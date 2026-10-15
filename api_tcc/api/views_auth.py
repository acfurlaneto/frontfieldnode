"""
views_auth.py — Endpoints de autenticação do FieldNode.

Expõe:
  POST /api/auth/login/     — autentica e retorna token DRF
  POST /api/auth/register/  — cria usuário e retorna token
  POST /api/auth/logout/    — invalida o token atual
  GET  /api/auth/me/        — retorna dados do usuário autenticado

Autenticação: TokenAuthentication do DRF (header: Authorization: Token <token>).
A X-API-Key existente para ingestão MQTT/IoT não é alterada.
"""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)


class LoginView(APIView):
    """
    POST /api/auth/login/

    Body: { "username": "...", "password": "..." }
    Retorna: { "token": "...", "user": { "id", "username", "email", "first_name", "last_name" } }
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"error": "Usuário e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)

        if user is None:
            logger.warning("Tentativa de login falhou para: %s", username)
            return Response(
                {"error": "Credenciais inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "Conta desativada. Entre em contato com o administrador."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        logger.info("Login bem-sucedido para: %s", username)

        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """
    POST /api/auth/register/

    Body: { "username": "...", "email": "...", "password": "...", "first_name": "...", "last_name": "..." }
    Retorna: { "token": "...", "user": { ... } }

    Regras:
      - username único (case-insensitive)
      - email único quando fornecido
      - password validado pelas regras AUTH_PASSWORD_VALIDATORS do Django
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username   = request.data.get("username", "").strip()
        email      = request.data.get("email", "").strip().lower()
        password   = request.data.get("password", "")
        first_name = request.data.get("first_name", "").strip()
        last_name  = request.data.get("last_name", "").strip()

        # Validações básicas de presença
        errors = {}
        if not username:
            errors["username"] = "O nome de usuário é obrigatório."
        if not password:
            errors["password"] = "A senha é obrigatória."
        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        # Username único (case-insensitive)
        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"errors": {"username": "Este nome de usuário já está em uso."}},
                status=status.HTTP_409_CONFLICT,
            )

        # Email único quando fornecido
        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {"errors": {"email": "Este e-mail já está cadastrado."}},
                status=status.HTTP_409_CONFLICT,
            )

        # Validar força da senha com as regras do Django
        try:
            validate_password(password)
        except DjangoValidationError as exc:
            return Response(
                {"errors": {"password": " ".join(exc.messages)}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Criar usuário
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
        except Exception as exc:
            logger.error("Erro ao criar usuário: %s", exc)
            return Response(
                {"error": "Não foi possível criar a conta. Tente novamente."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        token = Token.objects.create(user=user)
        logger.info("Novo usuário criado: %s", username)

        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Invalida o token do usuário autenticado.
    Header: Authorization: Token <token>
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            logger.info("Logout de: %s", request.user.username)
        except Exception:
            pass
        return Response({"message": "Logout realizado com sucesso."}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET /api/auth/me/

    Retorna dados do usuário autenticado.
    Header: Authorization: Token <token>
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }, status=status.HTTP_200_OK)

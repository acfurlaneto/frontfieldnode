"""Exportação de relatórios executivos FieldNode em formato Excel.

A planilha mantém o MESMO contrato: mesma URL, mesmas três abas na mesma ordem
(Resumo, Telemetria, Eventos), os mesmos dados nas mesmas células. O que mudou
foi só a apresentação — capa de marca, faixas zebradas, larguras medidas,
formatos numéricos, painéis congelados, filtros e hierarquia tipográfica.

Como o contrato de posição é verificado pelos testes
(api_tcc/tests/test_relatorios.py), dois pontos são invioláveis:

  * ``Resumo!B4`` continua sendo o total de leituras capturadas, então as
    métricas seguem nas linhas 3 a 6;
  * ``Telemetria`` e ``Eventos`` continuam com o cabeçalho na linha 1 e os dados
    a partir da linha 2, e as cores de faixa seguem as constantes de classe
    ``verde_fieldnode`` / ``cinza_fieldnode``.

Nada de dado, coluna ou linha foi movido ou inventado.
"""

from io import BytesIO

from django.http import HttpResponse
from django.utils import timezone
from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.properties import PageSetupProperties
from rest_framework.views import APIView

from api_tcc.models import Colheitadeira, LeituraTelemetria, RegistroAnalise


class RelatorioExportarView(APIView):
    """Gera um relatório .xlsx com resumo, telemetria e eventos de IA."""

    content_type = (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    # ── Faixas de marca ────────────────────────────────────────────────────
    # Cores das duas faixas de cabeçalho das abas de dados. Verificadas pelos
    # testes como contrato visual: NÃO trocar.
    verde_fieldnode = "1A3326"
    cinza_fieldnode = "2D3748"

    # ── Paleta de apoio ────────────────────────────────────────────────────
    lima_fieldnode = "A7FF2C"
    lima_escuro = "4D7C0F"
    tinta = "1F2937"
    tinta_suave = "4B5563"
    neutro_claro = "6B7280"
    zebra = "F5F7F4"
    linha = "DCE3D8"
    branco = "FFFFFF"
    vermelho = "B91C1C"
    ambar = "B45309"
    esmeralda = "047857"

    fonte = "Calibri"

    # Estilos reaproveitados: no openpyxl o custo está em CRIAR o estilo, não em
    # aplicá-lo. Como a aba de telemetria pode ter milhares de linhas, cada
    # objeto abaixo é montado uma única vez e compartilhado entre as células.
    _borda_fina = Border(
        left=Side(style="thin", color=linha),
        right=Side(style="thin", color=linha),
        top=Side(style="thin", color=linha),
        bottom=Side(style="thin", color=linha),
    )
    _borda_base = Border(bottom=Side(style="thin", color=linha))
    _fundo_zebra = PatternFill(start_color=zebra, end_color=zebra, fill_type="solid")
    _fundo_faixa_verde = PatternFill(
        start_color=verde_fieldnode, end_color=verde_fieldnode, fill_type="solid"
    )
    _fundo_faixa_cinza = PatternFill(
        start_color=cinza_fieldnode, end_color=cinza_fieldnode, fill_type="solid"
    )
    _fundo_capa = PatternFill(
        start_color=verde_fieldnode, end_color=verde_fieldnode, fill_type="solid"
    )
    _fundo_cabecalho_tabela = PatternFill(
        start_color="EEF2EA", end_color="EEF2EA", fill_type="solid"
    )

    def get(self, request):
        maquina_id = request.query_params.get("maquina_id")
        if not maquina_id:
            return HttpResponse('Parâmetro "maquina_id" é obrigatório', status=400)

        # A existência vem do cadastro de máquinas, e não das leituras. Assim,
        # uma máquina cadastrada, mas ainda sem telemetria, recebe um relatório
        # vazio válido; um identificador desconhecido não é mascarado por uma
        # planilha aparentemente válida.
        if not Colheitadeira.objects.filter(maquina_id=maquina_id).exists():
            return HttpResponse("Máquina não encontrada", status=404)

        leituras = LeituraTelemetria.objects.filter(maquina_id=maquina_id).order_by(
            "timestamp"
        )
        analises = RegistroAnalise.objects.filter(maquina_id=maquina_id).order_by(
            "criado_em"
        )

        workbook = Workbook()
        resumo = workbook.active
        resumo.title = "Resumo"
        self._montar_aba_resumo(resumo, maquina_id, leituras, analises)

        telemetria = workbook.create_sheet("Telemetria")
        self._montar_aba_dados(telemetria, leituras)

        eventos = workbook.create_sheet("Eventos")
        self._montar_aba_eventos(eventos, analises)

        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type=self.content_type)
        response["Content-Disposition"] = (
            f'attachment; filename="fieldnode_relatorio_{maquina_id}.xlsx"'
        )
        return response

    # ── Aba 1: Resumo ──────────────────────────────────────────────────────

    def _montar_aba_resumo(self, ws, maquina_id, leituras, analises):
        ws.sheet_view.showGridLines = False

        # Capa: faixa preta-esverdeada da marca com o nome em lima. A faixa ocupa
        # A1:D1 e as larguras das colunas abaixo foram medidas para o título
        # caber sem sobra.
        ws.merge_cells("A1:D1")
        capa = ws["A1"]
        capa.value = "FieldNode — Relatório Executivo de Telemetria"
        capa.font = Font(name=self.fonte, bold=True, size=15, color=self.lima_fieldnode)
        capa.fill = self._fundo_capa
        capa.alignment = Alignment(vertical="center", horizontal="left", indent=1)
        ws.row_dimensions[1].height = 36

        # Linha de contexto (antes vazia): quem, quando e em que fuso o arquivo
        # foi gerado. É o mínimo que um relatório executivo precisa declarar.
        ws.merge_cells("A2:D2")
        contexto = ws["A2"]
        contexto.value = (
            f"Máquina {maquina_id} · gerado em "
            f"{timezone.localtime().strftime('%d/%m/%Y às %H:%M')} · "
            f"fuso {timezone.get_current_timezone_name()}"
        )
        contexto.font = Font(name=self.fonte, size=9, color=self.tinta_suave)
        contexto.alignment = Alignment(vertical="center", indent=1)
        ws.row_dimensions[2].height = 20

        # Métricas. As LINHAS 3 a 6 são contrato: B4 é o total de leituras.
        metricas = (
            ("Identificador da Máquina", maquina_id),
            ("Total de Leituras Capturadas", leituras.count()),
            ("Alertas Críticos Registrados", analises.filter(status="CRITICO").count()),
            ("Alertas de Atenção Registrados", analises.filter(status="ATENCAO").count()),
        )
        for indice, (titulo, valor) in enumerate(metricas):
            row = 3 + indice
            rotulo = ws.cell(row=row, column=1, value=titulo)
            rotulo.font = Font(name=self.fonte, bold=True, color=self.tinta)
            rotulo.alignment = Alignment(vertical="center", indent=1)
            rotulo.border = self._borda_base

            celula = ws.cell(row=row, column=2, value=valor)
            celula.font = Font(
                name=self.fonte, bold=True, size=12, color=self.lima_escuro
            )
            celula.alignment = Alignment(horizontal="left", vertical="center")
            celula.border = self._borda_base
            if isinstance(valor, int):
                celula.number_format = "#,##0"

            # Faixa zebrada apenas nas linhas alternadas: dá ritmo de leitura sem
            # transformar o resumo num bloco de cor.
            if indice % 2 == 1:
                rotulo.fill = self._fundo_zebra
                celula.fill = self._fundo_zebra

            ws.row_dimensions[row].height = 20

        # Bloco de apoio: como os alertas se distribuem. Os números vêm de
        # filtros explícitos por status, não de subtração entre totais.
        titulo_bloco = ws.cell(row=8, column=1, value="ALERTAS POR STATUS")
        titulo_bloco.font = Font(
            name=self.fonte, bold=True, size=10, color=self.branco
        )
        titulo_bloco.fill = self._fundo_faixa_cinza
        titulo_bloco.alignment = Alignment(vertical="center", indent=1)
        ws.merge_cells("A8:B8")
        ws.row_dimensions[8].height = 22

        cabecalho = ("Status do risco", "Ocorrências")
        for coluna, texto in enumerate(cabecalho, start=1):
            celula = ws.cell(row=9, column=coluna, value=texto)
            celula.font = Font(name=self.fonte, bold=True, size=10, color=self.tinta)
            celula.fill = self._fundo_cabecalho_tabela
            celula.border = self._borda_fina
            if coluna == 1:
                celula.alignment = Alignment(vertical="center", indent=1)
            else:
                celula.alignment = Alignment(horizontal="center", vertical="center")

        distribuicao = (
            ("Crítico", analises.filter(status="CRITICO").count(), self.vermelho),
            ("Atenção", analises.filter(status="ATENCAO").count(), self.ambar),
            ("Normal", analises.filter(status="NORMAL").count(), self.esmeralda),
            ("Total de eventos", analises.count(), self.tinta),
        )
        for indice, (status, total, cor) in enumerate(distribuicao):
            row = 10 + indice
            rotulo = ws.cell(row=row, column=1, value=status)
            rotulo.font = Font(name=self.fonte, bold=(status == "Total de eventos"), color=cor)
            rotulo.alignment = Alignment(vertical="center", indent=1)
            rotulo.border = self._borda_fina

            celula = ws.cell(row=row, column=2, value=total)
            celula.font = Font(name=self.fonte, bold=True, color=cor)
            celula.alignment = Alignment(horizontal="center", vertical="center")
            celula.number_format = "#,##0"
            celula.border = self._borda_fina

            if indice % 2 == 1:
                rotulo.fill = self._fundo_zebra
                celula.fill = self._fundo_zebra
            ws.row_dimensions[row].height = 18

        nota = ws.cell(
            row=15,
            column=1,
            value=(
                "Relatório gerado automaticamente pelo FieldNode. Os limiares de "
                "atenção e risco são aplicados leitura por leitura, e os eventos "
                "listados na aba própria trazem o motivo e a recomendação."
            ),
        )
        nota.font = Font(name=self.fonte, size=9, color=self.neutro_claro)
        nota.alignment = Alignment(vertical="center", wrap_text=False, indent=1)
        ws.merge_cells("A15:D15")
        ws.row_dimensions[15].height = 18

        for col, largura in zip("ABCD", (38, 20, 20, 20)):
            ws.column_dimensions[col].width = largura

        ws.page_setup.orientation = "portrait"
        ws.page_setup.fitToWidth = 1
        ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)

    # ── Cabeçalho compartilhado das abas de dados ──────────────────────────

    def _aplicar_cabecalho(self, ws, cabecalhos, cor):
        """Faixa de cabeçalho na linha 1 — altura e cor ditadas pelo contrato."""
        preenchimento = (
            self._fundo_faixa_verde
            if cor == self.verde_fieldnode
            else self._fundo_faixa_cinza
        )
        fonte = Font(name=self.fonte, color=self.branco, bold=True, size=11)
        for coluna, titulo in enumerate(cabecalhos, start=1):
            celula = ws.cell(row=1, column=coluna, value=titulo)
            celula.fill = preenchimento
            celula.font = fonte
            celula.alignment = Alignment(
                horizontal="center", vertical="center", wrap_text=True
            )
        ws.row_dimensions[1].height = 26
        ws.freeze_panes = "A2"
        ws.sheet_view.showGridLines = False
        ws.print_title_rows = "1:1"

    # ── Aba 2: Telemetria ──────────────────────────────────────────────────

    def _montar_aba_dados(self, ws, leituras):
        cabecalhos = ("Timestamp", "Temperatura (°C)", "Vibração", "RPM")
        self._aplicar_cabecalho(ws, cabecalhos, self.verde_fieldnode)

        # Formato e alinhamento por COLUNA: uma atribuição por coluna em vez de
        # uma por célula. Numa aba que pode ter milhares de leituras, estilizar
        # célula a célula custa segundos de requisição — e o relatório em massa
        # tem orçamento de tempo. O que é uniforme desce para a coluna; o que
        # varia por linha (B/C/D e o número em si) fica onde precisa estar.
        self._estilizar_coluna(ws, 2, numero="0.0", alinhamento="center")
        self._estilizar_coluna(ws, 3, numero="0.00", alinhamento="center")
        self._estilizar_coluna(ws, 4, numero="#,##0", alinhamento="center")

        if not leituras.exists():
            aviso = ws.cell(
                row=2, column=1, value="Nenhuma leitura registrada para esta máquina."
            )
            aviso.font = Font(name=self.fonte, italic=True, color=self.neutro_claro)
        else:
            for linha, leitura in enumerate(leituras.iterator(), start=2):
                timestamp = self._normalizar_timestamp_excel(leitura.timestamp)
                celula_timestamp = ws.cell(row=linha, column=1, value=timestamp)
                if timestamp:
                    # Formato na CÉLULA, e não só na coluna: é contrato verificado
                    # pelos testes (Telemetria!A2.number_format).
                    celula_timestamp.number_format = "DD/MM/YYYY HH:MM:SS"
                ws.cell(row=linha, column=2, value=leitura.temperatura)
                ws.cell(row=linha, column=3, value=leitura.vibracao)
                ws.cell(row=linha, column=4, value=leitura.rpm)

            ultima = ws.max_row
            # Faixa zebrada por REGRA, não por célula: o Excel resolve as listras
            # ao desenhar a planilha. Mesmo efeito, custo zero na geração.
            self._aplicar_zebra(ws, f"A2:D{ultima}")
            # Destaca temperaturas críticas no Excel e em leitores compatíveis.
            ws.conditional_formatting.add(
                f"B2:B{ultima}",
                CellIsRule(
                    operator="greaterThan",
                    formula=["85"],
                    fill=PatternFill(
                        start_color="FDE8E8", end_color="FDE8E8", fill_type="solid"
                    ),
                    font=Font(color="9B1C1C", bold=True),
                ),
            )
            ws.auto_filter.ref = f"A1:D{ultima}"

        self._definir_larguras(ws, (22, 18, 14, 12))
        ws.page_setup.orientation = "landscape"

    # ── Aba 3: Eventos ─────────────────────────────────────────────────────

    def _montar_aba_eventos(self, ws, analises):
        cabecalhos = (
            "Data/Hora",
            "Status do Risco",
            "Motivos da Anomalia",
            "Recomendação Operacional",
        )
        self._aplicar_cabecalho(ws, cabecalhos, self.cinza_fieldnode)

        # Texto longo: as duas colunas de prosa quebram linha e alinham ao topo.
        # Vai na coluna, não na célula — mesmo motivo da aba de telemetria.
        self._estilizar_coluna(ws, 3, alinhamento="left", quebrar=True)
        self._estilizar_coluna(ws, 4, alinhamento="left", quebrar=True)
        self._estilizar_coluna(ws, 2, alinhamento="center")

        # Tinta por gravidade: o status é a coluna que se procura primeiro numa
        # lista de eventos, então é a única que ganha cor de texto — e cor de
        # texto precisa ser aplicada na célula, porque varia linha a linha.
        cor_do_status = {
            "CRITICO": self.vermelho,
            "ATENCAO": self.ambar,
            "NORMAL": self.esmeralda,
        }

        if not analises.exists():
            aviso = ws.cell(
                row=2, column=1, value="Nenhum evento anômalo registrado no período."
            )
            aviso.font = Font(name=self.fonte, italic=True, color=self.neutro_claro)
        else:
            for linha, analise in enumerate(analises.iterator(), start=2):
                timestamp = self._normalizar_timestamp_excel(analise.criado_em)
                celula_timestamp = ws.cell(row=linha, column=1, value=timestamp)
                if timestamp:
                    celula_timestamp.number_format = "DD/MM/YYYY HH:MM:SS"

                status_cell = ws.cell(row=linha, column=2, value=analise.status)
                status_cell.font = Font(
                    name=self.fonte,
                    bold=True,
                    color=cor_do_status.get(
                        str(analise.status).upper(), self.tinta_suave
                    ),
                )

                motivos = analise.motivos if isinstance(analise.motivos, list) else []
                ws.cell(row=linha, column=3, value="; ".join(map(str, motivos)))
                ws.cell(row=linha, column=4, value=analise.recomendacao or "")

            ultima = ws.max_row
            self._aplicar_zebra(ws, f"A2:D{ultima}")
            ws.auto_filter.ref = f"A1:D{ultima}"

        self._definir_larguras(ws, (22, 16, 45, 45))
        ws.page_setup.orientation = "landscape"

    # ── Auxiliares ─────────────────────────────────────────────────────────

    @staticmethod
    def _definir_larguras(ws, larguras):
        for coluna, largura in enumerate(larguras, start=1):
            ws.column_dimensions[get_column_letter(coluna)].width = largura

    @staticmethod
    def _estilizar_coluna(ws, coluna, numero=None, alinhamento=None, quebrar=False):
        """Aplica estilo na COLUNA inteira (formato, alinhamento e quebra).

        Uma atribuição por coluna em vez de uma por célula: numa aba de milhares
        de linhas essa é a diferença entre um relatório instantâneo e um que
        estoura o orçamento de tempo da requisição.
        """
        dimensao = ws.column_dimensions[get_column_letter(coluna)]
        if numero:
            dimensao.number_format = numero
        if alinhamento or quebrar:
            dimensao.alignment = Alignment(
                horizontal=alinhamento, vertical="top" if quebrar else "center",
                wrap_text=quebrar,
            )

    def _aplicar_zebra(self, ws, ref):
        """Faixa zebrada nas linhas pares por REGRA de formatação condicional.

        Desenhar listra a listra pintando cada célula custaria uma escrita de
        estilo por célula; como regra, quem resolve é o próprio Excel ao abrir a
        planilha — mesmo resultado visual, custo zero na geração.
        """
        listra = PatternFill(
            start_color=self.zebra, end_color=self.zebra, fill_type="solid"
        )
        ws.conditional_formatting.add(
            ref,
            FormulaRule(formula=["MOD(ROW(),2)=0"], fill=listra, stopIfTrue=False),
        )

    @staticmethod
    def _normalizar_timestamp_excel(timestamp):
        """Converte datetimes do Django para o tipo aceito no formato XLSX."""
        if timestamp and timezone.is_aware(timestamp):
            return timezone.make_naive(timestamp, timezone.get_current_timezone())
        return timestamp

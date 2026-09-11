Leia primeiro e siga integralmente as instruções permanentes do arquivo:

/home/ubuntu/frontfieldnode/frontend-next/AGENTS.md

Se o arquivo estiver em outro local, localize o arquivo equivalente de instruções do repositório antes de iniciar.

Agora personalize e corrija a experiência do chat/assistente “Pergunte à IA” do FieldNode, mantendo a mesma linha visual, técnica e comportamental que existia anteriormente.

==================================================
ESCOPO ABSOLUTO
==================================================

Esta tarefa é exclusivamente de frontend.

Altere somente arquivos dentro de:

/home/ubuntu/frontfieldnode/frontend-next

Não altere nenhum arquivo do backend.

É proibido modificar, criar ou excluir:

- Django
- Arquivos Python do backend
- Models
- Banco de dados
- Migrations
- Views
- URLs do backend
- Serializers
- Admin
- Endpoints
- Payloads
- Headers
- Regras de negócio
- Integrações MQTT
- Autenticação
- Docker relacionado ao backend
- Variáveis de ambiente do backend
- Service Worker
- Schemas Zod
- Tipos que formem contrato público da API
- Assinaturas ou lógica protegida de `telemetryService.ts`

Você pode ler:

```text
frontend-next/src/services/telemetryService.ts
somente para entender os dados e os contratos existentes.
Não altere a lógica ou assinatura do serviço sem autorização explícita.
Não altere endpoints, payloads ou contratos para fazer o chat parecer funcional.
Se a solução correta exigir qualquer alteração no backend ou em um contrato de API:
Pare imediatamente.
Não faça a alteração.
Informe qual arquivo seria alterado.
Explique por que o frontend não resolve o problema sozinho.
Explique o impacto da mudança.
Apresente uma alternativa somente no frontend, se existir.
Aguarde minha autorização explícita.
Não adicione dependências sem informar antes:
Nome do pacote.
Motivo da necessidade.
Por que a stack atual não é suficiente.
Impacto no projeto.
================================================== CONTEXTO VISUAL
O FieldNode já possui uma direção visual definida:
Dark mode como tema principal.
Modo claro opcional.
Glassmorphism.
Fundo neon/glassy discreto.
Verde para operação e ações principais.
Ciano e violeta para análise.
Âmbar para atenção.
Vermelho para criticidade.
Bordas finas.
Cantos arredondados.
Layout limpo.
Movimento sutil.
Aparência profissional de produto SaaS.
O chat não deve parecer um componente genérico colado no dashboard.
Ele precisa parecer uma parte nativa e cuidadosamente desenhada do FieldNode, seguindo a mesma linguagem da Sidebar, dos cards, do mapa e dos gráficos.
A referência principal é o estado anterior do projeto, no qual a assistente “Pergunte à IA” aparecia e fazia parte da experiência visual.
A prioridade é:
Recuperar a presença e o comportamento visual anterior.
Corrigir o layout atual.
Preservar a integração que já existia.
Refinar o visual sem descaracterizar o componente.
Adaptar o chat ao modo claro e escuro.
Garantir funcionamento em desktop e mobile.
Não transforme o chat em um novo produto separado.
================================================== ARQUIVOS A INVESTIGAR
Antes de editar, leia e compreenda:
src/components/ChatFAB.tsx
src/components/AppShell.tsx
src/components/Sidebar.tsx
src/app/dashboard/page.tsx
src/app/globals.css
src/lib/design-tokens.ts
src/lib/theme.ts
src/services/telemetryService.ts
Qualquer componente importado pelo ChatFAB
Qualquer componente relacionado ao painel ou mensagens da assistente
Configurações globais de layout e tema
Também procure no repositório por:
text
ChatFAB
Pergunte à IA
chat
assistant
assistente
IA
z-index
overflow-hidden
position: fixed
position: absolute
Antes da implementação, descubra:
Onde o botão “Pergunte à IA” era renderizado.
Onde o painel do chat era renderizado.
Qual estado controla abertura e fechamento.
Se o botão ainda está sendo montado, mas ficou invisível.
Se o painel está sendo cortado por um elemento pai.
Se algum overflow-hidden está escondendo o conteúdo.
Se o z-index está abaixo do mapa, da Sidebar ou do header.
Se o chat saiu da viewport por causa de top, bottom, right ou left.
Se alguma condição de renderização deixou o chat permanentemente oculto.
Se o novo tema alterou o contraste do botão ou do painel.
Se a navegação mobile está cobrindo o botão.
Se o chat está sendo renderizado em todas as rotas esperadas.
Se a integração real da IA continua conectada.
Se as mensagens anteriores e estados existentes foram preservados.
Se o problema é visual, de estado, de importação ou de integração.
Antes de modificar, apresente um diagnóstico curto com:
text
- causa provável
- arquivo responsável
- risco da correção
- solução planejada
Não faça alterações antes dessa análise.
================================================== PRESERVAR A LINHA VISUAL ANTERIOR
Não substitua o chat por uma interface completamente diferente.
Preserve, quando ainda existirem:
Botão flutuante original.
Nome “Pergunte à IA”.
Ícone original ou equivalente.
Mensagem inicial.
Sugestões rápidas.
Histórico de mensagens.
Campo de entrada.
Botão de envio.
Estados de loading.
Estado de erro.
Estado offline.
Fluxo de abrir e fechar.
Integração real existente.
Linguagem em português.
A evolução deve parecer uma versão refinada do chat anterior, não uma reconstrução desconectada.
================================================== BOTÃO “PERGUNTE À IA”
Corrija ou restaure o botão existente.
O botão deve:
Aparecer claramente.
Ficar em posição estável.
Permanecer acima do conteúdo.
Não ficar atrás do mapa.
Não ficar atrás da Sidebar.
Não ficar atrás da navegação mobile.
Não cobrir ações essenciais.
Respeitar margens e safe area.
Ter aria-label.
Ter foco visível.
Ter hover e active state.
Manter a identidade visual anterior.
Usar glassmorphism discreto.
Ter brilho controlado.
Ser mais compacto em telas menores.
Em telas grandes, pode exibir:
text
Pergunte à IA
Em telas pequenas, pode utilizar apenas o ícone com tooltip acessível.
Não utilizar pulsação contínua agressiva.
Se o botão estiver renderizado, mas invisível, corrija a causa real em vez de criar outro botão duplicado.
================================================== PAINEL DA ASSISTENTE
O painel deve continuar compacto e flutuante.
No desktop:
Ficar no canto inferior direito ou na posição original que fazia sentido.
Ter largura aproximada de 360px a 430px.
Ter altura controlada.
Não ocupar metade da tela.
Não empurrar o layout.
Não cobrir o conteúdo sem necessidade.
Permanecer acima do mapa e dos cards.
Ter header, mensagens e campo de entrada bem separados.
No mobile:
Respeitar margens laterais.
Não ultrapassar a viewport.
Não ficar atrás da navegação inferior.
Não gerar overflow horizontal.
Ajustar-se quando o teclado abrir.
Manter o botão fechar acessível.
Não usar position: absolute dentro de um container que possa cortar o painel se o comportamento anterior dependia de position: fixed.
================================================== HEADER DO CHAT
Preservar a identidade do header anterior e refiná-la.
O header pode conter:
Ícone da assistente.
“Pergunte à IA” ou nome já utilizado.
Indicador de estado.
Botão de fechar.
Botão de minimizar, se já existir.
Pequeno status visual.
Não afirmar que a IA tem acesso a dados em tempo real se isso não estiver realmente conectado.
Não inventar funcionalidades novas.
================================================== MENSAGENS E ESTADOS
Preservar os estados existentes e garantir que estejam visíveis:
Mensagem inicial.
Mensagem do usuário.
Mensagem da IA.
Loading.
Erro.
Offline.
Estado vazio.
Falha de integração.
As mensagens devem:
Continuar em português.
Ter boa quebra de linha.
Ter line-height confortável.
Possuir contraste adequado.
Não desaparecer por causa do tema.
Não ficar atrás do campo de entrada.
Ter scroll funcional.
No loading, utilizar animação curta e discreta.
Não criar respostas falsas para substituir uma integração ausente.
Se a IA não estiver conectada, exibir honestamente o estado correspondente.
================================================== CAMPO DE ENTRADA
Preservar o comportamento atual do campo.
Garantir:
Placeholder legível.
Foco visível.
Contraste nos dois temas.
Botão de envio visível.
Campo fixado na parte inferior interna do painel.
Mensagens não escondidas atrás do campo.
Enter funcionando se já existir essa lógica.
Estado disabled funcionando.
Área de toque adequada.
Acessibilidade por teclado.
Não alterar o contrato de envio.
================================================== DARK MODE E LIGHT MODE
O chat deve utilizar os tokens globais do FieldNode.
No dark mode:
Fundo grafite/azul profundo.
Glass escuro.
Texto claro.
Borda branca com baixa opacidade.
Glow verde, ciano ou violeta discreto.
Campo de entrada escuro e legível.
No light mode:
Fundo claro ou azul-gelo.
Cards com contraste.
Texto grafite.
Sombra leve.
Borda sutil.
Botão de envio claramente visível.
Nenhum elemento pode desaparecer por falta de contraste.
Não criar um tema independente do resto da aplicação.
Preservar as classes existentes, como:
text
liquid-glass
liquid-glass--elevated
liquid-glass--subtle
quando elas já forem parte da arquitetura visual.
================================================== CAMADAS E Z-INDEX
Verifique e documente a hierarquia de camadas.
Uma referência possível:
text
background: 0
conteúdo: 1
mapa: 10
header: 20
overlays do mapa: 30
Sidebar: 40 ou 50
ChatFAB: 70
painel do chat: 80
modais: 100
Ajuste conforme a estrutura atual.
Garanta que:
O botão apareça.
O painel apareça.
O chat fique acima do mapa.
O chat não fique atrás da Sidebar.
O chat não seja cortado.
O chat continue usável no mobile.
O chat não bloqueie toda a navegação.
================================================== GLASSMORPHISM E BRILHO
Refinar sem descaracterizar.
Aplicar:
Fundo translúcido.
Blur moderado.
Borda fina.
Highlight interno leve.
Sombra controlada.
Glow somente em pontos importantes.
O brilho deve ser localizado em:
Botão ativo.
Ícone da assistente.
Estado de foco.
Indicador de conexão.
Abertura do painel.
Não colocar neon forte em todas as mensagens ou em toda a área do chat.
O chat deve continuar legível por longos períodos.
================================================== MOVIMENTO
Adicionar apenas movimentos que melhorem a experiência:
Abertura suave do painel.
Fechamento suave.
Entrada de mensagens.
Loading.
Hover dos chips.
Foco no campo.
Transição entre tema claro e escuro.
Usar transições curtas:
text
hover: 160ms–220ms
abertura: 220ms–320ms
tema: 250ms–400ms
Não animar continuamente sem necessidade.
Respeitar:
CSS
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
================================================== ESCOPO DE RENDERIZAÇÃO
Confirme se o chat deve ser global ou específico de determinadas páginas.
A decisão deve seguir o comportamento anterior do FieldNode.
Se o chat era global, prefira renderizá-lo dentro do shell compartilhado, sem duplicá-lo em cada página.
Se ele era específico do dashboard, preserve essa regra, mas corrija a renderização.
Não fazer o chat desaparecer por causa de uma condição acidental de rota.
================================================== VALIDAÇÃO VISUAL
Testar pelo menos em:
text
1920px
1440px
1024px
768px
390px
Validar:
Dashboard com chat fechado.
Dashboard com chat aberto.
Chat sobre o mapa.
Chat em páginas internas.
Chat em dark mode.
Chat em light mode.
Sidebar desktop junto com chat.
Navegação inferior mobile junto com chat.
Campo de entrada.
Loading.
Erro.
Estado offline.
Fechamento.
Reabertura.
Navegação entre páginas.
Persistência ou comportamento do histórico, se já existir.
Também verificar:
Nenhum overflow horizontal.
Nenhum elemento cortado.
Nenhuma sobreposição indevida.
Nenhum botão inacessível.
Nenhuma mudança no backend.
================================================== VALIDAÇÃO TÉCNICA
Executar a partir de:
text
/home/ubuntu/frontfieldnode/frontend-next
Usar:
Bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
Executar testes Playwright existentes em:
text
frontend-next/tests/
quando o ambiente permitir.
Se alguma validação falhar por causa do ambiente, separar claramente:
Falha de código.
Falha de dependência.
Falha de ambiente.
Falha de backend.
Falha de navegador ou mapa externo.
================================================== RELATÓRIO FINAL OBRIGATÓRIO
Ao concluir, responda em português exatamente neste formato:
Relatório — Personalização do chat FieldNode
Escopo alterado
arquivo — o que mudou e por que
Causas raiz encontradas
Por que o chat não aparecia.
Se havia problema de z-index.
Se havia problema de overflow.
Se havia problema de posição.
Se havia problema de condição de renderização.
Se havia problema de tema ou contraste.
O que foi preservado
Integração existente.
Props.
Mensagens.
Estados.
Fluxo de envio.
Rotas.
Contratos da API.
O que foi validado
lint: passou / falhou
tsc --noEmit: passou / falhou
build: passou / falhou / não foi possível concluir
Playwright: passou / falhou / não executado
verificação visual: feita / não feita
dark mode: validado / não validado
light mode: validado / não validado
desktop: validado / não validado
mobile: validado / não validado
Pendências ou limitações
O que não foi possível resolver, testar ou confirmar.
Alterações no backend
Confirmar explicitamente: nenhum arquivo de backend foi alterado.
Precisa de alguma decisão minha?
sim/não — se sim, qual decisão
================================================== RESULTADO ESPERADO
Quero uma evolução cuidadosa do chat que já existia.
Não crie apenas um botão novo.
Não substitua a experiência anterior por um componente genérico.
Recupere a presença, a identidade e a utilidade do “Pergunte à IA”, seguindo o mesmo sistema visual do FieldNode:
Dark mode premium.
Light mode consistente.
Glassmorphism refinado.
Neon controlado.
Movimento sutil.
Mensagens legíveis.
Campo funcional.
Painel bem posicionado.
Desktop e mobile.
Acessibilidade.
Integração preservada.
Se qualquer mudança no backend parecer necessária, pare e peça autorização antes de editar.
Faça a personalização como uma evolução nativa do FieldNode, não como um chat separado colado na interface.
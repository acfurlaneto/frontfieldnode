# Alterações de UI/UX — FieldNode

**Branch:** `fix/ui-ux-experiencia`  
**Escopo:** modo claro e modo escuro  
**Objetivo:** legibilidade, navegação previsível e feedback correto por máquina

---

## 1. Seta de voltar (prioridade alta)

**Problema:** a seta usava `position: fixed` e sobrepunha o título do header (pior em zoom 100%). Além disso, `router.back()` dependia do histórico do browser.

**Solução:**
- Botão **integrado no fluxo do header** (flex, ao lado do título), sem `fixed`.
- Navegação **sempre** para `/dashboard`.
- Título com `truncate` e área de título com `min-w-0` para não colidir com ações à direita.

**Arquivos:**
- `frontend-next/src/components/BackButton.tsx`
- `frontend-next/src/components/AppShell.tsx`

---

## 2. Decisão IA / Prescrição

**Problema:** mesma mensagem para várias máquinas; container com texto sobreposto.

**Solução:**
- Chave SWR estritamente por `machineId`; `keepPreviousData: false`.
- Só renderiza análise se `analise.maquina_id === machineId`.
- Modal com `overflow-hidden`, conteúdo scrollável, card de recomendação com `isolate` e tipografia estável.

**Arquivos:**
- `frontend-next/src/components/PrescricaoModal.tsx`

---

## 3. Cards de métricas (dashboard)

**Problema:** pontos coloridos sem sentido; números desalinhados; fonte pequena no modo claro.

**Solução (já aplicada no main e mantida):**
- Remoção dos dots do sparkline (`dot={false}`).
- Valor centralizado e fonte maior (`text-4xl` / `sm:text-5xl`).

**Arquivos:**
- `frontend-next/src/components/SparklineCard.tsx`

---

## 4. Labels do mapa

**Problema:** no modo claro, texto do label competia com o mapa (contraste ruim).

**Solução:**
- Pill escuro com texto fixo `#F1F5F9` (não depende de `--text-1` do tema).
- Label: `maquina_id · status` (Operando / Atenção / Offline).

**Arquivos:**
- `frontend-next/src/components/MapClient.tsx`
- `frontend-next/src/app/globals.css`

---

## 5. Restauração de integridade

O remoto chegou a receber conteúdo placeholder em `MapClient.tsx` e `globals.css`. Esta branch **restaura** esses arquivos a partir da versão válida e aplica só o ajuste de contraste dos labels.

---

## Como validar

```bash
git fetch origin
git checkout fix/ui-ux-experiencia
cd frontend-next
npm ci
npm run dev
```

Checklist visual:
- [ ] Seta ao lado do título, sem sobreposição (zoom 100%, light e dark)
- [ ] Seta sempre leva ao `/dashboard`
- [ ] Decisão IA mostra conteúdo da máquina clicada
- [ ] Modal de prescrição legível, sem texto empilhado
- [ ] Cards do dashboard: números centrais, sem dots
- [ ] Labels do mapa legíveis no modo claro

---

## Fora deste pacote

- Multi-tenant / backend
- Redesign completo do mapa
- Novas features de chat

# Epic 14 — Pub & Bar Comanda (Tab System)
> Epico de Pub & Bar: Sistema de comanda digital para consumo em bares e pubs
> Status: In Progress
> Versao: 1.0 | Data: 2026-03-23

## Objetivo

Implementar o sistema de comanda digital (tab) para o tipo de servico Pub & Bar. Diferente do fluxo de pedidos tradicional (order system), o modelo Pub & Bar usa comanda corrida: o cliente abre uma comanda ao chegar, adiciona itens ao longo da noite (rodadas de drinks), e fecha/paga ao final. Este epico cobre a experiencia completa do cliente no app mobile, incluindo visualizacao da comanda em tempo real, montagem de rodadas, e pagamento com opcao de divisao.

## Contexto de Negocio

O tipo de servico **Pub & Bar** possui caracteristicas unicas:
- **Comanda corrida (Tab):** O cliente nao faz pedidos individuais que sao finalizados. Em vez disso, tudo vai para uma comanda aberta que acumula consumo.
- **Rodadas (Rounds):** Clientes frequentemente pedem "mais uma rodada" — o mesmo conjunto de bebidas para o grupo.
- **Pagamento ao final:** A comanda so e fechada no final da noite, podendo ser dividida entre os membros da mesa.
- **Tempo real:** Barman e garcom adicionam itens que devem refletir instantaneamente na comanda do cliente.
- **Grupo/Mesa:** Uma comanda pode ser compartilhada por multiplos membros de uma mesa.

## Escopo

### Inclui
- Tela de visualizacao da comanda do cliente (TabScreen)
- Bottom sheet para montagem de rodadas (RoundBuilderSheet)
- Tela de pagamento da comanda (TabPaymentScreen)
- Hook `useTab` com TanStack Query + WebSocket para atualizacoes em tempo real
- Integracao com backend TabsModule existente (REST + WebSocket)
- i18n completo (PT-BR, EN, ES)

### Nao Inclui (fora do escopo)
- Tela do Barman para gestao de comandas (ja existe em BarmanStationScreen.tsx com tab de Pedidos)
- Criacao/abertura de comanda (feita via QR code ou pelo garcom — fluxo separado)
- Gestao de membros da comanda (convites, remocao — epico futuro)
- Happy Hour pricing (backend ja implementado, integracao visual futura)

## User Stories

### US-14.1 — Visualizar Minha Comanda em Tempo Real
**Como** cliente de um pub/bar, **quero** ver minha comanda atualizada em tempo real, **para** acompanhar meu consumo e o total acumulado.

**Criterios de Aceitacao:**
- [ ] CA1: Tela exibe numero da comanda, numero da mesa e total corrente no header
- [ ] CA2: Lista de itens mostra nome, quantidade, preco unitario e status (pendente/confirmado/servido)
- [ ] CA3: Atualizacoes do barman/garcom aparecem em tempo real via WebSocket (< 2s de latencia)
- [ ] CA4: Estado vazio mostra mensagem "Sua comanda esta vazia — adicione itens" com CTA
- [ ] CA5: Skeleton loading durante carregamento inicial
- [ ] CA6: Pull-to-refresh funcional como fallback

**Notas Tecnicas:**
- Endpoint: `GET /tabs/:id` para dados iniciais
- WebSocket: namespace `/tabs`, evento `tabUpdate` com type `item_added`, `member_joined`, `tab_closed`
- TanStack Query para cache + WebSocket para invalidacao/update em tempo real

---

### US-14.2 — Montar e Enviar Rodada de Drinks
**Como** cliente de um pub/bar, **quero** montar uma rodada de drinks e enviar para o bar, **para** pedir bebidas de forma rapida e organizada.

**Criterios de Aceitacao:**
- [ ] CA1: Bottom sheet abre com cardapio de drinks agrupado por categoria (Beer, Wine, Spirits, Cocktails, Soft Drinks)
- [ ] CA2: Barra de busca filtra itens por nome
- [ ] CA3: Contador de quantidade permite adicionar/remover itens com feedback haptico
- [ ] CA4: Total da rodada e exibido em tempo real na parte inferior
- [ ] CA5: Botao "Adicionar a Comanda" envia itens via `POST /tabs/:tabId/items`
- [ ] CA6: Apos envio bem-sucedido, sheet fecha e comanda e atualizada

**Notas Tecnicas:**
- Endpoint: `POST /tabs/:id/items` com body `AddTabItemDto` (menu_item_id, quantity, unit_price)
- Haptic feedback via `expo-haptics` em add/remove
- Cardapio carregado do endpoint de menu do restaurante

---

### US-14.3 — Fechar e Pagar Comanda
**Como** cliente de um pub/bar, **quero** fechar minha comanda e pagar, **para** encerrar minha noite no bar.

**Criterios de Aceitacao:**
- [ ] CA1: Tela de pagamento mostra resumo completo: itens agrupados, subtotal, taxa de servico, total
- [ ] CA2: Seletor de metodo de pagamento (PIX, credito, Apple Pay, Google Pay, carteira)
- [ ] CA3: Opcao "Dividir com a mesa" abre fluxo de divisao
- [ ] CA4: Botao "Pagar agora" executa `POST /tabs/:tabId/close` + `POST /tabs/:tabId/payments`
- [ ] CA5: Estado de sucesso mostra confirmacao com link para recibo
- [ ] CA6: Comanda muda para status fechada apos pagamento confirmado

**Notas Tecnicas:**
- Endpoint close: `POST /tabs/:id/close`
- Endpoint payment: `POST /tabs/:id/payments` com `ProcessTabPaymentDto`
- Split options: `GET /tabs/:id/split-options`
- Reutilizar logica de metodos de pagamento do `UnifiedPaymentScreen`

---

### US-14.4 — Garcom/Barman Ve Itens da Comanda (Perspectiva Staff)
**Como** garcom ou barman, **quero** ver os itens adicionados a uma comanda, **para** preparar e servir os drinks corretamente.

**Criterios de Aceitacao:**
- [ ] CA1: BarmanStationScreen ja recebe pedidos de comanda como orders normais (sem conflito)
- [ ] CA2: Itens de comanda aparecem com identificacao da mesa/comanda
- [ ] CA3: Status do item e atualizado pelo barman (preparando -> pronto -> servido)

**Notas Tecnicas:**
- BarmanStationScreen.tsx existente ja trata orders; itens de tab chegam pelo mesmo fluxo
- Nao e necessario criar tela nova para o barman neste epico

---

## Arquitetura Tecnica

### Endpoints Utilizados (Backend ja implementado)
| Metodo | Rota | Roles | Descricao |
|--------|------|-------|-----------|
| GET | /tabs/my | CUSTOMER | Obter minhas comandas abertas |
| GET | /tabs/:id | CUSTOMER, STAFF | Detalhes da comanda |
| POST | /tabs/:id/items | CUSTOMER | Adicionar itens a comanda |
| POST | /tabs/:id/close | CUSTOMER | Solicitar fechamento |
| POST | /tabs/:id/payments | CUSTOMER | Processar pagamento |
| GET | /tabs/:id/split-options | CUSTOMER | Opcoes de divisao |
| POST | /tabs/:id/repeat-round | CUSTOMER | Repetir ultima rodada |

### WebSocket Gateway
- Namespace: `/tabs`
- Join room: emit `joinTab` com tabId
- Leave room: emit `leaveTab` com tabId
- Receive events: `tabUpdate` com types:
  - `item_added` — novo item adicionado
  - `member_joined` — novo membro entrou
  - `member_left` — membro saiu
  - `payment_made` — pagamento realizado
  - `tab_closed` — comanda fechada

### Novos Arquivos (Mobile Client)
- `mobile/apps/client/src/hooks/useTab.ts` — Hook com TanStack Query + WebSocket
- `mobile/apps/client/src/screens/pub-bar/TabScreen.tsx` — Tela principal da comanda
- `mobile/apps/client/src/screens/pub-bar/RoundBuilderSheet.tsx` — Bottom sheet para rodadas
- `mobile/apps/client/src/screens/pub-bar/TabPaymentScreen.tsx` — Tela de pagamento

### Alteracoes em Arquivos Existentes
- `mobile/apps/client/src/navigation/index.tsx` — Adicionar TabScreen e TabPaymentScreen ao MainStack
- `mobile/shared/i18n/pt-BR.ts` — Adicionar chaves i18n do tab
- `mobile/shared/i18n/en-US.ts` — Adicionar chaves i18n do tab
- `mobile/shared/i18n/es-ES.ts` — Adicionar chaves i18n do tab
- `mobile/shared/config/react-query.ts` — Adicionar queryKeys para tabs

### Novas Chaves i18n
```
tab.title
tab.myComanda
tab.items
tab.total
tab.closeTab
tab.empty
tab.addRound
tab.tableNumber
tab.tabNumber
tab.runningTotal
tab.round.title
tab.round.add
tab.round.total
tab.round.confirm
tab.round.search
tab.round.empty
tab.payment.title
tab.payment.summary
tab.payment.split
tab.payment.pay
tab.payment.serviceFee
tab.payment.subtotal
tab.payment.success
tab.payment.receipt
tab.payment.method
tab.item.pending
tab.item.confirmed
tab.item.served
```

### Migrations Necessarias
- Nenhuma — backend TabsModule ja esta completo com todas as entidades e migrations

## Dependencias
- Backend TabsModule (`/backend/src/modules/tabs/`) — JA COMPLETO
- UnifiedPaymentScreen — reutilizar logica de metodos de pagamento
- useWebSocket hook (`/mobile/shared/hooks/useWebSocket.ts`) — JA EXISTE
- TanStack React Query — JA CONFIGURADO

## Definition of Done

### Codigo
- [ ] Hook `useTab` implementado com useQuery, useMutation e WebSocket
- [ ] TabScreen renderiza comanda com header, lista de itens e acoes
- [ ] RoundBuilderSheet permite buscar, selecionar e enviar rodada
- [ ] TabPaymentScreen processa pagamento com divisao opcional
- [ ] Telas adicionadas ao MainStack na navegacao do client

### i18n
- [ ] Todas as strings usam `t()` — zero strings hardcoded
- [ ] Chaves adicionadas em pt-BR.ts, en-US.ts e es-ES.ts
- [ ] Interpolacoes usam `{{paramName}}`

### Design / UX
- [ ] Skeleton loading em TabScreen durante carregamento
- [ ] Empty state com mensagem e CTA em TabScreen
- [ ] Pull-to-refresh funcional em TabScreen
- [ ] Haptic feedback em add/remove no RoundBuilderSheet
- [ ] Cores usam tokens do design system via `useColors()`
- [ ] Feedback visual para status dos itens (pending/confirmed/served)

### Integracao
- [ ] WebSocket conecta ao namespace `/tabs` e recebe eventos em tempo real
- [ ] TanStack Query cache e invalidado corretamente apos mutations
- [ ] Nenhum conflito com BarmanStationScreen existente

### Testes
- [ ] Happy path: abrir comanda, adicionar itens, fechar e pagar
- [ ] Error path: falha de rede, comanda nao encontrada
- [ ] Edge cases: comanda vazia, rodada sem itens selecionados

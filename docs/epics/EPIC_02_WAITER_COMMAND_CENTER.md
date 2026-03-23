# EPICO 2 — Waiter Command Center

**Prioridade:** CRITICA | **Sprint:** 2 | **App:** Mobile Restaurant (Expo 51 / React Native 0.74)
**Status atual:** WaiterDashboardScreen existente e basico — requer substituicao completa

---

## Visao Geral

O Waiter Command Center e a tela mais sofisticada do Restaurant App. Substitui o `WaiterDashboardScreen.tsx` atual (que usa polling de 30s, sem WebSocket, sem abas, sem gestao de convidados) por uma implementacao completa de 4 abas orientada a tempo real.

O design de referencia completo esta implementado como prototipo web em:

- `/Users/pedrodini/project_okinawa-2/src/components/demo/restaurant/ServiceScreens.tsx` (linhas 159-1233, componente `WaiterScreen`)

O garcom deve, a partir de uma unica tela, conseguir:
- Monitorar eventos ao vivo via WebSocket
- Gerenciar mesas com detalhes por convidado
- Acompanhar o pipeline da cozinha e confirmar retiradas
- Processar pagamentos sem sair do app

### Arquivos alvo de implementacao

| Arquivo | Acao |
|---|---|
| `mobile/apps/restaurant/src/screens/waiter-dashboard/WaiterDashboardScreen.tsx` | Substituir por nova implementacao |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/tabs/LiveFeedTab.tsx` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/tabs/TablesTab.tsx` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/tabs/KitchenTab.tsx` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/tabs/ChargeTab.tsx` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/components/TableDetailView.tsx` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/components/PaymentFlow.tsx` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/hooks/useWaiterWebSocket.ts` | Criar |
| `mobile/apps/restaurant/src/screens/waiter-dashboard/hooks/useWaiterTables.ts` | Criar |
| `mobile/apps/restaurant/src/locales/pt-BR/waiter.json` | Criar |
| `mobile/apps/restaurant/src/locales/en/waiter.json` | Criar |
| `mobile/apps/restaurant/src/locales/es/waiter.json` | Criar |

---

## Pre-requisitos

- EPIC 01 (Auth + Restaurant Setup) concluido — garcom autenticado com `UserRole.WAITER`
- Backend: `GET /orders/waiter/my-tables` retornando mesas do garcom com relacoes
- Backend: `GET /orders/waiter/stats` retornando stats do turno
- Backend: `POST /orders` aceitando `UserRole.WAITER`
- Backend: `PATCH /orders/:id/status` para confirmacao de servico
- Backend: `PUT /waiter-calls/:id/acknowledge` e `/resolve`
- WebSocket namespace `/orders` emitindo `order:created` e `order:updated`
- WebSocket namespace `/tabs` emitindo `tabUpdate` com tipos `item_added`, `payment_made`

---

## Arquitetura WebSocket

O Waiter Command Center consome dois namespaces WebSocket distintos:

### Namespace `/orders` (OrdersGateway)

Arquivo backend: `backend/src/modules/orders/orders.gateway.ts`

```
// Emitidos pelo servidor para a sala restaurant:{restaurantId}
order:created  -> { id, table_id, user_id, items, status, ... }
order:updated  -> { id, table_id, status, items, ... }

// Mensagens enviadas pelo cliente
joinRestaurant  -> { restaurantId: string }
leaveRestaurant -> { restaurantId: string }
```

### Namespace `/tabs` (TabsGateway)

Arquivo backend: `backend/src/modules/tabs/tabs.gateway.ts`

```
// Emitidos pelo servidor para a sala tab:{tabId}
tabUpdate -> { type: string, data: any, timestamp: string }

// Tipos de tabUpdate relevantes para o garcom:
item_added     -> novo item adicionado por convidado
payment_made   -> convidado processou pagamento
member_joined  -> novo convidado entrou na mesa
tab_closed     -> mesa fechada
```

### Tipos de Evento do Live Feed

Baseados no `LIVE_FEED` do prototipo (`ServiceScreens.tsx`, linha 173):

| Tipo | Urgencia | Cor | Comportamento |
|---|---|---|---|
| `kitchen_ready` | critical | --destructive | Pulsing, banner no topo |
| `call` | high | --warning | Badge na aba Ao Vivo |
| `payment` | info | --success | Apenas informativo |
| `payment_needed` | high | --primary | Acao: Cobrar |
| `approval` | medium | --info | Acao: Solicitar |
| `order` | info | --muted | Sem acao |
| `alert` | critical | --destructive | Acao contexutal |

---

## FEATURE 2.1 — Tab "Ao Vivo" (Live Event Feed)

**Arquivo principal:** `tabs/LiveFeedTab.tsx`

Esta aba exibe um feed cronologico de todos os eventos que requerem atencao do garcom. E a aba padrao ao abrir o Command Center. O badge na aba exibe a contagem de eventos nao-info pendentes.

---

### US-2.1.1 — Receber notificacoes em tempo real

**Como** garcom,
**Quero** ver um feed atualizado instantaneamente com todos os eventos relevantes da minha sessao,
**Para que** eu possa priorizar acoes sem precisar navegar por multiplas telas.

#### Criterios de Aceite

- [ ] Ao abrir a aba "Ao Vivo", os eventos sao carregados e exibidos em ordem cronologica inversa (mais recente no topo)
- [ ] Novos eventos chegam via WebSocket e aparecem no topo do feed sem reload manual
- [ ] Cada evento exibe: tipo com icone, numero da mesa, tempo relativo, titulo, detalhe
- [ ] Eventos com urgencia `critical` tem animacao `animate-pulse` no icone e badge "AGORA"
- [ ] Eventos com urgencia `high` tem borda colorida correspondente ao tipo
- [ ] O badge numerico na aba "Ao Vivo" mostra contagem de eventos pendentes nao-info
- [ ] Quando nao ha eventos pendentes, exibe empty state "Tudo tranquilo!" com icone check verde
- [ ] O feed suporta skeleton loading enquanto carrega os eventos iniciais
- [ ] Eventos com acao (kitchen_ready, call, payment_needed, approval) exibem botao de acao no rodape do card
- [ ] Clicar no botao de acao navega para a aba correta E remove o evento do feed

#### Specs Tecnicos

**Hook a criar:** `hooks/useWaiterWebSocket.ts`

```typescript
// Interface esperada
interface LiveFeedEvent {
  id: string;
  time: string;         // tempo relativo: 'agora', '1min', etc.
  table: number;
  event: string;        // titulo do evento
  detail: string;       // descricao detalhada
  type: LiveEventType;
  urgency: 'critical' | 'high' | 'medium' | 'info';
  handled: boolean;
}

type LiveEventType =
  | 'kitchen_ready'
  | 'call'
  | 'payment'
  | 'payment_needed'
  | 'approval'
  | 'order'
  | 'alert';
```

**Conexao WebSocket (socket.io-client):**
```typescript
// Conectar ao namespace /orders
const socket = io(`${BASE_URL}/orders`, { auth: { token } });
socket.emit('joinRestaurant', { restaurantId });

// Mapear eventos para o feed
socket.on('order:created', (order) => addFeedEvent({
  type: 'order',
  urgency: 'info',
  table: order.table_number,
  ...
}));

socket.on('order:updated', (order) => {
  if (order.status === 'ready') addFeedEvent({
    type: 'kitchen_ready',
    urgency: 'critical',
    ...
  });
});
```

**Estado local (Zustand ou useState):**
```typescript
const [feedEvents, setFeedEvents] = useState<LiveFeedEvent[]>([]);
const [handledIds, setHandledIds] = useState<Set<string>>(new Set());

const activeFeed = feedEvents.filter(e => !handledIds.has(e.id));
```

**Arquivos a criar/modificar:**
- `hooks/useWaiterWebSocket.ts` — conexao e mapeamento de eventos
- `tabs/LiveFeedTab.tsx` — componente da aba
- `components/LiveFeedCard.tsx` — card individual de evento

#### Chaves i18n

**PT-BR** (`locales/pt-BR/waiter.json`):
```json
{
  "live": {
    "tab": "Ao Vivo",
    "empty_title": "Tudo tranquilo!",
    "empty_subtitle": "Nenhuma acao pendente",
    "badge_now": "AGORA",
    "event_kitchen_ready": "Prato pronto para retirar",
    "event_call": "Cliente chamou o garcom",
    "event_payment": "Pagamento recebido pelo app",
    "event_payment_needed": "Conta solicitada",
    "event_approval": "Cortesia solicitada",
    "event_order": "Novo pedido registrado",
    "action_pickup": "Retirar",
    "action_attend": "Atender",
    "action_charge": "Cobrar",
    "action_request": "Solicitar",
    "urgent_banner_title": "{count} prato(s) esperando retirada!",
    "urgent_banner_subtitle": "A cozinha esta aguardando",
    "urgent_banner_cta": "Ver"
  }
}
```

**EN** (`locales/en/waiter.json`):
```json
{
  "live": {
    "tab": "Live",
    "empty_title": "All clear!",
    "empty_subtitle": "No pending actions",
    "badge_now": "NOW",
    "event_kitchen_ready": "Dish ready for pickup",
    "event_call": "Guest called waiter",
    "event_payment": "Payment received via app",
    "event_payment_needed": "Bill requested",
    "event_approval": "Complimentary item requested",
    "event_order": "New order registered",
    "action_pickup": "Pick up",
    "action_attend": "Attend",
    "action_charge": "Charge",
    "action_request": "Request",
    "urgent_banner_title": "{count} dish(es) waiting for pickup!",
    "urgent_banner_subtitle": "Kitchen is waiting",
    "urgent_banner_cta": "View"
  }
}
```

**ES** (`locales/es/waiter.json`):
```json
{
  "live": {
    "tab": "En Vivo",
    "empty_title": "Todo tranquilo!",
    "empty_subtitle": "Sin acciones pendientes",
    "badge_now": "AHORA",
    "event_kitchen_ready": "Plato listo para retirar",
    "event_call": "Cliente llamo al mozo",
    "event_payment": "Pago recibido por la app",
    "event_payment_needed": "Cuenta solicitada",
    "event_approval": "Cortesia solicitada",
    "event_order": "Nuevo pedido registrado",
    "action_pickup": "Retirar",
    "action_attend": "Atender",
    "action_charge": "Cobrar",
    "action_request": "Solicitar",
    "urgent_banner_title": "{count} plato(s) esperando retiro!",
    "urgent_banner_subtitle": "La cocina esta esperando",
    "urgent_banner_cta": "Ver"
  }
}
```

#### Cenarios de Teste

**Happy path:**
- WebSocket recebe `order:updated` com `status: 'ready'` -> evento `kitchen_ready` aparece no topo do feed com badge AGORA
- Clicar em "Retirar" no card `kitchen_ready` -> evento e marcado como handled, aba muda para "Cozinha"
- Feed vazio -> exibe empty state com icone verde e texto "Tudo tranquilo!"

**Error path:**
- WebSocket desconecta -> exibir banner de reconexao "Sem conexao — tentando reconectar..."
- Endpoint de historico de eventos retorna 500 -> exibir skeleton + toast de erro
- Timeout na acao de atender -> manter evento no feed e exibir toast "Falha ao atender chamado"

**Edge cases:**
- 20+ eventos ativos -> scroll funciona corretamente, nenhum evento é omitido
- Dois eventos `kitchen_ready` simultaneos -> ambos aparecem no feed
- Reconexao WebSocket -> re-subscribe em `joinRestaurant` sem duplicar eventos

---

### US-2.1.2 — Agir sobre evento urgente (prato pronto)

**Como** garcom,
**Quero** ver um banner de urgencia pulsante no topo da aba "Ao Vivo" quando ha pratos prontos na cozinha,
**Para que** eu reaja imediatamente sem precisar navegar para a aba Cozinha.

#### Criterios de Aceite

- [ ] Quando `readyDishes.length > 0`, exibe banner vermelho pulsante no topo da aba com contagem
- [ ] Banner contem botao "Ver" que navega para Tab Cozinha
- [ ] Banner desaparece quando todos os pratos prontos sao retirados
- [ ] Cards de evento do tipo `kitchen_ready` tem borda `--destructive`, icone ChefHat pulsante
- [ ] Clicar em "Retirar" no card do live feed navega para Tab Cozinha E marca evento como handled

#### Specs Tecnicos

O banner usa o estado derivado `readyDishes` calculado a partir de `KITCHEN_PIPELINE` (prototipo) ou da query `GET /orders/kds/kitchen?status=ready` filtrada por `waiter_id` atual.

```typescript
// Banner component
const UrgencyBanner: React.FC<{ count: number; onPress: () => void }> = ({ count, onPress }) => (
  <Animated.View style={[styles.urgencyBanner, pulseAnimation]}>
    <Icon name="chef-hat" size={20} color={colors.destructive} />
    <View style={styles.urgencyTextContainer}>
      <Text style={styles.urgencyTitle}>{t('live.urgent_banner_title', { count })}</Text>
      <Text style={styles.urgencySubtitle}>{t('live.urgent_banner_subtitle')}</Text>
    </View>
    <TouchableOpacity onPress={onPress} style={styles.urgencyButton}>
      <Text style={styles.urgencyButtonText}>{t('live.urgent_banner_cta')}</Text>
    </TouchableOpacity>
  </Animated.View>
);
```

**Cenarios de Teste:**
- Prato muda para `ready` -> banner aparece em < 500ms
- Garcom retira prato -> banner atualiza contagem ou desaparece
- Multiplos pratos prontos de mesas diferentes -> contador correto no banner

---

## FEATURE 2.2 — Tab "Mesas" (Table Management)

**Arquivo principal:** `tabs/TablesTab.tsx`
**Sub-componente:** `components/TableDetailView.tsx`

Esta aba tem dois niveis de visualizacao: lista geral de mesas e detalhe de uma mesa especifica com 4 sub-abas internas.

---

### US-2.2.1 — Visualizar todas as minhas mesas

**Como** garcom,
**Quero** ver uma lista de todas as mesas que me foram atribuidas com indicadores de status,
**Para que** eu tenha visao geral rapida do estado do meu turno.

#### Criterios de Aceite

- [ ] Lista exibe apenas mesas com status `occupied` ou `billing` atribuidas ao garcom atual
- [ ] Cada card de mesa exibe: numero, nome do cliente principal, contagem de pessoas, total do pedido
- [ ] Cada card exibe avatares dos convidados codificados por cor: pago (verde), com app (azul), sem app (amarelo)
- [ ] Barra de progresso de pagamento (%) e contagem `pago/total` exibidas no card
- [ ] Mesas com prato pronto para retirar tem borda vermelha pulsante e badge "PRATO"
- [ ] Mesas com convidados sem app tem borda amarela e badge "{n} S/APP"
- [ ] Skeleton loading exibido durante carregamento inicial (3 cards placeholder)
- [ ] Empty state quando nenhuma mesa atribuida: icone de mesa + texto explicativo
- [ ] Pull-to-refresh atualiza a lista
- [ ] API utilizada: `GET /orders/waiter/my-tables`

#### Specs Tecnicos

**Hook a criar:** `hooks/useWaiterTables.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';

export function useWaiterTables() {
  return useQuery({
    queryKey: ['waiter', 'tables'],
    queryFn: () => apiClient.get('/orders/waiter/my-tables'),
    staleTime: 30_000,
    refetchInterval: 30_000, // fallback para WebSocket
  });
}
```

**Tipo do dado retornado (inferido do backend):**
```typescript
interface WaiterTable {
  id: string;
  number: number;
  status: 'occupied' | 'billing';
  customerName: string;
  occupiedSince: string; // ISO date
  orderTotal: number;
  guests: TableGuest[];
}

interface TableGuest {
  id: string;
  name: string;
  hasApp: boolean;
  paid: boolean;
  method?: string;
  orders: GuestOrder[];
}
```

#### Chaves i18n

```json
{
  "tables": {
    "tab": "Mesas",
    "empty_title": "Nenhuma Mesa Atribuida",
    "empty_subtitle": "Aguardando atribuicao pelo gerente",
    "badge_dish_ready": "PRATO",
    "badge_no_app": "{count} S/APP",
    "people_count": "{count} pessoas",
    "orders_count": "{count} pedidos",
    "payment_progress": "{paid}/{total} pagos"
  }
}
```

#### Cenarios de Teste

**Happy path:**
- Garcom tem 3 mesas atribuidas -> 3 cards exibidos com dados corretos
- Mesa 5 tem prato pronto -> card da mesa 5 tem borda vermelha pulsante e badge "PRATO"
- Nenhuma mesa atribuida -> empty state exibido

**Error path:**
- `GET /orders/waiter/my-tables` retorna 403 -> toast "Sem permissao para ver mesas"
- Request timeout -> skeleton substituido por error state com botao "Tentar novamente"

---

### US-2.2.2 — Ver detalhes de uma mesa especifica

**Como** garcom,
**Quero** tocar em uma mesa e ver suas informacoes completas divididas em 4 sub-abas,
**Para que** eu possa gerenciar pedidos, convidados e pagamentos sem sair da tela.

#### Criterios de Aceite

- [ ] Toque em qualquer card de mesa abre a visao de detalhe da mesa (Level 2)
- [ ] Header do detalhe exibe: "Mesa {N}", nome do cliente, contagem de pessoas, tempo de ocupacao, total e barra de pagamento
- [ ] 4 sub-abas disponiveis: Pessoas, Pedidos, Cardapio, Cobrar
- [ ] Botao "Voltar" (chevron + texto "Todas as mesas") fecha o detalhe e retorna a lista
- [ ] Sub-aba ativa persiste se o usuario navegar para outra aba principal e voltar para a mesma mesa
- [ ] Cada sub-aba exibe badge com contagem relevante: Pessoas(n), Pedidos(n), Cobrar(inadimplentes)

#### Specs Tecnicos

**Estado de navegacao:**
```typescript
const [selectedTable, setSelectedTable] = useState<number | null>(null);
const [tableDetailTab, setTableDetailTab] = useState<'guests' | 'orders' | 'menu' | 'charge'>('guests');
```

Ao navegar para outra aba principal (live/kitchen/charge), `selectedTable` e `tableDetailTab` sao resetados:
```typescript
// No handler de mudanca de aba principal:
onTabChange={(tab) => {
  setWaiterTab(tab);
  setSelectedTable(null);
  setTableDetailTab('guests');
}}
```

---

### US-2.2.3 — Adicionar convidado sem app

**Como** garcom,
**Quero** adicionar manualmente um convidado que nao tem o app instalado,
**Para que** eu possa registrar pedidos e processar pagamento em nome dele.

#### Criterios de Aceite

- [ ] Na sub-aba "Pessoas", botao "+ Adicionar convidado sem app" sempre visivel no final da lista
- [ ] Toque abre formulario inline com campo de nome e botoes "Adicionar" / "Cancelar"
- [ ] Campo de nome com focus automatico ao abrir o formulario
- [ ] Botao "Adicionar" desabilitado se nome estiver vazio
- [ ] Convidado adicionado aparece imediatamente na lista com badge "SEM APP" amarelo
- [ ] Convidado sem app e identificado com indicador de atencao em todos os contextos
- [ ] Multiplos convidados sem app podem ser adicionados
- [ ] API utilizada: `POST /waiter-calls` (ou endpoint de gestao de convidados a implementar no backend)

#### Specs Tecnicos

```typescript
// Estado local temporario (persistido via TanStack Query mutation)
const [addedGuests, setAddedGuests] = useState<TableGuest[]>([]);

const handleAddGuest = (tableId: string, name: string) => {
  const newGuest: TableGuest = {
    id: `local-${Date.now()}`,
    name: name.trim(),
    hasApp: false,
    paid: false,
    orders: [],
  };
  setAddedGuests(prev => [...prev, newGuest]);
  // TODO: persistir via mutation quando endpoint disponivel
};
```

#### Chaves i18n

```json
{
  "guests": {
    "tab": "Pessoas",
    "badge_app": "APP",
    "badge_no_app": "SEM APP",
    "badge_paid": "PAGO",
    "add_guest_cta": "Adicionar convidado sem app",
    "add_guest_placeholder": "Nome do convidado",
    "add_guest_confirm": "Adicionar",
    "add_guest_cancel": "Cancelar",
    "guest_items_count": "{count} itens",
    "guest_in_progress": "{count} em andamento",
    "guest_paid_via": "Pago via {method}",
    "action_order": "+ Pedir",
    "action_charge": "Cobrar"
  }
}
```

#### Cenarios de Teste

**Happy path:**
- Nome digitado + "Adicionar" -> convidado aparece na lista com badge "SEM APP"
- Convidado adicionado pode receber pedidos imediatamente

**Error path:**
- Tentar adicionar sem nome -> botao desabilitado, sem submit
- Campo de nome so com espacos -> validacao rejeita e campo nao e submetido

---

### US-2.2.4 — Fazer pedido como proxy de convidado

**Como** garcom,
**Quero** acessar o cardapio e fazer pedido em nome de qualquer convidado da mesa,
**Para que** convidados sem app possam pedir normalmente.

#### Criterios de Aceite

- [ ] Botao "+ Pedir" ao lado de cada convidado nao pago abre a sub-aba "Cardapio" com o convidado pre-selecionado
- [ ] Sub-aba "Cardapio" exibe banner "Fazendo pedido para: {nome}" com opcao de trocar convidado
- [ ] Se nenhum convidado selecionado, exibe selector de convidado horizontal com chips
- [ ] Botoes do cardapio ficam desabilitados (muted) se nenhum convidado selecionado
- [ ] Categorias do menu exibidas como pills horizontais com scroll
- [ ] Cada item exibe nome, preco e tempo estimado de preparo
- [ ] Convidados ja pagos nao aparecem no selector
- [ ] Itens selecionados exibem controles de quantidade +/-
- [ ] Subtotal do carrinho atualizado em tempo real

#### Specs Tecnicos

**Estado do pedido:**
```typescript
const [orderingForGuest, setOrderingForGuest] = useState<string | null>(null);
const [pendingOrder, setPendingOrder] = useState<CartItem[]>([]);

interface CartItem {
  itemId: string;
  item: string;
  qty: number;
  price: number;
}
```

**API do cardapio:**
- `GET /menus/{restaurantId}/categories` — categorias com itens
- Ou usar dados cacheados do menu ja carregados no app

#### Chaves i18n

```json
{
  "menu": {
    "tab": "Cardapio",
    "ordering_for_label": "Fazendo pedido para",
    "ordering_for_change": "trocar",
    "select_guest_label": "Selecionar convidado:",
    "item_time_label": "Tempo: {time}",
    "add_to_cart": "+ Adicionar",
    "quantity_minus": "−",
    "quantity_plus": "+",
    "cart_items": "{count} itens",
    "cart_total": "R$ {total}",
    "send_to_kitchen": "Enviar para Cozinha",
    "no_guest_selected": "Selecione um convidado para pedir"
  }
}
```

---

### US-2.2.5 — Enviar pedido para cozinha

**Como** garcom,
**Quero** confirmar e enviar o carrinho de pedidos para a cozinha com um toque,
**Para que** o pedido chegue instantaneamente ao chef sem processo manual.

#### Criterios de Aceite

- [ ] Botao "Enviar para Cozinha" aparece como barra fixa na parte inferior quando ha itens no carrinho E convidado selecionado
- [ ] Botao exibe contagem de itens, nome do convidado e total
- [ ] Toque envia pedido via `POST /orders` e exibe toast de sucesso "Pedido enviado para a cozinha!"
- [ ] Apos envio bem-sucedido: carrinho e limpo, `orderingForGuest` e resetado, navega para sub-aba "Pedidos"
- [ ] Pedido recem-enviado aparece na sub-aba "Pedidos" com status `pending`
- [ ] Em caso de erro de rede: toast de erro e carrinho mantido (nao perder selecao)
- [ ] Loading state no botao durante o envio (spinner)

#### Specs Tecnicos

**Mutation TanStack Query:**
```typescript
const sendOrderMutation = useMutation({
  mutationFn: (order: CreateOrderDto) => apiClient.post('/orders', order),
  onSuccess: () => {
    setPendingOrder([]);
    setOrderingForGuest(null);
    setTableDetailTab('orders');
    showToast({ type: 'success', message: t('menu.toast_sent') });
    queryClient.invalidateQueries({ queryKey: ['waiter', 'tables'] });
  },
  onError: () => {
    showToast({ type: 'error', message: t('menu.toast_error') });
  },
});
```

**DTO esperado pelo backend:**
```typescript
// POST /orders
interface CreateOrderDto {
  restaurant_id: string;
  table_id: string;
  tab_id?: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    notes?: string;
  }>;
  proxy_for_guest?: string; // nome do convidado sem app
}
```

#### Chaves i18n

```json
{
  "menu": {
    "toast_sent": "Pedido enviado para a cozinha!",
    "toast_sent_detail": "O chef recebeu e vai comecar a preparar",
    "toast_error": "Falha ao enviar pedido. Tente novamente.",
    "sending": "Enviando..."
  }
}
```

#### Cenarios de Teste

**Happy path:**
- Carrinho com 2 itens, convidado selecionado -> "Enviar para Cozinha" envia `POST /orders` -> toast sucesso -> sub-aba Pedidos com novos itens em status `pending`

**Error path:**
- `POST /orders` retorna 400 (item fora de estoque) -> toast erro especifico, carrinho mantido
- Sem conexao -> toast "Sem conexao — pedido nao enviado", carrinho mantido

---

## FEATURE 2.3 — Tab "Cozinha" (Kitchen Pipeline)

**Arquivo principal:** `tabs/KitchenTab.tsx`

Esta aba mostra o pipeline da cozinha em 3 secoes: pratos prontos (urgente), em preparo (com SLA), ja servidos.

---

### US-2.3.1 — Ver pratos prontos para retirar

**Como** garcom,
**Quero** ver todos os pratos prontos na cozinha com destaque visual urgente,
**Para que** eu saiba exatamente o que precisa ser retirado e levado para a mesa.

#### Criterios de Aceite

- [ ] Badge numerico na aba "Cozinha" exibe contagem de pratos prontos com cor `--destructive` e animacao `animate-pulse`
- [ ] Banner de urgencia pulsante no topo da aba quando ha pratos prontos
- [ ] Secao "PRONTO — RETIRAR" exibida antes das outras secoes
- [ ] Cada card de prato pronto exibe: numero da mesa (destaque), nome do prato, quantidade, chef responsavel, tempo desde que ficou pronto
- [ ] Pratos em preparo exibem: nome, mesa, chef, SLA progress bar, tempo restante (ou atraso em vermelho)
- [ ] Pratos ja servidos exibidos com opacidade reduzida em secao "SERVIDO"
- [ ] Dados em tempo real via WebSocket (order:updated com status ready)
- [ ] Sem pratos prontos: empty state "Nenhum prato aguardando retirada"

#### Specs Tecnicos

**Dados do kitchen pipeline:**
```typescript
interface KitchenDish {
  id: string;
  orderId: string;
  dish: string;
  qty: number;
  table: number;
  chef: string;
  status: 'preparing' | 'ready' | 'served';
  readyAgo?: number;  // minutos desde que ficou pronto
  sla: number;        // SLA em minutos
  elapsed: number;    // tempo ja decorrido em minutos
}
```

**Logica da SLA progress bar:**
```typescript
const slaPercent = Math.min((dish.elapsed / dish.sla) * 100, 100);
const isOverdue = dish.elapsed > dish.sla;
// Cor: verde ate 70%, amarelo 70-100%, vermelho acima de 100%
```

**API utilizada:**
- `GET /orders/waiter/my-tables` com relacoes de itens por status, ou
- WebSocket `order:updated` filtrando por `waiter_id`

#### Chaves i18n

```json
{
  "kitchen": {
    "tab": "Cozinha",
    "urgency_banner_title": "{count} prato(s) para retirar agora!",
    "urgency_banner_subtitle": "Tempo e qualidade — retire e sirva",
    "section_ready": "PRONTO — RETIRAR",
    "section_preparing": "PREPARANDO",
    "section_served": "SERVIDO",
    "empty_title": "Nenhum prato aguardando retirada",
    "empty_subtitle": "A cozinha esta tranquila",
    "ready_ago": "pronto ha {min}min",
    "sla_remaining": "{min}min restantes",
    "sla_overdue": "+{min}min atrasado"
  }
}
```

---

### US-2.3.2 — Confirmar retirada de prato

**Como** garcom,
**Quero** confirmar a retirada de um prato da cozinha com um toque,
**Para que** o status seja atualizado para "servido" e a cozinha saiba que o prato foi levado.

#### Criterios de Aceite

- [ ] Botao "Retirar" exibido em cada card de prato pronto
- [ ] Toque no botao chama `PATCH /orders/:id/status` com `{ status: 'served' }`
- [ ] Prato removido da secao "PRONTO" e movido para "SERVIDO" imediatamente (otimista)
- [ ] Badge da aba "Cozinha" decrementado imediatamente
- [ ] Banner de urgencia desaparece quando ultimo prato pronto e retirado
- [ ] Em caso de erro: reversao otimista + toast de erro
- [ ] Toast de confirmacao: "Prato retirado — leve para Mesa {N}"

#### Specs Tecnicos

```typescript
const pickupMutation = useMutation({
  mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
    apiClient.patch(`/orders/${orderId}/status`, { status: 'served', item_id: itemId }),
  onMutate: async ({ itemId }) => {
    // Atualizacao otimista
    setPickedUp(prev => [...prev, itemId]);
    return { itemId };
  },
  onError: (_, __, context) => {
    setPickedUp(prev => prev.filter(id => id !== context?.itemId));
    showToast({ type: 'error', message: t('kitchen.toast_pickup_error') });
  },
  onSuccess: (_, { orderId }) => {
    showToast({ type: 'success', message: t('kitchen.toast_picked_up') });
    queryClient.invalidateQueries({ queryKey: ['waiter', 'tables'] });
  },
});
```

#### Chaves i18n

```json
{
  "kitchen": {
    "action_pickup": "Retirar",
    "toast_picked_up": "Prato retirado — leve para Mesa {table}",
    "toast_pickup_error": "Falha ao confirmar retirada. Tente novamente."
  }
}
```

#### Cenarios de Teste

**Happy path:**
- Toque em "Retirar ✓" -> prato move para secao SERVIDO imediatamente, badge decrementado, toast "Prato retirado — leve para Mesa 5"

**Error path:**
- `PATCH /orders/:id/status` retorna 404 -> reversao otimista, prato volta para PRONTO, toast de erro

**Edge cases:**
- Dois garcons retiram o mesmo prato simultaneamente -> segundo recebe 409, toast especifico "Prato ja retirado por outro garcom"

---

## FEATURE 2.4 — Tab "Cobrar" (Quick Charge)

**Arquivo principal:** `tabs/ChargeTab.tsx`
**Sub-componente:** `components/PaymentFlow.tsx`

Esta aba oferece visao global de pagamentos por mesa e por convidado, com fluxo de cobranca em 4 steps.

---

### US-2.4.1 — Visualizar status de pagamento global

**Como** garcom,
**Quero** ver o status de pagamento de todos os convidados de todas as minhas mesas em uma unica vista,
**Para que** eu identifique rapidamente quem ainda precisa pagar.

#### Criterios de Aceite

- [ ] Lista de todas as mesas expandida com convidados visivel logo ao entrar na aba
- [ ] Header de cada mesa exibe: numero, nome do cliente, contadores (pago/no app/sem app), grafico circular de progresso
- [ ] Cada linha de convidado exibe: indicador colorido, nome, status textual, total individual
- [ ] Convidados pagos tem opacidade reduzida
- [ ] Convidados "no app" exibem badge azul "No app"
- [ ] Convidados sem app e nao pagos exibem botao "Cobrar" em destaque
- [ ] Banner explicativo no topo: "Quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa."
- [ ] Mesa totalmente paga some da lista ou exibe estado "Todos pagaram"

#### Chaves i18n

```json
{
  "charge": {
    "tab": "Cobrar",
    "info_banner": "Pagamento inteligente — quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa do garcom.",
    "guests_paid_count": "{paid} pago",
    "guests_app_count": "{count} no app",
    "guests_no_app_count": "{count} sem app",
    "guest_paid_via": "Pago via {method}",
    "guest_on_app": "Pagando pelo app",
    "guest_needs_waiter": "Sem app — cobrar manualmente",
    "action_charge": "Cobrar",
    "total_label": "Total: R$ {total}",
    "all_paid": "Todos pagaram"
  }
}
```

---

### US-2.4.2 — Processar pagamento via TAP to Pay (NFC)

**Como** garcom,
**Quero** cobrar um convidado via NFC com o proprio celular do garcom,
**Para que** o pagamento seja processado sem necessidade de maquininha externa.

#### Criterios de Aceite

- [ ] Toque em "Cobrar" abre Step 1 (method): tela com total e 4 opcoes de pagamento
- [ ] TAP to Pay e exibido como opcao recomendada com badge "RECOMENDADO"
- [ ] Toque em TAP to Pay avanca para Step 2 (processing): tela com animacao de NFC pulsante
- [ ] Tela de processing exibe instrucao "Aproxime o cartao" e status "Aguardando..."
- [ ] Botao "Confirmar Pagamento" manual disponivel para caso de sucesso confirmado
- [ ] Botao "Trocar metodo" disponivel na tela de processing
- [ ] Apos confirmacao, Step 3 (done): icone check verde, texto "Pagamento confirmado!", dados da mesa e convidado
- [ ] Step done exibe opcoes: "Imprimir recibo" e "Proximo →"
- [ ] "Proximo →" retorna ao Step 1 (guest list) para cobrar proximo convidado

#### Specs Tecnicos

**Maquina de estados do fluxo:**
```typescript
type PaymentStep = 'guests' | 'method' | 'processing' | 'done';
const [paymentStep, setPaymentStep] = useState<PaymentStep>('guests');
const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

type PaymentMethod = 'tap' | 'pix' | 'card' | 'cash';
```

**Opcoes de pagamento (ordem de exibicao):**
1. TAP to Pay (NFC) — `tap` — RECOMENDADO — icone smartphone
2. PIX QR Code — `pix` — icone raio
3. Cartao (Chip/Senha) — `card` — icone cartao
4. Dinheiro — `cash` — icone cedula

**Animacao NFC (React Native Animated API):**
```typescript
// Tres aneis concentricos com animate-ping
const pulseAnim = useRef(new Animated.Value(0)).current;
Animated.loop(
  Animated.sequence([
    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
  ])
).start();
```

**API de pagamento:**
- `POST /payments` com `{ method: 'tap', guest_id, table_id, amount }`
- Ou webhook de confirmacao NFC via endpoint dedicado

#### Chaves i18n

```json
{
  "payment": {
    "step_method_title": "Mesa {table} · {guest}",
    "method_tap": "TAP to Pay (NFC)",
    "method_tap_desc": "Encoste o cartao no celular",
    "method_tap_badge": "RECOMENDADO",
    "method_pix": "PIX QR Code",
    "method_pix_desc": "Gere o QR e mostre ao cliente",
    "method_card": "Cartao (Chip/Senha)",
    "method_card_desc": "Maquininha vinculada",
    "method_cash": "Dinheiro",
    "method_cash_desc": "Confirme valor recebido",
    "processing_title": "Aproxime o cartao",
    "processing_subtitle": "Peca ao cliente encostar o cartao no celular",
    "processing_waiting": "Aguardando...",
    "processing_confirm": "Confirmar Pagamento",
    "processing_change_method": "Trocar metodo",
    "done_title": "Pagamento confirmado!",
    "done_receipt_auto": "Recibo enviado automaticamente",
    "done_print": "Imprimir",
    "done_next": "Proximo",
    "back": "Voltar"
  }
}
```

---

### US-2.4.3 — Processar pagamento via PIX

**Como** garcom,
**Quero** gerar um QR Code PIX para o convidado escanear,
**Para que** o pagamento seja feito sem contato fisico.

#### Criterios de Aceite

- [ ] Toque em "PIX QR Code" na tela de metodo abre tela de QR Code
- [ ] QR Code gerado via API e exibido em tela cheia com total acima
- [ ] Status "Aguardando confirmacao..." pulsante abaixo do QR
- [ ] Confirmacao automatica via WebSocket quando pagamento PIX e recebido
- [ ] Apos confirmacao automatica, avanca para Step done automaticamente
- [ ] Botao manual "Confirmar manualmente" disponivel como fallback
- [ ] Botao "Trocar metodo" disponivel

#### Specs Tecnicos

```typescript
// Geracao do QR Code PIX
const pixMutation = useMutation({
  mutationFn: ({ amount, guestId }: { amount: number; guestId: string }) =>
    apiClient.post('/payments/pix/generate', { amount, guest_id: guestId, table_id }),
  onSuccess: (data) => {
    setPixQrCode(data.qr_code_base64);
    setPixPaymentId(data.payment_id);
    // Subscrever a confirmacao via WebSocket
    socket.on(`payment:confirmed:${data.payment_id}`, handlePixConfirmed);
  },
});
```

---

### US-2.4.4 — Processar pagamento em dinheiro ou cartao

**Como** garcom,
**Quero** registrar pagamentos em dinheiro ou na maquininha,
**Para que** o sistema reflita o pagamento mesmo sem processamento digital.

#### Criterios de Aceite

- [ ] Toque em "Dinheiro" abre tela com campo de valor recebido e calculo de troco
- [ ] Toque em "Cartao (Chip/Senha)" exibe instrucao de usar maquininha vinculada
- [ ] Em ambos os casos, botao "Confirmar Pagamento" registra manualmente
- [ ] Confirmacao chama `POST /payments` com `{ method: 'cash' | 'card', amount, guest_id }`
- [ ] Apos confirmacao, avanca para Step done

---

## Diagrama de Estado (ASCII)

```
WaiterCommandCenter
│
├── Tab: AO VIVO (padrao)
│   │
│   ├── [eventos WebSocket chegam]
│   │   ├── order:created    -> evento type:order (info)
│   │   ├── order:updated (ready) -> evento type:kitchen_ready (critical)
│   │   └── waiter-call      -> evento type:call (high)
│   │
│   ├── Feed filtrado por !handledIds
│   │   ├── Card urgency:critical -> borda vermelha + pulse
│   │   ├── Card urgency:high     -> borda colorida
│   │   └── Card urgency:info     -> neutro, sem acao
│   │
│   └── Botao acao -> dispatch(handled) + navigate(aba)
│
├── Tab: MESAS
│   │
│   ├── Level 1: Lista de mesas
│   │   └── [toque em mesa] -> Level 2
│   │
│   └── Level 2: Detalhe da mesa
│       ├── Sub-tab: Pessoas
│       │   ├── Lista convidados
│       │   └── [+ adicionar] -> formulario inline
│       ├── Sub-tab: Pedidos
│       │   ├── Agrupados por status
│       │   └── Acoes: servir, cancelar, editar
│       ├── Sub-tab: Cardapio
│       │   ├── Selector de convidado
│       │   ├── Categories pills
│       │   ├── Lista de itens
│       │   └── [Enviar Cozinha] -> POST /orders
│       └── Sub-tab: Cobrar
│           └── [ver PaymentFlow abaixo]
│
├── Tab: COZINHA
│   ├── Banner urgencia (se readyDishes > 0)
│   ├── Secao PRONTO -> cards + botao Retirar
│   ├── Secao PREPARANDO -> cards + SLA bar
│   └── Secao SERVIDO -> cards faded
│
└── Tab: COBRAR (global)
    │
    └── PaymentFlow
        ├── Step: guests  -> lista mesas + convidados
        ├── Step: method  -> 4 opcoes de pagamento
        ├── Step: processing -> animacao NFC/PIX QR/instrucao cartao
        └── Step: done    -> confirmacao + opcoes
```

---

## Sequencia de Implementacao

A ordem abaixo minimiza dependencias e permite validacao incremental:

### Sprint 2 — Semana 1

**Fase 1 — Infraestrutura e Hook WebSocket (2 dias)**
1. Criar `hooks/useWaiterWebSocket.ts` com conexao aos namespaces `/orders` e `/tabs`
2. Criar `hooks/useWaiterTables.ts` com TanStack Query e invalidacao por WebSocket
3. Criar tipos TypeScript compartilhados: `types/waiter.types.ts`
4. Criar arquivos i18n base para PT-BR, EN, ES

**Fase 2 — Tab Ao Vivo (1 dia)**
5. Criar `components/LiveFeedCard.tsx`
6. Criar `tabs/LiveFeedTab.tsx` consumindo `useWaiterWebSocket`
7. Integrar `UrgencyBanner` condicional

**Fase 3 — Tab Mesas Level 1 (1 dia)**
8. Criar `tabs/TablesTab.tsx` (lista) consumindo `useWaiterTables`
9. Criar `components/TableCard.tsx` com avatares e progress bar

### Sprint 2 — Semana 2

**Fase 4 — Tab Mesas Level 2 — Sub-abas (3 dias)**
10. Criar `components/TableDetailView.tsx` com sub-abas
11. Implementar sub-aba Pessoas com gestao de convidados
12. Implementar sub-aba Pedidos com agrupamento por status
13. Implementar sub-aba Cardapio com selector de convidado e carrinho
14. Implementar sub-aba Cobrar (local) com `PaymentFlow`

**Fase 5 — Tab Cozinha (1 dia)**
15. Criar `tabs/KitchenTab.tsx` com secoes e SLA bar
16. Implementar mutation de pickup com atualizacao otimista

**Fase 6 — Tab Cobrar Global + PaymentFlow completo (2 dias)**
17. Criar `tabs/ChargeTab.tsx` com vista global
18. Criar `components/PaymentFlow.tsx` com 4 metodos e maquina de estados
19. Implementar animacao NFC e geracao de QR PIX

**Fase 7 — Polimento e Testes (2 dias)**
20. Substituir `WaiterDashboardScreen.tsx` pelo novo Command Center
21. Testes de integracao WebSocket
22. Testes de acessibilidade e i18n
23. Review de performance (FlatList, memoizacao)

---

## Definition of Done

### Criterios Globais do Epico

- [ ] Todas as 4 abas implementadas e navegaveis
- [ ] WebSocket conectado e mapeando eventos corretamente (sem polling como fonte primaria)
- [ ] Todas as User Stories com criterios de aceite marcados
- [ ] i18n implementado nos 3 idiomas (PT-BR, EN, ES) sem string hardcoded em portugues
- [ ] Design tokens utilizados (--primary, --accent, --success, --warning, --destructive) sem cores hardcoded
- [ ] Skeleton loading em todos os estados de carregamento inicial
- [ ] Empty states implementados em todas as listas
- [ ] Toast feedback em todas as acoes de mutacao (sucesso e erro)
- [ ] Testes unitarios: happy path + error path + edge cases por User Story
- [ ] Sem chamadas a `ApiService` legado — uso exclusivo de TanStack Query + axios/fetch
- [ ] `WaiterDashboardScreen.tsx` original substituido (sem codigo morto)
- [ ] Build sem warnings de TypeScript (strict mode)
- [ ] Performance: lista de mesas com FlatList (nao ScrollView) para virtualizacao
- [ ] Acessibilidade: `accessibilityLabel` em todos os botoes de acao

### Metricas de Qualidade

| Metrica | Target |
|---|---|
| Tempo ate primeiro evento live feed | < 2s apos autenticacao |
| Latencia WebSocket evento -> UI | < 300ms |
| Frames durante scroll da lista de mesas | > 55fps |
| Cobertura de testes (happy path) | 100% dos mutations |
| Bundle size adicional | < 50kb compressed |

---

## Referencias de Codigo

### Prototipo de Referencia (Web)

O design completo e funcional esta implementado em:
- `/Users/pedrodini/project_okinawa-2/src/components/demo/restaurant/ServiceScreens.tsx` (linhas 159-1233)

Dados de mock reutilizaveis para testes:
- `KITCHEN_PIPELINE` — linha 165 — dados de pipeline da cozinha
- `LIVE_FEED` — linha 173 — eventos do feed ao vivo
- `TABLE_GUESTS_DATA` — linha 184 — dados de convidados por mesa
- `WAITER_MENU` — linha 242 — categorias e itens do cardapio

### Backend Existente

| Endpoint | Arquivo | Funcionalidade |
|---|---|---|
| `GET /orders/waiter/my-tables` | `backend/src/modules/orders/orders.controller.ts:113` | Mesas do garcom |
| `GET /orders/waiter/stats` | `backend/src/modules/orders/orders.controller.ts:122` | Stats do turno |
| `POST /orders` | `backend/src/modules/orders/orders.controller.ts:23` | Criar pedido |
| `PATCH /orders/:id/status` | `backend/src/modules/orders/orders.controller.ts:81` | Atualizar status |
| `PUT /waiter-calls/:id/acknowledge` | `backend/src/modules/tabs/waiter-calls.controller.ts:20` | Confirmar chamado |
| `PUT /waiter-calls/:id/resolve` | `backend/src/modules/tabs/waiter-calls.controller.ts:26` | Resolver chamado |
| WS `/orders` — `order:created` | `backend/src/modules/orders/orders.gateway.ts:40` | Novo pedido |
| WS `/orders` — `order:updated` | `backend/src/modules/orders/orders.gateway.ts:44` | Status atualizado |
| WS `/tabs` — `tabUpdate` | `backend/src/modules/tabs/tabs.gateway.ts:48` | Atualizacoes da comanda |

### Entidade WaiterCall

Arquivo: `backend/src/modules/tabs/entities/waiter-call.entity.ts`

Razoes de chamado suportadas: `'order'`, `'bill'`, `'question'`, `'other'`
Status possiveis: `'pending'`, `'acknowledged'`, `'resolved'`

---

*Documento gerado em 2026-03-23 para o projeto NOOWE — Waiter Command Center v1.0*

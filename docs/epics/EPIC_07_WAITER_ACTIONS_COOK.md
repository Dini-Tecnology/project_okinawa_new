# ÉPICO 7 — Waiter Actions Feed + Cook Station

**Prioridade:** ALTA | **Sprint:** 3
**Módulos afetados:** `restaurant-app` (mobile) · `backend` (NestJS) · `demo` (web stub)
**Data de criação:** 2026-03-23

---

## Visão Geral

O Épico 7 entrega dois componentes críticos do fluxo operacional do restaurante:

1. **Waiter Actions Feed** — feed situacional priorizado por urgência que centraliza
   todas as ações pendentes do garçom (pratos prontos, cobranças, chamados, cortesias,
   transferências de mesa) em um único lugar, ordenadas por criticidade.

2. **Cook Station View** — extensão filtrada do `KDSScreen` existente que apresenta
   apenas os tickets relevantes para a estação de preparo selecionada pelo cozinheiro
   (Grelhados, Frios ou Massas), com interface touch-friendly otimizada para display de
   cozinha.

O backend recebe dois ajustes: um novo endpoint de feed situacional para garçom e a
adição do parâmetro `?station=` no endpoint KDS existente.

---

## Adaptações Backend

### GET /orders/waiter/situational-feed

Novo endpoint que agrega e prioriza eventos pendentes para o garçom autenticado.
Retorna uma lista ordenada por urgência descendente.

**Rota:** `GET /orders/waiter/situational-feed`
**Autenticação:** JWT Bearer — role `WAITER`
**Escopo:** apenas eventos relacionados às mesas atribuídas ao garçom autenticado

**Tipos de evento retornados:**

| Tipo | Origem | Urgência padrão |
|---|---|---|
| `kitchen_ready` | Pedido com status `ready` na cozinha | critical |
| `bar_ready` | Pedido com status `ready` no bar | critical |
| `payment_needed` | Cliente sem app solicitou conta | high |
| `customer_call` | Chamado genérico de garçom | high |
| `courtesy_request` | Pedido de cortesia aguardando resposta | medium |
| `table_transfer` | Solicitação de troca de mesa | low |

**Schema de resposta:**

```typescript
interface SituationalEvent {
  id: string;
  type: 'kitchen_ready' | 'bar_ready' | 'payment_needed' |
        'customer_call' | 'courtesy_request' | 'table_transfer';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  tableNumber: number;
  detail: string;           // Descrição legível pelo garçom
  relatedOrderId?: string;  // ID do pedido relacionado (quando aplicável)
  createdAt: string;        // ISO 8601
  resolvedAt?: string;      // null enquanto pendente
}

// Resposta do endpoint
interface SituationalFeedResponse {
  events: SituationalEvent[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
}
```

**Exemplo de resposta:**

```json
{
  "events": [
    {
      "id": "evt-uuid-1",
      "type": "kitchen_ready",
      "urgency": "critical",
      "tableNumber": 5,
      "detail": "2x Filé ao Molho de Vinho — Chef Felipe marcou PRONTO há 2min",
      "relatedOrderId": "order-uuid-1",
      "createdAt": "2026-03-23T20:15:00Z",
      "resolvedAt": null
    },
    {
      "id": "evt-uuid-2",
      "type": "payment_needed",
      "urgency": "high",
      "tableNumber": 1,
      "detail": "1 convidado sem app precisa de cobrança via garçom",
      "relatedOrderId": "order-uuid-2",
      "createdAt": "2026-03-23T20:12:00Z",
      "resolvedAt": null
    }
  ],
  "summary": {
    "critical": 2,
    "high": 2,
    "medium": 1,
    "low": 1,
    "resolved": 0
  }
}
```

**Lógica de priorização no service:**

```typescript
// backend/src/orders/orders.service.ts — método getSituationalFeed
const URGENCY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

const sortedEvents = events.sort((a, b) => {
  const urgencyDiff = URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency];
  if (urgencyDiff !== 0) return urgencyDiff;
  // Desempate por tempo: mais antigo primeiro dentro do mesmo nível
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
});
```

**Endpoint de resolução:**

```
PATCH /orders/waiter/situational-feed/:eventId/resolve
Body: { resolvedAction: string }   // Ex.: "Retirei da cozinha"
```

---

### GET /orders/kds/kitchen?station=

Adaptar o endpoint existente `GET /orders/kds/kitchen` para aceitar o parâmetro
opcional `?station=` que filtra pedidos por estação de preparo.

**Parâmetro:** `station` (opcional) — valores: `grelhados` | `frios` | `massas`

**Mapeamento de keywords por estação** (baseado no demo `RoleScreens.tsx` linhas 431–435):

```typescript
// backend/src/orders/orders.service.ts
const STATION_KEYWORDS: Record<string, string[]> = {
  grelhados: ['Filé', 'Salmão', 'Polvo', 'Picanha', 'Costela'],
  frios: ['Tartare', 'Ceviche', 'Burrata', 'Carpaccio', 'Salada'],
  massas: ['Risoto', 'Ravioli', 'Fettuccine', 'Penne', 'Gnocchi'],
};

// Filtro aplicado nos items do pedido:
// Se station está presente, retornar apenas pedidos que possuem
// ao menos um item cujo menu_item.name contém alguma keyword da estação.
```

**Comportamento sem parâmetro:** retorna todos os pedidos ativos de cozinha (comportamento
atual preservado — sem breaking change).

**Exemplo de request:**
```
GET /orders/kds/kitchen?station=grelhados
Authorization: Bearer <jwt>
```

---

## FEATURE 7.1 — Waiter Actions Screen

**Arquivo mobile (criar):**
`mobile/apps/restaurant/src/screens/waiter-actions/WaiterActionsScreen.tsx`

**Referência demo:** `src/components/demo/restaurant/RoleScreens.tsx` linhas 807–930

O feed deve ser atualizado via WebSocket (evento `waiter:feed:update`) e polling de
30 segundos como fallback. A UI prioriza feedback visual imediato com animações pulse
para eventos críticos.

---

### US-7.1.1 — Ver feed de ações priorizadas

**Como** garçom,
**quero** ver todas as minhas ações pendentes em um único feed ordenado por urgência,
**para que** eu possa sempre saber o que fazer a seguir sem precisar checar múltiplas
telas ou depender de comunicação verbal com a cozinha.

#### Critérios de Aceite

- [ ] Banner de urgência pulsante exibido quando há eventos `critical` pendentes
- [ ] Banner mostra contagem de pratos prontos para retirar
- [ ] Stats bar mostra contagem por nível: Cozinha (critical), Clientes (high), Outros (medium+low), Resolvidos
- [ ] Action cards ordenados por urgência descendente (critical primeiro)
- [ ] Cada card exibe: número da mesa, tempo decorrido, título da ação, detalhe contextual
- [ ] Badge visual por nível: vermelho/IMEDIATO (critical), laranja/URGENTE (high), azul (medium), cinza (low)
- [ ] Cards críticos têm animação pulse ativa
- [ ] Estado vazio ("Tudo em dia!") exibido quando não há ações pendentes
- [ ] Feed atualiza automaticamente via WebSocket (evento `waiter:feed:update`)
- [ ] Pull-to-refresh disponível como fallback manual

#### Specs Técnicos

```typescript
// WaiterActionsScreen.tsx — estrutura de estado
const [events, setEvents] = useState<SituationalEvent[]>([]);
const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
const [expandedId, setExpandedId] = useState<string | null>(null);

// Derivados por urgência
const activeEvents = useMemo(
  () => events.filter(e => !resolvedIds.has(e.id)),
  [events, resolvedIds]
);

const criticalEvents = activeEvents.filter(e => e.urgency === 'critical');
const highEvents     = activeEvents.filter(e => e.urgency === 'high');
const otherEvents    = activeEvents.filter(e => !['critical', 'high'].includes(e.urgency));

// Banner pulsante — baseado no demo RoleScreens.tsx linhas 842-850
// Mostra quando criticalEvents.length > 0
```

**Design tokens por nível de urgência:**

| Nível | Cor de borda | Cor de fundo | Cor do badge | Texto badge |
|---|---|---|---|---|
| critical | `colors.error` | `errorBackground` | `colors.error` | IMEDIATO |
| high | `colors.warning` | `warningBackground` | `colors.warning` | URGENTE |
| medium | `colors.info` | `infoBackground` | `colors.info` | — |
| low | `colors.border` | `colors.card` | `colors.mutedForeground` | — |

**WebSocket listener:**

```typescript
useEffect(() => {
  socketService.on('waiter:feed:update', (updatedFeed: SituationalFeedResponse) => {
    setEvents(updatedFeed.events);
  });
  return () => socketService.off('waiter:feed:update');
}, []);
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `waiterActions.title` | Minhas Ações | My Actions | Mis Acciones |
| `waiterActions.banner.critical` | {count} prato(s) pronto(s) para retirar! | {count} dish(es) ready for pickup! | ¡{count} plato(s) listo(s) para retirar! |
| `waiterActions.banner.sub` | A cozinha está esperando — cada minuto conta | Kitchen is waiting — every minute counts | La cocina espera — cada minuto cuenta |
| `waiterActions.stats.kitchen` | Cozinha | Kitchen | Cocina |
| `waiterActions.stats.customers` | Clientes | Customers | Clientes |
| `waiterActions.stats.other` | Outros | Other | Otros |
| `waiterActions.stats.resolved` | Resolvidos | Resolved | Resueltos |
| `waiterActions.badge.immediate` | IMEDIATO | IMMEDIATE | INMEDIATO |
| `waiterActions.badge.urgent` | URGENTE | URGENT | URGENTE |
| `waiterActions.empty.title` | Tudo em dia! | All caught up! | ¡Todo al día! |
| `waiterActions.empty.sub` | Nenhuma ação pendente no momento | No pending actions right now | Sin acciones pendientes ahora |
| `waiterActions.timeAgo` | {time} atrás | {time} ago | hace {time} |

#### Testes

```typescript
describe('WaiterActionsScreen', () => {
  it('exibe banner pulsante quando há eventos critical', () => {
    const events = [mockCriticalEvent];
    render(<WaiterActionsScreen events={events} />);
    expect(screen.getByTestId('urgency-banner')).toBeTruthy();
  });

  it('ordena eventos por urgência (critical antes de high)', () => {
    const events = [mockHighEvent, mockCriticalEvent];
    render(<WaiterActionsScreen events={events} />);
    const cards = screen.getAllByTestId('action-card');
    expect(cards[0]).toHaveAccessibilityValue({ text: 'critical' });
  });

  it('não exibe banner quando não há eventos critical', () => {
    const events = [mockHighEvent, mockLowEvent];
    render(<WaiterActionsScreen events={events} />);
    expect(screen.queryByTestId('urgency-banner')).toBeNull();
  });

  it('exibe estado vazio quando todos os eventos estão resolvidos', () => {
    render(<WaiterActionsScreen events={[]} />);
    expect(screen.getByText('Tudo em dia!')).toBeTruthy();
  });

  it('atualiza feed ao receber evento WebSocket waiter:feed:update', () => {
    // mock socketService, emitir evento, verificar re-render
  });
});
```

---

### US-7.1.2 — Retirar prato da cozinha

**Como** garçom,
**quero** confirmar a retirada de um prato da cozinha diretamente no feed de ações,
**para que** o sistema registre o momento da retirada e a cozinha saiba que o prato
foi expedido.

#### Critérios de Aceite

- [ ] Cards do tipo `kitchen_ready` e `bar_ready` têm urgência `critical`
- [ ] Card expandido exibe sub-ações: "Retirei da cozinha" e "Servi na mesa"
- [ ] Clicar em "Retirei da cozinha" chama `PATCH .../resolve` com ação registrada
- [ ] Após resolver, o card sai do feed (animação fade-out)
- [ ] Resolução atualiza o status do pedido relacionado para `delivering`
- [ ] Notificação de confirmação exibida por 2 segundos após resolução

#### Specs Técnicos

```typescript
// Sub-ações expandíveis — baseado no demo RoleScreens.tsx linhas 814-819
const kitchenReadySubActions = [
  {
    label: t('waiterActions.subAction.pickedUp'),
    resolvedAction: 'picked_up_from_kitchen',
    nextOrderStatus: 'delivering' as OrderStatus,
    style: 'primary',
  },
  {
    label: t('waiterActions.subAction.served'),
    resolvedAction: 'served_at_table',
    nextOrderStatus: 'completed' as OrderStatus,
    style: 'secondary',
  },
];

const handleResolveEvent = async (eventId: string, resolvedAction: string) => {
  await ApiService.resolveWaiterEvent(eventId, { resolvedAction });
  setResolvedIds(prev => new Set([...prev, eventId]));
  // Feedback visual transitório
  showToast(t('waiterActions.resolved'), 'success', 2000);
};
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `waiterActions.subAction.pickedUp` | Retirei da cozinha | Picked up from kitchen | Retiré de la cocina |
| `waiterActions.subAction.served` | Servi na mesa | Served at table | Serví en la mesa |
| `waiterActions.subAction.confirmAction` | Confirmar Retirada | Confirm Pickup | Confirmar Retiro |
| `waiterActions.resolved` | Ação registrada! | Action recorded! | ¡Acción registrada! |
| `waiterActions.event.kitchenReady` | Prato pronto — retirar agora | Dish ready — pick up now | Plato listo — retirar ahora |
| `waiterActions.event.barReady` | Drink pronto — servir | Drink ready — serve now | Bebida lista — servir ahora |

#### Testes

```typescript
describe('US-7.1.2 — kitchen pickup', () => {
  it('exibe sub-ações ao expandir card kitchen_ready', () => {
    // pressionar card, verificar sub-actions visíveis
  });

  it('chama API de resolução com ação correta', async () => {
    const resolveSpy = jest.spyOn(ApiService, 'resolveWaiterEvent').mockResolvedValue(undefined);
    // pressionar "Retirei da cozinha"
    expect(resolveSpy).toHaveBeenCalledWith(
      expect.any(String),
      { resolvedAction: 'picked_up_from_kitchen' }
    );
  });

  it('remove card do feed após resolução', async () => {
    // resolver evento, verificar que card não está mais visível
  });
});
```

---

### US-7.1.3 — Resolver chamado de pagamento

**Como** garçom,
**quero** ver e atender chamados de pagamento de clientes que não possuem o app,
**para que** eu saiba qual mesa precisa de cobrança manual e com qual método de pagamento
proceder.

#### Critérios de Aceite

- [ ] Eventos `payment_needed` aparecem com urgência `high` no feed
- [ ] Card exibe detalhe: "X convidado(s) sem app — cobrança via garçom"
- [ ] Sub-ações disponíveis: "TAP to Pay", "PIX", "Dinheiro"
- [ ] Após selecionar método, resolve o evento e navega para tela de pagamento (se aplicável)
- [ ] Resolução registra o método de pagamento escolhido no evento

#### Specs Técnicos

```typescript
// Sub-ações para payment_needed — baseado no demo RoleScreens.tsx linha 825
const paymentSubActions = [
  { label: t('waiterActions.payment.tap'), resolvedAction: 'tap_to_pay', icon: 'contactless-payment' },
  { label: t('waiterActions.payment.pix'), resolvedAction: 'pix_payment', icon: 'qrcode' },
  { label: t('waiterActions.payment.cash'), resolvedAction: 'cash_payment', icon: 'cash' },
];
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `waiterActions.event.paymentNeeded` | Conta solicitada | Bill requested | Cuenta solicitada |
| `waiterActions.payment.tap` | TAP to Pay | TAP to Pay | TAP to Pay |
| `waiterActions.payment.pix` | PIX | PIX | PIX |
| `waiterActions.payment.cash` | Dinheiro | Cash | Efectivo |
| `waiterActions.payment.detail` | {count} convidado(s) sem app — cobrança via garçom | {count} guest(s) without app — manual billing | {count} invitado(s) sin app — cobro manual |

#### Testes

```typescript
describe('US-7.1.3 — payment resolution', () => {
  it('exibe 3 opções de pagamento ao expandir card payment_needed', () => {
    // verificar presença de TAP to Pay, PIX e Dinheiro
  });

  it('registra método de pagamento na resolução do evento', async () => {
    const resolveSpy = jest.spyOn(ApiService, 'resolveWaiterEvent').mockResolvedValue(undefined);
    // selecionar PIX
    expect(resolveSpy).toHaveBeenCalledWith(
      expect.any(String),
      { resolvedAction: 'pix_payment' }
    );
  });
});
```

---

### US-7.1.4 — Solicitar cortesia ao gerente

**Como** garçom,
**quero** solicitar aprovação de cortesia para um cliente diretamente do feed de ações,
**para que** eu não precise buscar o gerente fisicamente para aprovação.

#### Critérios de Aceite

- [ ] Eventos `courtesy_request` aparecem com urgência `medium`
- [ ] Card exibe: mesa, item da cortesia, contexto (ex.: "aniversário")
- [ ] Sub-ação "Enviar pedido ao gerente" cria uma aprovação pendente no módulo de aprovações
- [ ] Após envio, card exibe badge "Aguardando gerente" e fica em estado pendente (não removido do feed)
- [ ] Quando gerente aprova ou recusa, o evento é atualizado via WebSocket
- [ ] Resolução final (aprovada ou recusada) remove o card do feed com feedback visual

#### Specs Técnicos

```typescript
// Fluxo de cortesia — baseado no demo RoleScreens.tsx linha 827-828
// Evento type: 'courtesy_request' → urgency: 'medium'
// Sub-ação cria uma entrada em PENDING_APPROVALS (módulo de aprovações)

const handleRequestCourtesy = async (eventId: string, tableNumber: number) => {
  // Cria aprovação pendente
  await ApiService.createApprovalRequest({
    type: 'courtesy',
    tableNumber,
    relatedEventId: eventId,
    requestedBy: currentWaiter.name,
  });
  // Marca evento como "aguardando aprovação" (não resolvido ainda)
  setEventState(eventId, 'pending_approval');
};

// WebSocket: ao gerente aprovar/recusar, evento 'approval:resolved' é emitido
socketService.on('approval:resolved', ({ eventId, approved }) => {
  if (approved) {
    setResolvedIds(prev => new Set([...prev, eventId]));
    showToast(t('waiterActions.courtesy.approved'), 'success');
  } else {
    setResolvedIds(prev => new Set([...prev, eventId]));
    showToast(t('waiterActions.courtesy.refused'), 'error');
  }
});
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `waiterActions.event.courtesy` | Cortesia pendente | Pending courtesy | Cortesía pendiente |
| `waiterActions.courtesy.request` | Solicitar aprovação | Request approval | Solicitar aprobación |
| `waiterActions.courtesy.sending` | Enviando ao gerente... | Sending to manager... | Enviando al gerente... |
| `waiterActions.courtesy.waiting` | Aguardando gerente | Waiting for manager | Esperando al gerente |
| `waiterActions.courtesy.approved` | Cortesia aprovada! | Courtesy approved! | ¡Cortesía aprobada! |
| `waiterActions.courtesy.refused` | Cortesia recusada | Courtesy refused | Cortesía rechazada |
| `waiterActions.subAction.sendToManager` | Enviar pedido ao gerente | Send request to manager | Enviar solicitud al gerente |

#### Testes

```typescript
describe('US-7.1.4 — courtesy request', () => {
  it('cria aprovação pendente ao clicar Enviar ao gerente', async () => {
    const createApprovalSpy = jest.spyOn(ApiService, 'createApprovalRequest')
      .mockResolvedValue(undefined);
    // pressionar sub-ação
    expect(createApprovalSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'courtesy' })
    );
  });

  it('exibe badge "Aguardando gerente" após envio', async () => {
    // após handleRequestCourtesy, verificar badge no card
    expect(screen.getByText('Aguardando gerente')).toBeTruthy();
  });

  it('remove card quando WebSocket emite approval:resolved', async () => {
    // simular evento WebSocket com approved: true
    // verificar que card não está mais na lista ativa
  });
});
```

---

## FEATURE 7.2 — Cook Station View

**Arquivo mobile:** `mobile/apps/restaurant/src/screens/kds/KDSScreen.tsx`
**Status atual:** Implementado (KDS completo com filtros de status)
**Objetivo:** Adicionar Station Selector tabs para filtrar pedidos por estação de preparo

**Referência demo:** `src/components/demo/restaurant/RoleScreens.tsx` linhas 416–519

A Cook Station não substitui o KDSScreen — é uma view alternativa dentro dele,
ativada por um toggle "Modo Estação". Isso preserva o fluxo atual do chef de cozinha
que usa a visão geral e adiciona o filtro por estação para cozinheiros especializados.

---

### US-7.2.1 — Selecionar estação de preparo

**Como** cozinheiro,
**quero** selecionar minha estação de trabalho (Grelhados, Frios ou Massas) ao entrar
no KDS,
**para que** eu veja apenas os tickets de preparo relevantes para minha estação e
não me distraia com pedidos de outras áreas.

#### Critérios de Aceite

- [ ] Toggle "Modo Estação" disponível no header do KDSScreen
- [ ] Ao ativar o modo estação, Station Selector tabs aparecem: Grelhados, Frios, Massas
- [ ] Cada tab exibe o nome da estação com emoji de contexto e contagem de items ativos
- [ ] Tab selecionada tem estilo ativo (fundo primary + texto primary-foreground)
- [ ] Seleção persiste durante a sessão (AsyncStorage ou state global)
- [ ] Ao desativar modo estação, KDS volta à visão completa normal
- [ ] Contagem de items por estação atualiza em tempo real via WebSocket

#### Specs Técnicos

```typescript
// Extensão do KDSScreen.tsx existente
// Adicionar estado de modo estação

type Station = 'grelhados' | 'frios' | 'massas';

const STATION_CONFIG: Record<Station, { label: string; emoji: string; keywords: string[] }> = {
  grelhados: {
    label: t('kds.station.grelhados'),
    emoji: '🔥',
    keywords: ['Filé', 'Salmão', 'Polvo', 'Picanha', 'Costela'],
  },
  frios: {
    label: t('kds.station.frios'),
    emoji: '❄️',
    keywords: ['Tartare', 'Ceviche', 'Burrata', 'Carpaccio', 'Salada'],
  },
  massas: {
    label: t('kds.station.massas'),
    emoji: '🍝',
    keywords: ['Risoto', 'Ravioli', 'Fettuccine', 'Penne', 'Gnocchi'],
  },
};

// Contagem por estação para exibir no tab
const getStationCount = (station: Station, orders: Order[]): number => {
  const keywords = STATION_CONFIG[station].keywords;
  return orders
    .filter(o => ['confirmed', 'preparing'].includes(o.status))
    .reduce((count, order) => {
      const hasItem = order.items.some(item =>
        keywords.some(kw => item.menu_item?.name?.includes(kw))
      );
      return hasItem ? count + 1 : count;
    }, 0);
};
```

**Parâmetro de query na API ao ativar modo estação:**
```typescript
// Requisição quando modo estação está ativo:
const orders = await ApiService.getKitchenOrders(
  stationMode ? { station: selectedStation } : undefined
);
// GET /orders/kds/kitchen?station=grelhados
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `kds.stationMode` | Modo Estação | Station Mode | Modo Estación |
| `kds.station.grelhados` | Grelhados | Grilled | A la Plancha |
| `kds.station.frios` | Frios | Cold | Fríos |
| `kds.station.massas` | Massas | Pasta | Pastas |
| `kds.station.allStations` | Todas Estações | All Stations | Todas las Estaciones |
| `kds.station.itemsCount` | {count} item(s) | {count} item(s) | {count} ítem(s) |

#### Testes

```typescript
describe('KDSScreen — station selector', () => {
  it('exibe station tabs ao ativar modo estação', () => {
    render(<KDSScreen />);
    fireEvent.press(screen.getByTestId('station-mode-toggle'));
    expect(screen.getByText('Grelhados')).toBeTruthy();
    expect(screen.getByText('Frios')).toBeTruthy();
    expect(screen.getByText('Massas')).toBeTruthy();
  });

  it('tab ativo tem estilo visual diferenciado', () => {
    // verificar backgroundColor do tab selecionado
  });

  it('chama API com parâmetro station ao selecionar tab', async () => {
    const getOrdersSpy = jest.spyOn(ApiService, 'getKitchenOrders').mockResolvedValue([]);
    fireEvent.press(screen.getByText('Grelhados'));
    expect(getOrdersSpy).toHaveBeenCalledWith({ station: 'grelhados' });
  });

  it('volta à visão completa ao desativar modo estação', () => {
    // toggle off, verificar que station tabs não estão visíveis
    // verificar chamada API sem parâmetro station
  });
});
```

---

### US-7.2.2 — Ver tickets filtrados por estação

**Como** cozinheiro da estação de Grelhados,
**quero** ver apenas os tickets com itens da minha estação em cards grandes e
touch-friendly,
**para que** eu possa ler o ticket com clareza mesmo à distância e marcar o preparo
sem precisar de movimentos precisos.

#### Critérios de Aceite

- [ ] Cards exibem apenas os itens relevantes para a estação selecionada
- [ ] Pedidos sem itens da estação atual são completamente ocultados
- [ ] Cards grandes: número de mesa em fonte display 24px+, quantidade em badge 48x48px
- [ ] Bordas vermelhas e animação bounce para pedidos com atraso >= 15 minutos
- [ ] Botão de ação ocupa 100% da largura do card com altura mínima de 56px (touch target)
- [ ] Botão "INICIAR PREPARO" (confirmed → preparing) e "PRONTO" (preparing → ready)
- [ ] Layout 2 colunas em tablets, lista única em celulares
- [ ] Timer decorrido exibido em destaque no header do card

#### Specs Técnicos

Baseado no demo `RoleScreens.tsx` linhas 461–515:

```typescript
// Lógica de filtro de items por estação (equivalente ao demo linha 465-468)
const getRelevantItems = (order: Order, station: Station) => {
  const keywords = STATION_CONFIG[station].keywords;
  return order.items.filter(item =>
    keywords.some(kw => item.menu_item?.name?.includes(kw))
  );
};

// Atraso crítico em cozinha: 15 minutos (mais conservador que barman: 5 min)
const KITCHEN_LATE_MINUTES = 15;

const isLate = (createdAt: string) => {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  return elapsed >= KITCHEN_LATE_MINUTES;
};

// Estilos touch-friendly para ambiente de cozinha
const styles = useMemo(() => StyleSheet.create({
  // ...
  tableNumber: {
    fontSize: 28,           // Legível à distância
    fontWeight: 'bold',
    color: colors.foreground,
  },
  quantityBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
  },
  actionButton: {
    width: '100%',
    height: 56,             // Touch target confortável
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: colors.warning,
  },
  readyButton: {
    backgroundColor: colors.success,
  },
  lateCard: {
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
}), [colors]);
```

**Texto dos botões de ação (equivalente ao demo linha 510):**
- Status `confirmed` → botão laranja: "▶ INICIAR PREPARO"
- Status `preparing` → botão verde: "✓ PRONTO"

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `kds.action.startPreparing` | INICIAR PREPARO | START PREPARING | INICIAR PREP. |
| `kds.action.ready` | PRONTO | READY | LISTO |
| `kds.ticket.lateAlert` | Pedido atrasado! | Order delayed! | ¡Pedido demorado! |
| `kds.ticket.elapsed` | {min}min | {min}min | {min}min |
| `kds.ticket.prepTime` | {min}min preparo | {min}min prep | {min}min prep. |
| `kds.station.noTickets` | Nenhum ticket para sua estação | No tickets for your station | Sin tickets para tu estación |
| `kds.station.noTicketsSub` | Aguardando novos pedidos de {station} | Waiting for new {station} orders | Esperando pedidos de {station} |

**Chaves já existentes em KDSScreen que devem ser mantidas:**

| Chave existente | Preservar |
|---|---|
| `kds.title` | Sim |
| `kds.startPreparing` | Sim (mantido como alias para compatibilidade) |
| `kds.ready` | Sim |
| `kds.newOrders` | Sim |
| `kds.preparing` | Sim |
| `orders.noActiveOrders` | Sim |

#### Testes

```typescript
describe('KDSScreen — station filtered tickets', () => {
  it('exibe apenas items de grelhados quando estação grelhados selecionada', () => {
    const orders = [
      mockOrder({ items: [{ name: 'Filé Mignon', quantity: 1 }] }),
      mockOrder({ items: [{ name: 'Risoto de Funghi', quantity: 1 }] }),
    ];
    render(<KDSScreen initialStation="grelhados" />);
    // apenas o pedido com Filé deve aparecer
    expect(screen.getAllByTestId('order-card')).toHaveLength(1);
  });

  it('oculta pedidos sem items da estação', () => {
    // pedido com apenas Risoto não aparece em estação de Grelhados
  });

  it('exibe borda vermelha em pedido com 15+ minutos', () => {
    const lateOrder = mockOrder({ createdAt: new Date(Date.now() - 16 * 60000).toISOString() });
    // verificar estilo lateCard aplicado
  });

  it('botão INICIAR PREPARO tem altura mínima de 56px', () => {
    // verificar style.height do actionButton
  });

  it('chama updateOrderStatus com preparing ao pressionar INICIAR PREPARO', async () => {
    const updateSpy = jest.spyOn(ApiService, 'updateOrderStatus').mockResolvedValue(undefined);
    fireEvent.press(screen.getByText('INICIAR PREPARO'));
    expect(updateSpy).toHaveBeenCalledWith(expect.any(String), 'preparing');
  });

  it('chama updateOrderStatus com ready ao pressionar PRONTO', async () => {
    const order = mockOrder({ status: 'preparing' });
    const updateSpy = jest.spyOn(ApiService, 'updateOrderStatus').mockResolvedValue(undefined);
    fireEvent.press(screen.getByText('PRONTO'));
    expect(updateSpy).toHaveBeenCalledWith(order.id, 'ready');
  });
});
```

---

## Sequência de Implementação

```
Sprint 3 — Semana 1:
  1. [Backend] Implementar GET /orders/waiter/situational-feed
     - Agregar kitchen_ready, payment_needed, customer_call, courtesy_request, table_transfer
     - Lógica de priorização por urgência
     - PATCH .../resolve endpoint
  2. [Backend] Adaptar GET /orders/kds/kitchen para aceitar ?station=
     - Mapear keywords por estação
     - Testes unitários dos novos endpoints

Sprint 3 — Semana 2:
  3. [Mobile] Criar WaiterActionsScreen — estrutura base e stats bar (US-7.1.1)
  4. [Mobile] Implementar Action Cards com urgência e expansão (US-7.1.1)
  5. [Mobile] WebSocket listener para waiter:feed:update
  6. [Mobile] Fluxo de retirada de prato — kitchen_ready e bar_ready (US-7.1.2)

Sprint 3 — Semana 3:
  7. [Mobile] Fluxo de pagamento — payment_needed sub-ações (US-7.1.3)
  8. [Mobile] Fluxo de cortesia — courtesy_request + approval:resolved (US-7.1.4)
  9. [Mobile] Station Selector tabs no KDSScreen (US-7.2.1)
  10. [Mobile] Filtro de tickets por estação + touch targets (US-7.2.2)
  11. [QA] Testes E2E do fluxo completo: cozinha marca pronto → garçom retira
```

**Dependências:**
- US-7.1.2, 7.1.3 e 7.1.4 dependem do endpoint `GET /orders/waiter/situational-feed`
- US-7.1.4 depende do módulo de aprovações (já existente — `PENDING_APPROVALS`)
- US-7.2.1 e 7.2.2 dependem da adaptação de `GET /orders/kds/kitchen?station=`
- Testes E2E do fluxo cozinha→garçom requerem ambos os módulos implementados

---

## Definition of Done

- [ ] Todos os critérios de aceite das US 7.1.1, 7.1.2, 7.1.3, 7.1.4, 7.2.1 e 7.2.2 verificados
- [ ] Endpoint `GET /orders/waiter/situational-feed` implementado e testado
- [ ] Endpoint `GET /orders/kds/kitchen?station=` adaptado sem breaking change
- [ ] `WaiterActionsScreen` com feed, urgência, expansão e resolução funcionando
- [ ] Animação pulse ativa para eventos critical
- [ ] `KDSScreen` com Station Selector tabs e filtro funcional
- [ ] Touch targets >= 56px de altura nos botões de ação (conformidade WCAG 2.5.5)
- [ ] WebSocket integrado e testado em ambiente de staging
- [ ] Cobertura de testes unitários >= 80% nos novos componentes e services
- [ ] i18n keys cadastradas nos 3 idiomas (PT-BR, EN, ES)
- [ ] Nenhum breaking change no KDSScreen existente (testes de regressão passando)
- [ ] Revisão de design aprovada pelo time de produto
- [ ] Sem warnings de lint no código novo
- [ ] Pull Requests revisados e aprovados por ao menos 1 engenheiro sênior
- [ ] Demo web (RoleScreens.tsx) mantém paridade visual com o app mobile
- [ ] Documentação Swagger/OpenAPI atualizada com novos endpoints e parâmetro `station`

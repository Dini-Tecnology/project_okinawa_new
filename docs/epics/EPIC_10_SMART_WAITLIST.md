# ÉPICO 10 — Smart Waitlist + Family Mode

**Prioridade:** MÉDIA | **Sprint:** 5
**Status:** Backlog
**Apps afetados:** Client App (Casual Dining flow) · Restaurant App (Maitre) · Backend NestJS

---

## Visão Geral

Este épico implementa o fluxo completo de entrada em restaurante casual com fila de espera inteligente e modo família. O design e UX foram prototipados integralmente no `CasualDiningDemo.tsx` (776 linhas), que serve como especificação de referência para as telas: `entry-choice`, `waitlist`, `waitlist-bar`, `family-mode`, `family-activities` e `menu` (com Family Mode ativo).

**Jornada completa (de acordo com `JOURNEY_STEPS` do CasualDiningDemo):**
```
Walk-in ou reserva → Lista de espera inteligente → Modo família → Cardápio interativo → ...
```

**Tipo de restaurante:** Casual Dining (Cantina Noowe — italiano, R$$$)
**Diferencial UX:** O cliente pode pedir drinks enquanto espera na fila, atividades para crianças, e o cardápio kids sobe ao topo automaticamente.

---

## Módulo Backend: `restaurant/waitlist`

Adaptado a partir do módulo `club/queue` (`queue.controller.ts`) com extensões para suportar family mode, drinks na espera e preferência de seating.

### Entidade `WaitlistEntry` — schema TypeORM

```typescript
@Entity('waitlist_entries')
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  restaurantId: string;

  @Column()
  guestName: string;

  @Column({ nullable: true })
  userId: string; // null para walk-ins não autenticados

  @Column({ type: 'int' })
  partySize: number;

  @Column({
    type: 'enum',
    enum: ['salao', 'terraco', 'qualquer'],
    default: 'qualquer',
  })
  preference: 'salao' | 'terraco' | 'qualquer';

  @Column({ default: false })
  hasKids: boolean;

  @Column({ type: 'jsonb', nullable: true })
  kidsAges: number[]; // ex.: [5, 8]

  @Column({ type: 'jsonb', nullable: true })
  kidsAllergies: string[]; // ex.: ["glúten", "lactose"]

  @Column({ type: 'int' })
  position: number; // ordem na fila

  @Column({
    type: 'enum',
    enum: ['waiting', 'called', 'seated', 'cancelled', 'no-show'],
    default: 'waiting',
  })
  status: 'waiting' | 'called' | 'seated' | 'cancelled' | 'no-show';

  @Column({ type: 'jsonb', nullable: true })
  waitlistBarOrders: WaitlistBarOrder[]; // drinks pedidos na espera

  @Column({ nullable: true })
  estimatedWaitMinutes: number;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

interface WaitlistBarOrder {
  itemName: string;
  itemPrice: number;
  quantity: number;
  addedAt: string; // ISO timestamp
}
```

### DTOs

```typescript
// POST /restaurant/waitlist
class JoinWaitlistDto {
  restaurantId: string;
  guestName: string;
  partySize: number; // 1-20
  preference: 'salao' | 'terraco' | 'qualquer';
  hasKids: boolean;
  kidsAges?: number[];
  kidsAllergies?: string[];
}

// PATCH /restaurant/waitlist/:id/call
class CallGuestDto {
  tableNumber?: string; // ex.: "Mesa 8"
  message?: string;
}

// POST /restaurant/waitlist/:id/bar-order
class AddBarOrderDto {
  items: Array<{ itemName: string; itemPrice: number; quantity: number }>;
}
```

### Endpoints `waitlist.controller.ts`

```typescript
@Controller('restaurant/waitlist')
@ApiTags('waitlist')
export class WaitlistController {

  // CLIENT — entrar na fila
  @Post()
  joinWaitlist(@Body() dto: JoinWaitlistDto)
  // Returns: { id, position, estimatedWaitMinutes }

  // CLIENT — consultar posição própria
  @Get('my')
  getMyPosition(
    @CurrentUser() user: any,
    @Query('restaurant_id') restaurantId: string,
  )

  // CLIENT — sair da fila
  @Delete(':id')
  leaveWaitlist(@Param('id') id: string, @CurrentUser() user: any)

  // CLIENT — adicionar pedido de espera (waitlist bar)
  @Post(':id/bar-order')
  addBarOrder(@Param('id') id: string, @Body() dto: AddBarOrderDto)

  // RESTAURANT (MAITRE) — listar fila completa
  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  getWaitlist(@Query('restaurant_id') restaurantId: string)

  // RESTAURANT — estatísticas da fila
  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  getStats(@Query('restaurant_id') restaurantId: string)
  // Returns: { totalWaiting, tablesAvailable, avgWaitMinutes, groupsWithKids }

  // MAITRE — chamar próximo
  @Patch(':id/call')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  callGuest(@Param('id') id: string, @Body() dto: CallGuestDto)

  // MAITRE — confirmar assento (seated)
  @Patch(':id/seat')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  seatGuest(@Param('id') id: string)

  // MAITRE — no-show
  @Patch(':id/no-show')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  markNoShow(@Param('id') id: string)
}
```

### WebSocket — evento `waitlist:update`

Emitido pelo servidor via Socket.IO sempre que a fila é alterada (nova entrada, chamada, assento, cancelamento):

```typescript
// Servidor emite para room `waitlist:{restaurantId}`
socket.to(`waitlist:${restaurantId}`).emit('waitlist:update', {
  type: 'position_change' | 'called' | 'seated' | 'cancelled',
  entryId: string,
  newPosition: number,
  estimatedWaitMinutes: number,
  tableNumber?: string, // presente quando type === 'called'
  queueStats: {
    totalWaiting: number,
    tablesAvailable: number,
    avgWaitMinutes: number,
  }
});

// Cliente subscreve na conexão
socket.emit('subscribe:waitlist', { restaurantId });
```

**Integração com módulo club/queue existente:**
O `queue.controller.ts` existente já implementa `callNext`, `confirmEntry` e `markNoShow`. O novo módulo `waitlist` amplia com suporte a Family Mode, bar orders, e o evento WebSocket com stats completas.

---

## FEATURE 10.1 — Entry Choice Screen

### US-10.1.1 — Escolher forma de entrada no restaurante

**Como** cliente chegando ao restaurante,
**Quero** escolher entre Walk-in com fila inteligente, reserva antecipada ou escaneamento de QR se já estiver sentado,
**Para** iniciar minha experiência da forma mais conveniente.

**Critérios de aceite:**
- [ ] Tela com 3 opções conforme `CasualDiningDemo.tsx` screen `entry-choice`
- [ ] **Walk-in Inteligente** (borda primary, destaque): mostra tempo estimado (~15 min) e grupos na fila (3 grupos), 3 feature chips: "Pedir drinks", "Notificação", "Ver cardápio"
- [ ] **Reserva Antecipada**: mostra slots disponíveis (Hoje 20:00, Hoje 21:00, Amanhã)
- [ ] **Já estou na mesa**: opção com QR Code (navega para scanner)
- [ ] Texto "Como entrar?" como título da tela
- [ ] GuidedHint: "Escolha como deseja entrar — walk-in permite pedir enquanto espera"

**Specs técnicos:**
- Screen: `EntryChoiceScreen`
- API call: `GET /restaurant/waitlist/stats?restaurant_id={id}` para exibir tempo e fila em tempo real
- Navegação após Walk-in: `WaitlistScreen`
- Navegação após Reserva: `ReservationScreen` (épico de reservas)
- Navegação após QR: `QRScanScreen`

**i18n keys:**
```json
// PT-BR
{
  "entryChoice.title": "Como entrar?",
  "entryChoice.hint": "Walk-in permite pedir enquanto espera",
  "entryChoice.walkIn": "Walk-in Inteligente",
  "entryChoice.walkInDesc": "~{{wait}} min · {{groups}} grupos na fila",
  "entryChoice.walkInChipDrinks": "Pedir drinks",
  "entryChoice.walkInChipNotify": "Notificação",
  "entryChoice.walkInChipMenu": "Ver cardápio",
  "entryChoice.reservation": "Reserva Antecipada",
  "entryChoice.reservationDesc": "Garanta sua mesa · Ideal para grupos 5+",
  "entryChoice.alreadySeated": "Já estou na mesa",
  "entryChoice.alreadySeatedDesc": "Escaneie o QR Code da mesa"
}
// EN
{
  "entryChoice.title": "How to enter?",
  "entryChoice.hint": "Walk-in lets you order while waiting",
  "entryChoice.walkIn": "Smart Walk-in",
  "entryChoice.walkInDesc": "~{{wait}} min · {{groups}} groups in line",
  "entryChoice.walkInChipDrinks": "Order drinks",
  "entryChoice.walkInChipNotify": "Notification",
  "entryChoice.walkInChipMenu": "View menu",
  "entryChoice.reservation": "Advance Reservation",
  "entryChoice.reservationDesc": "Secure your table · Best for groups 5+",
  "entryChoice.alreadySeated": "I'm already seated",
  "entryChoice.alreadySeatedDesc": "Scan the table QR Code"
}
// ES
{
  "entryChoice.title": "¿Cómo ingresar?",
  "entryChoice.hint": "Walk-in permite pedir mientras esperas",
  "entryChoice.walkIn": "Walk-in Inteligente",
  "entryChoice.walkInDesc": "~{{wait}} min · {{groups}} grupos en fila",
  "entryChoice.walkInChipDrinks": "Pedir bebidas",
  "entryChoice.walkInChipNotify": "Notificación",
  "entryChoice.walkInChipMenu": "Ver menú",
  "entryChoice.reservation": "Reserva Anticipada",
  "entryChoice.reservationDesc": "Asegura tu mesa · Ideal para grupos 5+",
  "entryChoice.alreadySeated": "Ya estoy en la mesa",
  "entryChoice.alreadySeatedDesc": "Escanea el código QR de la mesa"
}
```

**Testes:**
- [ ] Stats da fila carregam via API (mocked em dev)
- [ ] Cada botão navega para a tela correta
- [ ] Walk-in destaque visual (border-primary) mesmo sem dados da API

---

## FEATURE 10.2 — Smart Waitlist Screen

### US-10.2.1 — Entrar na fila de espera

**Como** cliente,
**Quero** entrar na fila de espera do restaurante informando meu grupo,
**Para** receber minha posição e estimativa de espera.

**Critérios de aceite:**
- [ ] Formulário: nome do responsável, quantidade de pessoas (1-10+), preferência (Salão / Terraço / Qualquer)
- [ ] Opção de ativar Family Mode no formulário (checkbox/toggle com ícone Baby)
- [ ] Ao confirmar: chamada `POST /restaurant/waitlist`, recebe posição e estimativa
- [ ] Navegar automaticamente para `WaitlistPositionScreen` com a posição recebida
- [ ] Confirmar: botão "Entrar na Fila Virtual" — mesmo texto do protótipo

**Specs técnicos:**
- Form state: `{ guestName, partySize, preference, hasKids }`
- API: `POST /restaurant/waitlist` → response `{ id, position, estimatedWaitMinutes }`
- Persistir `waitlistEntryId` no AsyncStorage/SecureStore para recovery após fechar app

**i18n keys:**
```json
// PT-BR
{
  "waitlist.joinTitle": "Entrar na Fila",
  "waitlist.guestName": "Nome do responsável",
  "waitlist.partySize": "Quantas pessoas?",
  "waitlist.preference": "Preferência de mesa",
  "waitlist.prefSalao": "Salão",
  "waitlist.prefTerraco": "Terraço",
  "waitlist.prefAny": "Qualquer",
  "waitlist.hasKids": "Tem crianças?",
  "waitlist.joinButton": "Entrar na Fila Virtual",
  "waitlist.joinSuccess": "Você está na fila! Posição: {{position}}"
}
// EN
{
  "waitlist.joinTitle": "Join Queue",
  "waitlist.guestName": "Name",
  "waitlist.partySize": "How many people?",
  "waitlist.preference": "Table preference",
  "waitlist.prefSalao": "Indoor",
  "waitlist.prefTerraco": "Terrace",
  "waitlist.prefAny": "Any",
  "waitlist.hasKids": "Bringing kids?",
  "waitlist.joinButton": "Join Smart Queue",
  "waitlist.joinSuccess": "You're in the queue! Position: {{position}}"
}
// ES
{
  "waitlist.joinTitle": "Unirse a la Fila",
  "waitlist.guestName": "Nombre del responsable",
  "waitlist.partySize": "¿Cuántas personas?",
  "waitlist.preference": "Preferencia de mesa",
  "waitlist.prefSalao": "Salón",
  "waitlist.prefTerraco": "Terraza",
  "waitlist.prefAny": "Cualquiera",
  "waitlist.hasKids": "¿Hay niños?",
  "waitlist.joinButton": "Entrar en la Fila Virtual",
  "waitlist.joinSuccess": "¡Estás en la fila! Posición: {{position}}"
}
```

**Testes:**
- [ ] Nome vazio: erro de validação
- [ ] partySize 0: erro de validação
- [ ] API erro 503: mensagem "Fila temporariamente indisponível"
- [ ] Entry id persistido no storage após resposta

---

### US-10.2.2 — Acompanhar posição em tempo real

**Como** cliente na fila,
**Quero** acompanhar minha posição em tempo real com animações,
**Para** saber quando minha mesa estará pronta.

**Critérios de aceite:**
- [ ] Posição numérica exibida no centro com ring animado (spinner de borda, 3s por rotação) — idêntico ao protótipo `waitlist` do CasualDiningDemo
- [ ] Texto de estimativa: "Estimativa: ~{queuePos * 5} min"
- [ ] 3 chips de stats: Pessoas, Mesa (A definir / número quando chamado), Status (Na fila / Chamado)
- [ ] Atualização em tempo real via WebSocket `waitlist:update`
- [ ] Quando posição = 1 e status = 'called': banner de alerta pulsante "Sua mesa está pronta!" com número da mesa
- [ ] Botão para sair da fila (com confirmação)
- [ ] Posição animada: decrementos com transição suave
- [ ] Push notification quando posição <= 2

**Specs técnicos:**
- WebSocket: subscrever em `waitlist:{restaurantId}`, escutar `waitlist:update`
- Animação: `Animated.spring` para mudança de número de posição
- `useEffect` para simular decremento a cada 4000ms (dev) — baseado no `setInterval` do CasualDiningDemo
- Push notification: `expo-notifications` ao receber evento `called`

**i18n keys:**
```json
// PT-BR
{
  "waitlist.position": "{{pos}}º na fila",
  "waitlist.estimate": "Estimativa: ~{{min}} min",
  "waitlist.people": "Pessoas",
  "waitlist.table": "Mesa",
  "waitlist.status": "Status",
  "waitlist.statusWaiting": "Na fila",
  "waitlist.statusCalled": "Chamado!",
  "waitlist.tableReady": "Sua mesa está pronta!",
  "waitlist.tableReadyDesc": "Mesa {{table}} · Dirija-se à recepção",
  "waitlist.leave": "Sair da Fila",
  "waitlist.leaveConfirm": "Deseja sair da fila?",
  "waitlist.whileWaiting": "Enquanto espera:",
  "waitlist.orderDrinks": "Pedir drinks e aperitivos",
  "waitlist.orderDrinksDesc": "Vai direto pra sua comanda",
  "waitlist.viewMenu": "Ver cardápio e favoritar",
  "waitlist.viewMenuDesc": "Adiante seu pedido"
}
// EN
{
  "waitlist.position": "{{pos}}th in line",
  "waitlist.estimate": "Estimate: ~{{min}} min",
  "waitlist.people": "People",
  "waitlist.table": "Table",
  "waitlist.status": "Status",
  "waitlist.statusWaiting": "In queue",
  "waitlist.statusCalled": "Called!",
  "waitlist.tableReady": "Your table is ready!",
  "waitlist.tableReadyDesc": "Table {{table}} · Head to the host",
  "waitlist.leave": "Leave Queue",
  "waitlist.leaveConfirm": "Leave the queue?",
  "waitlist.whileWaiting": "While you wait:",
  "waitlist.orderDrinks": "Order drinks & appetizers",
  "waitlist.orderDrinksDesc": "Added to your tab",
  "waitlist.viewMenu": "Browse & favorite menu items",
  "waitlist.viewMenuDesc": "Plan your order in advance"
}
// ES
{
  "waitlist.position": "{{pos}}° en la fila",
  "waitlist.estimate": "Estimado: ~{{min}} min",
  "waitlist.people": "Personas",
  "waitlist.table": "Mesa",
  "waitlist.status": "Estado",
  "waitlist.statusWaiting": "En fila",
  "waitlist.statusCalled": "¡Llamado!",
  "waitlist.tableReady": "¡Tu mesa está lista!",
  "waitlist.tableReadyDesc": "Mesa {{table}} · Dirígete a recepción",
  "waitlist.leave": "Salir de la Fila",
  "waitlist.leaveConfirm": "¿Salir de la fila?",
  "waitlist.whileWaiting": "Mientras esperas:",
  "waitlist.orderDrinks": "Pedir bebidas y aperitivos",
  "waitlist.orderDrinksDesc": "Va directo a tu cuenta",
  "waitlist.viewMenu": "Ver y favoritar el menú",
  "waitlist.viewMenuDesc": "Planifica tu pedido"
}
```

**Testes:**
- [ ] WebSocket desconectado: fallback para polling a cada 30s
- [ ] Status "called" dispara banner animado + push notification
- [ ] `queuePos` reduz de 3 a 1 em steps de 4s (simulação dev)
- [ ] Botão "Sair da Fila" dispara `DELETE /restaurant/waitlist/:id`

---

### US-10.2.3 — Pedir drinks enquanto espera (Waitlist Bar)

**Como** cliente na fila,
**Quero** pedir drinks e aperitivos enquanto aguardo minha mesa,
**Para** aproveitar a espera e ter os itens já incluídos na minha comanda.

**Critérios de aceite:**
- [ ] Tela "Pedir na Espera" acessível via botão "Pedir drinks e aperitivos" na WaitlistScreen
- [ ] Lista de 4+ itens disponíveis: Caipirinha (R$22), Cerveja Artesanal (R$18), Suco Natural (R$12), Porção de Pão de Alho (R$16) — baseados no `waitlistDrinks` do CasualDiningDemo
- [ ] Cada item: foto/ícone, nome, preço, botão "+"
- [ ] Resumo do pedido de espera na parte inferior
- [ ] Botão "Confirmar Pedido" (se há itens) / "Voltar para Fila" (se vazio)
- [ ] GuidedHint: "Peça drinks e aperitivos — tudo vai pra comanda da mesa"
- [ ] Pedido confirmado via `POST /restaurant/waitlist/:id/bar-order`
- [ ] Ao sentar na mesa, os bar orders aparecem na comanda principal

**Specs técnicos:**
- Items do bar: `GET /restaurant/:id/waitlist-bar-menu` (ou config estática)
- State: `barOrders: Array<{ name, price }>` — mesmo padrão do CasualDiningDemo
- Subtotal calculado em tempo real

**i18n keys:**
```json
// PT-BR
{
  "waitlistBar.title": "Pedir na Espera",
  "waitlistBar.hint": "Peça drinks — tudo vai pra comanda da mesa",
  "waitlistBar.yourOrder": "Seu pedido de espera:",
  "waitlistBar.total": "Total",
  "waitlistBar.confirm": "Confirmar Pedido",
  "waitlistBar.back": "Voltar para Fila",
  "waitlistBar.orderSent": "Pedido enviado! Será preparado enquanto espera.",
  "waitlistBar.addedToTab": "Adicionado à comanda"
}
// EN
{
  "waitlistBar.title": "Order While Waiting",
  "waitlistBar.hint": "Order drinks — all added to your table tab",
  "waitlistBar.yourOrder": "Your waiting order:",
  "waitlistBar.total": "Total",
  "waitlistBar.confirm": "Confirm Order",
  "waitlistBar.back": "Back to Queue",
  "waitlistBar.orderSent": "Order sent! Being prepared while you wait.",
  "waitlistBar.addedToTab": "Added to tab"
}
// ES
{
  "waitlistBar.title": "Pedir Mientras Esperas",
  "waitlistBar.hint": "Pide bebidas — todo va a tu cuenta",
  "waitlistBar.yourOrder": "Tu pedido de espera:",
  "waitlistBar.total": "Total",
  "waitlistBar.confirm": "Confirmar Pedido",
  "waitlistBar.back": "Volver a la Fila",
  "waitlistBar.orderSent": "¡Pedido enviado! Se prepara mientras esperas.",
  "waitlistBar.addedToTab": "Agregado a la cuenta"
}
```

**Testes:**
- [ ] Adicionar 2 items: subtotal calculado corretamente
- [ ] Confirmar pedido sem items: não chama API (botão desabilitado)
- [ ] barOrders visíveis na ComandaScreen após sentar

---

## FEATURE 10.3 — Family Mode

### US-10.3.1 — Ativar modo família

**Como** cliente com crianças,
**Quero** ativar o Modo Família,
**Para** receber benefícios especiais: cardápio kids em destaque, cadeirão, kit de atividades, alerta de alérgenos para crianças e prioridade nos pratos kids.

**Critérios de aceite:**
- [ ] Toggle "Modo Família" visível na WaitlistScreen com ícone Baby
- [ ] Ao ativar: navega para `FamilyModeScreen`
- [ ] Card "Modo Família Ativado" com gradiente primary → accent
- [ ] 5 features listadas (conforme CasualDiningDemo `family-mode`):
  1. Cardápio Kids em destaque (itens kids primeiro)
  2. Cadeirão reservado ("Já preparamos tudo para vocês")
  3. Kit de atividades ("Jogos e colorir na mesa")
  4. Pratos kids primeiro ("Crianças comem antes, sem espera")
  5. Alerta de alérgenos ("Itens com alérgenos infantis destacados")
- [ ] Botão "Ver Atividades Disponíveis" → navega para `FamilyActivitiesScreen`
- [ ] Botão "Ver Cardápio Completo" → navega para `MenuScreen` com `familyMode=true`
- [ ] Badge "Modo Família" visível no menu quando ativo: "Modo Família ativo — Kids Menu em destaque"

**Specs técnicos:**
- State global: `familyMode: boolean` (Context API ou Zustand)
- `MenuScreen`: quando `familyMode=true`, ordenar MENU com `kids` items no topo
- Sorting: `filtered.sort((a, b) => (b.kids ? 1 : 0) - (a.kids ? 1 : 0))` — exatamente como no CasualDiningDemo

**i18n keys:**
```json
// PT-BR
{
  "familyMode.title": "Modo Família",
  "familyMode.activated": "Modo Família Ativado",
  "familyMode.kidsMenu": "Cardápio Kids em destaque",
  "familyMode.kidsMenuDesc": "Itens especiais para crianças primeiro",
  "familyMode.highchair": "Cadeirão reservado",
  "familyMode.highchairDesc": "Já preparamos tudo para vocês",
  "familyMode.activityKit": "Kit de atividades",
  "familyMode.activityKitDesc": "Jogos e colorir na mesa",
  "familyMode.kidsFirst": "Pratos kids primeiro",
  "familyMode.kidsFirstDesc": "Crianças comem antes, sem espera",
  "familyMode.allergenAlert": "Alerta de alérgenos",
  "familyMode.allergenAlertDesc": "Itens com alérgenos infantis destacados",
  "familyMode.seeActivities": "Ver Atividades Disponíveis",
  "familyMode.seeMenu": "Ver Cardápio Completo",
  "familyMode.menuBadge": "Modo Família ativo — Kids Menu em destaque",
  "familyMode.toggle": "Modo Família",
  "familyMode.toggleDesc": "Cardápio kids, cadeirão e atividades"
}
// EN
{
  "familyMode.title": "Family Mode",
  "familyMode.activated": "Family Mode Activated",
  "familyMode.kidsMenu": "Kids menu highlighted",
  "familyMode.kidsMenuDesc": "Special items for kids first",
  "familyMode.highchair": "Highchair reserved",
  "familyMode.highchairDesc": "We've prepared everything for you",
  "familyMode.activityKit": "Activity kit",
  "familyMode.activityKitDesc": "Games and coloring at the table",
  "familyMode.kidsFirst": "Kids dishes served first",
  "familyMode.kidsFirstDesc": "Kids eat first, no waiting",
  "familyMode.allergenAlert": "Allergen alerts",
  "familyMode.allergenAlertDesc": "Items with children's allergens highlighted",
  "familyMode.seeActivities": "See Available Activities",
  "familyMode.seeMenu": "View Full Menu",
  "familyMode.menuBadge": "Family Mode active — Kids Menu highlighted",
  "familyMode.toggle": "Family Mode",
  "familyMode.toggleDesc": "Kids menu, highchair and activities"
}
// ES
{
  "familyMode.title": "Modo Familia",
  "familyMode.activated": "Modo Familia Activado",
  "familyMode.kidsMenu": "Menú Kids destacado",
  "familyMode.kidsMenuDesc": "Platos especiales para niños primero",
  "familyMode.highchair": "Silla alta reservada",
  "familyMode.highchairDesc": "Ya preparamos todo para ustedes",
  "familyMode.activityKit": "Kit de actividades",
  "familyMode.activityKitDesc": "Juegos y dibujos en la mesa",
  "familyMode.kidsFirst": "Platos para niños primero",
  "familyMode.kidsFirstDesc": "Los niños comen antes, sin espera",
  "familyMode.allergenAlert": "Alerta de alérgenos",
  "familyMode.allergenAlertDesc": "Platos con alérgenos infantiles destacados",
  "familyMode.seeActivities": "Ver Actividades Disponibles",
  "familyMode.seeMenu": "Ver Menú Completo",
  "familyMode.menuBadge": "Modo Familia activo — Menú Kids destacado",
  "familyMode.toggle": "Modo Familia",
  "familyMode.toggleDesc": "Menú kids, silla alta y actividades"
}
```

**Testes:**
- [ ] Toggle ativo: `familyMode` state = true
- [ ] MenuScreen com familyMode=true: kids items primeiro na lista
- [ ] Badge "Modo Família" visível no menu apenas quando ativo
- [ ] Desativar: kids items voltam à posição padrão

---

### US-10.3.2 — Registrar criança com alergias

**Como** cliente no Modo Família,
**Quero** registrar o nome, idade e alergias de cada criança do grupo,
**Para** que o restaurante e o cardápio se adaptem às necessidades das crianças.

**Critérios de aceite:**
- [ ] Seção "Quem são as crianças?" na FamilyModeScreen
- [ ] Exibir crianças já registradas em card: avatar colorido (purple), nome, idade, alergias
- [ ] Botão "Adicionar Criança" → bottom sheet ou modal
- [ ] Campos: Nome, Idade (1-17 anos), Alergias (multi-select: Glúten, Lactose, Amendoim, Frutos do Mar, Ovos, Nenhuma)
- [ ] Check verde no card após registrar
- [ ] Dados enviados ao restaurante via `PATCH /restaurant/waitlist/:id` com `kidsAges` e `kidsAllergies`
- [ ] Protótipo exibe "Sofia · 5 anos · Alergias: Nenhuma"

**Specs técnicos:**
- PEOPLE data no CasualDiningDemo: `{ id: 'p4', name: 'Sofia', isKid: true }`
- API: `PATCH /restaurant/waitlist/:id` body `{ kidsAges: [5], kidsAllergies: [] }`
- Na ComandaScreen: crianças identificadas com badge "Kids" (ícone Baby, cor purple)

**i18n keys:**
```json
// PT-BR
{
  "familyMode.childrenTitle": "Quem são as crianças?",
  "familyMode.addChild": "Adicionar Criança",
  "familyMode.childName": "Nome da criança",
  "familyMode.childAge": "Idade",
  "familyMode.childAllergies": "Alergias",
  "familyMode.allergyGluten": "Glúten",
  "familyMode.allergyLactose": "Lactose",
  "familyMode.allergyPeanut": "Amendoim",
  "familyMode.allergySeafood": "Frutos do Mar",
  "familyMode.allergyEggs": "Ovos",
  "familyMode.allergyNone": "Nenhuma",
  "familyMode.childYears": "{{age}} anos"
}
// EN
{
  "familyMode.childrenTitle": "Who are the children?",
  "familyMode.addChild": "Add Child",
  "familyMode.childName": "Child's name",
  "familyMode.childAge": "Age",
  "familyMode.childAllergies": "Allergies",
  "familyMode.allergyGluten": "Gluten",
  "familyMode.allergyLactose": "Lactose",
  "familyMode.allergyPeanut": "Peanut",
  "familyMode.allergySeafood": "Seafood",
  "familyMode.allergyEggs": "Eggs",
  "familyMode.allergyNone": "None",
  "familyMode.childYears": "{{age}} years old"
}
// ES
{
  "familyMode.childrenTitle": "¿Quiénes son los niños?",
  "familyMode.addChild": "Agregar Niño",
  "familyMode.childName": "Nombre del niño",
  "familyMode.childAge": "Edad",
  "familyMode.childAllergies": "Alergias",
  "familyMode.allergyGluten": "Gluten",
  "familyMode.allergyLactose": "Lactosa",
  "familyMode.allergyPeanut": "Maní",
  "familyMode.allergySeafood": "Mariscos",
  "familyMode.allergyEggs": "Huevos",
  "familyMode.allergyNone": "Ninguna",
  "familyMode.childYears": "{{age}} años"
}
```

**Testes:**
- [ ] Adicionar criança sem nome: erro de validação
- [ ] Idade 0 ou 18+: erro de validação
- [ ] Criança com alergias: alérgenos destacados nos itens do menu (badge warning)
- [ ] Dados enviados ao backend ao confirmar

---

### US-10.3.3 — Acessar atividades para crianças

**Como** cliente no Modo Família,
**Quero** ver as atividades disponíveis para crianças no restaurante,
**Para** entreter as crianças enquanto aguardamos a comida.

**Critérios de aceite:**
- [ ] Tela "Atividades Kids" com lista de 4 atividades (conforme CasualDiningDemo `family-activities`):
  1. **Colorir na Mesa** — Kit de lápis e desenhos da Cantina — status: Disponível
  2. **Quiz da Pizza** — Jogo interativo no tablet da mesa — status: Disponível
  3. **Caça ao Tesouro** — Encontre 5 itens escondidos no restaurante — status: Em breve
  4. **Chef Mirim** — Monte sua própria mini pizza (30 min) — status: Disponível
- [ ] Badge verde "Disponível" ou "Em breve" (muted)
- [ ] Atividades disponíveis: card com borda primary/5, fundo primary/5
- [ ] Atividades em breve: card muted, opacidade reduzida
- [ ] GuidedHint: "Atividades para entreter as crianças enquanto a comida chega"
- [ ] Botão "Ir para o Cardápio" no final

**Specs técnicos:**
- Screen: `FamilyActivitiesScreen`
- Dados das atividades: estáticos na v1, dinâmicos na v2 via `GET /restaurant/:id/activities`
- Atividades mapeadas do CasualDiningDemo: `{ name, desc, icon, active }`

**i18n keys:**
```json
// PT-BR
{
  "activities.title": "Atividades Kids",
  "activities.hint": "Atividades para entreter as crianças",
  "activities.available": "Disponível",
  "activities.comingSoon": "Em breve",
  "activities.goToMenu": "Ir para o Cardápio",
  "activities.colorir": "Colorir na Mesa",
  "activities.colorirDesc": "Kit de lápis e desenhos da Cantina",
  "activities.quiz": "Quiz da Pizza",
  "activities.quizDesc": "Jogo interativo no tablet da mesa",
  "activities.treasure": "Caça ao Tesouro",
  "activities.treasureDesc": "Encontre 5 itens escondidos no restaurante",
  "activities.chef": "Chef Mirim",
  "activities.chefDesc": "Monte sua própria mini pizza (30 min)"
}
// EN
{
  "activities.title": "Kids Activities",
  "activities.hint": "Activities to entertain children",
  "activities.available": "Available",
  "activities.comingSoon": "Coming soon",
  "activities.goToMenu": "Go to Menu",
  "activities.colorir": "Coloring at the Table",
  "activities.colorirDesc": "Pencil kit and restaurant drawings",
  "activities.quiz": "Pizza Quiz",
  "activities.quizDesc": "Interactive game on the table tablet",
  "activities.treasure": "Treasure Hunt",
  "activities.treasureDesc": "Find 5 hidden items in the restaurant",
  "activities.chef": "Junior Chef",
  "activities.chefDesc": "Make your own mini pizza (30 min)"
}
// ES
{
  "activities.title": "Actividades Kids",
  "activities.hint": "Actividades para entretener a los niños",
  "activities.available": "Disponible",
  "activities.comingSoon": "Próximamente",
  "activities.goToMenu": "Ir al Menú",
  "activities.colorir": "Colorear en la Mesa",
  "activities.colorirDesc": "Kit de lápices y dibujos del restaurante",
  "activities.quiz": "Quiz de Pizza",
  "activities.quizDesc": "Juego interactivo en la tablet",
  "activities.treasure": "Búsqueda del Tesoro",
  "activities.treasureDesc": "Encuentra 5 objetos escondidos",
  "activities.chef": "Chef Mirim",
  "activities.chefDesc": "Arma tu propia mini pizza (30 min)"
}
```

**Testes:**
- [ ] 4 atividades renderizadas: 3 disponíveis, 1 "em breve"
- [ ] Atividade "em breve": pointer-events: none, opacidade 0.5
- [ ] Botão "Ir para o Cardápio" navega para MenuScreen com familyMode=true

---

## FEATURE 10.4 — Gestão de Waitlist (Maitre / Restaurant App)

### US-10.4.1 — Ver fila em tempo real

**Como** Maitre ou gerente do restaurante,
**Quero** ver a fila de espera completa em tempo real,
**Para** gerenciar a entrada de clientes de forma eficiente.

**Critérios de aceite:**
- [ ] Lista de todos os grupos na fila, ordenada por posição
- [ ] Cada item: posição, nome do responsável, tamanho do grupo, preferência, tempo de espera, status
- [ ] Grupos com crianças: ícone Kids (Baby icon, cor purple) visível
- [ ] Grupos com bar orders: ícone de bebida + quantidade de itens pedidos
- [ ] Stats no topo: total na fila, mesas disponíveis, tempo médio de espera, grupos com família
- [ ] Atualização em tempo real via WebSocket `waitlist:update`
- [ ] Pull-to-refresh como fallback
- [ ] Filtro por status: Todos, Aguardando, Chamados

**Specs técnicos:**
- Screen: `WaitlistManagementScreen` no Restaurant App
- API: `GET /restaurant/waitlist?restaurant_id={id}`
- WebSocket: mesmo canal `waitlist:{restaurantId}`
- Stats: `GET /restaurant/waitlist/stats?restaurant_id={id}`

**i18n keys:**
```json
// PT-BR
{
  "waitlistMgmt.title": "Fila de Espera",
  "waitlistMgmt.totalWaiting": "Na fila",
  "waitlistMgmt.tablesAvailable": "Mesas livres",
  "waitlistMgmt.avgWait": "Espera média",
  "waitlistMgmt.familyGroups": "Com família",
  "waitlistMgmt.filterAll": "Todos",
  "waitlistMgmt.filterWaiting": "Aguardando",
  "waitlistMgmt.filterCalled": "Chamados",
  "waitlistMgmt.emptyQueue": "Fila vazia",
  "waitlistMgmt.kidsLabel": "Kids",
  "waitlistMgmt.barOrdersLabel": "{{count}} pedido(s) na espera"
}
// EN
{
  "waitlistMgmt.title": "Waitlist",
  "waitlistMgmt.totalWaiting": "In queue",
  "waitlistMgmt.tablesAvailable": "Tables free",
  "waitlistMgmt.avgWait": "Avg wait",
  "waitlistMgmt.familyGroups": "With family",
  "waitlistMgmt.filterAll": "All",
  "waitlistMgmt.filterWaiting": "Waiting",
  "waitlistMgmt.filterCalled": "Called",
  "waitlistMgmt.emptyQueue": "Empty queue",
  "waitlistMgmt.kidsLabel": "Kids",
  "waitlistMgmt.barOrdersLabel": "{{count}} waiting order(s)"
}
// ES
{
  "waitlistMgmt.title": "Lista de Espera",
  "waitlistMgmt.totalWaiting": "En fila",
  "waitlistMgmt.tablesAvailable": "Mesas libres",
  "waitlistMgmt.avgWait": "Espera media",
  "waitlistMgmt.familyGroups": "Con familia",
  "waitlistMgmt.filterAll": "Todos",
  "waitlistMgmt.filterWaiting": "Esperando",
  "waitlistMgmt.filterCalled": "Llamados",
  "waitlistMgmt.emptyQueue": "Fila vacía",
  "waitlistMgmt.kidsLabel": "Niños",
  "waitlistMgmt.barOrdersLabel": "{{count}} pedido(s) en espera"
}
```

**Testes:**
- [ ] Lista vazia: estado "Fila vazia" exibido
- [ ] Grupo com `hasKids=true`: ícone Baby visível
- [ ] Stats atualizam via WebSocket sem refresh manual
- [ ] Filtro "Chamados": mostra apenas status='called'

---

### US-10.4.2 — Chamar próximo grupo

**Como** Maitre,
**Quero** chamar o próximo grupo da fila ou um grupo específico,
**Para** acomodá-lo na mesa disponível.

**Critérios de aceite:**
- [ ] Botão "Chamar" em cada card de grupo na fila (destaque no primeiro da fila)
- [ ] Ao tocar "Chamar": modal para informar número da mesa (input obrigatório)
- [ ] Confirmar chamada: `PATCH /restaurant/waitlist/:id/call` com `{ tableNumber: "Mesa 8" }`
- [ ] Cliente recebe push notification + WebSocket event com número da mesa
- [ ] Status do grupo muda para "Chamado" (badge warning)
- [ ] Após chamar: botões "Sentado" e "No-show" visíveis no card
- [ ] "Sentado": `PATCH /restaurant/waitlist/:id/seat` → status='seated', remove da fila
- [ ] "No-show": `PATCH /restaurant/waitlist/:id/no-show` → status='no-show', próximo avança
- [ ] Reposicionamento automático da fila após qualquer ação

**Specs técnicos:**
- Modal: `CallGuestSheet` (bottom sheet) com input de número da mesa
- Animação de remoção do card: `LayoutAnimation.configureNext`
- O endpoint `callNext` do `queue.controller.ts` existente serve como referência

**i18n keys:**
```json
// PT-BR
{
  "waitlistMgmt.call": "Chamar",
  "waitlistMgmt.callGuest": "Chamar grupo",
  "waitlistMgmt.tableNumber": "Número da mesa",
  "waitlistMgmt.tableNumberPlaceholder": "Ex.: Mesa 8",
  "waitlistMgmt.confirmCall": "Chamar grupo",
  "waitlistMgmt.seated": "Sentado",
  "waitlistMgmt.noShow": "No-show",
  "waitlistMgmt.calledStatus": "Chamado",
  "waitlistMgmt.seatedStatus": "Sentado",
  "waitlistMgmt.callSuccess": "{{name}} foi chamado para a {{table}}",
  "waitlistMgmt.seatedSuccess": "{{name}} foi acomodado na {{table}}",
  "waitlistMgmt.noShowSuccess": "{{name}} marcado como no-show"
}
// EN
{
  "waitlistMgmt.call": "Call",
  "waitlistMgmt.callGuest": "Call group",
  "waitlistMgmt.tableNumber": "Table number",
  "waitlistMgmt.tableNumberPlaceholder": "E.g.: Table 8",
  "waitlistMgmt.confirmCall": "Call group",
  "waitlistMgmt.seated": "Seated",
  "waitlistMgmt.noShow": "No-show",
  "waitlistMgmt.calledStatus": "Called",
  "waitlistMgmt.seatedStatus": "Seated",
  "waitlistMgmt.callSuccess": "{{name}} called to {{table}}",
  "waitlistMgmt.seatedSuccess": "{{name}} seated at {{table}}",
  "waitlistMgmt.noShowSuccess": "{{name}} marked as no-show"
}
// ES
{
  "waitlistMgmt.call": "Llamar",
  "waitlistMgmt.callGuest": "Llamar grupo",
  "waitlistMgmt.tableNumber": "Número de mesa",
  "waitlistMgmt.tableNumberPlaceholder": "Ej.: Mesa 8",
  "waitlistMgmt.confirmCall": "Llamar grupo",
  "waitlistMgmt.seated": "Sentado",
  "waitlistMgmt.noShow": "No-show",
  "waitlistMgmt.calledStatus": "Llamado",
  "waitlistMgmt.seatedStatus": "Sentado",
  "waitlistMgmt.callSuccess": "{{name}} llamado a {{table}}",
  "waitlistMgmt.seatedSuccess": "{{name}} acomodado en {{table}}",
  "waitlistMgmt.noShowSuccess": "{{name}} marcado como no-show"
}
```

**Testes:**
- [ ] Chamar sem número de mesa: erro de validação
- [ ] Chamar: status do card muda para "Chamado" imediatamente (optimistic)
- [ ] No-show: próximo grupo avança uma posição via WebSocket
- [ ] Push notification enviada ao cliente chamado (via FCM/APNs)

---

## Sequência de Implementação

```
Sprint 5 — Semana 1:
1. Backend: criar módulo restaurant/waitlist
   - WaitlistEntry entity + migrations
   - WaitlistService (join, getPosition, leave, call, seat, no-show)
   - WaitlistController com todos os endpoints
   - WebSocket gateway: emitir waitlist:update

Sprint 5 — Semana 2:
2. Client: EntryChoiceScreen (US-10.1.1)
3. Client: JoinWaitlistScreen + WaitlistPositionScreen (US-10.2.1, 10.2.2)
4. Client: WaitlistBarScreen (US-10.2.3)

Sprint 5 — Semana 3:
5. Client: FamilyModeScreen (US-10.3.1, 10.3.2)
6. Client: FamilyActivitiesScreen (US-10.3.3)
7. Client: MenuScreen com Family Mode (sort kids items)

Sprint 5 — Semana 4:
8. Restaurant: WaitlistManagementScreen (US-10.4.1)
9. Restaurant: CallGuestSheet + ações de Maitre (US-10.4.2)
10. Integração WebSocket client ↔ backend
11. Push notifications para "mesa pronta"
12. QA + testes e2e
```

**Dependências:**
- `ÉPICO 3` — Auth e roles (STAFF role necessário para Maitre)
- `ÉPICO 5` — Orders/Comanda — bar orders integram com a comanda da mesa
- Socket.IO gateway já configurado no projeto NestJS
- `expo-notifications` configurado no Client App

---

## Definition of Done

- [ ] Todos os critérios de aceite de cada US verificados manualmente
- [ ] Entidade `WaitlistEntry` migrada no banco PostgreSQL
- [ ] Cobertura de testes unitários >= 80% no `WaitlistService`
- [ ] Testes de integração para os endpoints críticos: POST `/waitlist`, PATCH `/waitlist/:id/call`, PATCH `/waitlist/:id/seat`
- [ ] WebSocket `waitlist:update` testado com múltiplos clientes simultâneos
- [ ] i18n implementado nas 3 línguas (PT-BR, EN, ES) sem chave faltando
- [ ] Design tokens aplicados (sem cores hardcoded) — purple-500 para kids → substituir por design token `color.kids`
- [ ] Family Mode state persistido entre navegações (Context ou Zustand)
- [ ] Acessibilidade: todos os ícones têm `accessibilityLabel`
- [ ] Performance: `FlatList` para lista da fila com `getItemLayout` definido
- [ ] Offline graceful: sem WebSocket, exibir dados cached + botão de refresh
- [ ] Push notifications configuradas para Android (FCM) e iOS (APNs)
- [ ] Documentação Swagger completa para todos os endpoints do módulo waitlist
- [ ] PR aprovado por 1 reviewer
- [ ] Fluxo completo (entry-choice → waitlist → bar → family → menu) testado em staging
- [ ] Deploy em staging validado pelo PO

# ÉPICO 9 — Loyalty + Promotions + Coupons

**Prioridade:** MÉDIA | **Sprint:** 4
**Status:** Backlog
**Apps afetados:** Client App · Restaurant App · Backend NestJS

---

## Visão Geral

Este épico implementa o sistema completo de fidelidade (loyalty), promoções e cupons da plataforma NOOWE. Baseia-se nas telas já prototipadas em `FineDiningDemo.tsx` (LoyaltyScreen), `LoyaltyScreenV2.tsx`, `LoyaltyDetailScreenV2.tsx`, `CouponsScreenV2.tsx` e `LoyaltyManagementScreenV2.tsx`, além do controller backend já existente em `backend/src/modules/loyalty/loyalty.controller.ts`.

**Tier ladder:**
| Tier     | Pontos mínimos |
|----------|---------------|
| Silver   | 500 pts       |
| Gold     | 1.000 pts     |
| Platinum | 2.000 pts     |
| Black    | 5.000 pts     |

---

## Módulo `loyalty` — adequações ao backend existente

O controller `loyalty.controller.ts` já expõe os endpoints base. As adequações necessárias para suportar gestão pelo restaurante são:

```typescript
// Endpoints a ADICIONAR ao loyalty.controller.ts

// 1. Gestão de rewards pelo restaurante
@Post('rewards')
@Roles(UserRole.OWNER, UserRole.MANAGER)
createReward(@Body() dto: CreateRewardDto)

@Patch('rewards/:id')
@Roles(UserRole.OWNER, UserRole.MANAGER)
updateReward(@Param('id') id: string, @Body() dto: UpdateRewardDto)

@Delete('rewards/:id')
@Roles(UserRole.OWNER, UserRole.MANAGER)
deleteReward(@Param('id') id: string)

// 2. Configuração do programa
@Patch('program')
@Roles(UserRole.OWNER, UserRole.MANAGER)
updateProgram(@Body() dto: UpdateLoyaltyProgramDto)
// DTO já existe: UpdateLoyaltyProgramDto

// 3. Stamp cards (por service type)
@Get('stamps')
getMyStamps(@CurrentUser() user: any, @Query('restaurant_id') restaurantId: string)

@Post('stamps/add')
@Roles(UserRole.OWNER, UserRole.MANAGER)
addStamp(@Body() dto: AddStampDto)
```

**Entidade `Reward` — schema TypeORM:**
```typescript
@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() restaurantId: string;
  @Column() name: string;
  @Column() description: string;
  @Column() pointsCost: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) serviceType: string; // dine-in | delivery | takeout
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

**Entidade `StampCard` — schema TypeORM:**
```typescript
@Entity('stamp_cards')
export class StampCard {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() restaurantId: string;
  @Column() serviceType: string; // dine-in | delivery | takeout
  @Column({ default: 0 }) currentStamps: number;
  @Column({ default: 10 }) requiredStamps: number;
  @Column({ default: 0 }) completedCycles: number;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

## Módulo `promotions` — novo

**Entidade `Promotion` — schema TypeORM:**
```typescript
@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() restaurantId: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'enum', enum: ['percentage', 'fixed'] }) discountType: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) discountValue: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) minimumOrderValue: number;
  @Column({ type: 'timestamp' }) validFrom: Date;
  @Column({ type: 'timestamp' }) validUntil: Date;
  @Column({ nullable: true }) usageLimit: number;
  @Column({ default: 0 }) usedCount: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

**Endpoints `promotions.controller.ts`:**
```typescript
@Controller('promotions')
export class PromotionsController {
  // CRUD básico
  @Post()        createPromotion(@Body() dto: CreatePromotionDto)
  @Get()         listPromotions(@Query('restaurant_id') restaurantId: string)
  @Get(':id')    getPromotion(@Param('id') id: string)
  @Patch(':id')  updatePromotion(@Param('id') id: string, @Body() dto: UpdatePromotionDto)
  @Delete(':id') deletePromotion(@Param('id') id: string)

  // Validação no checkout
  @Post('validate')
  validatePromotion(@Body() dto: ValidatePromotionDto)
  // Body: { code: string, restaurantId: string, orderValue: number }
  // Returns: { valid: boolean, discount: number, message?: string }
}
```

---

## FEATURE 9.1 — Loyalty Tier System (Client App)

### US-9.1.1 — Ver tier atual e progresso para o próximo

**Como** cliente NOOWE,
**Quero** visualizar meu tier atual, pontos acumulados e progresso para o próximo nível,
**Para** ter motivação para continuar utilizando a plataforma.

**Critérios de aceite:**
- [ ] Exibir card hero com gradiente baseado no tier atual (Silver → Gray, Gold → Amber, Platinum → Cyan, Black → Dark)
- [ ] Mostrar pontos totais com formatação (ex.: 1.269)
- [ ] Barra de progresso animada indicando % para o próximo tier
- [ ] Texto dinâmico: "Faltam {X} pontos para {nextTier}"
- [ ] Lista dos 4 tiers em row (Silver, Gold, Platinum, Black) com tier ativo destacado
- [ ] Tier Black não exibe "próximo nível"

**Specs técnicos:**
- Screen: `LoyaltyScreenV2` (já existente como stub em `LoyaltyScreenV2.tsx`)
- API call: `GET /loyalty/profile?restaurant_id={id}`
- API call: `GET /loyalty/tiers`
- State: `loyaltyProfile: { points, tier, nextTierPoints, nextTierName }`
- Animação de barra: `Animated.Value` com `useNativeDriver: false`

**i18n keys:**
```json
// PT-BR
{
  "loyalty.title": "Programa de Fidelidade",
  "loyalty.yourPoints": "Seus Pontos",
  "loyalty.progressTo": "Faltam {{points}} pontos para {{tier}}",
  "loyalty.tierActive": "Nível atual",
  "loyalty.reachedBlack": "Você atingiu o nível máximo!"
}
// EN
{
  "loyalty.title": "Loyalty Program",
  "loyalty.yourPoints": "Your Points",
  "loyalty.progressTo": "{{points}} points to {{tier}}",
  "loyalty.tierActive": "Current tier",
  "loyalty.reachedBlack": "You've reached the highest tier!"
}
// ES
{
  "loyalty.title": "Programa de Fidelidad",
  "loyalty.yourPoints": "Tus Puntos",
  "loyalty.progressTo": "Faltan {{points}} puntos para {{tier}}",
  "loyalty.tierActive": "Nivel actual",
  "loyalty.reachedBlack": "¡Alcanzaste el nivel máximo!"
}
```

**Testes:**
- [ ] Exibir corretamente pontos = 0 (Silver sem progresso)
- [ ] Exibir corretamente pontos = 4999 (quase Black)
- [ ] Exibir corretamente pontos = 5000+ (Black, sem próximo tier)
- [ ] Animação da barra dispara ao montar o componente

---

### US-9.1.2 — Ver rewards disponíveis e resgatar pontos

**Como** cliente,
**Quero** ver as recompensas disponíveis para resgate e realizar o resgate,
**Para** usufruir dos benefícios acumulados.

**Critérios de aceite:**
- [ ] Listar rewards com nome, custo em pontos e ícone
- [ ] Rewards com custo <= pontos do usuário: botão "Resgatar" ativo (primary)
- [ ] Rewards com custo > pontos: exibir "Faltam X pts" em muted, botão desabilitado
- [ ] Ao tocar "Resgatar": modal de confirmação com nome do reward e custo
- [ ] Após confirmação: pontos debitados, toast de sucesso, lista atualizada
- [ ] Rewards ativos no FineDiningDemo: Sobremesa grátis (500pts), Drink da casa (800pts), Entrada premium (1200pts), Jantar para 2 (3000pts)

**Specs técnicos:**
- API call: `GET /loyalty/rewards?restaurant_id={id}`
- API call: `POST /loyalty/redeem?restaurant_id={id}` com body `RedeemRewardDto`
- Modal: `RewardConfirmationSheet` (bottom sheet)

**i18n keys:**
```json
// PT-BR
{
  "loyalty.rewards": "Recompensas",
  "loyalty.redeem": "Resgatar",
  "loyalty.redeemConfirm": "Confirmar resgate de {{reward}}?",
  "loyalty.redeemSuccess": "Recompensa resgatada com sucesso!",
  "loyalty.pointsMissing": "Faltam {{points}} pts",
  "loyalty.redeemCost": "Custo: {{points}} pontos"
}
// EN
{
  "loyalty.rewards": "Rewards",
  "loyalty.redeem": "Redeem",
  "loyalty.redeemConfirm": "Confirm redeeming {{reward}}?",
  "loyalty.redeemSuccess": "Reward redeemed successfully!",
  "loyalty.pointsMissing": "Need {{points}} more pts",
  "loyalty.redeemCost": "Cost: {{points}} points"
}
// ES
{
  "loyalty.rewards": "Recompensas",
  "loyalty.redeem": "Canjear",
  "loyalty.redeemConfirm": "¿Confirmar canje de {{reward}}?",
  "loyalty.redeemSuccess": "¡Recompensa canjeada con éxito!",
  "loyalty.pointsMissing": "Faltan {{points}} pts",
  "loyalty.redeemCost": "Costo: {{points}} puntos"
}
```

**Testes:**
- [ ] Botão Resgatar desabilitado quando pontos insuficientes
- [ ] Modal aparece corretamente antes do resgate
- [ ] Pontos são debitados imediatamente no state local (optimistic update)
- [ ] Erro de rede: mostrar toast de erro, rollback de pontos

---

### US-9.1.3 — Ver histórico de pontos ganhos/usados

**Como** cliente,
**Quero** ver o histórico de todas as transações de pontos,
**Para** entender como meu saldo foi formado.

**Critérios de aceite:**
- [ ] Lista cronológica (mais recente primeiro)
- [ ] Pontos ganhos: cor success, prefixo "+"
- [ ] Pontos usados: cor destructive, prefixo "-"
- [ ] Cada entrada: descrição (ex.: "Visita ao Bistrô Noowe"), data, pontos
- [ ] Suportar paginação (scroll infinito ou "Ver mais")
- [ ] Estado vazio: ilustração + "Nenhuma transação ainda"

**Specs técnicos:**
- API call: `GET /loyalty/history?restaurant_id={id}&page={n}&limit=20`
- Baseado no histórico do `LoyaltyDetailScreenV2.tsx`: entries com `type: 'earn' | 'redeem'`

**i18n keys:**
```json
// PT-BR
{
  "loyalty.history": "Histórico",
  "loyalty.historyEmpty": "Nenhuma transação ainda",
  "loyalty.earned": "Ganhou",
  "loyalty.redeemed": "Resgatou",
  "loyalty.loadMore": "Ver mais"
}
// EN
{
  "loyalty.history": "History",
  "loyalty.historyEmpty": "No transactions yet",
  "loyalty.earned": "Earned",
  "loyalty.redeemed": "Redeemed",
  "loyalty.loadMore": "Load more"
}
// ES
{
  "loyalty.history": "Historial",
  "loyalty.historyEmpty": "Sin transacciones aún",
  "loyalty.earned": "Ganado",
  "loyalty.redeemed": "Canjeado",
  "loyalty.loadMore": "Ver más"
}
```

**Testes:**
- [ ] Paginação: carrega página 2 ao chegar no fim da lista
- [ ] Transações positivas exibem verde, negativas exibem vermelho
- [ ] Estado vazio renderizado corretamente

---

### US-9.1.4 — Ver stamp card progress por service type

**Como** cliente,
**Quero** acompanhar meu cartão de selos por tipo de visita (presencial, delivery, takeout),
**Para** saber quantas visitas faltam para completar meu ciclo de recompensas.

**Critérios de aceite:**
- [ ] 3 stamp cards: Dine-in, Delivery, Takeout
- [ ] Cada card: grade de selos (ex.: 10 selos, preenchidos = visitas completadas)
- [ ] Ao completar 10 selos: destaque visual (animação confetti) + reward automático
- [ ] Selos ganhos nesta visita: destaque com animação de entrada
- [ ] Exibir quantas vezes o ciclo foi completado ("Ciclos completos: 3")

**Specs técnicos:**
- API call: `GET /loyalty/stamps?restaurant_id={id}`
- Stamp visual: `StampGrid` component (10 slots, ícone filled/unfilled)
- Animação: `react-native-animatable` ou `Animated`

**i18n keys:**
```json
// PT-BR
{
  "loyalty.stampCard": "Cartão de Selos",
  "loyalty.stampDineIn": "Presencial",
  "loyalty.stampDelivery": "Delivery",
  "loyalty.stampTakeout": "Retirada",
  "loyalty.stampsCompleted": "Ciclos completos: {{count}}",
  "loyalty.stampsToGo": "{{remaining}} selos para completar"
}
// EN
{
  "loyalty.stampCard": "Stamp Card",
  "loyalty.stampDineIn": "Dine-in",
  "loyalty.stampDelivery": "Delivery",
  "loyalty.stampTakeout": "Takeout",
  "loyalty.stampsCompleted": "Completed cycles: {{count}}",
  "loyalty.stampsToGo": "{{remaining}} stamps to complete"
}
// ES
{
  "loyalty.stampCard": "Tarjeta de Sellos",
  "loyalty.stampDineIn": "En el Local",
  "loyalty.stampDelivery": "Entrega",
  "loyalty.stampTakeout": "Para Llevar",
  "loyalty.stampsCompleted": "Ciclos completados: {{count}}",
  "loyalty.stampsToGo": "{{remaining}} sellos para completar"
}
```

**Testes:**
- [ ] Card com 0 selos: todos os slots vazios
- [ ] Card com 10/10 selos: todos preenchidos + badge "Completo"
- [ ] Animação de conclusão dispara somente uma vez

---

## FEATURE 9.2 — Profile com Tier Badge (Client App)

### US-9.2.1 — Exibir tier + progresso na tela de perfil

**Como** cliente,
**Quero** ver meu nível de fidelidade e progresso diretamente na tela de perfil,
**Para** ter visibilidade rápida sem precisar acessar a tela de loyalty.

**Critérios de aceite:**
- [ ] Card de loyalty na ProfileScreen: tier name + ícone Crown + pontos + barra de progresso
- [ ] Toque no card: navega para tela LoyaltyScreen
- [ ] Tier badge no avatar do usuário (small badge no canto inferior direito)
- [ ] Baseado no estado atual do FineDiningDemo.tsx ProfileScreen: "Nível Gold · 62% para Platinum"
- [ ] Dados do `LoyaltyScreenV2.tsx`: `stats` (47 Reservas, R$ 2.4k economizado, 12 Indicações)

**Specs técnicos:**
- Componente: `TierProgressCard` reutilizável
- Props: `{ tier, points, nextTierPoints, nextTierName, onPress }`
- Inserir na `ProfileScreen` existente logo abaixo do header do usuário

**i18n keys:**
```json
// PT-BR
{
  "profile.loyaltyCard": "Programa de Fidelidade",
  "profile.tierLevel": "Nível {{tier}}",
  "profile.pointsShort": "{{points}} pts"
}
// EN
{
  "profile.loyaltyCard": "Loyalty Program",
  "profile.tierLevel": "{{tier}} Level",
  "profile.pointsShort": "{{points}} pts"
}
// ES
{
  "profile.loyaltyCard": "Programa de Fidelidad",
  "profile.tierLevel": "Nivel {{tier}}",
  "profile.pointsShort": "{{points}} pts"
}
```

**Testes:**
- [ ] Card exibido mesmo quando pontos = 0 (Silver, 0%)
- [ ] Toque no card navega para tela de loyalty
- [ ] Badge no avatar exibe cor correta por tier

---

## FEATURE 9.3 — Coupons Screen (Client App)

### US-9.3.1 — Ver cupons disponíveis

**Como** cliente,
**Quero** ver todos os cupons disponíveis para mim,
**Para** aproveitar descontos na minha próxima visita.

**Critérios de aceite:**
- [ ] Listagem de cupons com card visual estilizado (baseado em `CouponsScreenV2.tsx`)
- [ ] Cada cupom exibe: código, desconto (valor ou %), descrição, validade, ícone por tipo
- [ ] Tipos de desconto: percentage (%), fixed (R$), delivery (frete grátis), gift (brinde)
- [ ] Design de ticket com elementos decorativos (círculos nas laterais, linha tracejada)
- [ ] Campo de input para adicionar código de cupom manualmente
- [ ] Botão "Aplicar" ao lado do input
- [ ] Estado vazio: "Fique de olho! Novos cupons são adicionados frequentemente"
- [ ] Cupons expirados visualmente indicados (opacity reduzida)

**Specs técnicos:**
- Screen: `CouponsScreen` (baseado em `CouponsScreenV2.tsx`)
- API call: `GET /promotions?restaurant_id={id}` — lista promotions ativas para o usuário
- Os 4 cupons do stub: OKINAWA20 (20% OFF), PRIMEIRACOMPRA (R$15 OFF), FRETEGRATIS, SOBREMESA

**i18n keys:**
```json
// PT-BR
{
  "coupons.title": "Meus Cupons",
  "coupons.available": "{{count}} cupons disponíveis",
  "coupons.inputPlaceholder": "Adicionar código de cupom",
  "coupons.apply": "Aplicar",
  "coupons.expires": "Válido até {{date}}",
  "coupons.noExpiry": "Sem data de validade",
  "coupons.empty": "Fique de olho! Novos cupons em breve"
}
// EN
{
  "coupons.title": "My Coupons",
  "coupons.available": "{{count}} coupons available",
  "coupons.inputPlaceholder": "Add coupon code",
  "coupons.apply": "Apply",
  "coupons.expires": "Valid until {{date}}",
  "coupons.noExpiry": "No expiration date",
  "coupons.empty": "Stay tuned! New coupons coming soon"
}
// ES
{
  "coupons.title": "Mis Cupones",
  "coupons.available": "{{count}} cupones disponibles",
  "coupons.inputPlaceholder": "Agregar código de cupón",
  "coupons.apply": "Aplicar",
  "coupons.expires": "Válido hasta {{date}}",
  "coupons.noExpiry": "Sin fecha de vencimiento",
  "coupons.empty": "¡Atento! Nuevos cupones próximamente"
}
```

**Testes:**
- [ ] 4 tipos de cupom renderizados corretamente com ícone correspondente
- [ ] Cupom expirado: opacity 0.5, sem botão de copiar
- [ ] Input aceita código e chama a API de validação

---

### US-9.3.2 — Copiar/aplicar cupom no checkout

**Como** cliente,
**Quero** copiar o código do cupom ou aplicá-lo diretamente no checkout,
**Para** garantir o desconto na minha conta.

**Critérios de aceite:**
- [ ] Botão "Copiar" em cada cupom: copia código para clipboard
- [ ] Feedback visual após cópia: ícone muda para Check (verde) por 2 segundos
- [ ] Na tela de pagamento (checkout): campo "Tem um cupom?" com input
- [ ] Ao aplicar: chamada `POST /promotions/validate`, exibe desconto calculado no resumo
- [ ] Desconto exibido em linha separada no resumo do pagamento (cor success)
- [ ] Cupom inválido: mensagem de erro inline "Cupom inválido ou expirado"
- [ ] Cupom válido: exibir nome do desconto e valor abatido

**Specs técnicos:**
- Integração com `DemoPayment` / tela de checkout existente
- API: `POST /promotions/validate` body: `{ code, restaurantId, orderValue }`
- Response: `{ valid: boolean, discount: number, message?: string }`
- `navigator.clipboard.writeText(code)` no web / `Clipboard.setString(code)` no RN

**i18n keys:**
```json
// PT-BR
{
  "coupons.copy": "Copiar",
  "coupons.copied": "Copiado!",
  "coupons.applyAtCheckout": "Tem um cupom?",
  "coupons.discount": "Desconto: -R$ {{value}}",
  "coupons.invalidCode": "Cupom inválido ou expirado",
  "coupons.applied": "Cupom {{code}} aplicado!"
}
// EN
{
  "coupons.copy": "Copy",
  "coupons.copied": "Copied!",
  "coupons.applyAtCheckout": "Have a coupon?",
  "coupons.discount": "Discount: -R$ {{value}}",
  "coupons.invalidCode": "Invalid or expired coupon",
  "coupons.applied": "Coupon {{code}} applied!"
}
// ES
{
  "coupons.copy": "Copiar",
  "coupons.copied": "¡Copiado!",
  "coupons.applyAtCheckout": "¿Tienes un cupón?",
  "coupons.discount": "Descuento: -R$ {{value}}",
  "coupons.invalidCode": "Cupón inválido o vencido",
  "coupons.applied": "¡Cupón {{code}} aplicado!"
}
```

**Testes:**
- [ ] `handleCopy` muda estado `copiedId` por 2s e reverte
- [ ] API validate retorna erro: mensagem inline exibida
- [ ] Desconto aparece no resumo e total é recalculado
- [ ] Não permite aplicar mais de 1 cupom simultaneamente

---

## FEATURE 9.4 — Loyalty Management (Restaurant App)

### US-9.4.1 — Configurar programa de pontos

**Como** gerente de restaurante,
**Quero** configurar as regras do programa de pontos,
**Para** personalizar a experiência de fidelidade para meus clientes.

**Critérios de aceite:**
- [ ] Tela baseada em `LoyaltyManagementScreenV2.tsx`
- [ ] Dashboard com 4 stats: Membros totais (1247), Ativos este mês, Pontos emitidos, Resgates
- [ ] Configurar pontos por R$ gasto (ex.: 1 ponto por R$ 1)
- [ ] Configurar thresholds de tier (Silver, Gold, Platinum, Black)
- [ ] Toggle para ativar/desativar programa
- [ ] Salvar configurações via `PATCH /loyalty/program`

**Specs técnicos:**
- Screen: `LoyaltyManagementScreen` no Restaurant App
- API: `PATCH /loyalty/program` com `UpdateLoyaltyProgramDto`
- Stats: `GET /loyalty/statistics?restaurant_id={id}` (OWNER/MANAGER only)
- Form: React Hook Form + Zod validation

**i18n keys:**
```json
// PT-BR
{
  "loyaltyMgmt.title": "Fidelidade",
  "loyaltyMgmt.subtitle": "Gestão do programa",
  "loyaltyMgmt.members": "Membros",
  "loyaltyMgmt.active": "Ativos",
  "loyaltyMgmt.pointsIssued": "Pontos Emitidos",
  "loyaltyMgmt.redemptions": "Resgates",
  "loyaltyMgmt.configureRewards": "Configurar Recompensas",
  "loyaltyMgmt.pointsPerReal": "Pontos por R$ 1",
  "loyaltyMgmt.tierThresholds": "Limiares por Tier"
}
// EN
{
  "loyaltyMgmt.title": "Loyalty",
  "loyaltyMgmt.subtitle": "Program management",
  "loyaltyMgmt.members": "Members",
  "loyaltyMgmt.active": "Active",
  "loyaltyMgmt.pointsIssued": "Points Issued",
  "loyaltyMgmt.redemptions": "Redemptions",
  "loyaltyMgmt.configureRewards": "Configure Rewards",
  "loyaltyMgmt.pointsPerReal": "Points per R$ 1",
  "loyaltyMgmt.tierThresholds": "Tier Thresholds"
}
// ES
{
  "loyaltyMgmt.title": "Fidelidad",
  "loyaltyMgmt.subtitle": "Gestión del programa",
  "loyaltyMgmt.members": "Miembros",
  "loyaltyMgmt.active": "Activos",
  "loyaltyMgmt.pointsIssued": "Puntos Emitidos",
  "loyaltyMgmt.redemptions": "Canjes",
  "loyaltyMgmt.configureRewards": "Configurar Recompensas",
  "loyaltyMgmt.pointsPerReal": "Puntos por R$ 1",
  "loyaltyMgmt.tierThresholds": "Umbrales por Nivel"
}
```

**Testes:**
- [ ] Stats carregam via API e exibem valores reais
- [ ] Form de configuração valida campos numéricos (pontos > 0)
- [ ] Salvar exibe loading e toast de sucesso
- [ ] Tier thresholds: valor de cada tier deve ser maior que o anterior

---

### US-9.4.2 — Criar rewards e definir thresholds

**Como** gerente de restaurante,
**Quero** criar novas recompensas resgatáveis e definir seus custos em pontos,
**Para** incentivar meus clientes a acumularem pontos.

**Critérios de aceite:**
- [ ] Modal/Sheet "Criar Reward" com campos: nome, descrição, custo em pontos, service type (opcional)
- [ ] Listar rewards existentes com opção de editar e deletar
- [ ] Validação: custo em pontos >= 100
- [ ] Reward inativo: toggle on/off sem deletar
- [ ] Após criar/editar: lista atualizada via refetch

**Specs técnicos:**
- API: `POST /loyalty/rewards`, `PATCH /loyalty/rewards/:id`, `DELETE /loyalty/rewards/:id`
- Form: `CreateRewardDto { name: string, description: string, pointsCost: number, serviceType?: string }`

**i18n keys:**
```json
// PT-BR
{
  "rewards.create": "Criar Recompensa",
  "rewards.name": "Nome",
  "rewards.description": "Descrição",
  "rewards.pointsCost": "Custo em pontos",
  "rewards.serviceType": "Tipo de serviço (opcional)",
  "rewards.active": "Ativa",
  "rewards.delete": "Excluir",
  "rewards.deleteConfirm": "Excluir recompensa {{name}}?"
}
// EN / ES: similar structure omitted for brevity — follow same key pattern
```

**Testes:**
- [ ] Criar reward com custo = 0: erro de validação
- [ ] Deletar reward: confirmação antes de remover
- [ ] Toggle ativo/inativo: persiste na API

---

## FEATURE 9.5 — Promotions Management (Restaurant App)

### US-9.5.1 — Criar promoção com código

**Como** gerente de restaurante,
**Quero** criar promoções com código de desconto,
**Para** atrair clientes com ofertas especiais.

**Critérios de aceite:**
- [ ] Formulário: código único (maiúsculas, sem espaços), tipo de desconto (% ou R$), valor, valor mínimo do pedido, data início, data fim, limite de usos (opcional)
- [ ] Validação de código único: POST verifica duplicata (HTTP 409 se duplicado)
- [ ] Preview em tempo real do desconto calculado (ex.: "20% OFF em pedido de R$ 100 = R$ 20 de desconto")
- [ ] Ao criar: toast de sucesso, volta para lista

**Specs técnicos:**
- API: `POST /promotions` com `CreatePromotionDto`
- DTO:
  ```typescript
  class CreatePromotionDto {
    code: string; // uppercase, no spaces, 4-20 chars
    discountType: 'percentage' | 'fixed';
    discountValue: number; // 1-100 para percentage, > 0 para fixed
    minimumOrderValue?: number;
    validFrom: string; // ISO date
    validUntil: string; // ISO date
    usageLimit?: number; // null = ilimitado
    description?: string;
  }
  ```

**i18n keys:**
```json
// PT-BR
{
  "promotions.title": "Promoções",
  "promotions.create": "Criar Promoção",
  "promotions.code": "Código",
  "promotions.discountType": "Tipo de desconto",
  "promotions.percentage": "Percentual (%)",
  "promotions.fixed": "Valor fixo (R$)",
  "promotions.discountValue": "Valor do desconto",
  "promotions.minOrder": "Pedido mínimo",
  "promotions.validFrom": "Válido de",
  "promotions.validUntil": "Válido até",
  "promotions.usageLimit": "Limite de usos",
  "promotions.unlimited": "Ilimitado",
  "promotions.duplicateCode": "Este código já está em uso"
}
// EN / ES: follow same key pattern
```

**Testes:**
- [ ] Código com espaços: normalizado automaticamente para maiúsculas sem espaços
- [ ] Data fim anterior à data início: erro de validação
- [ ] Percentual > 100: erro de validação
- [ ] Código duplicado: mensagem de erro inline

---

### US-9.5.2 — Monitorar uso de promoções ativas

**Como** gerente de restaurante,
**Quero** acompanhar quantas vezes cada promoção foi usada,
**Para** avaliar a efetividade das minhas campanhas.

**Critérios de aceite:**
- [ ] Lista de promoções com: código, desconto, validade, usos/limite (ex.: "34/100 usos")
- [ ] Badge de status: Ativa (success), Expirada (muted), Esgotada (warning)
- [ ] Barra de progresso de usos quando há limite definido
- [ ] Opção de desativar promoção ativa antes de expirar
- [ ] Filtro por status: Todas, Ativas, Expiradas

**Specs técnicos:**
- API: `GET /promotions?restaurant_id={id}&status=active|expired|all`
- API: `PATCH /promotions/:id` com `{ isActive: false }` para desativar

**i18n keys:**
```json
// PT-BR
{
  "promotions.usages": "{{used}}/{{limit}} usos",
  "promotions.usagesUnlimited": "{{used}} usos",
  "promotions.statusActive": "Ativa",
  "promotions.statusExpired": "Expirada",
  "promotions.statusDepleted": "Esgotada",
  "promotions.deactivate": "Desativar",
  "promotions.filterAll": "Todas",
  "promotions.filterActive": "Ativas",
  "promotions.filterExpired": "Expiradas"
}
// EN / ES: follow same key pattern
```

**Testes:**
- [ ] Promoção sem limite: exibir "∞ usos" ou sem barra de progresso
- [ ] Promoção esgotada: badge "Esgotada" e desabilitada para novos usos
- [ ] Desativar: confirmação modal + status muda para inativo

---

## Sequência de Implementação

```
Sprint 4 — Semana 1:
1. Backend: adequar módulo loyalty (endpoints de reward + stamp cards)
2. Backend: criar módulo promotions (entity, dto, controller, service)
3. Client: LoyaltyScreen + LoyaltyDetailScreen (US-9.1.1, 9.1.2, 9.1.3)

Sprint 4 — Semana 2:
4. Client: StampCard component (US-9.1.4)
5. Client: TierProgressCard no Profile (US-9.2.1)
6. Client: CouponsScreen (US-9.3.1, 9.3.2)

Sprint 4 — Semana 3:
7. Client: integração cupom no checkout (US-9.3.2 — parte 2)
8. Restaurant: LoyaltyManagementScreen (US-9.4.1, 9.4.2)
9. Restaurant: PromotionsScreen (US-9.5.1, 9.5.2)
10. QA + ajustes + testes e2e
```

**Dependências:**
- `ÉPICO 3` — Auth (JWT, roles) — obrigatório antes do módulo loyalty
- `ÉPICO 5` — Orders / Payment — integração de pontos no checkout
- `ÉPICO 6` — Profile Screen — para inserir TierProgressCard

---

## Definition of Done

- [ ] Todos os critérios de aceite de cada US verificados
- [ ] Cobertura de testes unitários >= 80% nos services backend
- [ ] Testes de integração para `POST /loyalty/redeem` e `POST /promotions/validate`
- [ ] i18n implementado nas 3 línguas (PT-BR, EN, ES) sem chave faltando
- [ ] Design tokens aplicados (sem cores hardcoded)
- [ ] Acessibilidade: labels em todos os botões e inputs
- [ ] Performance: listas com `FlatList` e `keyExtractor` correto
- [ ] Error states implementados em todas as chamadas de API
- [ ] Loading states implementados (skeleton ou spinner)
- [ ] Documentação Swagger atualizada para novos endpoints
- [ ] PR aprovado por 1 reviewer
- [ ] Deploy em staging validado pelo PO

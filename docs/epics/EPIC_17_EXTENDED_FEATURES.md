# EPIC 17 -- Extended Features (Convergence Audit Remaining)

**Prioridade:** ALTA | **Sprint:** 8
**Status:** Em Desenvolvimento
**Apps afetados:** Client App, Restaurant App, Backend NestJS

---

## Visao Geral (Business Context)

Este epico cobre as 3 funcionalidades restantes identificadas na auditoria de convergencia entre o prototipo demo e a plataforma de producao. Cada feature preenche uma lacuna critica no fluxo operacional de restaurantes, especialmente para o segmento Casual Dining:

1. **Group Booking** -- Reservas para grupos grandes (8+ pessoas) com coordenador, menu pre-fixado e deposito
2. **Partial Order (Pedido Parcial)** -- Permitir que clientes adicionem itens a um pedido aberto (modelo "comanda aberta")
3. **Casual Dining Config Screen** -- Tela simplificada de configuracao para restaurantes Casual Dining

Essas features complementam os Epicos 8 (Config Hub), 10 (Smart Waitlist) e 11 (Service Types), fechando o ciclo de funcionalidades planejadas para o MVP.

---

## Feature 1: Group Booking (Reserva para Grupos)

### User Stories

| ID | Papel | Historia | Criterio de Aceite |
|----|-------|---------|-------------------|
| US-17.1 | Cliente | Como cliente, quero criar uma reserva para grupo (8+ pessoas) com detalhes do coordenador | Formulario multi-step com validacao de grupo minimo 8 pessoas, contato obrigatorio |
| US-17.2 | Cliente | Como cliente, quero ver uma estimativa de deposito antes de confirmar a reserva de grupo | Valor de deposito exibido quando aplicavel, tela de confirmacao com numero de referencia |
| US-17.3 | Cliente | Como cliente, quero selecionar opcoes de menu pre-fixado para meu grupo | Toggle de menu pre-fixado, selecao de restricoes alimentares, notas adicionais |
| US-17.4 | Maitre/Manager | Como maitre, quero ver reservas de grupo separadas com badge "GRUPO" | Badge visual na lista de reservas, filtro por grupo, detalhes do coordenador visiveis |
| US-17.5 | Owner/Manager | Como gerente, quero listar e gerenciar reservas de grupo do meu restaurante | Endpoint GET /reservations/group/:restaurantId com paginacao |

### Especificacao Tecnica

#### Backend -- Extensao do ReservationsModule

**Migration: AddGroupBookingToReservations**

Novas colunas na tabela `reservations`:

| Coluna | Tipo | Default | Nullable |
|--------|------|---------|----------|
| is_group_booking | boolean | false | NO |
| group_size | integer | null | YES |
| pre_fixed_menu | boolean | false | NO |
| pre_fixed_menu_id | varchar | null | YES |
| group_coordinator_name | varchar | null | YES |
| group_coordinator_phone | varchar | null | YES |
| deposit_required | boolean | false | NO |
| deposit_amount | decimal(10,2) | null | YES |

**DTO: CreateGroupBookingDto** (extends CreateReservationDto)

```typescript
{
  // Herda: restaurant_id, reservation_date, reservation_time, party_size, etc.
  group_coordinator_name: string;   // required
  group_coordinator_phone: string;  // required
  pre_fixed_menu: boolean;
  pre_fixed_menu_id?: string;
  deposit_required?: boolean;
  deposit_amount?: number;
  occasion?: string; // birthday | corporate | wedding | other
}
```

**Validacoes:**
- party_size >= 8 (grupo minimo)
- group_coordinator_name obrigatorio
- group_coordinator_phone obrigatorio (formato internacional)
- Se pre_fixed_menu === true, pre_fixed_menu_id e recomendado

**Novos endpoints:**
- `POST /reservations/group` -- Criar reserva de grupo (CUSTOMER, OWNER, MANAGER, MAITRE)
- `GET /reservations/group/:restaurantId` -- Listar reservas de grupo (OWNER, MANAGER, MAITRE)

#### Mobile Client -- GroupBookingScreen.tsx

Path: `/mobile/apps/client/src/screens/reservations/GroupBookingScreen.tsx`

Formulario multi-step (3 etapas):
1. **Detalhes do grupo:** slider tamanho (8-50), data, hora, ocasiao (aniversario/corporativo/casamento/outro)
2. **Contato:** nome coordenador, telefone, email + mensagem "Precisamos de contato para grupos"
3. **Preferencias de cardapio:** toggle menu pre-fixado, restricoes alimentares, notas adicionais

Pos-submit: Tela de confirmacao com numero de referencia + "Aguardando confirmacao do restaurante"

#### Mobile Restaurant -- Extensao ReservationsScreen

- Badge "GRUPO" em cards de reserva que sao group bookings
- No ReservationDetailScreen: exibir campos especificos de grupo (coordenador, status deposito, menu pre-fixado)
- Filtro "grupo" na tela de listagem

### i18n Keys

```
groupBooking.title
groupBooking.partySize
groupBooking.coordinator
groupBooking.coordinatorName
groupBooking.coordinatorPhone
groupBooking.coordinatorRequired
groupBooking.deposit
groupBooking.depositAmount
groupBooking.priceEstimate
groupBooking.preFixedMenu
groupBooking.dietaryRestrictions
groupBooking.additionalNotes
groupBooking.occasion
groupBooking.occasionBirthday
groupBooking.occasionCorporate
groupBooking.occasionWedding
groupBooking.occasionOther
groupBooking.submitted
groupBooking.awaitingConfirmation
groupBooking.badge
groupBooking.stepGroupDetails
groupBooking.stepContactInfo
groupBooking.stepMenuPreferences
groupBooking.minimumSize
```

---

## Feature 2: Partial Order (Pedido Parcial / Comanda Aberta)

### User Stories

| ID | Papel | Historia | Criterio de Aceite |
|----|-------|---------|-------------------|
| US-17.6 | Cliente | Como cliente, quero adicionar itens a um pedido existente aberto | Tela mostra itens ja confirmados + secao de novos itens, CTA "Adicionar ao pedido" |
| US-17.7 | Cliente | Como cliente, quero ver o total corrente incluindo itens ja confirmados e novos | Running total separado: "items confirmados" vs "novos items (nao enviados)" |
| US-17.8 | Garcom/Manager | Como garcom, quero marcar um pedido como "aberto para adicoes" | PATCH /orders/:id/open define status open_for_additions |
| US-17.9 | Cliente | Como cliente, quero enviar novos itens para a cozinha sem criar um novo pedido | POST /orders/:id/items adiciona items e recalcula total |

### Especificacao Tecnica

#### Backend -- Extensao do OrdersModule

**OrderStatus Enum:** Adicionar `OPEN_FOR_ADDITIONS = 'open_for_additions'` ao enum existente.

**Migration:** AddOpenForAdditionsStatus -- adiciona valor ao enum `order_status`.

**Novos metodos no OrdersService:**
- `addItemsToExistingOrder(orderId, items[], userId)` -- valida pedido aberto, adiciona items, recalcula total
- `openOrderForAdditions(orderId)` -- marca pedido como open_for_additions

**Novos endpoints:**
- `POST /orders/:id/items` -- adicionar itens a pedido aberto (CUSTOMER, WAITER, MANAGER)
- `PATCH /orders/:id/open` -- marcar pedido como open_for_additions (WAITER, MANAGER)

**Validacoes:**
- Pedido deve estar em status `confirmed`, `preparing`, ou `open_for_additions`
- Itens de menu devem estar disponiveis
- Recalculo automatico de subtotal, tax, total

#### Mobile Client -- PartialOrderScreen.tsx

Path: `/mobile/apps/client/src/screens/orders/PartialOrderScreen.tsx`

Secoes:
- **Itens ja confirmados:** lista read-only com status individual
- **Novos itens (nao enviados):** area interativa para adicionar do cardapio
- **Running total:** subtotal confirmado + subtotal novos + total geral
- CTA: "Adicionar ao pedido" -> POST /orders/:id/items
- Botao: "Ver pedido completo"

### i18n Keys

```
partialOrder.title
partialOrder.confirmed
partialOrder.confirmedItems
partialOrder.newItems
partialOrder.newItemsNotSent
partialOrder.addMore
partialOrder.addToOrder
partialOrder.sendItems
partialOrder.viewFullOrder
partialOrder.runningTotal
partialOrder.orderOpen
partialOrder.openForAdditions
```

---

## Feature 3: Casual Dining Config Screen

### User Stories

| ID | Papel | Historia | Criterio de Aceite |
|----|-------|---------|-------------------|
| US-17.10 | Owner | Como dono de restaurante casual, quero configurar features especificas do meu tipo de servico em uma unica tela | Tela com toggles e selectors para Modo Familia, Smart Waitlist, Pedidos Parciais, Modo de Comanda |
| US-17.11 | Owner | Como dono, quero definir o tempo maximo de mesa para avisar staff | Slider 60-240 min com preview do valor |
| US-17.12 | Owner | Como dono, quero um atalho para configuracoes de pagamento | Botao de atalho para ConfigPaymentsScreen |

### Especificacao Tecnica

#### Mobile Restaurant -- CasualDiningConfigScreen.tsx

Path: `/mobile/apps/restaurant/src/screens/config/CasualDiningConfigScreen.tsx`

Secoes:
- **Modo Familia** toggle (familyModeEnabled)
- **Smart Waitlist** toggle (virtualQueueEnabled)
- **Pedidos Parciais** toggle (partialOrdersEnabled -- nova flag em ExperienceFlags)
- **Modo de Comanda** selector: by_table | by_person | hybrid
- **Tempo maximo de mesa** slider 60-240 min (maxTableMinutes)
- **Taxa de servico** botao atalho para ConfigPayments
- **Preview card:** visualizacao de como a experiencia casual fica para o cliente

API: `PATCH /config/:restaurantId/experience` (mesmo endpoint do ConfigExperienceScreen, Epic 8)

Acesso: OWNER, MANAGER

A tela reutiliza o hook `useRestaurantConfig` e salva via `updateExperience()`.

### i18n Keys

```
casualConfig.title
casualConfig.subtitle
casualConfig.familyMode
casualConfig.familyModeDesc
casualConfig.waitlist
casualConfig.waitlistDesc
casualConfig.partialOrders
casualConfig.partialOrdersDesc
casualConfig.comandaMode
casualConfig.comandaModeDesc
casualConfig.maxTableTime
casualConfig.maxTableTimeDesc
casualConfig.maxTableTimeMinutes
casualConfig.serviceCharge
casualConfig.serviceChargeDesc
casualConfig.byTable
casualConfig.byPerson
casualConfig.hybrid
casualConfig.preview
casualConfig.previewTitle
```

---

## Novos i18n Keys (resumo para 3 idiomas)

Todos os keys acima devem ser adicionados a:
- `/mobile/shared/i18n/pt-BR.ts`
- `/mobile/shared/i18n/en-US.ts`
- `/mobile/shared/i18n/es-ES.ts`

---

## Definition of Done (DoD)

### Backend
- [ ] Migration AddGroupBookingToReservations criada e executavel
- [ ] Migration AddOpenForAdditionsStatus criada e executavel
- [ ] CreateGroupBookingDto com validacoes completas
- [ ] AddItemsToOrderDto com validacoes completas
- [ ] ReservationsService.createGroupBooking() implementado
- [ ] ReservationsService.findGroupByRestaurant() implementado
- [ ] ReservationsController endpoints group criados com guards corretos
- [ ] OrdersService.addItemsToExistingOrder() implementado
- [ ] OrdersService.openOrderForAdditions() implementado
- [ ] OrdersController endpoints items/open criados com guards corretos
- [ ] Reservation entity atualizada com colunas de grupo
- [ ] Order entity compativel com novo status
- [ ] OrderStatus enum atualizado

### Mobile Client
- [ ] GroupBookingScreen.tsx -- formulario 3 steps funcional
- [ ] GroupBookingScreen.tsx -- validacoes client-side
- [ ] GroupBookingScreen.tsx -- tela de confirmacao
- [ ] PartialOrderScreen.tsx -- exibicao items confirmados vs novos
- [ ] PartialOrderScreen.tsx -- adicao de items e recalculo
- [ ] PartialOrderScreen.tsx -- CTA funcional

### Mobile Restaurant
- [ ] ReservationsScreen.tsx -- badge GRUPO em reservas de grupo
- [ ] ReservationDetailScreen.tsx -- campos grupo (coordenador, deposito, menu)
- [ ] CasualDiningConfigScreen.tsx -- todos toggles e selectors
- [ ] CasualDiningConfigScreen.tsx -- save via updateExperience()
- [ ] CasualDiningConfigScreen.tsx -- preview card
- [ ] Navegacao para CasualDiningConfigScreen registrada

### i18n
- [ ] Todas as keys adicionadas em pt-BR.ts
- [ ] Todas as keys adicionadas em en-US.ts
- [ ] Todas as keys adicionadas em es-ES.ts
- [ ] Nenhuma string hardcoded

### Geral
- [ ] TypeScript strict -- zero erros de tipo
- [ ] Swagger annotations em todos endpoints novos
- [ ] RBAC guards em todos endpoints
- [ ] Padrao visual conforme Design System (spacing, borderRadius, typography tokens)

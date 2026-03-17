# NOOWE Restaurant Demo — Complete Technical & Product Documentation

> **Version**: 4.0 · **Last Updated**: 2026-03-17 · **Classification**: Internal Engineering & Product  
> **Route**: `/demo/restaurant` · **Context**: Bistrô Noowe (simulated Fine Dining establishment)  
> **Total Codebase**: ~5,538 lines of TypeScript/React + ~6,000 lines of i18n translations

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture & System Design](#2-architecture--system-design)
3. [Role-Based Access Control (RBAC) — 7 Roles](#3-role-based-access-control-rbac--7-roles)
4. [Complete Screen Inventory — 22 Screens](#4-complete-screen-inventory--22-screens)
5. [Role Journeys — Step-by-Step Walkthroughs](#5-role-journeys--step-by-step-walkthroughs)
6. [Critical User Flows — Sequence Diagrams](#6-critical-user-flows--sequence-diagrams)
7. [Waiter Command Center — Deep Dive](#7-waiter-command-center--deep-dive)
8. [Data Model & Mock Data Catalog](#8-data-model--mock-data-catalog)
9. [Internationalization (i18n) — 3 Languages](#9-internationalization-i18n--3-languages)
10. [Mobile-First Rendering Architecture](#10-mobile-first-rendering-architecture)
11. [Component Architecture & File Map](#11-component-architecture--file-map)
12. [Interactive Actions — Complete Catalog](#12-interactive-actions--complete-catalog)
13. [Service Type Differentiation — 11 Types](#13-service-type-differentiation--11-types)
14. [Design System & Visual Language](#14-design-system--visual-language)
15. [State Management & Simulation Engine](#15-state-management--simulation-engine)

---

## 1. Executive Summary

The Restaurant Demo (`/demo/restaurant`) is a **production-grade interactive prototype** embedded within the NOOWE platform. It simulates the complete operational management of a Fine Dining restaurant — **Bistrô Noowe** — allowing stakeholders to experience every aspect of the platform through 7 distinct staff perspectives across 22 dedicated screens with 50+ interactive actions.

### 1.1 — Purpose & Strategic Goals

| Goal | Description |
|------|-------------|
| **Sales Enablement** | Prospective restaurant owners experience the full platform before purchase — every role, every workflow, every screen |
| **Stakeholder Validation** | Each team member (chef, waiter, owner, manager) sees exactly what their daily interface looks like |
| **Product Demonstration** | Showcases NOOWE's SaaS + Take Rate business model with real operational depth |
| **Technical Proof** | Validates that complex restaurant workflows (KDS, approvals, multi-party payments, floor management) work seamlessly |

### 1.2 — Key Metrics

| Metric | Value | Detail |
|--------|-------|--------|
| Staff Roles | 7 | Owner, Manager, Maitre, Chef, Barman, Cook, Waiter |
| Dedicated Screens | 22 | Role-specific views with unique functionality |
| Service Types | 11 | Fine Dining through Club & Balada |
| Interactive Actions | 50+ | Stateful interactions with visual feedback |
| Languages | 3 | Portuguese (PT-BR), English (EN), Spanish (ES) |
| Mock Tables | 12 | Positioned on interactive floor plan |
| Mock Team Members | 10 | With avatars, roles, shifts, sales data |
| Mock Orders | Dynamic | Generated and advanced by simulation engine |
| Mock Reservations | Dynamic | With status lifecycle tracking |
| Mock Stock Items | 8 | With critical/low/ok status levels |
| Mock Drink Recipes | 5 | With full ingredient technical sheets |
| Mock Approvals | 4 | Cancel, courtesy, refund, discount types |
| Mock Guest Data | 13 guests | Across 5 tables with 18 individual orders |
| Mock Live Feed | 7 events | With 4 urgency levels |
| Mock Kitchen Pipeline | 5 dishes | With SLA tracking and chef attribution |

---

## 2. Architecture & System Design

### 2.1 — Layout Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      /demo/restaurant                              │
│  ┌──────────────┐   ┌─────────────────────┐   ┌────────────────┐  │
│  │   Journey     │   │   PhoneShell /       │   │   Context      │  │
│  │   Sidebar     │   │   Desktop View       │   │   Sidebar      │  │
│  │   (left)      │   │   (center)           │   │   (right)      │  │
│  │              │   │                     │   │                │  │
│  │  ┌─────────┐ │   │  Screen content     │   │  Screen title  │  │
│  │  │ Stage 1 │ │   │  rendered here      │   │  Description   │  │
│  │  │ Stage 2 │ │   │  (role-specific)    │   │  from          │  │
│  │  │ Stage 3 │ │   │                     │   │  SCREEN_INFO   │  │
│  │  │   ...   │ │   │                     │   │                │  │
│  │  └─────────┘ │   │                     │   │                │  │
│  └──────────────┘   └─────────────────────┘   └────────────────┘  │
│                                                                    │
│                         DemoContext                                 │
│                  (Global Simulation State)                          │
└────────────────────────────────────────────────────────────────────┘
```

**Three-Column Centered Layout:**
1. **Journey Sidebar** (left, visible ≥768px) — Progress tracker showing role-specific stages; click any stage to navigate directly to that screen. Mandatory from `md` breakpoint upwards to preserve presentation context.
2. **PhoneShell / Desktop View** (center) — Primary content area. Mobile-specific screens (Waiter, Dashboard) render inside a `PhoneShell` or `ResponsivePhoneShell` component simulating a smartphone. Desktop screens render full-width with cards and grids.
3. **Context Sidebar** (right) — Displays screen metadata (title, description) pulled from the `SCREEN_INFO` constant map, providing contextual orientation for the viewer.

### 2.2 — State Management

All demo state flows through `DemoContext` (React Context API), providing:

| State | Type | Description |
|-------|------|-------------|
| `orders` | `DemoOrder[]` | Live order objects with full status pipeline (pending → confirmed → preparing → ready → delivered → paid) |
| `tables` | `DemoTable[]` | 12 table objects with status (available/occupied/reserved/billing), customer name, seat count, occupied timestamp, order total |
| `reservations` | `DemoReservation[]` | Reservation list with customer, time, party size, status (confirmed/seated/waiting/cancelled), notes |
| `analytics` | `DemoAnalytics` | Revenue (today, hourly, weekly), orders count, avg ticket, occupancy rate, satisfaction score, top items, returning customers rate |
| `notifications` | `DemoNotification[]` | Real-time notification feed with type (waiter_call, kitchen, payment, etc.), read status, timestamp |
| `menu` | `DemoMenuItem[]` | Full menu catalog with name, price, category, description, image URL, prep time |
| `unreadNotifications` | `number` | Count of unread notifications for badge rendering |

**Mutation Helpers:**
- `updateOrderStatus(orderId, newStatus)` — Advances order through pipeline
- `updateTableStatus(tableId, newStatus)` — Transitions table between states

### 2.3 — Real-Time Simulation Engine

`DemoContext` runs an **interval-based simulation** that creates the feeling of a living, active restaurant:

- **Order Advancement**: Automatically progresses orders through status pipeline at realistic intervals
- **Notification Generation**: Creates waiter calls, kitchen ready alerts, payment notifications
- **Metric Updates**: Recalculates revenue, occupancy, and counts in real-time
- **Timestamp Tracking**: All orders and notifications carry real `Date` objects for elapsed time calculations

This simulation ensures the demo feels dynamic regardless of user interaction, with orders appearing to move through the kitchen, notifications arriving organically, and metrics shifting naturally.

---

## 3. Role-Based Access Control (RBAC) — 7 Roles

### 3.1 — Role Hierarchy

```
                     ┌─────────┐
                     │  OWNER  │  Full Control
                     │  (Dono) │  9 screens
                     └────┬────┘
                          │
                ┌─────────┴─────────┐
                │                   │
          ┌─────┴─────┐      ┌─────┴─────┐
          │  MANAGER  │      │  MAITRE   │
          │ (Gerente) │      │           │
          │ 7 screens │      │ 3 screens │
          └─────┬─────┘      └───────────┘
                │
     ┌──────────┼──────────┐
     │          │          │
┌────┴────┐ ┌──┴───┐ ┌────┴────┐
│  CHEF   │ │BARMAN│ │ WAITER  │
│         │ │      │ │(Garçom) │
│3 screens│ │4 scr.│ │6 screens│
└────┬────┘ └──────┘ └─────────┘
     │
┌────┴────┐
│  COOK   │
│(Cozinh.)│
│2 screens│
└─────────┘
```

### 3.2 — Role Configuration Detail

| # | Role | ID | Emoji | Default Screen | Color Token | Gradient | Description |
|---|------|----|-------|---------------|-------------|----------|-------------|
| 1 | **Dono** | `owner` | 👑 | `dashboard` | `primary` | `from-primary/20 to-primary/5` | Full executive control — revenue, analytics, all operations |
| 2 | **Gerente** | `manager` | 📊 | `manager-ops` | `secondary` | `from-secondary/20 to-secondary/5` | Operations management, approvals, staff oversight |
| 3 | **Maitre** | `maitre` | 💁‍♀️ | `maitre` | `info` | `from-info/20 to-info/5` | Reservation flow, virtual queue, floor management |
| 4 | **Chef** | `chef` | 👨‍🍳 | `kds-kitchen` | `warning` | `from-warning/20 to-warning/5` | Kitchen KDS, menu management, stock control |
| 5 | **Barman** | `barman` | 🍸 | `barman-station` | `accent-foreground` | `from-accent/20 to-accent/5` | Bar KDS, drink recipes, bar stock |
| 6 | **Cozinheiro** | `cook` | 🧑‍🍳 | `cook-station` | `destructive` | `from-destructive/20 to-destructive/5` | Station-specific prep, simplified KDS |
| 7 | **Garçom** | `waiter` | 🤵 | `waiter` | `success` | `from-success/20 to-success/5` | Complete table service command center |

### 3.3 — Complete Permission Matrix

| Screen | Owner | Manager | Maitre | Chef | Barman | Cook | Waiter |
|--------|:-----:|:-------:|:------:|:----:|:------:|:----:|:------:|
| Dashboard Executivo | ✅ | — | — | — | — | — | — |
| Mapa de Mesas | ✅ | ✅ | ✅ | — | — | — | — |
| Gestão de Pedidos | ✅ | ✅ | — | — | — | — | ✅ |
| KDS Cozinha | ✅ | — | — | ✅ | — | ✅ | — |
| KDS Bar | ✅ | — | — | — | ✅ | — | — |
| Analytics & Relatórios | ✅ | — | — | — | — | — | — |
| Gestão de Equipe | ✅ | ✅ | — | — | — | — | — |
| Editor de Cardápio | ✅ | — | — | ✅ | — | — | — |
| Configuração (Setup) | ✅ | — | — | — | — | — | — |
| Painel Operacional | — | ✅ | — | — | — | — | — |
| Aprovações | — | ✅ | — | — | — | — | — |
| Relatório do Dia | — | ✅ | — | — | — | — | — |
| Painel do Maitre | — | — | ✅ | — | — | — | — |
| Fluxo do Salão | — | — | ✅ | — | — | — | — |
| Estação do Barman | — | — | — | — | ✅ | — | — |
| Receitas de Drinks | — | — | — | — | ✅ | — | — |
| Estação de Preparo | — | — | — | — | — | ✅ | — |
| Controle de Estoque | — | ✅ | — | ✅ | ✅ | — | — |
| Garçom (Command Center) | — | — | — | — | — | — | ✅ |
| Chamados de Clientes | — | — | — | — | — | — | ✅ |
| Gorjetas | — | — | — | — | — | — | ✅ |
| Cobrar na Mesa | — | — | — | — | — | — | ✅ |
| Ações na Mesa | — | — | — | — | — | — | ✅ |

---

## 4. Complete Screen Inventory — 22 Screens

### 4.1 — Welcome Screen (`welcome`)

**Purpose**: Entry point and role selection hub for the entire restaurant demo.

**Visual Structure**:
- **Hero Banner**: Gradient background with "Bistrô Noowe" logo (N icon), "DEMO INTERATIVA" badge, and description inviting exploration
- **Role Selection Grid**: 2×4 grid (responsive) with 7 role cards. Each card shows emoji, role name, description, feature count, and "Explorar →" CTA. Cards have gradient backgrounds matching role color tokens and scale on hover (`hover:scale-[1.02]`)
- **Feature Highlights**: 3-column grid showcasing 6 platform capabilities (Real-time Dashboard, Professional KDS, Interactive Map, Reservations & Queue, Waiter App, Approvals & RBAC)
- **Stats Summary**: 3-column centered stats — "7 Perfis de Acesso", "22 Telas Dedicadas", "11 Tipos de Serviço"

**Interactive Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Select Role | Click role card | Sets `activeRole` in parent, navigates to role's `defaultScreen`, updates journey sidebar stages |

**File**: `SetupScreens.tsx` → `WelcomeScreen` · **Lines**: 17-99

---

### 4.2 — Setup Wizard (`setup`)

**Purpose**: Simulates the 4-step restaurant onboarding configuration.

**Step 1 — Profile (Perfil do Restaurante)**:
- Restaurant photo with camera hover overlay
- Pre-filled fields: Name ("Bistrô Noowe"), Description ("Gastronomia contemporânea com ingredientes locais e sazonais")
- Contact info grid: Address (Rua Oscar Freire, 432 - Jardins, SP), Phone ((11) 3042-8900), Hours (Ter-Dom · 12h-15h, 19h-00h), Website
- "Próximo →" CTA with shadow-glow

**Step 2 — Service Type (Tipo de Serviço)**:
- 4-column grid (responsive) with 11 service type cards
- Each card: label, short description, feature count with ⚡ icon
- Selected card: primary border, glow shadow, ring effect, checkmark
- Available types: Fine Dining (26 features), Casual Dining (22), Fast Casual (18), Café/Padaria (16), Pub & Bar (20), Buffet (14), Drive-Thru (12), Food Truck (14), Chef's Table (24), Quick Service (15), Club & Balada (22)

**Step 3 — Features (Características)**:
- 4-column toggle grid for amenities
- All enabled by default: Wi-Fi, Estacionamento, Acessível, Pet Friendly, Terraço, Carta de Vinhos, Reservas Online, QR Code nas Mesas
- Each toggle shows icon + label + checkmark when active

**Step 4 — Payments (Pagamentos)**:
- 4 configuration rows: Taxa de serviço (10%), Gorjeta (Opcional 5/10/15%), Split de pagamento (4 modos), Métodos (Cartão, PIX, Apple/Google Pay, NFC)
- Completion banner: Success gradient, checkmark icon, "Configuração Completa!" message
- "Ir para o Dashboard →" CTA

**Interactive Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Navigate Steps | Click step pill or "Próximo"/"Voltar" | Advances/retreats through 4-step wizard |
| Select Service Type | Click type card | Highlights with glow + ring, shows checkmark |
| Toggle Feature | Click feature toggle | Visual on/off state change |
| Complete Setup | Click "Ir para o Dashboard" | Navigates to dashboard screen |

**File**: `SetupScreens.tsx` → `SetupScreen` · **Lines**: 101-286

---

### 4.3 — Dashboard Executivo (`dashboard`)

**Purpose**: Real-time executive overview of all restaurant operations.

**Visual Structure**:

**KPI Grid (4 cards)**:
| KPI | Example Value | Icon | Color | Detail |
|-----|--------------|------|-------|--------|
| Receita Hoje | R$ 12.840 | DollarSign | success | +12.4% |
| Pedidos | 47 | UtensilsCrossed | primary | X ativos |
| Ticket Médio | R$ 273 | TrendingUp | info | +5.2% |
| Ocupação | 83% | Users | warning | X/12 mesas |

**Quick Action Alerts**: Contextual banners that appear when:
- Ready orders exist → green banner "X pedido(s) pronto(s) para entregar" → click navigates to Orders
- Pending orders exist → warning banner "X pedido(s) aguardando confirmação" → click navigates to Orders

**Revenue by Hour Chart**: Bar chart with 12 hourly columns (11h-22h), gradient fill, hover-to-reveal values (R$X.Xk), responsive height

**Occupancy Gauge**: SVG circular gauge with animated stroke-dasharray, center text showing percentage, 2×2 grid below (Livres/Ocupadas/Reservadas/Pagamento)

**Active Orders List**: Scrollable list (max 6 items) with table number badge, customer name, item count, total, status badge, elapsed time

**Notifications Feed**: Scrollable list with read/unread styling (unread: primary border + background), dot indicator, message text, timestamp

**Top Sellers**: 5-column horizontal ranking with position number (#1 in primary, #2 in secondary), item name, quantity sold

**Interactive Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Click ready alert | Banner click | Navigate to orders (filtered to ready) |
| Click pending alert | Banner click | Navigate to orders (filtered to pending) |
| Click "Ver todos →" | Link click | Navigate to orders or notifications screen |
| Hover revenue bar | Mouse hover | Shows revenue value tooltip |

**File**: `DashboardScreens.tsx` → `DashboardScreen` · **Lines**: 31-210

---

### 4.4 — Analytics & Relatórios (`analytics`)

**Purpose**: Deep reporting with multi-period analysis.

**Period Selector**: 3 pill buttons — Hoje / Semana / Mês. Values dynamically change:
- Today: R$ 12.840 / 47 orders / R$ 273 avg / 4.7★
- Week: R$ 77.500 / 312 orders / R$ 248 avg
- Month: R$ 312.000 / 1.248 orders / R$ 250 avg

**Summary Cards (4)**: Revenue Total, Total Orders, Average Ticket, Customer Satisfaction — each with icon, percentage change, arrow indicator

**Weekly Revenue Chart**: 7 bars (Seg-Dom), current day highlighted in primary gradient, others in secondary gradient, hover-to-reveal values

**Customer Satisfaction Panel**: Giant score display (4.7), 5-star visual, distribution bars (5★=72%, 4★=18%, 3★=7%, 2★=2%, 1★=1%), "342 avaliações"

**Returning Customers**: Large percentage (e.g., 68%), horizontal progress bar with secondary gradient

**Peak Hours Heatmap**: 7×6 grid (days × time slots), color-coded intensity (4 levels of primary opacity), hover for hour tooltip, legend bar

**Staff Performance**: 3-row leaderboard with rank, name, role, order count, revenue, tips, rating star

**File**: `DashboardScreens.tsx` → `AnalyticsScreen` · **Lines**: 212-392

---

### 4.5 — Mapa de Mesas (`table-map`)

**Purpose**: Interactive visual floor plan of the restaurant dining room.

**Layout**: 2-column (desktop) — floor plan (2/3) + detail panel (1/3)

**Floor Plan**:
- 12 tables positioned on a relative coordinate system within a bordered container
- Decorative labels: "Salão Principal" (top-left), "Terraço →" (top-right), "← Entrada" (bottom-left), "Bar ↑" (bottom-center)
- Dashed inner border for visual depth
- Tables rendered as positioned buttons with `translate(-50%, -50%)` centering

**Table Shapes**:
| Shape | CSS | Usage |
|-------|-----|-------|
| Round | `w-16 h-16 rounded-full` | Intimate 2-person tables |
| Rect | `w-20 h-16 rounded-2xl` | Standard 4-person tables |
| Long | `w-24 h-14 rounded-2xl` | Group 6-8 person tables |

**Status Color Coding**:
| Status | Background | Border | Text | Label |
|--------|-----------|--------|------|-------|
| Available | `bg-success/20` | `border-success/50` | `text-success` | Disponível |
| Occupied | `bg-primary/20` | `border-primary/50` | `text-primary` | Ocupada |
| Reserved | `bg-warning/20` | `border-warning/50` | `text-warning` | Reservada |
| Billing | `bg-info/20` | `border-info/50` | `text-info` | Pagamento |

**Table Decorations**:
- Customer name label below table (when occupied)
- Animated pulse dot on occupied tables (top-right corner)
- Selected table: foreground border, shadow, scale(1.1), z-index elevation

**Detail Panel** (when table selected):
- Table number (large display), status badge
- Stats grid: Seats, Time elapsed (if occupied)
- Customer info card (if occupied): name, order total
- **Status Transition Buttons**:

```
Available  ──[Sentar Cliente]──→  Occupied
Occupied   ──[Fechar Conta]────→  Billing
Billing    ──[Liberar Mesa]────→  Available
Reserved   ──[Check-in Reserva]→  Occupied
```

**Empty State**: Eye icon + "Clique em uma mesa para ver os detalhes"

**Interactive Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| Select table | Click table on floor plan | Highlights table, opens detail panel |
| Deselect table | Click selected table again | Closes detail panel |
| Seat Customer | Button click (available) | Status → occupied |
| Close Bill | Button click (occupied) | Status → billing |
| Release Table | Button click (billing) | Status → available |
| Check-in Reservation | Button click (reserved) | Status → occupied |
| Hover table | Mouse hover | `scale-110` animation |

**File**: `OperationsScreens.tsx` → `TableMapScreen` · **Lines**: 14-162

---

### 4.6 — Gestão de Pedidos (`orders`)

**Purpose**: Complete order lifecycle management with filtering and status transitions.

**Filter Bar**: Horizontal scrollable pill buttons:
- Todos (X) · Pendentes (X) · Confirmados (X) · Preparando (X) · Prontos (X) · Entregues (X)
- Active filter: `bg-primary text-primary-foreground shadow-glow`
- Count badges in each pill

**Order Cards** (expandable):
- **Header**: Table number badge (large, primary), customer name, elapsed time with clock icon, item count, status badge
- **Item Preview**: First 3 items as small pills (`2x Filé...`), +N indicator
- **Expanded Detail** (click "..." menu): Full item list with images (w-10 h-10 rounded-lg), notes (italic), individual prices
- **Action Bar**: Total price (large display) + status transition button

**Late Order Highlighting**: Orders >15 minutes get `bg-destructive/5 border border-destructive/20` styling

**Order Status Pipeline & Actions**:
```
Pending ──[✓ Confirmar]──→ Confirmed ──[🔥 Preparar]──→ Preparing ──[✓ Pronto]──→ Ready ──[🍽️ Entregar]──→ Delivered
```

**File**: `OperationsScreens.tsx` → `OrdersScreen` · **Lines**: 164-297

---

### 4.7 — KDS Cozinha (`kds-kitchen`) & 4.8 — KDS Bar (`kds-bar`)

**Purpose**: Professional Kitchen/Bar Display System with ticket-based workflow.

**Same component** (`KDSScreen`) with `view` prop ('kitchen' | 'bar'). Kitchen filters non-beverage items; bar filters beverages.

**Stats Row (3)**:
- Na Fila (Queue): warning color, count of confirmed orders
- Preparando: primary color, count of preparing orders
- Prontos: success color, count of ready orders

**Empty State**: Large icon (ChefHat/Wine) + "Nenhum pedido na fila" + "Os tickets aparecerão aqui automaticamente"

**Ticket Cards** (grid layout: 2-3 columns):
- **Header Bar**: "Mesa X" (large display), flame icon (if urgent), timer badge showing elapsed minutes
- **Urgency Styling**:

| Elapsed Time | Border | Background | Animation |
|-------------|--------|------------|-----------|
| 0-10 min | `border-border` | `bg-card` | None |
| 10-15 min | `border-warning` | `bg-warning/5` | Flame icon |
| >15 min | `border-destructive` | `bg-destructive/5` | `animate-pulse` + bouncing AlertCircle |

- **Item List**: Quantity badge, item name, prep time in minutes
- **Action Button**: Full-width, contextual:
  - Confirmed: "▶ Iniciar Preparo" (warning color)
  - Preparing: "✓ Marcar como Pronto" (success color)

**File**: `OperationsScreens.tsx` → `KDSScreen` · **Lines**: 299-423

---

### 4.9 — Painel do Maitre (`maitre`)

**Purpose**: Reservation management, virtual queue, and guest flow control.

**Quick Stats (4)**: Reservas Hoje, Confirmadas, Na Fila, Mesas Livres

**2-Column Layout**:

**Left — Reservations Timeline**:
- "Nova" button (primary) to add reservation
- Expandable reservation cards with:
  - Calendar icon, customer name, phone
  - Status badge (Confirmada/Sentado/Aguardando/Cancelada) with color coding
  - Time, party size, notes (italic with 📝)
  - **Expanded actions**: Check-in (success), Editar (muted), Cancelar (destructive)

**Right — Virtual Queue**:
- Queue count badge ("3 na fila", warning)
- Guest cards with position number (#1, #2, #3), name, party size, estimated wait
- Action buttons per guest: ✓ Check (seat) and 📱 Phone (call)

**Available Tables Grid**: 4-column grid showing free tables with number and seat count, `bg-success/10 border-success/20`

**Mock Queue Data**:
| Position | Name | Party | Wait |
|----------|------|-------|------|
| #1 | Marcos Pereira | 3 | ~15min |
| #2 | Sandra Alves | 2 | ~25min |
| #3 | Roberto Lima | 5 | ~35min |

**File**: `ServiceScreens.tsx` → `MaitreScreen` · **Lines**: 18-157

---

### 4.10 — Fluxo do Salão (`floor-flow`)

**Purpose**: Extended Maitre view for table rotation monitoring and virtual queue management.

**Stats Row (4)**:
| Metric | Value | Color |
|--------|-------|-------|
| Mesas Ativas | (occupied count) | primary |
| Tempo Médio | 42min | warning |
| Na Fila | 3 | success |
| Espera Estimada | ~15min | info |

**Table Rotation Monitor**:
- Lists all occupied tables with:
  - Table number badge, customer name, seat count, order total
  - Elapsed time (highlighted in warning if >60min, "Acima da média")
  - Progress bar (fills to 90min, warning color if >60min)

**Virtual Queue** (same as Maitre):
- 3 queued guests with position, name, party size, estimated wait
- "Chamar" (Call) action button per guest

**File**: `RoleScreens.tsx` → `FloorFlowScreen` · **Lines**: 1016-1098

---

### 4.11 — Painel Operacional do Gerente (`manager-ops`)

**Purpose**: Manager's operational command center with alerts, staff oversight, and approval preview.

**Alert Banners** (conditional):
- Late orders (>15min): Destructive pulsing banner with count
- Pending approvals: Warning banner with shield icon, clickable → navigates to approvals

**KPI Grid (4)**:
| KPI | Icon | Color | Sub-detail |
|-----|------|-------|-----------|
| Pedidos Ativos | UtensilsCrossed | primary | "X prontos" |
| Receita Hoje | DollarSign | success | "+12% vs ontem" |
| Equipe Ativa | Users | info | "X em folga" |
| Ocupação | BarChart3 | warning | "X mesas livres" |

**2-Column Layout**:

**Left — Staff on Duty**:
- Scrollable list (max height 72) of online team members
- Each: avatar (rounded-full), name, role + shift, "● Ativo" green status

**Right — Pending Approvals Preview**:
- "Ver todas →" link to full approvals screen
- First 3 approvals with type badge, item name, table number, requester, amount (destructive red)

**Live Orders Feed**:
- Max 6 active orders with elapsed time, late highlighting (>15min → destructive background)
- Status pills (Pendente/Confirmado/Preparando/Pronto/Entregue)

**File**: `RoleScreens.tsx` → `ManagerOpsScreen` · **Lines**: 20-154

---

### 4.12 — Aprovações Pendentes (`approvals`)

**Purpose**: Authorization workflow for financially sensitive operations.

**Stats Row (4)**:
| Metric | Value | Color |
|--------|-------|-------|
| Pendentes | (active count) | warning |
| Aprovadas Hoje | 7 | success |
| Recusadas Hoje | 2 | destructive |
| Total Impacto | R$ 239 | primary |

**Approval Types**:
| Type | Icon | Color | Description |
|------|------|-------|-------------|
| Cancelamento | XCircle | destructive | Order cancellation by customer or waiter |
| Cortesia | Star | info | Complimentary item (e.g., birthday dessert) |
| Estorno | ArrowDown | warning | Refund for returned/unsatisfactory dish |
| Desconto | DollarSign | secondary | Loyalty or promotional discount |

**Approval Cards** (full-detail):
- Type badge, time ago, item name, table number, requester name (bold), quoted reason (italic)
- Amount displayed in large destructive font
- **Action row** (border-top): "✅ Aprovar" (success) | "❌ Recusar" (destructive)
- **Post-action state**: Card fades to 50% opacity, "✅ Processado" message

**Mock Data**:
| # | Type | Table | Item | Reason | Amount | Requester |
|---|------|-------|------|--------|--------|-----------|
| 1 | Cancel | 5 | Filé ao Molho de Vinho | Cliente mudou de ideia | R$ 118 | Bruno Oliveira |
| 2 | Courtesy | 8 | Petit Gâteau | Aniversariante na mesa | R$ 42 | Carla Lima |
| 3 | Refund | 1 | Ceviche Peruano | Prato devolvido — não atendeu expectativa | R$ 48 | Bruno Oliveira |
| 4 | Discount | 3 | Conta Mesa 3 | 10% desconto fidelidade | R$ 31 | Marina Costa |

**File**: `RoleScreens.tsx` → `ApprovalsScreen` · **Lines**: 156-232

---

### 4.13 — Estação do Barman (`barman-station`)

**Purpose**: Bar-specific workstation with drink queue, recipes access, and stock alerts.

**Stats (3)**: Drinks na Fila (warning), Prontos (success), Drinks Hoje (primary, hardcoded 47)

**Drink Queue**: Grid (2-3 columns) of order cards:
- Header with "Mesa X", flame icon if >5min, timer badge
- Drink items with images (w-10 h-10 rounded-lg), quantity, name, notes
- Action button: "▶ Preparar" (warning) or "✓ Pronto para servir" (success)

**Empty State**: Beer icon + "Nenhum drink na fila"

**Quick Access Cards (2-column)**:
- "Receitas de Drinks" → navigates to drink-recipes
- "Estoque do Bar" → navigates to stock (with alert count badge)

**File**: `RoleScreens.tsx` → `BarmanStationScreen` · **Lines**: 234-343

---

### 4.14 — Receitas de Drinks (`drink-recipes`)

**Purpose**: Standardized cocktail technical sheets with full preparation instructions.

**Layout**: 3-column — recipe list (1/3) + detail panel (2/3)

**Recipe List**: 5 clickable cards with thumbnail (w-12 h-12 rounded-xl), name, prep time, price

**Recipe Detail**:
- Large image (w-32 h-32 rounded-2xl), drink name (display font, 2xl), prep time + price
- Tags: glass type pill, garnish pill (primary)
- **Ingredients**: Numbered list (1-4 items) with circular step indicators
- **Preparation Steps**: 5 standardized steps in muted panel

**Cocktail Catalog**:
| Drink | Ingredients | Glass | Garnish | Time | Price |
|-------|------------|-------|---------|------|-------|
| Gin Tônica Aurora | Gin 60ml, Tônica 120ml, Pepino 2 slices, Cardamomo 3 seeds | Taça Balloon | Pepino + Cardamomo | 3min | R$ 38 |
| Negroni Clássico | Gin 30ml, Campari 30ml, Vermute Rosso 30ml | Old Fashioned | Twist de laranja | 3min | R$ 42 |
| Espresso Martini | Vodka 45ml, Licor de Café 30ml, Espresso 30ml | Taça Martini | 3 grãos de café | 4min | R$ 40 |
| Caipirinha Premium | Cachaça Envelhecida 60ml, Limão 1 unit, Açúcar demerara 2 colheres | Old Fashioned | Limão | 2min | R$ 32 |
| Moscow Mule | Vodka 45ml, Ginger Beer 120ml, Suco de limão 15ml | Caneca de cobre | Limão + Hortelã | 2min | R$ 36 |

**File**: `RoleScreens.tsx` → `DrinkRecipesScreen` · **Lines**: 345-414

---

### 4.15 — Estação de Preparo (`cook-station`)

**Purpose**: Simplified, station-specific KDS designed for line cooks.

**Station Selector** (3 tabs):
| Station | Label | Count |
|---------|-------|-------|
| Grelhados | 🔥 Grelhados | 4 |
| Frios | ❄️ Frios | 2 |
| Massas | 🍝 Massas | 1 |

**Station Keyword Filtering**:
- Grelhados: Filé, Salmão, Polvo, Carpaccio
- Frios: Tartare, Ceviche, Burrata, Carpaccio
- Massas: Risoto, Ravioli

**Ticket Cards** (large format, designed for kitchen displays):
- "Mesa X" in 2xl font, elapsed time badge
- Large quantity badges (w-12 h-12), item name in lg font, prep time
- Late highlighting: destructive border + background + bouncing alert icon
- Action: "▶ INICIAR PREPARO" (warning) or "✓ PRONTO" (success) — full-width py-4 buttons

**File**: `RoleScreens.tsx` → `CookStationScreen` · **Lines**: 416-519

---

### 4.16 — Controle de Estoque (`stock`)

**Purpose**: Inventory monitoring with automatic low-stock alerts.

**Stats (3)**: OK count (success), Low count (warning), Critical count (destructive)

**Filters (3)**: Todos / Baixo Estoque / Crítico

**Item List**: Table-style rows with:
- Status icon (Package) with color coding
- Item name, category
- Current level + unit, minimum level
- Visual progress bar (fills based on current/min ratio)

**Status Styling**:
| Status | Background | Bar Color | Icon Color |
|--------|-----------|-----------|-----------|
| OK | Default | success | success |
| Low | `bg-warning/5` | warning | warning |
| Critical | `bg-destructive/5` | destructive | destructive |

**File**: `RoleScreens.tsx` → `StockScreen` · **Lines**: 521-594

---

### 4.17 — Chamados de Clientes (`waiter-calls`)

**Purpose**: Real-time customer call management for waiters.

**Urgent Banner**: Pulsing destructive banner when urgent calls exist — "X chamado(s) urgente(s)! Prioridade máxima"

**Stats (4)**: Pendentes (warning), Urgentes (destructive), Atendidos (success), Tempo Médio ~2min (primary)

**Call Cards** (sorted by urgency):
- Table number badge (large), message, urgency/category badges
- Detailed reason text
- Timestamp ("Mesa X · Xmin atrás")
- "Atender" button (primary, shadow-glow) → transitions to "✅ Atendido"
- Urgent cards: destructive border + background + animate-pulse

**Mock Call Data**:
| ID | Table | Type | Message | Reason | Category | Urgent |
|----|-------|------|---------|--------|----------|--------|
| wc1 | 3 | garcom | Solicitou garçom | Dúvida sobre harmonização | Atendimento | No |
| wc2 | 8 | gerente | Falar com gerente | Reclamação sobre tempo de espera | Escalação | Yes |
| wc3 | 1 | garcom | Pedido de sobremesa | Ver cardápio de sobremesas | Pedido | No |
| wc4 | 5 | ajuda | Assistência especial | Acessibilidade — cadeira especial | Acessibilidade | Yes |
| wc5 | 10 | garcom | Questão sobre alérgenos | Intolerância a glúten | Segurança | No |

**File**: `RoleScreens.tsx` → `WaiterCallsScreen` · **Lines**: 596-685

---

### 4.18 — Gorjetas (`waiter-tips`)

**Purpose**: Daily tip tracking with weekly performance chart.

**Stats (3)**:
| Metric | Value | Detail |
|--------|-------|--------|
| Hoje | R$ 410 | +18% vs ontem (success gradient) |
| Semana | R$ 1.840 | 23 mesas |
| Média/Mesa | R$ 51 | 8 mesas hoje |

**Today's Tips List** (5 entries):
| Table | Customer | Amount | Time | % of Bill |
|-------|----------|--------|------|-----------|
| 8 | Grupo Aniversário | R$ 120 | 30min atrás | 15% |
| 5 | Grupo Pedro | R$ 85 | 1h atrás | 12% |
| 10 | Carlos M. | R$ 98 | 1h30 atrás | 10% |
| 3 | João & Ana | R$ 62 | 2h atrás | 10% |
| 1 | Maria S. | R$ 45 | 2h30 atrás | 15% |

**Weekly Performance Chart**: 7 bars (Seg-Dom), current day in success gradient, values on top, folga days show "-"

**File**: `RoleScreens.tsx` → `WaiterTipsScreen` · **Lines**: 933-1014

---

### 4.19 — Waiter Payment (`waiter-payment`)

**Purpose**: Payment tracking across all tables with per-guest status visibility.

**Stats (4)**: Mesas abertas, Pagos via app, Pendentes, Sem app

**Alert Banner**: "X cliente(s) sem app precisam do garçom — Use TAP to Pay, PIX ou dinheiro"

**Per-Table Payment Cards**:
- Table header: number badge, customer name, seat count, total, progress ring (SVG circle)
- Guest rows: avatar badge (✓ paid / 📱 app / ! no app), name, payment status text, amount
- Paid guests: faded (opacity-60), success styling
- No-app guests: warning background, "Cobrar" button
- App guests: info badge "No app"
- Summary bar: progress bar + "X/Y pagos" + "Mesa quitada" when 100%

**File**: `RoleScreens.tsx` → `WaiterPaymentScreen` · **Lines**: 687-805

---

### 4.20 — Ações na Mesa (`waiter-actions`)

**Purpose**: Situational action feed prioritized by urgency with contextual sub-actions.

**Urgent Banner**: Pulsing destructive — "X prato(s) pronto(s) para retirar! A cozinha está esperando"

**Stats (4)**: Cozinha (destructive), Clientes (warning), Outros (info), Resolvidos (success)

**Action Cards** (6 mock situations):
| Urgency | Table | Title | Detail | Primary Action |
|---------|-------|-------|--------|---------------|
| 🔴 Critical | 5 | Prato pronto — retirar agora | 2x Filé · Chef Felipe · 2min | Confirmar retirada |
| 🔴 Critical | 10 | Sobremesa pronta — servir | 1x Petit Gâteau · Thiago · 1min | Confirmar retirada |
| 🟡 High | 3 | Cliente sem app quer pedir | Convidado 3 não tem app | Abrir cardápio |
| 🟡 High | 1 | Conta solicitada | 1 convidado sem app | Ir para cobrança |
| 🔵 Medium | 8 | Cortesia — aniversário | Solicitar Petit Gâteau ao gerente | Solicitar aprovação |
| ⚪ Low | 5 | Transferir mesa | Grupo quer mesa maior | Solicitar ao Maitre |

**Expandable Detail**: Click card → reveals sub-action buttons (e.g., "Retirei da cozinha", "Servi na mesa")

**Collapsed Action**: Full-width bottom button with urgency-colored styling

**Completed State**: "Tudo em dia!" with success checkmark when all resolved

**File**: `RoleScreens.tsx` → `WaiterActionsScreen` · **Lines**: 807-930

---

### 4.21 — Editor de Cardápio (`menu-editor`)

**Purpose**: Complete menu management with categories, pricing, and item editing.

**Header**: Item count, category count, "Categorias" button, "+ Novo Item" CTA

**Category Filter**: Horizontal scrollable pills from menu categories

**Item Grid**: Cards with:
- Item image (w-16 h-16 rounded-xl), name, description (truncated), price, prep time, category badge
- Availability toggle
- Edit (pencil) and Delete (trash) icon buttons

**Quick Edit Panel** (expandable):
- 2-column form: Name, Price, Prep Time, Category
- Description textarea
- "Salvar" (primary) + "Cancelar" buttons
- Panel highlighted with `border-2 border-primary/30`

**Stats (3)**: Items count (primary), Categories count (secondary), Average Price (accent)

**File**: `ServiceScreens.tsx` → `MenuEditorScreen` · **Lines**: 1235-1371

---

### 4.22 — Gestão de Equipe (`team`)

**Purpose**: Staff management with roles, schedules, and permission overview.

**Header**: Total members, online count, "+ Adicionar" CTA

**Stats (3)**: Em serviço (success), Folga (warning), Gorjetas hoje R$847 (info)

**Team List** (table-style rows):
- Avatar with online/offline dot indicator
- Name, join date ("Desde X"), shift hours
- Role badge with color coding per role
- Status text ("● Ativo" / "○ Folga")
- "..." menu button

**Roles & Permissions Section**:
- 6 role cards showing role name, permission description, "Editar" link
- Roles: Dono (acesso total), Gerente (gestão operacional), Chef (KDS, cardápio, estoque), Garçom (pedidos, mesas), Barman (KDS bar, bebidas), Hostess/Maitre (reservas, fila, mapa)

**File**: `ServiceScreens.tsx` → `TeamScreen` · **Lines**: 1373-1479

---

### 4.23 — Relatório do Dia (`daily-report`)

**Purpose**: End-of-day closure report with metrics, rankings, and hourly breakdown.

**Hero Card**: Gradient background with:
- "Fechamento do Dia" title, date ("Domingo, 16 de Março 2026")
- "+12% vs semana passada" badge
- 4 KPIs: Receita Total, Pedidos, Ticket Médio, Satisfação (★)

**2-Column Layout**:
- **Left — Top Sellers**: Ranked list (#1-#5) with item name and quantity
- **Right — Staff Performance**: Sorted by sales with avatar, name, role, revenue, tip amount

**Hourly Revenue Chart**: Same bar chart as Dashboard but standalone with full-width rendering

**File**: `RoleScreens.tsx` → `DailyReportScreen` · **Lines**: 1100-1188

---

## 5. Role Journeys — Step-by-Step Walkthroughs

### 5.1 — Owner Journey (9 Stages)

The owner sees the full operational picture from executive metrics to individual configuration.

```
Stage 1: Dashboard         → Real-time KPIs, revenue chart, occupancy gauge, alerts
Stage 2: Mapa de Mesas     → Visual floor plan, table status management
Stage 3: Pedidos            → Full order lifecycle management with filtering
Stage 4: KDS Cozinha        → Kitchen ticket monitoring with SLA timers
Stage 5: KDS Bar            → Bar ticket monitoring (drink-filtered)
Stage 6: Analytics          → Period-based reporting, heatmaps, satisfaction
Stage 7: Equipe             → Staff roster, schedules, permission matrix
Stage 8: Cardápio           → Menu editor with categories and pricing
Stage 9: Configuração       → 4-step setup wizard (Profile → Service Type → Features → Payments)
```

**Narrative**: The owner starts their day checking the executive dashboard for revenue and occupancy. They glance at the floor plan to see table status, then review active orders. They monitor both kitchen and bar KDS for production flow. For strategic analysis, they dive into Analytics for weekly trends and peak hour patterns. They manage their team roster and update the menu as needed. Finally, they review the restaurant configuration.

---

### 5.2 — Manager Journey (7 Stages)

The manager focuses on operational execution, staff coordination, and sensitive approvals.

```
Stage 1: Painel Operacional → Alerts, KPIs, staff status, approval preview, live feed
Stage 2: Pedidos             → Active order management and status transitions
Stage 3: Aprovações          → Cancel/courtesy/refund/discount authorization
Stage 4: Mapa de Mesas       → Floor status overview
Stage 5: Equipe Hoje         → Current shift roster
Stage 6: Relatório do Dia    → End-of-day closure metrics
Stage 7: Estoque             → Low stock alerts and inventory levels
```

**Narrative**: The manager opens their operational panel and immediately sees alerts — 2 late orders and 3 pending approvals. They handle the approvals first (approving a birthday courtesy, rejecting an unjustified cancellation). They check the order flow, ensuring nothing is stuck. They verify the floor plan, confirm staff assignments, and at end of shift, review the daily report. Before leaving, they check stock alerts to prepare tomorrow's purchase orders.

---

### 5.3 — Maitre Journey (3 Stages)

The maitre manages the front-of-house guest experience flow.

```
Stage 1: Reservas           → Today's reservations, check-in, virtual queue
Stage 2: Fluxo do Salão     → Table rotation monitoring, wait time management
Stage 3: Mapa de Mesas      → Table allocation and availability
```

**Narrative**: The maitre begins by reviewing today's reservations — 5 confirmed, 2 waiting. As guests arrive, they perform check-ins, expanding reservation cards and clicking "Check-in". Walk-in guests are added to the virtual queue with estimated wait times. The maitre monitors the Floor Flow screen to track table rotation — any table exceeding 60 minutes gets a warning flag. They use the table map to identify which tables will be available next for queue guests.

---

### 5.4 — Chef Journey (3 Stages)

The chef commands the kitchen production line and menu quality.

```
Stage 1: KDS Cozinha        → Active ticket queue with SLA tracking
Stage 2: Cardápio           → Menu item management, prep times, descriptions
Stage 3: Estoque Cozinha    → Kitchen ingredient stock levels
```

**Narrative**: The chef's primary screen is the KDS — ticket cards arrive as orders are confirmed. They click "Iniciar Preparo" when starting a dish, and "Marcar como Pronto" when it's ready for service. Urgent tickets (>10min) show flame icons; late tickets (>15min) pulse red. Between rushes, the chef reviews the menu editor for seasonal updates and checks kitchen stock for any critical-level ingredients that need immediate attention.

---

### 5.5 — Barman Journey (4 Stages)

The barman manages the bar's drink production workflow.

```
Stage 1: Minha Estação      → Drink queue, prep timers, recipe/stock shortcuts
Stage 2: KDS Bar            → Full bar display system
Stage 3: Receitas           → Cocktail technical sheets with ingredients and steps
Stage 4: Estoque Bar        → Bar-specific inventory (spirits, mixers, garnishes)
```

**Narrative**: The barman opens their station to see the drink queue. New drink orders appear as ticket cards with images and specifications. They progress each drink through "Preparar" → "Pronto para servir". For unfamiliar drinks, they quickly access the Recipe screen for standardized measurements and garnish instructions. Between orders, they check bar stock — seeing that Gin Tanqueray is low (3/5 bottles) and Limão Tahiti is critical (8/20 units).

---

### 5.6 — Cook Journey (2 Stages)

The cook has a minimal, focused interface for their specific station.

```
Stage 1: Minha Estação      → Station-filtered tickets (Grelhados/Frios/Massas)
Stage 2: KDS Geral          → Full kitchen view for coordination
```

**Narrative**: The cook selects their station (e.g., Grelhados) and sees only relevant tickets — Filé, Salmão, Polvo items are shown while pasta and cold dishes are hidden. Large, touch-friendly ticket cards show quantity, item name, and prep time. They tap "INICIAR PREPARO" when they start and "PRONTO" when finished. They can switch to the general KDS view to coordinate with other stations.

---

### 5.7 — Waiter Journey (6 Stages)

The waiter's journey covers the complete table service lifecycle — the most complex role.

```
Stage 1: Minhas Mesas       → 4-tab Command Center (Live/Tables/Kitchen/Charge)
Stage 2: Chamados           → Real-time customer call management
Stage 3: Cobrar / TAP       → Payment processing (NFC/PIX/Card/Cash)
Stage 4: Ações na Mesa      → Situational action feed with prioritized tasks
Stage 5: Pedidos Ativos     → Active order management for assigned tables
Stage 6: Gorjetas           → Daily tip tracking and weekly performance
```

**Narrative**: The waiter starts their shift checking the Live Feed for urgent items — 2 dishes ready for pickup, a customer calling at Table 3. They attend to pickups first (Kitchen tab), then check their Tables tab for an overview. When a guest without the app needs to order, they open the table detail, navigate to the Menu tab, select the guest, browse categories, add items, and send to kitchen. For payment, they use the Charge tab — selecting the guest, choosing TAP to Pay, and processing the NFC payment. Throughout the shift, they monitor their tips screen to track daily earnings.

---

## 6. Critical User Flows — Sequence Diagrams

### 6.1 — Order Lifecycle (End-to-End)

```
Customer (App)          Waiter              KDS (Kitchen/Bar)       Manager
     │                    │                       │                    │
     │──[Place Order]────→│                       │                    │
     │                    │──[Order Created]──────→│                    │
     │                    │   status: pending      │                    │
     │                    │                       │                    │
     │                    │                       │──[Confirm]─────────│
     │                    │                       │   → confirmed      │
     │                    │                       │                    │
     │                    │                       │──[Start Prep]──────│
     │                    │                       │   → preparing      │
     │                    │                       │                    │
     │                    │                       │──[Mark Ready]──────│
     │                    │  ←──[Ready Alert]──── │   → ready          │
     │                    │                       │                    │
     │                    │──[Pick Up]────────────→│                    │
     │                    │──[Deliver]────────────→│   → delivered      │
     │                    │                       │                    │
     │──[Pay via App]────→│                       │                    │
     │                    │   → paid              │                    │
```

### 6.2 — Guest Without App (Waiter Proxy Flow)

```
Walk-in Guest           Waiter (Command Center)              Kitchen
     │                         │                                │
     │──[Sits at table]───────→│                                │
     │                         │                                │
     │                         │──[Tables tab → Select table]   │
     │                         │──[Guests tab → "+Add guest"]   │
     │                         │──[Enter name → Confirm]        │
     │                         │   Guest added with "!" badge   │
     │                         │                                │
     │──[Wants to order]──────→│                                │
     │                         │──[Click "+ Pedir" on guest]    │
     │                         │──[Menu tab opens]              │
     │                         │──[Select category → Add items] │
     │                         │──[Adjust quantities (+/−)]     │
     │                         │──[🔥 Enviar para Cozinha]      │
     │                         │──────────────────────────────→ │
     │                         │   Toast: "Pedido enviado!"     │
     │                         │   Tab switches to Orders       │
     │                         │                                │
     │                         │  ←──[Status updates]───────────│
     │                         │   pending → preparing → ready  │
     │                         │                                │
     │                         │──[Kitchen tab → "Retirar ✓"]   │
     │                         │──[Serves dish to guest]        │
     │                         │                                │
     │──[Ready to pay]────────→│                                │
     │                         │──[Charge tab → Select guest]   │
     │                         │──[Choose method: TAP to Pay]   │
     │                         │──[Processing: "Aproxime cartão"]│
     │──[Taps card]───────────→│                                │
     │                         │──[Confirm Payment]             │
     │                         │   "Pagamento confirmado! ✓"    │
     │                         │   [Imprimir recibo] [Próximo]  │
```

### 6.3 — Approval Workflow

```
Waiter                 System                Manager               Owner
  │                      │                      │                    │
  │──[Request Cancel]───→│                      │                    │
  │                      │──[Create Approval]──→│                    │
  │                      │   type: cancel       │                    │
  │                      │   amount: R$118      │                    │
  │                      │                      │                    │
  │                      │   Manager sees:      │                    │
  │                      │   - Alert banner     │                    │
  │                      │   - Ops dashboard    │                    │
  │                      │   - Full detail card │                    │
  │                      │                      │                    │
  │                      │                      │──[Review]          │
  │                      │                      │  Item, reason,     │
  │                      │                      │  requester, amount │
  │                      │                      │                    │
  │                      │                      │──[Approve ✅]      │
  │                      │  ←──[Processed]──────│                    │
  │                      │   Card fades, shows  │                    │
  │  ←──[Notification]───│   "Processado" badge │                    │
```

### 6.4 — Table Lifecycle

```
Table Status Flow:

  ┌───────────┐    Seat Customer    ┌───────────┐
  │ AVAILABLE │ ──────────────────→ │ OCCUPIED  │
  │  (green)  │                     │  (blue)   │
  └───────────┘                     └─────┬─────┘
       ↑                                  │
       │         Close Bill               │
       │                                  ▼
  ┌────┴──────┐                     ┌───────────┐
  │  Release  │ ←────────────────── │  BILLING  │
  │   Table   │                     │  (cyan)   │
  └───────────┘                     └───────────┘

  ┌───────────┐    Check-in         ┌───────────┐
  │ RESERVED  │ ──────────────────→ │ OCCUPIED  │
  │ (yellow)  │                     │  (blue)   │
  └───────────┘                     └───────────┘
```

### 6.5 — NFC/TAP Payment Flow

```
Waiter                    Phone (Simulated)         Guest Card
  │                            │                        │
  │──[Select guest]            │                        │
  │──[Choose TAP to Pay]──────→│                        │
  │                            │                        │
  │                            │ ┌────────────────────┐ │
  │                            │ │ Animated circles   │ │
  │                            │ │ (ping + pulse)     │ │
  │                            │ │                    │ │
  │                            │ │  📱 Phone icon     │ │
  │                            │ │                    │ │
  │                            │ │ "Aproxime o cartão"│ │
  │                            │ │ ● Aguardando...    │ │
  │                            │ └────────────────────┘ │
  │                            │                        │
  │                            │  ←─[Card tap]──────── │
  │                            │                        │
  │──[Confirmar Pagamento]────→│                        │
  │                            │                        │
  │                            │ ┌────────────────────┐ │
  │                            │ │    ✓ Green circle  │ │
  │                            │ │                    │ │
  │                            │ │ "Pagamento         │ │
  │                            │ │  confirmado!"      │ │
  │                            │ │                    │ │
  │                            │ │ [Imprimir recibo]  │ │
  │                            │ │ [Próximo →]        │ │
  │                            │ └────────────────────┘ │
```

---

## 7. Waiter Command Center — Deep Dive

The Waiter Command Center (`waiter` screen) is the most sophisticated component in the demo, rendered inside a `PhoneShell` emulator with 4 tabs and deep-nested sub-navigation.

### 7.1 — Component State (16 state variables)

```typescript
// Tab navigation
waiterTab: 'live' | 'tables' | 'kitchen' | 'charge'

// Table selection & detail
selectedTable: number | null
tableDetailTab: 'guests' | 'orders' | 'menu' | 'charge'

// Guest management
addingGuest: boolean
newGuestName: string
addedGuests: TableGuest[]

// Order management
menuCategory: string
orderingForGuest: string | null
pendingOrder: Array<{ item, qty, price }>
sentOrders: Array<{ id, guest, item, qty, price, status, sentAt }>
cancelledOrders: string[]
editingOrder: string | null
orderSentToast: boolean

// Feed & kitchen
handledItems: string[]
pickedUp: string[]

// Payment
paymentStep: 'guests' | 'method' | 'processing' | 'done'
selectedGuest: string | null
```

### 7.2 — Header Bar

Gradient header (`from-primary via-primary/90 to-accent`) with:
- Shift label ("Turno das 18h"), Waiter name ("Bruno — Garçom")
- Kitchen alert badge (pulsing, shows ready dish count)
- Bell icon with unread call count
- 4 mini-stat cards: Mesas, Retirar (urgent if >0), Chamados (urgent if >0), Gorjetas (R$410)

### 7.3 — Tab: Ao Vivo (Live Feed)

**Purpose**: Situational awareness — everything happening now that requires attention.

**Urgent Kitchen Banner**: Appears when dishes are waiting — "X prato(s) esperando retirada! A cozinha está aguardando" with "Ver" button → switches to Kitchen tab

**Event Types** (7 in mock data):

| Type | Icon | Color | Action Button | Behavior on Click |
|------|------|-------|--------------|-------------------|
| `kitchen_ready` | ChefHat | destructive | "Retirar →" | Switches to Kitchen tab |
| `call` | Bell | warning | "Atender →" | Switches to Tables tab, selects table |
| `payment` | Check | success | None (info only) | — |
| `payment_needed` | Smartphone | primary | "Cobrar →" | Switches to Charge tab, selects table |
| `approval` | Shield | info | "Solicitar →" | — |
| `order` | BookOpen | muted | None (info only) | — |

**Urgency Levels**:
| Level | Visual Treatment |
|-------|-----------------|
| Critical | Ring border, pulsing icon, "AGORA" badge |
| High | Standard urgent styling |
| Medium | Default styling |
| Info | Muted background, no action button |

**Dismissed Items**: Clicking an action removes the event from the feed via `handledItems` state

**Empty State**: Green checkmark + "Tudo tranquilo! Nenhuma ação pendente"

### 7.4 — Tab: Mesas (Tables)

**Two-Level Navigation**: Overview → Table Detail

**Level 1 — Table Overview**:
For each occupied table:
- Table number badge (pulsing red if dish ready), customer name
- Guest count, order count, total amount
- Guest avatar dots: ✓ (paid, green) / 📱 (has app, blue) / ! (no app, yellow)
- Payment progress bar with percentage
- Badges: "PRATO" (dish ready), "X S/APP" (guests without app)
- Click → opens Table Detail

**Level 2 — Table Detail**:
- "← Todas as mesas" back button
- Header card with gradient: table number, customer name, guest count, elapsed time, total, payment progress

**4 Sub-tabs**:

#### Sub-tab: Pessoas (Guests)
- Individual guest cards with:
  - Avatar badge (paid/app/no-app status)
  - Name, "APP" or "SEM APP" badge
  - Order count, active order count, payment status
  - Total amount
  - Action buttons: "+ Pedir" → opens Menu tab for that guest, "Cobrar" → opens Charge tab
- **Add Guest Form**: Dashed border card, text input for name, Confirmar/Cancelar buttons
- "+ Adicionar convidado sem app" floating button

#### Sub-tab: Pedidos (Orders)
- Orders grouped by status: ENVIADO → CONFIRMADO → PREPARANDO → 🔔 PRONTO → ✓ SERVIDO
- Each status group has colored dot indicator and uppercase label
- Order items show: qty × name, guest avatar (📱 or 👤), guest name, sent time, price
- **Actions per item**:
  - Ready: "Servir" button (destructive)
  - Pending/Confirmed: Edit (pencil) → expand to "Alterar qtd" / "Trocar item" / "Cancelar", Delete (X)
- Empty state: "Nenhum pedido ainda" + "Abrir Cardápio" button
- "+ Adicionar mais itens" dashed button at bottom

#### Sub-tab: Cardápio (Menu)
- **Guest selector**: Shows which guest the order is for. If none selected, shows guest pills. "trocar" link to switch.
- **Category pills**: Horizontal scrollable (Entradas, Principais, Sobremesas, Bebidas)
- **Item cards**: Name, price (bold primary), prep time. "Adicionar" button or quantity controls (−/qty/+)
- **Cart/Send bar** (sticky bottom, appears when items added):
  - Item count, guest name, total price
  - "🔥 Enviar para Cozinha" full-width success button
  - Triggers: creates sent order records, shows toast, switches to Orders tab

#### Sub-tab: Cobrar (Charge)
- Instruction card: "Quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa."
- Guest list with payment status:
  - Paid (✓): faded, "Pago via [method] ✓"
  - Has app (📱): info badge "No app"
  - No app (!): warning background, "Cobrar" button
- Payment progress bar with count "X/Y pagos"

### 7.5 — Tab: Cozinha (Kitchen Pipeline)

**Sections** (in order of priority):

**1. Ready Dishes (Destructive pulsing banner)**:
- Alert: "X prato(s) para retirar agora! Tempo é qualidade"
- Individual dish cards with:
  - Table number badge (destructive), qty × dish name
  - Chef attribution, "pronto há Xmin"
  - "Retirar ✓" button (destructive, shadow-lg)

**2. Preparing Dishes (Warning section)**:
- Cards with: table number (warning), qty × dish name, chef name
- SLA progress bar: fills based on elapsed/expected time
- Remaining time or overage time indicator

**3. Served Dishes (Success section, only if items picked up)**:
- Faded cards (opacity-60) with success border
- Checkmark icon

### 7.6 — Tab: Cobrar (Quick Charge — Global View)

**Two views depending on context**:

**From Tab (Global)**: Shows all tables with per-guest payment status
- Instruction card: "Cobrança inteligente — Quem pagou pelo app aparece automaticamente"
- Per-table cards with:
  - Table header: number badge, customer name, paid/waiting/needsWaiter counts
  - SVG progress ring (paid/total ratio)
  - Guest rows (same as table detail Charge sub-tab)
  - "Cobrar" button only for no-app unpaid guests

**From Table Detail**: Same as sub-tab charge (see 7.4 above)

**Payment Method Flow** (4 steps):

**Step 1 — Guest Selection**: Pick which guest to charge

**Step 2 — Method Selection**:
| Method | Icon | Description | Highlight |
|--------|------|-------------|-----------|
| TAP to Pay (NFC) | 📱 | Encoste o cartão no celular | ✅ RECOMENDADO |
| PIX QR Code | ⚡ | Gere o QR e mostre ao cliente | |
| Cartão (Chip/Senha) | 💳 | Maquininha vinculada | |
| Dinheiro | 💵 | Confirme valor recebido | |

**Step 3 — Processing**:
- Concentric animated circles (ping + pulse) with phone icon
- "Aproxime o cartão" instruction
- "● Aguardando..." with pulsing dot
- "Confirmar Pagamento" (success) + "Trocar método" (muted)

**Step 4 — Confirmation**:
- Green checkmark circle
- "Pagamento confirmado!" (success bold)
- Table/guest info, "Recibo enviado automaticamente"
- "Imprimir recibo" + "Próximo →" buttons

---

## 8. Data Model & Mock Data Catalog

### 8.1 — Team Members (10 records)

| ID | Name | Role | Status | Shift | Since | Sales (R$) | Tips (R$) | Avatar Source |
|----|------|------|--------|-------|-------|-----------|----------|---------------|
| tm1 | Ricardo Alves | Dono | 🟢 Online | Integral | Jan 2023 | 0 | 0 | Unsplash 507003 |
| tm2 | Marina Costa | Gerente | 🟢 Online | 14h–23h | Mar 2023 | 4,200 | 320 | Unsplash 494790 |
| tm3 | Felipe Santos | Chef | 🟢 Online | 15h–23h | Jun 2023 | 0 | 0 | Unsplash 472099 |
| tm4 | Ana Rodrigues | Sommelier | 🟢 Online | 18h–00h | Set 2023 | 1,800 | 240 | Unsplash 438761 |
| tm5 | Bruno Oliveira | Garçom | 🟢 Online | 18h–00h | Nov 2023 | 3,200 | 410 | Unsplash 500648 |
| tm6 | Carla Lima | Garçom | 🟢 Online | 12h–18h | Jan 2024 | 2,100 | 280 | Unsplash 534528 |
| tm7 | Diego Martins | Barman | 🔴 Offline | Folga | Feb 2024 | 0 | 0 | Unsplash 506794 |
| tm8 | Juliana Ferraz | Hostess | 🟢 Online | 18h–00h | Apr 2024 | 0 | 0 | Unsplash 544005 |
| tm9 | Thiago Nunes | Cozinheiro | 🟢 Online | 15h–23h | May 2024 | 0 | 0 | Unsplash 519345 |
| tm10 | Priscila Gomes | Cozinheiro | 🟢 Online | 11h–19h | Jul 2024 | 0 | 0 | Unsplash 580489 |

### 8.2 — Table Floor Plan (12 tables)

| ID | Position (x%, y%) | Shape | Seats |
|----|-------------------|-------|-------|
| t1 | (12, 15) | Round | 2 |
| t2 | (32, 12) | Round | 2 |
| t3 | (52, 15) | Rect | 4 |
| t4 | (75, 12) | Rect | 4 |
| t5 | (10, 42) | Long | 6 |
| t6 | (35, 40) | Round | 2 |
| t7 | (55, 42) | Rect | 4 |
| t8 | (78, 38) | Long | 6 |
| t9 | (15, 68) | Round | 2 |
| t10 | (38, 70) | Round | 2 |
| t11 | (58, 68) | Long | 8 |
| t12 | (80, 70) | Round | 2 |

### 8.3 — Guest Data (13 guests across 5 tables, 18 orders)

**Table 1** (2 guests):
| Guest | App | Paid | Orders |
|-------|-----|------|--------|
| Maria S. | ✅ | ❌ | Tartare de Atum (served, R$58), Risotto (preparing, R$62) |
| Paulo R. | ❌ | ❌ | Salmão Grelhado (preparing, R$72) |

**Table 3** (3 guests):
| Guest | App | Paid | Orders |
|-------|-----|------|--------|
| João | ✅ | ❌ | Costela Braseada (confirmed, R$78), Vinho Tinto (served, R$45) |
| Ana | ✅ | ✅ Apple Pay | Polvo Grelhado (served, R$68), Tiramisu (preparing, R$32) |
| Convidado 3 | ❌ | ❌ | (none — needs waiter to order) |

**Table 5** (3 guests):
| Guest | App | Paid | Orders |
|-------|-----|------|--------|
| Pedro M. | ✅ | ✅ PIX | Filé ao Molho (ready, R$89), Café Espresso (served, R$12) |
| Lucas C. | ✅ | ❌ | Filé ao Molho (ready, R$89), Tiramisu (pending, R$32) |
| Mariana | ❌ | ❌ | Salmão Grelhado (preparing, R$72) |

**Table 8** (4 guests):
| Guest | App | Paid | Orders |
|-------|-----|------|--------|
| Rafael C. | ✅ | ✅ Apple Pay | Polvo Grelhado (served, R$68) |
| Fernanda A. | ✅ | ❌ | Costela Braseada (preparing, R$78) |
| Thiago S. | ❌ | ❌ | Tartare (confirmed, R$58), Cerveja ×2 (served, R$24) |
| Juliana | ❌ | ❌ | (none — needs waiter) |

**Table 10** (1 guest):
| Guest | App | Paid | Orders |
|-------|-----|------|--------|
| Carlos M. | ✅ | ❌ | Petit Gâteau (ready, R$38), Café Espresso (served, R$12) |

### 8.4 — Kitchen Pipeline (5 dishes)

| Dish | Qty | Table | Chef | Status | SLA | Elapsed | Over SLA? |
|------|-----|-------|------|--------|-----|---------|-----------|
| Filé ao Molho de Vinho | 2 | 5 | Chef Felipe | 🟢 Ready (3min ago) | 20min | 22min | ⚠️ +2min |
| Petit Gâteau | 1 | 10 | Cozinheiro Thiago | 🟢 Ready (1min ago) | 12min | 11min | ✅ |
| Risotto de Cogumelos | 1 | 3 | Chef Felipe | 🟡 Preparing | 25min | 18min | ✅ 7min left |
| Salmão Grelhado | 1 | 8 | Cozinheiro Ana | 🟡 Preparing | 22min | 8min | ✅ 14min left |
| Tiramisu | 2 | 1 | Cozinheiro Thiago | 🟡 Preparing | 15min | 5min | ✅ 10min left |

### 8.5 — Live Feed Events (7 entries)

| Time | Table | Event | Detail | Type | Urgency |
|------|-------|-------|--------|------|---------|
| agora | 5 | Prato pronto para retirar | 2x Filé ao Molho — Chef Felipe | kitchen_ready | 🔴 critical |
| 1min | 10 | Sobremesa pronta | 1x Petit Gâteau — Cozinheiro Thiago | kitchen_ready | 🔴 critical |
| 2min | 3 | Cliente chamou o garçom | Convidado 3 sem app quer fazer pedido | call | 🟡 high |
| 3min | 8 | Pagamento recebido pelo app | Rafael C. pagou R$ 85 via Apple Pay | payment | 🔵 info |
| 5min | 1 | Conta solicitada | 1 convidado sem app precisa de cobrança | payment_needed | 🟡 high |
| 8min | 10 | Cortesia solicitada | Aniversário — solicitar Petit Gâteau ao gerente | approval | 🟠 medium |
| 12min | 5 | Novo pedido registrado | 1x Tiramisu + 1x Café Espresso via app | order | 🔵 info |

### 8.6 — Waiter Menu (15 items, 4 categories)

| Category | Items |
|----------|-------|
| **Entradas** | Tartare de Atum (R$58, 8min) · Burrata com Presunto (R$52, 5min) · Polvo Grelhado (R$68, 12min) · Carpaccio de Wagyu (R$72, 6min) |
| **Principais** | Filé ao Molho de Vinho (R$89, 20min) · Risotto de Cogumelos (R$62, 25min) · Salmão Grelhado (R$72, 18min) · Costela Braseada (R$78, 15min) |
| **Sobremesas** | Petit Gâteau (R$38, 12min) · Tiramisu (R$32, 5min) · Crème Brûlée (R$34, 8min) |
| **Bebidas** | Café Espresso (R$12, 3min) · Vinho Tinto taça (R$45, 1min) · Cerveja Artesanal (R$24, 1min) · Suco Natural (R$16, 5min) |

---

## 9. Internationalization (i18n) — 3 Languages

**Engine**: `useDemoI18n()` hook from `DemoI18n.tsx` (~6,000+ lines)

**Languages**: Portuguese (PT-BR, source), English (EN), Spanish (ES)

**Translation Approach**: PT-BR strings serve as keys; the `t()` function maps them to the selected language. If no translation found, falls back to the original PT-BR string.

**Coverage** (~300+ keys):
- Navigation: Dashboard, Mesas, Pedidos, KDS, Analytics
- KPIs: Receita, Ticket Médio, Ocupação, Satisfação
- Order statuses: Pendente, Confirmado, Preparando, Pronto, Entregue, Pago
- Waiter actions: Ao Vivo, Pessoas, Cobrar, Enviar para Cozinha, Retirar
- Payment: TAP to Pay, Aproxime o cartão, Pagamento confirmado, PIX QR Code
- Approval types: Cancelamento, Cortesia, Estorno, Desconto
- Alerts: Prato pronto, Cliente chamou, Conta solicitada
- Setup: Perfil, Tipo de Serviço, Recursos, Pagamentos
- Stock: OK, Baixo, Crítico, Estoque
- Tips: Gorjetas, Hoje, Semana, Média por mesa

---

## 10. Mobile-First Rendering Architecture

### 10.1 — PhoneShell Emulator

Desktop screens like the Waiter Command Center render inside a `PhoneShell` component:
- Fixed dimensions simulating a smartphone viewport
- Status bar with time, battery, signal indicators
- Notch/dynamic island simulation
- Rounded corners with device bezel styling
- Internal scrolling independent of page scroll

### 10.2 — ResponsivePhoneShell

Adapts rendering strategy by viewport:
- **< 768px (Mobile)**: Full-screen rendering, no shell chrome
- **≥ 768px (Tablet/Desktop)**: PhoneShell emulator centered in viewport

### 10.3 — Mobile-Optimized Screens

`MobileRestaurantScreens.tsx` (1,557 lines) provides optimized variants:

| Component | Screens | Specialization |
|-----------|---------|---------------|
| `MobileDashboard` | Owner mobile | Compact KPIs, quick action grid, recent orders, alerts |
| `MobileTableMap` | All roles | 3-column grid (not positioned plan), detail card below |
| `MobileOrders` | Owner/Manager | Compact order cards with inline status transition |
| `MobileKDS` | Chef/Barman/Cook | Compact ticket cards with stats bar |
| `MobileMaitre` | Maitre | Reservation cards, available tables count |
| `MobileWaiter` | Waiter | Full 4-tab Command Center (identical logic to desktop) |
| `MobileOwner` | Owner | Revenue, ticket médio, top items, executive summary |
| `MobileManager` | Manager | Alerts, approvals, staff, quick KPIs |

---

## 11. Component Architecture & File Map

### 11.1 — File Structure

```
src/components/demo/restaurant/
├── RestaurantDemoShared.tsx    213 lines  Types, RBAC, journeys, mock data, helpers
├── SetupScreens.tsx            286 lines  Welcome + 4-step Setup Wizard
├── DashboardScreens.tsx        392 lines  Dashboard + Analytics
├── OperationsScreens.tsx       423 lines  Table Map + Orders + KDS
├── ServiceScreens.tsx        1,479 lines  Maitre + Waiter Command Center + Menu + Team
├── RoleScreens.tsx           1,188 lines  Manager + Approvals + Barman + Cook + Stock + Calls + Tips + Floor + Report
└── MobileRestaurantScreens.tsx 1,557 lines  Mobile-optimized variants of all screens
                              ─────────
                              5,538 lines total (+ ~6,000 lines i18n)
```

### 11.2 — Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| `GuidedHint` | `DemoShared.tsx` | Contextual hint bar at top of each screen (primary/5 bg, primary text) |
| `PhoneShell` | `DemoShared.tsx` | Mobile device emulator frame for phone-view screens |
| `MobileSection` | `MobileRestaurantScreens.tsx` | Standardized section with title, subtitle, optional action |
| `CompactStat` | `MobileRestaurantScreens.tsx` | Small KPI card with tone-based coloring |
| `MobileHint` | `MobileRestaurantScreens.tsx` | Compact hint for mobile (primary/5 bg, rounded-2xl) |
| `StatusBadge` | `DashboardScreens.tsx` | Order status pill with color coding |

### 11.3 — Exported Types

```typescript
// Screen navigation
type RestaurantScreen = 'welcome' | 'setup' | 'dashboard' | 'table-map' | 'orders' |
  'kds-kitchen' | 'kds-bar' | 'maitre' | 'waiter' | 'menu-editor' | 'team' |
  'analytics' | 'manager-ops' | 'approvals' | 'barman-station' | 'drink-recipes' |
  'cook-station' | 'stock' | 'waiter-calls' | 'waiter-tips' |
  'waiter-table-detail' | 'waiter-payment' | 'waiter-actions' | 'floor-flow' | 'daily-report'

// Staff roles
type StaffRole = 'owner' | 'manager' | 'maitre' | 'barman' | 'chef' | 'cook' | 'waiter'

// Guest orders (waiter module)
type GuestOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
type GuestOrder = { id: string; item: string; qty: number; price: number; status: GuestOrderStatus; sentAt: string }
type TableGuest = { id: string; name: string; hasApp: boolean; paid: boolean; method?: string; orders: GuestOrder[] }
```

---

## 12. Interactive Actions — Complete Catalog

### 12.1 — Global Actions (2)
| # | Action | Screen | Trigger | Effect |
|---|--------|--------|---------|--------|
| 1 | Select Role | Welcome | Click role card | Sets active role, loads journey, navigates to default screen |
| 2 | Switch Language | Header | Language selector | Applies i18n translations across all screens |

### 12.2 — Setup Actions (4)
| # | Action | Step | Effect |
|---|--------|------|--------|
| 3 | Navigate Steps | All | Wizard step progression/regression |
| 4 | Select Service Type | Step 2 | Highlights card with glow + ring + checkmark |
| 5 | Toggle Feature | Step 3 | Visual on/off toggle for amenities |
| 6 | Complete Setup | Step 4 | Shows completion banner, navigates to dashboard |

### 12.3 — Table Management (5)
| # | Action | Screen | Trigger | State Change |
|---|--------|--------|---------|-------------|
| 7 | Select Table | Table Map | Click table node | Opens detail panel |
| 8 | Seat Customer | Table Map (available) | Button click | available → occupied |
| 9 | Close Bill | Table Map (occupied) | Button click | occupied → billing |
| 10 | Release Table | Table Map (billing) | Button click | billing → available |
| 11 | Check-in Reservation | Table Map (reserved) | Button click | reserved → occupied |

### 12.4 — Order Management (7)
| # | Action | Screen | Trigger | State Change |
|---|--------|--------|---------|-------------|
| 12 | Filter Orders | Orders | Click filter pill | Filters visible orders by status |
| 13 | Expand Order | Orders | Click "..." | Reveals full item list with images |
| 14 | Confirm Order | Orders/KDS | Click button | pending → confirmed |
| 15 | Start Preparation | Orders/KDS | Click button | confirmed → preparing |
| 16 | Mark Ready | Orders/KDS | Click button | preparing → ready |
| 17 | Deliver Order | Orders | Click button | ready → delivered |
| 18 | Collapse Order | Orders | Click "..." again | Hides expanded detail |

### 12.5 — KDS Actions (2)
| # | Action | Screen | Effect |
|---|--------|--------|--------|
| 19 | Start Prep (KDS) | KDS Kitchen/Bar | confirmed → preparing, button changes |
| 20 | Mark Ready (KDS) | KDS Kitchen/Bar | preparing → ready, ticket moves to "Prontos" |

### 12.6 — Approval Actions (2)
| # | Action | Screen | Effect |
|---|--------|--------|--------|
| 21 | Approve Request | Approvals | Card fades, "✅ Processado" shown |
| 22 | Reject Request | Approvals | Card fades, "✅ Processado" shown |

### 12.7 — Waiter Command Center Actions (28)
| # | Action | Tab/Sub | Trigger | Effect |
|---|--------|---------|---------|--------|
| 23 | Switch Tab | — | Click tab pill | Resets sub-navigation state |
| 24 | Dismiss Feed Item | Live | Click action button | Removes from feed, navigates to relevant tab |
| 25 | View Kitchen | Live | Click "Ver" on banner | Switches to Kitchen tab |
| 26 | Select Table | Tables | Click table card | Opens table detail view |
| 27 | Back to Tables | Tables/Detail | Click "← Todas as mesas" | Returns to table list |
| 28 | Switch Sub-tab | Tables/Detail | Click Pessoas/Pedidos/Cardápio/Cobrar | Changes detail view |
| 29 | Add Guest | Tables/Guests | Click "+" button | Opens name input form |
| 30 | Confirm Guest | Tables/Guests | Click "Confirmar" | Creates guest entry with "!" badge |
| 31 | Cancel Add Guest | Tables/Guests | Click "Cancelar" | Closes input form |
| 32 | Open Menu for Guest | Tables/Guests | Click "+ Pedir" | Switches to Menu tab with guest pre-selected |
| 33 | Open Charge for Guest | Tables/Guests | Click "Cobrar" | Switches to Charge tab for that guest |
| 34 | Switch Menu Category | Tables/Menu | Click category pill | Filters menu items |
| 35 | Add Item to Cart | Tables/Menu | Click "+ Adicionar" | Adds to pending order |
| 36 | Increment Item | Tables/Menu | Click "+" button | Increases quantity |
| 37 | Decrement Item | Tables/Menu | Click "−" button | Decreases qty or removes |
| 38 | Send to Kitchen | Tables/Menu | Click "🔥 Enviar para Cozinha" | Creates sent orders, toast, switches to Orders |
| 39 | Serve Dish | Tables/Orders | Click "Servir" (ready) | Marks as served |
| 40 | Edit Order | Tables/Orders | Click pencil icon | Expands edit options |
| 41 | Cancel Order | Tables/Orders | Click X icon | Adds to cancelled list |
| 42 | Pick Up Dish | Kitchen | Click "Retirar ✓" | Moves to served section |
| 43 | Select Payment Guest | Charge | Click "Cobrar" on guest | Opens method selection |
| 44 | Select Payment Method | Charge/Method | Click method card | Starts processing animation |
| 45 | Confirm Payment | Charge/Processing | Click "Confirmar Pagamento" | Shows success screen |
| 46 | Print Receipt | Charge/Done | Click "Imprimir recibo" | (UI-only action) |
| 47 | Next Payment | Charge/Done | Click "Próximo →" | Resets to guest selection |
| 48 | Change Method | Charge/Processing | Click "Trocar método" | Returns to method selection |
| 49 | Back from Method | Charge/Method | Click "← Voltar" | Returns to guest list |
| 50 | Switch Guest Order | Tables/Menu | Click "trocar" | Clears guest selection |

### 12.8 — Other Waiter Screens (3)
| # | Action | Screen | Effect |
|---|--------|--------|--------|
| 51 | Attend Call | Waiter Calls | Marks call as attended, shows "✅ Atendido" |
| 52 | Expand Situation | Waiter Actions | Reveals sub-action buttons |
| 53 | Resolve Situation | Waiter Actions | Removes from active list, increments resolved count |

### 12.9 — Maitre/Floor Actions (3)
| # | Action | Screen | Effect |
|---|--------|--------|--------|
| 54 | Expand Reservation | Maitre | Shows Check-in/Edit/Cancel buttons |
| 55 | Check-in Guest | Maitre | Status transition (UI-only) |
| 56 | Call Queue Guest | Floor Flow | "Chamar" button (UI-only) |

### 12.10 — Menu & Team Actions (4)
| # | Action | Screen | Effect |
|---|--------|--------|--------|
| 57 | Filter Menu Category | Menu Editor | Filters visible items |
| 58 | Edit Menu Item | Menu Editor | Opens inline edit panel with fields |
| 59 | Select Drink Recipe | Drink Recipes | Shows detailed recipe view |
| 60 | Filter Stock | Stock | Filters by OK/Low/Critical |

---

## 13. Service Type Differentiation — 11 Types

| # | Service Type | Key Differentiator | Feature Count | Anchor Features |
|---|-------------|-------------------|:------------:|-----------------|
| 1 | **Fine Dining** | AI-powered wine/food harmonization | 26 | Harmonização IA, Split por Item, Menu Degustação |
| 2 | **Casual Dining** | Smart waitlist with pre-ordering | 22 | Smart Waitlist, Modo Família, Kids Priority |
| 3 | **Fast Casual** | Build-your-own dish builder | 18 | Montador de Pratos, Acompanhamento Nutricional, Alérgenos |
| 4 | **Café / Bakery** | Work Mode (Wi-Fi/outlet management) | 16 | Work Mode, Lógica de Refill, Timer de Permanência |
| 5 | **Pub & Bar** | Digital tab pre-authorization | 20 | Pré-auth Comanda, Comandas de Grupo, Round Builder |
| 6 | **Buffet** | Smart scale integration via NFC | 14 | Balança Inteligente NFC, Peso → Preço Automático |
| 7 | **Drive-Thru** | Geofencing GPS triggers at 500m | 12 | GPS Geofencing, Pedido Antecipado, ETA Tracking |
| 8 | **Food Truck** | Real-time location map | 14 | Mapa em Tempo Real, Fila Virtual, Push Notifications |
| 9 | **Chef's Table** | Course-by-course tasting menu | 24 | Menu Degustação Step-by-Step, Notas do Sommelier |
| 10 | **Quick Service** | Skip the Line fast checkout | 15 | Skip the Line, Acompanhamento 4 Estágios |
| 11 | **Club & Balada** | Animated QR tickets + VIP mapping | 22 | QR Animado, Mapa VIP, Consumo Mínimo Tracker |

---

## 14. Design System & Visual Language

### 14.1 — Semantic Color Tokens

All components use Tailwind semantic tokens defined in `index.css`:

| Token | Usage Examples |
|-------|---------------|
| `primary` | CTAs, selected states, main accent, table badges, revenue |
| `secondary` | Alternate accent, weekly charts, discount badges |
| `destructive` | Errors, late orders (>15min), critical alerts, cancellations |
| `success` | Available tables, payments confirmed, completed actions, tips |
| `warning` | Urgency indicators, low stock, queue, preparing status |
| `info` | Reservations, confirmed status, billing, app-user badges |
| `muted` | Backgrounds, disabled states, inactive elements |
| `accent` | Barman color, header gradients, decorative elements |

### 14.2 — Typography Scale

| Class | Usage |
|-------|-------|
| `text-[7px]` | Micro badges (PRATO, S/APP, IMEDIATO) |
| `text-[8px]` | Sub-labels, timestamps in compact views |
| `text-[9px]` | Secondary info in mobile views |
| `text-[10px]` | Status labels, small descriptions |
| `text-[11px]` | Compact card text, mobile item names |
| `text-xs` | Standard small text, descriptions |
| `text-sm` | Body text, names, prices |
| `text-base` | Waiter header name |
| `text-lg` | Table numbers, section titles |
| `text-xl` / `text-2xl` | KPI values, approval amounts |
| `text-3xl` | Large stat displays |
| `text-5xl` | Hero KPIs (satisfaction, returning customers) |

### 14.3 — Animation Patterns

| Pattern | CSS Class | Usage |
|---------|-----------|-------|
| Pulse | `animate-pulse` | Urgent alerts, ready dishes, critical badges, NFC waiting |
| Bounce | `animate-bounce` | Late order alert icon (AlertCircle) |
| Ping | `animate-ping` | NFC processing circles, notification dots |
| Slide In | `animate-in slide-in-from-top-2` | Toast notifications |
| Scale Hover | `hover:scale-[1.02]` | Role selection cards |
| Scale 110 | `hover:scale-110` | Table map nodes |
| Shadow Glow | `shadow-glow` | Primary CTAs, active filter pills |
| Transition All | `transition-all` | Tab switches, card selections, button hovers |

### 14.4 — Card & Container Patterns

| Pattern | Usage |
|---------|-------|
| `rounded-2xl border border-border bg-card` | Standard content card |
| `rounded-xl border-2 border-primary/30 bg-primary/5` | Selected/highlighted card |
| `rounded-xl border-2 border-destructive/30 bg-destructive/5 animate-pulse` | Critical alert card |
| `rounded-xl border-2 border-dashed border-primary/20` | Add/create action card |
| `bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10` | Hero/summary cards |
| `bg-gradient-to-r from-primary via-primary/90 to-accent` | Waiter header bar |

---

## 15. State Management & Simulation Engine

### 15.1 — DemoContext Provider

The `DemoContext` (from `@/contexts/DemoContext`) wraps all demo pages and provides:

```typescript
interface DemoContextValue {
  // Data
  orders: DemoOrder[]
  tables: DemoTable[]
  reservations: DemoReservation[]
  analytics: DemoAnalytics
  notifications: DemoNotification[]
  menu: DemoMenuItem[]
  unreadNotifications: number

  // Mutations
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
}
```

### 15.2 — Order Status Pipeline

```
pending → confirmed → preparing → ready → delivered → paid
```

Each transition can be triggered by:
- Manual action (button click in Orders, KDS, or Waiter screens)
- Simulation engine (automatic advancement at intervals)

### 15.3 — Table Status Machine

```
available ⇄ occupied → billing → available
reserved → occupied
```

### 15.4 — Local State (Waiter Module)

The Waiter Command Center maintains extensive local state that is **not** persisted to DemoContext:
- Added guests (via "Add guest without app")
- Sent orders (via "Send to Kitchen")
- Cancelled orders
- Live feed dismissals
- Kitchen pickup tracking
- Payment flow progression

This design allows the waiter module to demonstrate complex workflows without side effects on the global simulation state.

---

> **NOOWE Platform** — Built with React 18, TypeScript, Tailwind CSS, Vite  
> **Documentation Standard**: v4.0 · International · Big Tech-level  
> **Total Lines of Code**: ~11,538 (demo + i18n)  
> **Maintainer**: NOOWE Engineering Team

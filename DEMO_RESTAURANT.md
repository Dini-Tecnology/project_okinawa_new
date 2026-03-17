# NOOWE Restaurant Demo — Complete Technical Documentation

> **Version**: 3.1 · **Last Updated**: 2026-03-17  
> **Route**: `/demo/restaurant` · **Context**: Bistrô Noowe (simulated establishment)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Role-Based Access Control (RBAC)](#3-role-based-access-control-rbac)
4. [Screen Inventory (22 Screens)](#4-screen-inventory-22-screens)
5. [Role Journeys](#5-role-journeys)
6. [Feature Deep-Dives](#6-feature-deep-dives)
7. [Data Model & Mock Data](#7-data-model--mock-data)
8. [Internationalization (i18n)](#8-internationalization-i18n)
9. [Mobile-First Rendering](#9-mobile-first-rendering)
10. [Component Architecture](#10-component-architecture)
11. [Interactive Actions Catalog](#11-interactive-actions-catalog)
12. [Service Type Differentiation](#12-service-type-differentiation)
13. [Design System Integration](#13-design-system-integration)
14. [File Map](#14-file-map)

---

## 1. Executive Summary

The Restaurant Demo is a **high-fidelity interactive prototype** embedded within the NOOWE platform, designed to showcase the full operational management capabilities of a restaurant SaaS. It operates under the simulated context of **Bistrô Noowe**, a Fine Dining establishment, and allows stakeholders to explore the platform through 7 distinct staff perspectives across 22 dedicated screens.

### Key Numbers

| Metric | Value |
|--------|-------|
| Staff Roles | 7 (Owner → Cook) |
| Dedicated Screens | 22 |
| Service Types Supported | 11 (Fine Dining → Club & Balada) |
| Interactive Actions | 50+ |
| Languages | 3 (PT-BR, EN, ES) |
| Mock Data Points | Tables (12), Orders (dynamic), Reservations (dynamic), Team (10), Stock (8), Drinks (5) |

### Purpose

- **Sales**: Allow prospective restaurant owners to experience the full platform before purchasing
- **Validation**: Demonstrate real operational workflows (KDS, approvals, payments, floor management)
- **Stakeholder Alignment**: Let each team member (chef, waiter, owner) see their exact view

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    /demo/restaurant                         │
│  ┌──────────┐   ┌─────────────────┐   ┌──────────────────┐ │
│  │  Journey  │   │  PhoneShell /   │   │   Context        │ │
│  │  Sidebar  │   │  Desktop View   │   │   Sidebar        │ │
│  │  (left)   │   │  (center)       │   │   (right)        │ │
│  └──────────┘   └─────────────────┘   └──────────────────┘ │
│                          │                                  │
│                    DemoContext                               │
│               (orders, tables, menus,                       │
│                reservations, analytics,                     │
│                notifications, simulation)                   │
└─────────────────────────────────────────────────────────────┘
```

### Layout Pattern

Three-column centered layout:
1. **Journey Sidebar** (left, ≥768px) — Progress tracker with role-specific stages
2. **PhoneShell / Desktop View** (center) — Primary content rendered inside a responsive phone emulator (mobile) or full-width cards (desktop)
3. **Context Sidebar** (right) — Screen metadata (title, description) from `SCREEN_INFO`

### State Management

All demo state flows through `DemoContext` (React Context), providing:
- `orders` — Live order objects with status pipeline
- `tables` — 12 table objects with status, customer, timing
- `reservations` — Reservation list with status tracking
- `analytics` — Revenue, occupancy, hourly data, satisfaction
- `notifications` — Real-time notification feed
- `menu` — Menu items with categories and images
- Mutation helpers: `updateOrderStatus()`, `updateTableStatus()`

### Real-Time Simulation Engine

`DemoContext` runs an interval-based simulation that:
- Advances order statuses through the pipeline
- Generates new notifications (waiter calls, kitchen alerts)
- Updates occupancy and revenue metrics
- Creates a sense of a "living" restaurant during the demo

---

## 3. Role-Based Access Control (RBAC)

The demo implements a **6-tier RBAC hierarchy** with 7 roles:

| # | Role | ID | Default Screen | Icon | Access Level |
|---|------|----|---------------|------|-------------|
| 1 | **Dono** (Owner) | `owner` | `dashboard` | 👑 Crown | Full Control — all 9 screens |
| 2 | **Gerente** (Manager) | `manager` | `manager-ops` | 📊 Briefcase | Operations & Approvals — 7 screens |
| 3 | **Maitre** | `maitre` | `maitre` | 💁‍♀️ CalendarDays | Reservations & Floor — 3 screens |
| 4 | **Chef** | `chef` | `kds-kitchen` | 👨‍🍳 ChefHat | Kitchen KDS & Menu — 3 screens |
| 5 | **Barman** | `barman` | `barman-station` | 🍸 Beer | Bar KDS & Drinks — 4 screens |
| 6 | **Cozinheiro** (Cook) | `cook` | `cook-station` | 🧑‍🍳 CookingPot | Station-specific KDS — 2 screens |
| 7 | **Garçom** (Waiter) | `waiter` | `waiter` | 🤵 HandPlatter | Table Service — 6 screens |

### Permission Matrix

| Screen | Owner | Manager | Maitre | Chef | Barman | Cook | Waiter |
|--------|:-----:|:-------:|:------:|:----:|:------:|:----:|:------:|
| Dashboard | ✅ | — | — | — | — | — | — |
| Table Map | ✅ | ✅ | ✅ | — | — | — | — |
| Orders | ✅ | ✅ | — | — | — | — | ✅ |
| KDS Kitchen | ✅ | — | — | ✅ | — | ✅ | — |
| KDS Bar | ✅ | — | — | — | ✅ | — | — |
| Analytics | ✅ | — | — | — | — | — | — |
| Team | ✅ | ✅ | — | — | — | — | — |
| Menu Editor | ✅ | — | — | ✅ | — | — | — |
| Setup | ✅ | — | — | — | — | — | — |
| Manager Ops | — | ✅ | — | — | — | — | — |
| Approvals | — | ✅ | — | — | — | — | — |
| Daily Report | — | ✅ | — | — | — | — | — |
| Maitre Panel | — | — | ✅ | — | — | — | — |
| Floor Flow | — | — | ✅ | — | — | — | — |
| Barman Station | — | — | — | — | ✅ | — | — |
| Drink Recipes | — | — | — | — | ✅ | — | — |
| Cook Station | — | — | — | — | — | ✅ | — |
| Stock | — | ✅ | — | ✅ | ✅ | — | — |
| Waiter (Command Center) | — | — | — | — | — | — | ✅ |
| Waiter Calls | — | — | — | — | — | — | ✅ |
| Waiter Tips | — | — | — | — | — | — | ✅ |
| Waiter Payment | — | — | — | — | — | — | ✅ |

---

## 4. Screen Inventory (22 Screens)

### 4.1 — Welcome (`welcome`)
**Purpose**: Entry point for the restaurant demo  
**Components**: Hero banner, 7-role selector grid, 6 feature highlight cards, stats summary (7 roles, 22 screens, 11 service types)  
**Actions**: Select a staff role → navigates to their default screen  
**File**: `SetupScreens.tsx` → `WelcomeScreen`

### 4.2 — Setup Wizard (`setup`)
**Purpose**: 4-step restaurant configuration wizard  
**Steps**:
1. **Profile** — Name, description, address, phone, hours, photo upload
2. **Service Type** — 11 options (Fine Dining → Club & Balada), each with feature count
3. **Features** — Toggle amenities (Wi-Fi, Parking, Pet Friendly, Terrace, Wine List, Online Reservations, QR Code)
4. **Payments** — Service charge (10%), tip (optional), split payment (4 modes), methods (Card, PIX, Apple/Google Pay, NFC)

**Actions**: Navigate steps, select service type, toggle features, proceed to dashboard  
**File**: `SetupScreens.tsx` → `SetupScreen`

### 4.3 — Dashboard (`dashboard`)
**Purpose**: Executive real-time overview  
**KPIs**: Revenue today, Total orders, Average ticket, Occupancy rate  
**Widgets**: Revenue-by-hour bar chart, Occupancy gauge (SVG ring), Active orders list, Notifications feed, Top sellers ranking  
**Actions**: Click KPI alerts → navigate to orders, click "See all" → orders/notifications  
**File**: `DashboardScreens.tsx` → `DashboardScreen`

### 4.4 — Analytics (`analytics`)
**Purpose**: Deep reporting & insights  
**Sections**: Period selector (Today/Week/Month), Revenue summary cards, Weekly revenue bar chart, Customer satisfaction (5-star breakdown), Returning customers gauge, Peak hours heatmap (7×6 grid), Staff performance leaderboard  
**File**: `DashboardScreens.tsx` → `AnalyticsScreen`

### 4.5 — Table Map (`table-map`)
**Purpose**: Interactive floor plan  
**Features**: 12 tables positioned on a visual grid (round/rect/long shapes), color-coded status (Available/Occupied/Reserved/Billing), click-to-select detail panel, status transition buttons  
**Actions**: Click table → view details, "Seat Customer" / "Close Bill" / "Release Table" / "Check-in Reservation"  
**File**: `OperationsScreens.tsx` → `TableMapScreen`

### 4.6 — Orders (`orders`)
**Purpose**: Complete order lifecycle management  
**Features**: Filter bar by status (All/Pending/Confirmed/Preparing/Ready/Delivered), expandable order cards with item images, elapsed time tracking, late order highlighting (>15min)  
**Actions**: Confirm → Prepare → Ready → Deliver status transitions per order  
**File**: `OperationsScreens.tsx` → `OrdersScreen`

### 4.7 — KDS Kitchen (`kds-kitchen`)
**Purpose**: Kitchen Display System  
**Features**: Stats (Queue/Preparing/Ready), ticket cards with table number, item list, prep time, elapsed timer, urgency indicators (flame, bounce, pulse animations), ticket actions  
**Actions**: "Start Preparation" / "Mark as Ready" per ticket  
**File**: `OperationsScreens.tsx` → `KDSScreen` (view='kitchen')

### 4.8 — KDS Bar (`kds-bar`)
**Purpose**: Bar Display System (same component as Kitchen KDS, filtered for drinks)  
**Actions**: Same as KDS Kitchen but filtered to `Bebidas` category  
**File**: `OperationsScreens.tsx` → `KDSScreen` (view='bar')

### 4.9 — Maitre Panel (`maitre`)
**Purpose**: Reservation management & guest flow  
**Sections**: Quick stats (Reservations/Confirmed/Queue/Free Tables), Reservations timeline with expandable cards (Check-in, Edit, Cancel), Virtual Queue (3 mock guests with position, party size, wait time), Available Tables for assignment  
**Actions**: Check-in guest, call queue member, assign table  
**File**: `ServiceScreens.tsx` → `MaitreScreen`

### 4.10 — Floor Flow (`floor-flow`)
**Purpose**: Virtual queue management & table rotation  
**Accessible by**: Maitre  
**File**: `ServiceScreens.tsx` (referenced in journey)

### 4.11 — Waiter Command Center (`waiter`)
**Purpose**: Complete table service hub — the most complex screen in the demo  
**Rendered in**: PhoneShell (mobile-first emulator)  
**Sub-tabs**:

#### 4.11a — Ao Vivo (Live Feed)
- Real-time event feed with 7 event types: `kitchen_ready`, `call`, `payment`, `payment_needed`, `approval`, `order`
- Urgency levels: `critical` (pulsing), `high`, `medium`, `info`
- Actionable: "Retirar" (pick up dish), "Atender" (answer call), "Cobrar" (charge), "Solicitar" (request approval)
- Kitchen alert banner when dishes are waiting

#### 4.11b — Mesas (Tables Overview → Table Detail)
- **Overview**: List of assigned tables with guest count, order count, payment progress bar, badges (PRATO=dish ready, S/APP=guest without app)
- **Table Detail** (click on table):
  - Header: Table number, customer name, guest count, time elapsed, total amount, payment progress
  - **Sub-tab: Pessoas (Guests)** — Individual guest cards with app/no-app status, order count, total, "+ Pedir" and "Cobrar" buttons, "Add guest without app" form
  - **Sub-tab: Pedidos (Orders)** — All orders from all guests, status badges (ENVIADO/PREPARANDO/PRONTO/✓ SERVIDO), edit quantity and cancel actions
  - **Sub-tab: Cardápio (Menu)** — Full menu catalog (Entradas, Principais, Sobremesas, Bebidas), ordering flow per guest, quantity selector, "🔥 Enviar para Cozinha" button
  - **Sub-tab: Cobrar (Charge)** — Per-guest billing, multi-method payment (TAP to Pay/NFC, PIX QR, Card, Cash), 3-step flow (select guest → choose method → processing → confirmation)

#### 4.11c — Cozinha (Kitchen Pipeline)
- Visual pipeline of dishes in preparation
- Status: Preparando (yellow) / Pronto (green pulsing) / Servido (muted)
- SLA timers with elapsed vs expected time
- "Retirar" action for ready dishes
- Chef attribution

#### 4.11d — Cobrar (Quick Charge)
- Guest selector from occupied tables
- Payment method selection: TAP to Pay (NFC), PIX QR Code, Cartão, Dinheiro
- 3-step flow: Select guest → Method → Processing animation → Confirmation
- NFC simulation with "Aproxime o cartão" animation

**File**: `ServiceScreens.tsx` → `WaiterScreen`

### 4.12 — Waiter Calls (`waiter-calls`)
**Purpose**: Pending customer calls  
**Features**: Call notifications with table number, timestamp, read/unread status  
**File**: `RoleScreens.tsx` → `WaiterCallsScreen`

### 4.13 — Waiter Tips (`waiter-tips`)
**Purpose**: Daily tip tracking  
**Features**: Today's total, tip history, per-table breakdown  
**File**: `RoleScreens.tsx` → `WaiterTipsScreen`

### 4.14 — Waiter Payment (`waiter-payment`)
**Purpose**: Redirected to Waiter Command Center "Cobrar" tab  
**File**: Routes to `waiter` screen with charge tab active

### 4.15 — Manager Ops (`manager-ops`)
**Purpose**: Operational dashboard for managers  
**Features**: Alert banners (late orders >15min, pending approvals), 4 KPIs (Active Orders, Revenue, Active Staff, Occupancy), Staff on duty list with avatars and roles, Approval preview cards, Real-time order feed with elapsed timers  
**Actions**: Navigate to approvals, view order details  
**File**: `RoleScreens.tsx` → `ManagerOpsScreen`

### 4.16 — Approvals (`approvals`)
**Purpose**: Authorization workflow for sensitive operations  
**Stats**: Pending, Approved Today, Rejected Today, Total Impact (R$)  
**Types**:
- 🔴 **Cancelamento** — Order cancellation (e.g., "Cliente mudou de ideia")
- 🔵 **Cortesia** — Complimentary item (e.g., "Aniversariante na mesa")
- 🟡 **Estorno** — Refund (e.g., "Prato devolvido — não atendeu expectativa")
- 🟣 **Desconto** — Discount (e.g., "10% desconto fidelidade")

**Actions**: Approve ✅ or Reject ❌ each request with visual feedback  
**Mock Data**: 4 pending approvals totaling R$ 239  
**File**: `RoleScreens.tsx` → `ApprovalsScreen`

### 4.17 — Barman Station (`barman-station`)
**Purpose**: Bar-specific KDS  
**Features**: 3 stats (Queue, Ready, Today's Total), Drink ticket cards with images, prep timers, urgency markers, quick links to Recipes and Stock  
**Actions**: "Prepare" → "Ready to serve" per drink order  
**File**: `RoleScreens.tsx` → `BarmanStationScreen`

### 4.18 — Drink Recipes (`drink-recipes`)
**Purpose**: Standardized cocktail technical sheets  
**Cocktails**: Gin Tônica Aurora, Negroni Clássico, Espresso Martini, Caipirinha Premium, Moscow Mule  
**Detail**: Image, prep time, price, glass type, garnish, numbered ingredients, step-by-step preparation  
**File**: `RoleScreens.tsx` → `DrinkRecipesScreen`

### 4.19 — Cook Station (`cook-station`)
**Purpose**: Simplified station-specific KDS  
**Stations**: 🔥 Grelhados, ❄️ Frios, 🍝 Massas (tab selector)  
**Features**: Large ticket cards with item quantity, name, prep time, urgency highlighting, station keyword filtering  
**Actions**: "INICIAR PREPARO" / "PRONTO" per ticket  
**File**: `RoleScreens.tsx` → `CookStationScreen`

### 4.20 — Stock (`stock`)
**Purpose**: Inventory control  
**Stats**: OK / Low / Critical counts  
**Filters**: All, Low Stock, Critical  
**Items**: 8 mock items (Gin Tanqueray, Tônica, Limão, Campari, Filé Mignon, Salmão, Arroz, Azeite) with current level, minimum, visual progress bar  
**File**: `RoleScreens.tsx` → `StockScreen`

### 4.21 — Menu Editor (`menu-editor`)
**Purpose**: Menu management with categories, items, and pricing  
**File**: `ServiceScreens.tsx` → `MenuEditorScreen`

### 4.22 — Team (`team`)
**Purpose**: Staff management  
**Members**: 10 mock team members with avatars, roles, shifts, sales, tips  
**File**: `ServiceScreens.tsx` → `TeamScreen`

### 4.23 — Daily Report (`daily-report`)
**Purpose**: End-of-day metrics and closure  
**File**: `RoleScreens.tsx` → `DailyReportScreen`

---

## 5. Role Journeys

Each role has a predefined journey (sequence of screens) displayed in the sidebar:

### 5.1 — Owner Journey (9 stages)
```
Dashboard → Table Map → Orders → KDS Kitchen → KDS Bar → Analytics → Team → Menu → Setup
```

### 5.2 — Manager Journey (7 stages)
```
Ops Panel → Orders → Approvals → Table Map → Team → Daily Report → Stock
```

### 5.3 — Maitre Journey (3 stages)
```
Reservations → Floor Flow → Table Map
```

### 5.4 — Chef Journey (3 stages)
```
KDS Kitchen → Menu → Stock
```

### 5.5 — Barman Journey (4 stages)
```
My Station → KDS Bar → Recipes → Stock
```

### 5.6 — Cook Journey (2 stages)
```
My Station → General KDS
```

### 5.7 — Waiter Journey (6 stages)
```
My Tables → Calls → Charge/TAP → Actions → Active Orders → Tips
```

---

## 6. Feature Deep-Dives

### 6.1 — Real-Time KDS (Kitchen Display System)

The KDS is the operational heartbeat of the kitchen and bar. It implements:

- **Ticket lifecycle**: `confirmed` → `preparing` → `ready`
- **SLA timers**: Elapsed time vs expected prep time, with visual urgency escalation
- **Color-coded urgency**:
  - Normal (0–10min): Default border
  - Urgent (10–15min): Warning border + flame icon
  - Late (>15min): Destructive border + pulsing animation + bouncing alert icon
- **Dual views**: Kitchen (food items) and Bar (drink items) from the same component
- **Station filtering** (Cook): Keywords filter tickets to specific stations (grelhados, frios, massas)

### 6.2 — Waiter Command Center

The most sophisticated screen, operating as a 4-tab mobile-first command center:

**State Management (local)**:
- `waiterTab`: live | tables | kitchen | charge
- `selectedTable`: Current table being managed
- `tableDetailTab`: guests | orders | menu | charge
- `addedGuests`: Guests added without app
- `pendingOrder`: Items staged for kitchen submission
- `sentOrders`: Orders sent to kitchen (tracked locally)
- `cancelledOrders`: Cancelled order IDs
- `handledItems`: Dismissed live feed items
- `pickedUp`: Kitchen items marked as picked up
- `paymentStep`: guests | method | processing | done

**Key Flows**:

```
Guest without app arrives
  → Waiter opens table detail
  → "Pessoas" tab → "Adicionar convidado sem app"
  → Types name → Confirms
  → Guest appears in list with "!" badge
  → "+ Pedir" button → Cardápio tab
  → Browse categories → Add items with qty
  → "🔥 Enviar para Cozinha"
  → Toast confirmation → Order appears in "Pedidos" tab
  → Kitchen prepares → "Cozinha" tab shows status
  → Dish ready → "Retirar" → Serve
  → "Cobrar" tab → Select guest → Choose payment method
  → NFC/PIX/Card/Cash → Processing → Done ✓
```

### 6.3 — Approval Workflow

Sensitive financial operations require manager/owner authorization:

```
Waiter requests cancellation
  → Approval card created (type: cancel)
  → Manager sees alert banner in Ops Dashboard
  → Navigates to Approvals screen
  → Reviews: item, table, reason, requester, amount
  → Approves ✅ or Rejects ❌
  → Card transitions to "Processado" state
```

4 approval types: Cancel, Courtesy, Refund, Discount — each with distinct color coding and icons.

### 6.4 — Interactive Table Map

Visual floor plan with 12 tables in a grid layout:

| Table | Position | Shape | Seats |
|-------|----------|-------|-------|
| T1 | (12%, 15%) | Round | 2 |
| T2 | (32%, 12%) | Round | 2 |
| T3 | (52%, 15%) | Rect | 4 |
| T4 | (75%, 12%) | Rect | 4 |
| T5 | (10%, 42%) | Long | 6 |
| T6 | (35%, 40%) | Round | 2 |
| T7 | (55%, 42%) | Rect | 4 |
| T8 | (78%, 38%) | Long | 6 |
| T9 | (15%, 68%) | Round | 2 |
| T10 | (38%, 70%) | Round | 2 |
| T11 | (58%, 68%) | Long | 8 |
| T12 | (80%, 70%) | Round | 2 |

**Status transitions**: Available → Occupied → Billing → Available (cycle), Reserved → Occupied (check-in)

---

## 7. Data Model & Mock Data

### 7.1 — Team Members (10)

| ID | Name | Role | Status | Shift |
|----|------|------|--------|-------|
| tm1 | Ricardo Alves | Dono | Online | Integral |
| tm2 | Marina Costa | Gerente | Online | 14h–23h |
| tm3 | Felipe Santos | Chef | Online | 15h–23h |
| tm4 | Ana Rodrigues | Sommelier | Online | 18h–00h |
| tm5 | Bruno Oliveira | Garçom | Online | 18h–00h |
| tm6 | Carla Lima | Garçom | Online | 12h–18h |
| tm7 | Diego Martins | Barman | Offline | Folga |
| tm8 | Juliana Ferraz | Hostess | Online | 18h–00h |
| tm9 | Thiago Nunes | Cozinheiro | Online | 15h–23h |
| tm10 | Priscila Gomes | Cozinheiro | Online | 11h–19h |

### 7.2 — Stock Items (8)

| Item | Category | Current | Min | Status |
|------|----------|---------|-----|--------|
| Gin Tanqueray | Destilados | 3 bottles | 5 | 🟡 Low |
| Tônica Fever Tree | Mixers | 12 units | 10 | 🟢 OK |
| Limão Tahiti | Frutas | 8 units | 20 | 🔴 Critical |
| Campari | Licores | 4 bottles | 3 | 🟢 OK |
| Filé Mignon | Carnes | 6 kg | 10 | 🟡 Low |
| Salmão Norueguês | Peixes | 4 kg | 5 | 🟡 Low |
| Arroz Arbóreo | Grãos | 15 kg | 5 | 🟢 OK |
| Azeite Trufado | Condimentos | 2 bottles | 3 | 🟡 Low |

### 7.3 — Drink Recipes (5)

| Drink | Glass | Prep Time | Price |
|-------|-------|-----------|-------|
| Gin Tônica Aurora | Taça Balloon | 3min | R$ 38 |
| Negroni Clássico | Old Fashioned | 3min | R$ 42 |
| Espresso Martini | Taça Martini | 4min | R$ 40 |
| Caipirinha Premium | Old Fashioned | 2min | R$ 32 |
| Moscow Mule | Caneca de cobre | 2min | R$ 36 |

### 7.4 — Pending Approvals (4)

| Type | Table | Item | Amount | Requester |
|------|-------|------|--------|-----------|
| Cancel | 5 | Filé ao Molho de Vinho | R$ 118 | Bruno Oliveira |
| Courtesy | 8 | Petit Gâteau | R$ 42 | Carla Lima |
| Refund | 1 | Ceviche Peruano | R$ 48 | Bruno Oliveira |
| Discount | 3 | Conta Mesa 3 | R$ 31 | Marina Costa |

### 7.5 — Waiter Menu (15 items across 4 categories)

**Entradas**: Tartare de Atum (R$58), Burrata com Presunto (R$52), Polvo Grelhado (R$68), Carpaccio de Wagyu (R$72)  
**Principais**: Filé ao Molho de Vinho (R$89), Risotto de Cogumelos (R$62), Salmão Grelhado (R$72), Costela Braseada (R$78)  
**Sobremesas**: Petit Gâteau (R$38), Tiramisu (R$32), Crème Brûlée (R$34)  
**Bebidas**: Café Espresso (R$12), Vinho Tinto taça (R$45), Cerveja Artesanal (R$24), Suco Natural (R$16)

### 7.6 — Kitchen Pipeline (5 dishes)

| Dish | Table | Chef | Status | SLA | Elapsed |
|------|-------|------|--------|-----|---------|
| Filé ao Molho de Vinho (2x) | 5 | Chef Felipe | Ready | 20min | 22min |
| Petit Gâteau | 10 | Cozinheiro Thiago | Ready | 12min | 11min |
| Risotto de Cogumelos | 3 | Chef Felipe | Preparing | 25min | 18min |
| Salmão Grelhado | 8 | Cozinheiro Ana | Preparing | 22min | 8min |
| Tiramisu (2x) | 1 | Cozinheiro Thiago | Preparing | 15min | 5min |

### 7.7 — Table Guests (5 tables, 13 guests, 18 orders)

Tables 1, 3, 5, 8, 10 have pre-populated guest data with individual orders, app status, and payment status. This data powers the Waiter Command Center's deep-dive functionality.

### 7.8 — Live Feed (7 events)

| Time | Table | Event | Type | Urgency |
|------|-------|-------|------|---------|
| now | 5 | Dish ready for pickup | kitchen_ready | 🔴 Critical |
| 1min | 10 | Dessert ready | kitchen_ready | 🔴 Critical |
| 2min | 3 | Customer called waiter | call | 🟡 High |
| 3min | 8 | Payment received via app | payment | 🔵 Info |
| 5min | 1 | Bill requested | payment_needed | 🟡 High |
| 8min | 10 | Courtesy requested | approval | 🟠 Medium |
| 12min | 5 | New order registered | order | 🔵 Info |

---

## 8. Internationalization (i18n)

The demo supports **3 languages**: Portuguese (PT-BR), English (EN), and Spanish (ES).

- Translation engine: `useDemoI18n()` hook from `DemoI18n.tsx`
- All user-facing strings are translation keys (PT-BR as source, mapped to EN/ES)
- Technical comments and code remain in English
- ~300+ translation keys covering all 22 screens

### Coverage Areas

- Navigation labels (Dashboard, Mesas, Pedidos, etc.)
- KPI labels and descriptions
- Action buttons (Confirmar, Preparar, Pronto, Entregar)
- Status badges (Pendente, Confirmado, Preparando, Pronto, Entregue, Pago)
- Waiter Command Center (Ao Vivo, Pessoas, Cobrar, Enviar para Cozinha)
- Payment flows (TAP to Pay, Aproxime o cartão, Pagamento confirmado)
- Approval types (Cancelamento, Cortesia, Estorno, Desconto)
- Alert messages and live feed events

---

## 9. Mobile-First Rendering

### PhoneShell Emulator

Desktop screens like the Waiter Command Center render inside a `PhoneShell` component that simulates a smartphone interface:
- Fixed width/height resembling a mobile device
- Status bar (time, battery, signal)
- Notch or dynamic island
- Rounded corners and bezels
- Internal scrolling

### ResponsivePhoneShell

The `ResponsivePhoneShell` variant adapts rendering:
- **Mobile devices** (<768px): Full-screen rendering without shell chrome
- **Tablets/Desktop** (≥768px): PhoneShell emulator centered in viewport

### Mobile-Optimized Screens (`MobileRestaurantScreens.tsx`)

Dedicated mobile versions of key screens:
- `MobileDashboard` — Compact KPIs, quick action grid
- `MobileOwner` — Revenue, ticket, top items, executive summary
- `MobileManager` — Alerts, pending approvals, staff status
- `MobileMaitre` — Reservation cards, queue
- `MobileChef` — Kitchen ticket cards
- `MobileBarman` — Drink queue
- `MobileCook` — Station tickets
- `MobileWaiter` — Full Command Center (4 tabs, same as desktop `WaiterScreen`)

---

## 10. Component Architecture

### File Structure

```
src/components/demo/restaurant/
├── RestaurantDemoShared.tsx   — Types, RBAC config, journey stages, mock data, helpers
├── SetupScreens.tsx           — Welcome + 4-step Setup Wizard (286 lines)
├── DashboardScreens.tsx       — Dashboard + Analytics (392 lines)
├── OperationsScreens.tsx      — Table Map + Orders + KDS (423 lines)
├── ServiceScreens.tsx         — Maitre + Waiter Command Center + Menu + Team (1,479 lines)
├── RoleScreens.tsx            — Manager + Approvals + Barman + Cook + Stock + Calls + Tips (1,188 lines)
└── MobileRestaurantScreens.tsx — Mobile-optimized variants of all screens (1,557 lines)
```

### Shared Components

| Component | Purpose |
|-----------|---------|
| `GuidedHint` | Contextual hint bar at top of each screen |
| `PhoneShell` | Mobile device emulator frame |
| `MobileSection` | Standardized section with title/subtitle/action |
| `CompactStat` | Small KPI card with tone coloring |
| `MobileHint` | Compact hint for mobile screens |
| `StatusBadge` | Order status pill component |

### Exported Types

```typescript
type RestaurantScreen = 'welcome' | 'setup' | 'dashboard' | ... (24 values)
type StaffRole = 'owner' | 'manager' | 'maitre' | 'barman' | 'chef' | 'cook' | 'waiter'
type GuestOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
type TableGuest = { id, name, hasApp, paid, method?, orders[] }
type GuestOrder = { id, item, qty, price, status, sentAt }
```

---

## 11. Interactive Actions Catalog

### Global Actions
| Action | Screen | Effect |
|--------|--------|--------|
| Select Role | Welcome | Sets active role, navigates to default screen, updates journey sidebar |
| Switch Language | Header | Applies i18n translations across all screens |

### Order Management
| Action | Screen | Effect |
|--------|--------|--------|
| Confirm Order | Orders / KDS | Status: `pending` → `confirmed` |
| Start Preparation | Orders / KDS | Status: `confirmed` → `preparing` |
| Mark Ready | Orders / KDS | Status: `preparing` → `ready` |
| Deliver | Orders | Status: `ready` → `delivered` |
| Expand Order | Orders | Shows item details with images |
| Filter by Status | Orders | Filters visible orders |

### Table Management
| Action | Screen | Effect |
|--------|--------|--------|
| Select Table | Table Map | Opens detail panel |
| Seat Customer | Table Map | Status: `available` → `occupied` |
| Close Bill | Table Map | Status: `occupied` → `billing` |
| Release Table | Table Map | Status: `billing` → `available` |
| Check-in Reservation | Table Map | Status: `reserved` → `occupied` |

### Waiter Actions
| Action | Screen | Effect |
|--------|--------|--------|
| Dismiss Live Feed Item | Waiter/Live | Removes from feed, navigates to relevant tab |
| Select Table | Waiter/Tables | Opens table detail with 4 sub-tabs |
| Add Guest Without App | Waiter/Guests | Creates new guest entry |
| Place Order for Guest | Waiter/Menu | Adds items to pending order → sends to kitchen |
| Send to Kitchen | Waiter/Menu | Creates sent order records, shows toast, switches to Orders tab |
| Cancel Order | Waiter/Orders | Moves order to cancelled list |
| Edit Quantity | Waiter/Orders | Opens edit modal for order item |
| Pick Up Dish | Waiter/Kitchen | Marks kitchen item as picked up |
| Charge Guest (TAP/NFC) | Waiter/Charge | Simulates NFC payment flow |
| Charge Guest (PIX) | Waiter/Charge | Shows QR code simulation |
| Charge Guest (Card/Cash) | Waiter/Charge | Simulates payment processing |

### Approval Actions
| Action | Screen | Effect |
|--------|--------|--------|
| Approve Request | Approvals | Marks as processed with ✅ |
| Reject Request | Approvals | Marks as processed with ❌ |

### Setup Actions
| Action | Screen | Effect |
|--------|--------|--------|
| Navigate Steps (1-4) | Setup | Advances/retreats through wizard |
| Select Service Type | Setup | Highlights selected type with feature count |
| Toggle Features | Setup | Enables/disables restaurant amenities |
| Complete Setup | Setup | Shows success state, navigates to dashboard |

---

## 12. Service Type Differentiation

The Setup Wizard offers 11 service types, each unlocking a distinct feature set:

| # | Service Type | Key Feature | Feature Count |
|---|-------------|-------------|:------------:|
| 1 | Fine Dining | AI Harmonization + Unified Bill | 26 |
| 2 | Casual Dining | Smart Waitlist + Family Mode | 22 |
| 3 | Fast Casual | Dish Builder + Allergen Tracking | 18 |
| 4 | Café / Bakery | Work Mode (Wi-Fi/outlets) + Refill Logic | 16 |
| 5 | Pub & Bar | Digital Tab Pre-auth + Round Builder | 20 |
| 6 | Buffet | Smart Scale (NFC) | 14 |
| 7 | Drive-Thru | Geofencing GPS (500m triggers) | 12 |
| 8 | Food Truck | Real-time Map + Virtual Queue | 14 |
| 9 | Chef's Table | Course-by-course Tasting Menu + Sommelier Notes | 24 |
| 10 | Quick Service | Skip the Line + 4-stage Tracking | 15 |
| 11 | Club & Balada | Animated QR Tickets + VIP Map + Minimum Spend Tracker | 22 |

---

## 13. Design System Integration

### Color Tokens (Semantic)

All components use Tailwind semantic tokens from `index.css`:

| Token | Usage |
|-------|-------|
| `primary` | CTAs, selected states, main accent |
| `secondary` | Alternate accent, charts |
| `destructive` | Errors, late orders, critical alerts |
| `success` | Available tables, completed actions, payments |
| `warning` | Urgency, low stock, queue |
| `info` | Reservations, confirmed status, billing |
| `muted` | Backgrounds, disabled states |

### Typography

- `font-display` — Headings, numbers, KPIs
- `font-semibold` / `font-bold` — Labels, emphasis
- Size scale: `text-[7px]` (micro badges) → `text-5xl` (hero KPIs)

### Animation Patterns

| Pattern | Usage |
|---------|-------|
| `animate-pulse` | Urgent alerts, ready dishes, critical badges |
| `animate-bounce` | Late order alert icon |
| `animate-in slide-in-from-top-2` | Toast notifications |
| `transition-all` | Tab switches, button hovers, card selections |
| `hover:scale-[1.02]` | Role selection cards |
| `hover:scale-110` | Table map nodes |
| `shadow-glow` | Primary CTAs, active filters |

---

## 14. File Map

| File | Lines | Purpose | Key Exports |
|------|------:|---------|-------------|
| `RestaurantDemoShared.tsx` | 213 | Types, RBAC, journeys, mock data | `ROLE_CONFIG`, `ROLE_JOURNEYS`, `SCREEN_INFO`, `TEAM_MEMBERS`, `STOCK_ITEMS`, `DRINK_RECIPES`, `PENDING_APPROVALS`, `TABLE_POSITIONS` |
| `SetupScreens.tsx` | 286 | Welcome + Setup Wizard | `WelcomeScreen`, `SetupScreen` |
| `DashboardScreens.tsx` | 392 | Dashboard + Analytics | `DashboardScreen`, `AnalyticsScreen` |
| `OperationsScreens.tsx` | 423 | Table Map + Orders + KDS | `TableMapScreen`, `OrdersScreen`, `KDSScreen` |
| `ServiceScreens.tsx` | 1,479 | Maitre + Waiter + Menu + Team | `MaitreScreen`, `WaiterScreen`, `MenuEditorScreen`, `TeamScreen`, `TABLE_GUESTS_DATA`, `KITCHEN_PIPELINE`, `LIVE_FEED`, `WAITER_MENU` |
| `RoleScreens.tsx` | 1,188 | Manager + Barman + Cook + Stock | `ManagerOpsScreen`, `ApprovalsScreen`, `BarmanStationScreen`, `DrinkRecipesScreen`, `CookStationScreen`, `StockScreen`, `WaiterCallsScreen`, `WaiterTipsScreen` |
| `MobileRestaurantScreens.tsx` | 1,557 | Mobile-optimized variants | `MobileDashboard`, `MobileOwner`, `MobileManager`, `MobileWaiter`, etc. |
| `DemoI18n.tsx` | ~6,000+ | Translation engine (PT/EN/ES) | `useDemoI18n()` |

**Total**: ~5,538 lines of restaurant demo code + ~6,000 lines of translations

---

> **NOOWE Platform** — Built with React, TypeScript, Tailwind CSS, Vite  
> **Documentation Standard**: v3.1 · International bilingual (EN/PT) · Big Tech-level  
> **Maintainer**: NOOWE Engineering Team

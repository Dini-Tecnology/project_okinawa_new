# EPIC 16 -- Backend Completions (Missing Modules)

> **Status:** In Progress
> **Priority:** High
> **Sprint:** 2026-Q1
> **Date:** 2026-03-23

---

## 1. Business Context

Four backend modules were missing from the NOOWE platform, causing their corresponding frontend screens to rely on mock data, placeholder APIs, or static content. This created a fragile integration layer where mobile screens appeared functional during demos but would fail silently in production.

The affected areas are:

| Module | Impact | Frontend Screens Affected |
|--------|--------|--------------------------|
| **AddressesModule** | Users cannot save, edit, or manage delivery/pickup addresses | `AddressesScreen.tsx` calls `/users/addresses` (non-existent) |
| **ReceiptsModule** | Digital receipts are hardcoded with mock data; no persistence | `DigitalReceiptScreen.tsx` uses inline mock `ReceiptData` |
| **MenuItemCustomization** | Dish builder uses static ingredient arrays instead of dynamic customization groups | `DishBuilderScreen.tsx` has hardcoded `ingredients` map |
| **Geofencing** | Geolocation tracking screen has no server-side geofence validation | `GeolocationTrackingScreen.tsx` uses client-only distance calculation |

Completing these modules eliminates all remaining mock APIs and enables end-to-end data flow for the affected user journeys.

---

## 2. User Stories

### 2.1 Addresses

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-16-01 | As a customer, I want to save my addresses so I can quickly select one during checkout | Address is persisted with all fields; appears in list on reload |
| US-16-02 | As a customer, I want to set a default address so it is pre-selected in forms | Only one address is default at a time; badge is visible |
| US-16-03 | As a customer, I want to edit or delete an address | PATCH and DELETE endpoints work; UI reflects changes immediately |

### 2.2 Receipts

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-16-04 | As a customer, I want to view my digital receipt after payment | Receipt is generated from real order data; items snapshot is accurate |
| US-16-05 | As a customer, I want to see my receipt history | Paginated list of past receipts sorted by date descending |
| US-16-06 | As the system, I want to generate a receipt when payment succeeds | POST /receipts/generate creates snapshot atomically |

### 2.3 Menu Item Customization

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-16-07 | As a customer, I want to customize my dish with dynamic options from the restaurant | DishBuilderScreen fetches customization groups from API |
| US-16-08 | As a restaurant owner, I want to create customization groups for my menu items | CRUD endpoints for customization groups with validation |
| US-16-09 | As a customer, I want to see required vs optional customization groups | `is_required` flag drives UI behavior (min_select enforcement) |

### 2.4 Geofencing

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-16-10 | As a customer, I want to find nearby restaurants based on my location | GET /restaurants/nearby returns restaurants within radius using Haversine |
| US-16-11 | As a customer arriving at a drive-thru, I want the app to detect I'm inside the geofence | GET /restaurants/:id/geofence-check returns `isInside` and `distance` |
| US-16-12 | As a restaurant owner, I want to configure my restaurant's geofence radius | `geofence_radius` column on restaurants table; PATCH updates it |

---

## 3. Technical Specifications

### 3.1 AddressesModule

**Path:** `backend/src/modules/addresses/`

#### Entity: Address

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | string | indexed, NOT NULL |
| label | string | e.g. 'Casa', 'Trabalho', 'Outro' |
| street | string | NOT NULL |
| number | string | NOT NULL |
| complement | string / null | nullable |
| neighborhood | string | NOT NULL |
| city | string | NOT NULL |
| state | string(2) | NOT NULL |
| zip | string(8) | NOT NULL |
| lat | decimal / null | nullable |
| lng | decimal / null | nullable |
| is_default | boolean | default false |
| created_at | timestamp | auto |
| updated_at | timestamp | auto |

#### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/addresses` | JWT | List current user's addresses |
| POST | `/addresses` | JWT | Create a new address |
| PATCH | `/addresses/:id` | JWT | Update an address |
| DELETE | `/addresses/:id` | JWT | Delete an address |
| PATCH | `/addresses/:id/set-default` | JWT | Set address as default (clears others) |

#### Migration: `CreateAddressesTable`

---

### 3.2 ReceiptsModule

**Path:** `backend/src/modules/receipts/`

#### Entity: Receipt

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| order_id | string | unique, NOT NULL |
| payment_id | string / null | nullable |
| user_id | string | indexed, NOT NULL |
| restaurant_id | string | NOT NULL |
| items_snapshot | JSONB | array of {name, qty, unit_price, total} |
| subtotal | decimal | cents |
| service_fee | decimal | cents |
| tip | decimal | cents |
| total | decimal | cents |
| payment_method | string | NOT NULL |
| generated_at | timestamp | NOT NULL |
| created_at | timestamp | auto |

#### Service Methods

- `generate(orderId, paymentId)` -- fetches order + payment, creates item snapshot, saves receipt
- `findByOrder(orderId)` -- get receipt by order ID
- `findByUser(userId, pagination)` -- paginated receipt history

#### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/receipts/order/:orderId` | JWT | Get receipt for specific order |
| GET | `/receipts/my` | JWT | Get current user's receipts (paginated) |
| POST | `/receipts/generate` | JWT | Trigger receipt generation |

#### Migration: `CreateReceiptsTable`

---

### 3.3 MenuItemCustomization (extends MenuItemsModule)

**Path:** `backend/src/modules/menu-items/` (new entity + service methods + controller endpoints)

#### Entity: MenuItemCustomizationGroup

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| menu_item_id | string | FK to menu_items, indexed |
| name | string | e.g. "Ponto da carne", "Molho", "Extras" |
| min_select | number | default 0 |
| max_select | number | default 1 |
| is_required | boolean | default false |
| sort_order | number | for display ordering |
| options | JSONB | array of {id, name, price_delta (cents), calories} |

#### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/menu-items/:id/customizations` | Public | Get customization groups for a menu item |
| POST | `/menu-items/:id/customizations` | JWT (OWNER, MANAGER) | Create customization group |
| PATCH | `/menu-items/customizations/:groupId` | JWT (OWNER, MANAGER) | Update customization group |
| DELETE | `/menu-items/customizations/:groupId` | JWT (OWNER, MANAGER) | Delete customization group |

#### Migration: `CreateMenuItemCustomizationsTable`

---

### 3.4 Geofencing (extends RestaurantsModule)

**Path:** `backend/src/modules/restaurants/` (new columns + service methods + controller endpoints)

#### New Columns on Restaurant Entity

| Column | Type | Constraints |
|--------|------|-------------|
| lat | decimal / null | nullable, precision 10 scale 7 |
| lng | decimal / null | nullable, precision 10 scale 7 |
| geofence_radius | integer / null | nullable, default 500 (meters) |

#### Service Methods

- `findNearby(lat, lng, radiusKm)` -- uses Haversine formula for distance calculation
- `getGeofenceStatus(restaurantId, userLat, userLng)` -- returns `{ isInside: boolean, distance: number }`

#### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/restaurants/nearby` | Public | Find nearby restaurants (`?lat=&lng=&radius=`) |
| GET | `/restaurants/:id/geofence-check` | JWT | Check geofence status (`?lat=&lng=`) |

#### Migration: `AddGeofenceToRestaurants`

---

## 4. i18n Keys

Keys added to all three language files (pt, en, es):

### Addresses
- `addresses.created` -- Address created confirmation
- `addresses.updated` -- Address updated confirmation
- `addresses.deleted` -- Address deleted confirmation
- `addresses.setAsDefault` -- Set as default action
- `addresses.defaultBadge` -- Default badge label

### Receipts
- `receipts.title` -- Receipts screen title
- `receipts.myReceipts` -- My receipts header
- `receipts.order` -- Order label
- `receipts.paymentMethod` -- Payment method label
- `receipts.generated` -- Receipt generated confirmation

### Dish Builder
- `dishBuilder.customizations` -- Customizations section title
- `dishBuilder.required` -- Required indicator
- `dishBuilder.optional` -- Optional indicator
- `dishBuilder.select` -- Select instruction
- `dishBuilder.extras` -- Extras label

---

## 5. Mobile Screen Updates

| Screen | Current State | After |
|--------|--------------|-------|
| `AddressesScreen.tsx` | Calls `/users/addresses` (non-existent route) | Calls `/addresses` (real AddressesModule) |
| `DigitalReceiptScreen.tsx` | Uses hardcoded mock ReceiptData | Fetches from `GET /receipts/order/:orderId` |
| `DishBuilderScreen.tsx` | Static `ingredients` map | Fetches from `GET /menu-items/:id/customizations` |
| `GeolocationTrackingScreen.tsx` | Client-only distance calc, no server validation | Calls `GET /restaurants/:id/geofence-check` for server-validated geofence |

---

## 6. Definition of Done (DoD) Checklist

- [ ] **AddressesModule**: Entity, DTO, Service, Controller, Migration created
- [ ] **AddressesModule**: All 5 endpoints functional (GET, POST, PATCH, DELETE, set-default)
- [ ] **ReceiptsModule**: Entity, DTO, Service, Controller, Migration created
- [ ] **ReceiptsModule**: All 3 endpoints functional (GET order, GET my, POST generate)
- [ ] **MenuItemCustomization**: Entity, DTO, Service methods, Controller endpoints, Migration created
- [ ] **MenuItemCustomization**: All 4 endpoints functional (GET, POST, PATCH, DELETE)
- [ ] **Geofencing**: New columns added via migration, Service methods, Controller endpoints
- [ ] **Geofencing**: Haversine-based findNearby and geofence-check working
- [ ] **app.module.ts**: AddressesModule and ReceiptsModule registered
- [ ] **i18n**: All keys added to pt, en, es JSON files
- [ ] **AddressesScreen.tsx**: Updated to call `/addresses` endpoints
- [ ] **DigitalReceiptScreen.tsx**: Fetches real receipt from API
- [ ] **DishBuilderScreen.tsx**: Fetches customization groups from API
- [ ] **GeolocationTrackingScreen.tsx**: Calls geofence-check endpoint
- [ ] All entities follow existing TypeORM patterns (PrimaryGeneratedColumn, CreateDateColumn, etc.)
- [ ] All DTOs use class-validator decorators matching codebase conventions
- [ ] All controllers use proper guards (JwtAuthGuard, RolesGuard) where needed
- [ ] Migrations follow timestamp naming convention

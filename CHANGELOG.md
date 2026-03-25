# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Legal module tests (controller and service spec files)
- Project-level README with complete setup instructions
- `useAsyncState` hook for consistent loading/error/empty state management
- CHANGELOG.md following Keep a Changelog format

### Changed
- Optimized N+1 queries in `analytics-aggregation.service.ts` with eager relation loading and SQL-level aggregation

### Fixed
- Analytics `getCustomerAnalytics` now loads order `user` relation eagerly instead of relying on in-memory lookups
- Analytics `getRestaurantPerformance` loads review `user` and reservation relations eagerly via `Promise.all`

## [3.0.0] - 2026-03-24

### Added
- `OrderAdditionsService` extracted from `OrdersService` to reduce complexity (345 lines)

### Changed
- Refactored service decomposition across multiple modules (Wave 3)
- Adopted FlashList for mobile list rendering performance
- Real-time dashboards for restaurant app

## [2.2.0] - 2026-03-23

### Fixed
- Accessibility improvements across mobile screens (Wave 2)
- i18n missing key fixes for es-ES and en-US
- Backend test coverage gaps in multiple modules
- Duplicate component cleanup

## [2.1.0] - 2026-03-22

### Fixed
- All Wave 1 audit blockers resolved
- Security hardening for authentication flows
- Input validation on all public endpoints

## [2.0.0] - 2026-03-20

### Changed
- Reorganized repository into `platform/` and `site/` top-level directories
- Backend moved to `platform/backend/`
- Mobile apps moved to `platform/mobile/`

### Added
- **17 Epics Completed** covering the full restaurant platform:
  - Epic 1-3: Service Config Hub, Manager Approvals, Stock Inventory
  - Epic 4-6: Recipes with seeds, Loyalty & Promotions, Smart Waitlist
  - Epic 7-9: Kitchen Display System, Payment Split (4 modes), Analytics & BI
  - Epic 10-11: Club & Balada module (entry tickets, VIP tables, promoters), Pub & Bar (tabs, happy hour)
  - Epic 12-14: Service Calls, Addresses, Receipts with auto-generated receipt numbers
  - Epic 15-17: Menu Customization, Geofencing (Haversine), Legal (Privacy Policy & Terms)
- 8 WebSocket gateways: Orders, Tabs, ClubQueue, Reservations, Events, Approvals, Waitlist, Calls
- 37+ client mobile screens and 25+ restaurant mobile screens
- Identity module with credential management, MFA/TOTP, and audit logging
- 11 service types: fine-dining, quick-service, fast-casual, cafe-bakery, buffet, drive-thru, food-truck, chefs-table, casual-dining, pub-bar, club
- 7 user roles: CUSTOMER, OWNER, MANAGER, MAITRE, CHEF, BARMAN, WAITER
- i18n support for 3 languages: pt-BR (default), en-US, es-ES

### Security
- JWT with refresh tokens and token blacklisting (JTI)
- Biometric authentication support
- Rate limiting (ThrottlerModule)
- Helmet.js HTTP security headers
- CORS configuration
- SQL injection prevention via TypeORM parameterized queries

# Supabase RLS Policy Matrix

Generated from TypeORM metadata. Treat this as a review worksheet, not as final policy SQL.

| table | owner column | tenant column | initial policy posture |
| --- | --- | --- | --- |
| public.addresses | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.approvals | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.attendances | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.audit_logs | user_id | - | authenticated owner access via auth.uid() |
| public.bills | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.biometric_tokens | user_id | - | authenticated owner access via auth.uid() |
| public.cash_register_movements | - | - | deny direct client access until reviewed |
| public.cash_register_sessions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.club_birthday_entries | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.club_check_in_outs | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.club_entries | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.cook_stations | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.customer_profiles | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.delivery_settlements | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.drink_recipes | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.external_menu_mappings | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.favorites | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.financial_transactions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.fire_schedules | - | - | deny direct client access until reviewed |
| public.fiscal_configs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.fiscal_documents | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.fraud_alerts | user_id | - | authenticated owner access via auth.uid() |
| public.gateway_configs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.gateway_transactions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.guest_list_entries | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.happy_hour_schedules | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.ingredient_prices | - | - | deny direct client access until reviewed |
| public.ingredient_suppliers | - | - | deny direct client access until reviewed |
| public.ingredients | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.inventory_counts | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.inventory_items | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.kds_brain_configs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.leave_requests | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.lineup_slots | - | - | deny direct client access until reviewed |
| public.lineups | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.loyalty_configs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.loyalty_programs | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.menu_categories | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.menu_item_customization_groups | - | - | deny direct client access until reviewed |
| public.menu_items | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.notifications | user_id | - | authenticated owner access via auth.uid() |
| public.order_guests | - | - | deny direct client access until reviewed |
| public.order_items | - | - | deny direct client access until reviewed |
| public.orders | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.otp_tokens | - | - | deny direct client access until reviewed |
| public.password_reset_tokens | user_id | - | authenticated owner access via auth.uid() |
| public.payment_methods | user_id | - | authenticated owner access via auth.uid() |
| public.payment_splits | - | - | deny direct client access until reviewed |
| public.platform_connections | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.prep_analytics | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.prep_time_suggestions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.profiles | - | - | deny direct client access until reviewed |
| public.promoters | - | - | deny direct client access until reviewed |
| public.promotions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.purchase_records | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.qr_scan_logs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.queue_entries | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.receipts | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.recipe_ingredients | - | - | deny direct client access until reviewed |
| public.recipes | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.reservation_guests | - | - | deny direct client access until reviewed |
| public.reservations | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.restaurant_configs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.restaurant_service_configs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.restaurants | - | - | deny direct client access until reviewed |
| public.reviews | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.security_incidents | - | - | deny direct client access until reviewed |
| public.service_calls | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.shifts | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.stamp_cards | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.stock_items | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.stock_movements | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.supplier_item_mappings | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.suppliers | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.tab_items | - | - | deny direct client access until reviewed |
| public.tab_members | user_id | - | authenticated owner access via auth.uid() |
| public.tab_payments | user_id | - | authenticated owner access via auth.uid() |
| public.table_qr_codes | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.table_sessions | customer_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.tables | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.tabs | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.tips | customer_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.token_blacklist | user_id | - | authenticated owner access via auth.uid() |
| public.unit_conversions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.user_consents | user_id | - | authenticated owner access via auth.uid() |
| public.user_credentials | user_id | - | authenticated owner access via auth.uid() |
| public.user_roles | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.user_sanctions | user_id | - | authenticated owner access via auth.uid() |
| public.vip_table_guests | user_id | - | authenticated owner access via auth.uid() |
| public.vip_table_reservations | - | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.vip_table_tab_items | - | - | deny direct client access until reviewed |
| public.vip_table_tabs | - | - | deny direct client access until reviewed |
| public.waiter_calls | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.waitlist_entries | customer_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.wallet_transactions | - | - | deny direct client access until reviewed |
| public.wallets | user_id | restaurant_id | authenticated users with active user_roles for restaurant_id |
| public.webhook_deliveries | - | - | deny direct client access until reviewed |
| public.webhook_subscriptions | - | restaurant_id | authenticated users with active user_roles for restaurant_id |

Notes:
- Authorization claims must come from Supabase app_metadata or database lookups, never user_metadata.
- Add indexes on columns used by policies before exposing tables through the Data API.
- UPDATE policies also need a matching SELECT policy in Postgres RLS.

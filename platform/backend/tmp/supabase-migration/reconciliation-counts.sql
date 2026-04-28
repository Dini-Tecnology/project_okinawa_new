-- Run this on both the legacy database and Supabase after load, then diff the results.
-- It intentionally checks row counts only; add domain-specific checksums after the first dry run.
select 'public.addresses' as table_name, count(*)::bigint as row_count from "public"."addresses"
union all
select 'public.approvals' as table_name, count(*)::bigint as row_count from "public"."approvals"
union all
select 'public.attendances' as table_name, count(*)::bigint as row_count from "public"."attendances"
union all
select 'public.audit_logs' as table_name, count(*)::bigint as row_count from "public"."audit_logs"
union all
select 'public.bills' as table_name, count(*)::bigint as row_count from "public"."bills"
union all
select 'public.biometric_tokens' as table_name, count(*)::bigint as row_count from "public"."biometric_tokens"
union all
select 'public.cash_register_movements' as table_name, count(*)::bigint as row_count from "public"."cash_register_movements"
union all
select 'public.cash_register_sessions' as table_name, count(*)::bigint as row_count from "public"."cash_register_sessions"
union all
select 'public.club_birthday_entries' as table_name, count(*)::bigint as row_count from "public"."club_birthday_entries"
union all
select 'public.club_check_in_outs' as table_name, count(*)::bigint as row_count from "public"."club_check_in_outs"
union all
select 'public.club_entries' as table_name, count(*)::bigint as row_count from "public"."club_entries"
union all
select 'public.cook_stations' as table_name, count(*)::bigint as row_count from "public"."cook_stations"
union all
select 'public.customer_profiles' as table_name, count(*)::bigint as row_count from "public"."customer_profiles"
union all
select 'public.delivery_settlements' as table_name, count(*)::bigint as row_count from "public"."delivery_settlements"
union all
select 'public.drink_recipes' as table_name, count(*)::bigint as row_count from "public"."drink_recipes"
union all
select 'public.external_menu_mappings' as table_name, count(*)::bigint as row_count from "public"."external_menu_mappings"
union all
select 'public.favorites' as table_name, count(*)::bigint as row_count from "public"."favorites"
union all
select 'public.financial_transactions' as table_name, count(*)::bigint as row_count from "public"."financial_transactions"
union all
select 'public.fire_schedules' as table_name, count(*)::bigint as row_count from "public"."fire_schedules"
union all
select 'public.fiscal_configs' as table_name, count(*)::bigint as row_count from "public"."fiscal_configs"
union all
select 'public.fiscal_documents' as table_name, count(*)::bigint as row_count from "public"."fiscal_documents"
union all
select 'public.fraud_alerts' as table_name, count(*)::bigint as row_count from "public"."fraud_alerts"
union all
select 'public.gateway_configs' as table_name, count(*)::bigint as row_count from "public"."gateway_configs"
union all
select 'public.gateway_transactions' as table_name, count(*)::bigint as row_count from "public"."gateway_transactions"
union all
select 'public.guest_list_entries' as table_name, count(*)::bigint as row_count from "public"."guest_list_entries"
union all
select 'public.happy_hour_schedules' as table_name, count(*)::bigint as row_count from "public"."happy_hour_schedules"
union all
select 'public.ingredient_prices' as table_name, count(*)::bigint as row_count from "public"."ingredient_prices"
union all
select 'public.ingredient_suppliers' as table_name, count(*)::bigint as row_count from "public"."ingredient_suppliers"
union all
select 'public.ingredients' as table_name, count(*)::bigint as row_count from "public"."ingredients"
union all
select 'public.inventory_counts' as table_name, count(*)::bigint as row_count from "public"."inventory_counts"
union all
select 'public.inventory_items' as table_name, count(*)::bigint as row_count from "public"."inventory_items"
union all
select 'public.kds_brain_configs' as table_name, count(*)::bigint as row_count from "public"."kds_brain_configs"
union all
select 'public.leave_requests' as table_name, count(*)::bigint as row_count from "public"."leave_requests"
union all
select 'public.lineup_slots' as table_name, count(*)::bigint as row_count from "public"."lineup_slots"
union all
select 'public.lineups' as table_name, count(*)::bigint as row_count from "public"."lineups"
union all
select 'public.loyalty_configs' as table_name, count(*)::bigint as row_count from "public"."loyalty_configs"
union all
select 'public.loyalty_programs' as table_name, count(*)::bigint as row_count from "public"."loyalty_programs"
union all
select 'public.menu_categories' as table_name, count(*)::bigint as row_count from "public"."menu_categories"
union all
select 'public.menu_item_customization_groups' as table_name, count(*)::bigint as row_count from "public"."menu_item_customization_groups"
union all
select 'public.menu_items' as table_name, count(*)::bigint as row_count from "public"."menu_items"
union all
select 'public.notifications' as table_name, count(*)::bigint as row_count from "public"."notifications"
union all
select 'public.order_guests' as table_name, count(*)::bigint as row_count from "public"."order_guests"
union all
select 'public.order_items' as table_name, count(*)::bigint as row_count from "public"."order_items"
union all
select 'public.orders' as table_name, count(*)::bigint as row_count from "public"."orders"
union all
select 'public.otp_tokens' as table_name, count(*)::bigint as row_count from "public"."otp_tokens"
union all
select 'public.password_reset_tokens' as table_name, count(*)::bigint as row_count from "public"."password_reset_tokens"
union all
select 'public.payment_methods' as table_name, count(*)::bigint as row_count from "public"."payment_methods"
union all
select 'public.payment_splits' as table_name, count(*)::bigint as row_count from "public"."payment_splits"
union all
select 'public.platform_connections' as table_name, count(*)::bigint as row_count from "public"."platform_connections"
union all
select 'public.prep_analytics' as table_name, count(*)::bigint as row_count from "public"."prep_analytics"
union all
select 'public.prep_time_suggestions' as table_name, count(*)::bigint as row_count from "public"."prep_time_suggestions"
union all
select 'public.profiles' as table_name, count(*)::bigint as row_count from "public"."profiles"
union all
select 'public.promoters' as table_name, count(*)::bigint as row_count from "public"."promoters"
union all
select 'public.promotions' as table_name, count(*)::bigint as row_count from "public"."promotions"
union all
select 'public.purchase_records' as table_name, count(*)::bigint as row_count from "public"."purchase_records"
union all
select 'public.qr_scan_logs' as table_name, count(*)::bigint as row_count from "public"."qr_scan_logs"
union all
select 'public.queue_entries' as table_name, count(*)::bigint as row_count from "public"."queue_entries"
union all
select 'public.receipts' as table_name, count(*)::bigint as row_count from "public"."receipts"
union all
select 'public.recipe_ingredients' as table_name, count(*)::bigint as row_count from "public"."recipe_ingredients"
union all
select 'public.recipes' as table_name, count(*)::bigint as row_count from "public"."recipes"
union all
select 'public.reservation_guests' as table_name, count(*)::bigint as row_count from "public"."reservation_guests"
union all
select 'public.reservations' as table_name, count(*)::bigint as row_count from "public"."reservations"
union all
select 'public.restaurant_configs' as table_name, count(*)::bigint as row_count from "public"."restaurant_configs"
union all
select 'public.restaurant_service_configs' as table_name, count(*)::bigint as row_count from "public"."restaurant_service_configs"
union all
select 'public.restaurants' as table_name, count(*)::bigint as row_count from "public"."restaurants"
union all
select 'public.reviews' as table_name, count(*)::bigint as row_count from "public"."reviews"
union all
select 'public.security_incidents' as table_name, count(*)::bigint as row_count from "public"."security_incidents"
union all
select 'public.service_calls' as table_name, count(*)::bigint as row_count from "public"."service_calls"
union all
select 'public.shifts' as table_name, count(*)::bigint as row_count from "public"."shifts"
union all
select 'public.stamp_cards' as table_name, count(*)::bigint as row_count from "public"."stamp_cards"
union all
select 'public.stock_items' as table_name, count(*)::bigint as row_count from "public"."stock_items"
union all
select 'public.stock_movements' as table_name, count(*)::bigint as row_count from "public"."stock_movements"
union all
select 'public.supplier_item_mappings' as table_name, count(*)::bigint as row_count from "public"."supplier_item_mappings"
union all
select 'public.suppliers' as table_name, count(*)::bigint as row_count from "public"."suppliers"
union all
select 'public.tab_items' as table_name, count(*)::bigint as row_count from "public"."tab_items"
union all
select 'public.tab_members' as table_name, count(*)::bigint as row_count from "public"."tab_members"
union all
select 'public.tab_payments' as table_name, count(*)::bigint as row_count from "public"."tab_payments"
union all
select 'public.table_qr_codes' as table_name, count(*)::bigint as row_count from "public"."table_qr_codes"
union all
select 'public.table_sessions' as table_name, count(*)::bigint as row_count from "public"."table_sessions"
union all
select 'public.tables' as table_name, count(*)::bigint as row_count from "public"."tables"
union all
select 'public.tabs' as table_name, count(*)::bigint as row_count from "public"."tabs"
union all
select 'public.tips' as table_name, count(*)::bigint as row_count from "public"."tips"
union all
select 'public.token_blacklist' as table_name, count(*)::bigint as row_count from "public"."token_blacklist"
union all
select 'public.unit_conversions' as table_name, count(*)::bigint as row_count from "public"."unit_conversions"
union all
select 'public.user_consents' as table_name, count(*)::bigint as row_count from "public"."user_consents"
union all
select 'public.user_credentials' as table_name, count(*)::bigint as row_count from "public"."user_credentials"
union all
select 'public.user_roles' as table_name, count(*)::bigint as row_count from "public"."user_roles"
union all
select 'public.user_sanctions' as table_name, count(*)::bigint as row_count from "public"."user_sanctions"
union all
select 'public.vip_table_guests' as table_name, count(*)::bigint as row_count from "public"."vip_table_guests"
union all
select 'public.vip_table_reservations' as table_name, count(*)::bigint as row_count from "public"."vip_table_reservations"
union all
select 'public.vip_table_tab_items' as table_name, count(*)::bigint as row_count from "public"."vip_table_tab_items"
union all
select 'public.vip_table_tabs' as table_name, count(*)::bigint as row_count from "public"."vip_table_tabs"
union all
select 'public.waiter_calls' as table_name, count(*)::bigint as row_count from "public"."waiter_calls"
union all
select 'public.waitlist_entries' as table_name, count(*)::bigint as row_count from "public"."waitlist_entries"
union all
select 'public.wallet_transactions' as table_name, count(*)::bigint as row_count from "public"."wallet_transactions"
union all
select 'public.wallets' as table_name, count(*)::bigint as row_count from "public"."wallets"
union all
select 'public.webhook_deliveries' as table_name, count(*)::bigint as row_count from "public"."webhook_deliveries"
union all
select 'public.webhook_subscriptions' as table_name, count(*)::bigint as row_count from "public"."webhook_subscriptions"
order by table_name;

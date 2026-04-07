import { useState } from 'react';
import { MobilePreviewProvider, useMobilePreview } from './context/MobilePreviewContext';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { HomeScreen } from './HomeScreen';
import { LoginScreen } from './LoginScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { ProfileScreen } from './ProfileScreen';
import { SearchScreen } from './SearchScreen';

// Client screens
import { ExploreScreen } from './client/ExploreScreen';
import { RestaurantDetailScreen } from './client/RestaurantDetailScreen';
import { VirtualQueueScreen } from './client/VirtualQueueScreen';
import { CallWaiterScreen } from './client/CallWaiterScreen';
import { DishBuilderScreen } from './client/DishBuilderScreen';
import { NewReservationScreen } from './client/NewReservationScreen';
import { TrackLocationScreen } from './client/TrackLocationScreen';
import { CartScreen } from './client/CartScreen';
import { CheckoutScreen } from './client/CheckoutScreen';
import { SplitPaymentScreen } from './client/SplitPaymentScreen';
import { SplitByItemScreen } from './client/SplitByItemScreen';
import { LoyaltyScreen } from './client/LoyaltyScreen';
import { LoyaltyLeaderboardScreen } from './client/LoyaltyLeaderboardScreen';
import { QRScannerScreen } from './client/QRScannerScreen';
import { ReservationsScreen } from './client/ReservationsScreen';
import { ReservationDetailScreen } from './client/ReservationDetailScreen';
import { OrdersScreen } from './client/OrdersScreen';
import { FavoritesScreen } from './client/FavoritesScreen';
import { NotificationsScreen } from './client/NotificationsScreen';
import { SettingsScreen } from './client/SettingsScreen';
import { WalletScreen } from './client/WalletScreen';
import { SharedOrderScreen } from './client/SharedOrderScreen';
import { TipScreen } from './client/TipScreen';
import { OrderStatusScreen } from './client/OrderStatusScreen';
import { DigitalReceiptScreen } from './client/DigitalReceiptScreen';
import { PairingAssistantScreen } from './client/PairingAssistantScreen';
// NEW: missing client screens
import { RegisterScreen } from './client/RegisterScreen';
import { MenuScreen } from './client/MenuScreen';
import { PaymentScreen } from './client/PaymentScreen';
import { PaymentSuccessScreen } from './client/PaymentSuccessScreen';
import { GuestInvitationScreen } from './client/GuestInvitationScreen';
import { BuffetCheckinScreen } from './client/BuffetCheckinScreen';
import { LoyaltyHomeScreen } from './client/LoyaltyHomeScreen';
import { StampCardsScreen } from './client/StampCardsScreen';
import { ManageConsentsScreen } from './client/ManageConsentsScreen';
import { AddressesScreen } from './client/AddressesScreen';
import { CouponsScreen } from './client/CouponsScreen';
import { LoyaltyDetailScreen } from './client/LoyaltyDetailScreen';
import { RatingScreen } from './client/RatingScreen';
import { SupportScreen } from './client/SupportScreen';

// Pub & Bar screens
import { TabScreen, RepeatRoundSheet, TabSplitSheet, TabPaymentScreen } from './client/pub-bar';

// Club screens
import { TicketPurchaseScreen, QueueScreen, VipTableScreen, LineupScreen, BirthdayEntryRequestScreen } from './client/club';
import { ClubHomeScreen } from './client/club/ClubHomeScreen';
import { BirthdayBookingScreen } from './client/club/BirthdayBookingScreen';

// Waitlist screens
import { WaitlistBarScreen } from './client/waitlist/WaitlistBarScreen';
import { EntryChoiceScreen } from './client/waitlist/EntryChoiceScreen';
import { FamilyModeScreen } from './client/waitlist/FamilyModeScreen';
import { FamilyActivitiesScreen } from './client/waitlist/FamilyActivitiesScreen';

// Restaurant screens
import { RestaurantDashboardScreen } from './restaurant/RestaurantDashboardScreen';
import { RestaurantOrdersScreen } from './restaurant/RestaurantOrdersScreen';
import { RestaurantMenuScreen } from './restaurant/RestaurantMenuScreen';
import { RestaurantSettingsScreen } from './restaurant/RestaurantSettingsScreen';
import { RestaurantReservationsScreen } from './restaurant/RestaurantReservationsScreen';
import { TablesScreen } from './restaurant/TablesScreen';
import { KitchenDisplayScreen } from './restaurant/KitchenDisplayScreen';
import { BarKDSScreen } from './restaurant/BarKDSScreen';
import { MaitreScreen } from './restaurant/MaitreScreen';
import { ServiceTypeConfigScreen } from './restaurant/ServiceTypeConfigScreen';
import { RoleDashboardScreen } from './restaurant/RoleDashboardScreen';
import { TipsManagementScreen } from './restaurant/TipsManagementScreen';
import { WaiterScreen } from './restaurant/WaiterScreen';
import { StaffManagementScreen } from './restaurant/StaffManagementScreen';
import { PromotionsScreen } from './restaurant/PromotionsScreen';
import { ReportsScreen } from './restaurant/ReportsScreen';
import { ReviewsScreen } from './restaurant/ReviewsScreen';
import { LoyaltyManagementScreen } from './restaurant/LoyaltyManagementScreen';
import { OrderPaymentTrackingScreen } from './restaurant/OrderPaymentTrackingScreen';

// Restaurant Operations screens
import { ChefViewScreen } from './restaurant/ChefViewScreen';
import { CookStationScreen } from './restaurant/CookStationScreen';
import { BarmanStationScreen } from './restaurant/BarmanStationScreen';
import { CashRegisterScreen } from './restaurant/CashRegisterScreen';
import { FloorPlanScreen } from './restaurant/FloorPlanScreen';
import { StockScreen } from './restaurant/StockScreen';
import { WaiterDashboardScreen } from './restaurant/WaiterDashboardScreen';

// Restaurant Financial screens
import { BillsScreen, FinancialReportScreen, ForecastScreen, FiscalSetupScreen, MarginDashboardScreen, KdsAnalyticsScreen, CustomerCrmScreen } from './restaurant/FinancialScreens';

// Restaurant Pub & Bar screens
import { TabManagementScreen, WaiterCallsScreen, HappyHourManagementScreen } from './restaurant/pub-bar';

// Restaurant Club screens
import { DoorControlScreen, QueueManagementScreen, VipTableManagementScreen, BirthdayApprovalScreen, PromoterManagementScreen } from './restaurant/club';

// Restaurant Config screens
import { ConfigHubScreen, ConfigProfileScreen, ConfigServiceTypesConfigScreen, ConfigExperienceScreen, ConfigFloorScreen, ConfigKitchenScreen, ConfigPaymentsScreen, ConfigFeaturesScreen, ConfigTeamScreen, ConfigNotificationsScreen, ConfigLanguageScreen } from './restaurant/config';

type AppMode = 'client' | 'restaurant';

const screenComponents: Record<string, React.ComponentType> = {
  // Auth & Onboarding
  login: LoginScreen,
  onboarding: OnboardingScreen,
  'service-type-select': ServiceTypeSelector,
  
  // Client Main
  home: HomeScreen,
  explore: ExploreScreen,
  search: SearchScreen,
  profile: ProfileScreen,
  
  // Client Restaurant Flow
  'restaurant-detail': RestaurantDetailScreen,
  'qr-scanner': QRScannerScreen,
  'call-waiter': CallWaiterScreen,
  'dish-builder': DishBuilderScreen,
  'virtual-queue': VirtualQueueScreen,
  'track-location': TrackLocationScreen,
  
  // Client Orders & Payment
  cart: CartScreen,
  checkout: CheckoutScreen,
  'split-payment': SplitPaymentScreen,
  'split-by-item': SplitByItemScreen,
  'shared-order': SharedOrderScreen,
  tip: TipScreen,
  'order-status': OrderStatusScreen,
  'digital-receipt': DigitalReceiptScreen,
  'pairing-assistant': PairingAssistantScreen,
  orders: OrdersScreen,
  
  // Client Reservations
  reservations: ReservationsScreen,
  'new-reservation': NewReservationScreen,
  'reservation-detail': ReservationDetailScreen,
  'guest-invitation': GuestInvitationScreen,
  
  // Client Loyalty & Rewards
  loyalty: LoyaltyScreen,
  'loyalty-leaderboard': LoyaltyLeaderboardScreen,
  'loyalty-home': LoyaltyHomeScreen,
  'stamp-cards': StampCardsScreen,
  
  // Client Account
  favorites: FavoritesScreen,
  notifications: NotificationsScreen,
  settings: SettingsScreen,
  wallet: WalletScreen,
  'manage-consents': ManageConsentsScreen,
  
  // Client Auth
  register: RegisterScreen,
  
  // Client Menu & Payment
  menu: MenuScreen,
  payment: PaymentScreen,
  'payment-success': PaymentSuccessScreen,
  
  // Client Extra
  addresses: AddressesScreen,
  coupons: CouponsScreen,
  'loyalty-detail': LoyaltyDetailScreen,
  rating: RatingScreen,
  support: SupportScreen,
  
  // Client Buffet
  'buffet-checkin': BuffetCheckinScreen,
  
  // Pub & Bar
  'tab': TabScreen,
  'repeat-round': RepeatRoundSheet,
  'tab-split': TabSplitSheet,
  'tab-payment': TabPaymentScreen,
  
  // Club & Balada
  'ticket-purchase': TicketPurchaseScreen,
  'club-queue': QueueScreen,
  'vip-table': VipTableScreen,
  'lineup': LineupScreen,
  'birthday-entry-request': BirthdayEntryRequestScreen,
  'club-home': ClubHomeScreen,
  'birthday-booking': BirthdayBookingScreen,
  
  // Waitlist
  'waitlist-bar': WaitlistBarScreen,
  'entry-choice': EntryChoiceScreen,
  'family-mode': FamilyModeScreen,
  'family-activities': FamilyActivitiesScreen,
  
  // Restaurant Main
  'restaurant-dashboard': RestaurantDashboardScreen,
  'restaurant-orders': RestaurantOrdersScreen,
  'restaurant-menu': RestaurantMenuScreen,
  'restaurant-settings': RestaurantSettingsScreen,
  'restaurant-reservations': RestaurantReservationsScreen,
  
  // Restaurant Operations
  tables: TablesScreen,
  'kitchen-kds': KitchenDisplayScreen,
  'bar-kds': BarKDSScreen,
  maitre: MaitreScreen,
  waiter: WaiterScreen,
  'chef-view': ChefViewScreen,
  'cook-station': CookStationScreen,
  'barman-station': BarmanStationScreen,
  'cash-register': CashRegisterScreen,
  'floor-plan': FloorPlanScreen,
  'stock': StockScreen,
  'waiter-dashboard': WaiterDashboardScreen,

  // Restaurant Financial & Analytics
  'bills': BillsScreen,
  'financial-report': FinancialReportScreen,
  'forecast': ForecastScreen,
  'fiscal-setup': FiscalSetupScreen,
  'margin-dashboard': MarginDashboardScreen,
  'kds-analytics': KdsAnalyticsScreen,
  'customer-crm': CustomerCrmScreen,
  
  // Restaurant Configuration
  'service-type-config': ServiceTypeConfigScreen,
  'role-dashboard': RoleDashboardScreen,
  'staff-management': StaffManagementScreen,
  'tips-management': TipsManagementScreen,
  'promotions': PromotionsScreen,
  'reports': ReportsScreen,
  'reviews': ReviewsScreen,
  'loyalty-management': LoyaltyManagementScreen,
  'order-payment-tracking': OrderPaymentTrackingScreen,
  
  // Restaurant Pub & Bar Management
  'tab-management': TabManagementScreen,
  'waiter-calls': WaiterCallsScreen,
  'happy-hour-management': HappyHourManagementScreen,
  
  // Restaurant Club Management
  'door-control': DoorControlScreen,
  'queue-management': QueueManagementScreen,
  'vip-table-management': VipTableManagementScreen,
  'birthday-approval': BirthdayApprovalScreen,
  'promoter-management': PromoterManagementScreen,

  // Restaurant Config Hub
  'config-hub': ConfigHubScreen,
  'config-profile': ConfigProfileScreen,
  'config-service-types': ConfigServiceTypesConfigScreen,
  'config-experience': ConfigExperienceScreen,
  'config-floor': ConfigFloorScreen,
  'config-kitchen': ConfigKitchenScreen,
  'config-payments': ConfigPaymentsScreen,
  'config-features': ConfigFeaturesScreen,
  'config-team': ConfigTeamScreen,
  'config-notifications': ConfigNotificationsScreen,
  'config-language': ConfigLanguageScreen,
};

function MobilePreviewContent({ mode }: { mode: AppMode }) {
  const { currentScreen, serviceType } = useMobilePreview();
  
  // If no service type selected, show selector (for demo purposes)
  if (!serviceType && currentScreen === 'home') {
    return <ServiceTypeSelector />;
  }
  
  const ScreenComponent = screenComponents[currentScreen] || HomeScreen;
  
  return <ScreenComponent />;
}

interface MobilePreviewProps {
  initialMode?: AppMode;
  initialScreen?: string;
}

export function MobilePreview({ initialMode = 'client', initialScreen = 'home' }: MobilePreviewProps) {
  const [mode, setMode] = useState<AppMode>(initialMode);
  
  return (
    <MobilePreviewProvider initialScreen={initialScreen}>
      <div className="h-full flex flex-col bg-background">
        {/* Mode Switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('client')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === 'client' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            App Cliente
          </button>
          <button
            onClick={() => setMode('restaurant')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === 'restaurant' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            App Restaurante
          </button>
        </div>
        
        {/* Screen Content */}
        <div className="flex-1 overflow-hidden">
          <MobilePreviewContent mode={mode} />
        </div>
      </div>
    </MobilePreviewProvider>
  );
}

export default MobilePreview;

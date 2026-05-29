import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import RestaurantLiquidGlassNav from '@okinawa/shared/components/RestaurantLiquidGlassNav';

const ROUTE_TO_TAB: Record<string, string> = {
  Hub: 'dashboard',
  Orders: 'orders',
  Kitchen: 'kitchen-kds',
  Tables: 'tables',
  Settings: 'settings',
};

const TAB_TO_ROUTE: Record<string, string> = {
  dashboard: 'Hub',
  orders: 'Orders',
  'kitchen-kds': 'Kitchen',
  tables: 'Tables',
  settings: 'Settings',
};

export function RestaurantTabBar({ state, navigation }: BottomTabBarProps) {
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const activeRoute = state.routes[state.index]?.name ?? 'Hub';
  const activeTab = ROUTE_TO_TAB[activeRoute] ?? 'dashboard';

  return (
    <View
      style={styles.wrap}
      pointerEvents="box-none"
      onLayout={(event) => onHeightChange?.(event.nativeEvent.layout.height)}
    >
      <RestaurantLiquidGlassNav
        activeTab={activeTab}
        onNavigate={(tab) => {
          const route = TAB_TO_ROUTE[tab];
          if (route) navigation.navigate(route);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

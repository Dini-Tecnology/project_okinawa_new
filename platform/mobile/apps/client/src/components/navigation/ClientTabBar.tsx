import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  string,
  { label: string; icon: TabIconName; iconFocused: TabIconName }
> = {
  Home: { label: 'Início', icon: 'home-outline', iconFocused: 'home' },
  MenuTab: { label: 'Cardápio', icon: 'restaurant-outline', iconFocused: 'restaurant' },
  Orders: { label: 'Pedidos', icon: 'receipt-outline', iconFocused: 'receipt' },
  WalletTab: { label: 'Carteira', icon: 'wallet-outline', iconFocused: 'wallet' },
  Profile: { label: 'Perfil', icon: 'person-outline', iconFocused: 'person' },
};

export function ClientTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] ?? {
          label: options.title ?? route.name,
          icon: 'ellipse-outline' as TabIconName,
          iconFocused: 'ellipse' as TabIconName,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const tint = isFocused ? colors.primary : colors.foregroundMuted;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={config.label}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFocused ? config.iconFocused : config.icon}
              size={24}
              color={tint}
            />
            <Text
              variant="labelSmall"
              style={[styles.label, { color: tint }]}
              numberOfLines={1}
            >
              {config.label}
            </Text>
            {isFocused && (
              <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 52,
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});

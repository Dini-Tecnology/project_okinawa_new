import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { RESTAURANT_BRANDING } from '../../constants/branding';
import { AUTH_BRAND } from './authScreenTheme';

interface AuthScreenHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthScreenHeader({ title, subtitle }: AuthScreenHeaderProps) {
  const colors = useColors();

  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Image
          source={RESTAURANT_BRANDING.icon}
          style={styles.logoIcon}
          resizeMode="contain"
          accessibilityLabel="NOOWE Restaurant"
        />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground ?? colors.foregroundSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: AUTH_BRAND.borderRadius,
    backgroundColor: AUTH_BRAND.logoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});

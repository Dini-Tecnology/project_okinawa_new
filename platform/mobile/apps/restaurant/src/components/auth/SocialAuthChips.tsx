import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useI18n } from '@/shared/hooks/useI18n';
import { AUTH_BRAND } from './authScreenTheme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SocialChipConfig {
  key: 'google' | 'apple' | 'biometric';
  labelKey: 'auth.google' | 'auth.apple' | 'auth.biometric';
  backgroundColor: string;
  textColor: string;
  icon: IconName;
  onPress?: () => void;
  visible: boolean;
  loading?: boolean;
}

interface SocialAuthChipsProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onBiometricLogin?: () => void;
  showBiometric?: boolean;
  biometricLoading?: boolean;
  biometricIcon?: IconName;
  disabled?: boolean;
}

function ChipIcon({ icon, textColor }: { icon: IconName; textColor: string }) {
  return <MaterialCommunityIcons name={icon} size={16} color={textColor} />;
}

export function SocialAuthChips({
  onGoogleLogin,
  onAppleLogin,
  onBiometricLogin,
  showBiometric = true,
  biometricLoading = false,
  biometricIcon = 'fingerprint',
  disabled = false,
}: SocialAuthChipsProps) {
  const { t } = useI18n();

  const chips: SocialChipConfig[] = [
    {
      key: 'google',
      labelKey: 'auth.google',
      backgroundColor: AUTH_BRAND.googleBg,
      textColor: AUTH_BRAND.googleText,
      icon: 'google',
      onPress: onGoogleLogin,
      visible: true,
    },
    {
      key: 'apple',
      labelKey: 'auth.apple',
      backgroundColor: AUTH_BRAND.appleBg,
      textColor: AUTH_BRAND.appleText,
      icon: 'apple',
      onPress: onAppleLogin,
      visible: true,
    },
    {
      key: 'biometric',
      labelKey: 'auth.biometric',
      backgroundColor: AUTH_BRAND.biometricBg,
      textColor: AUTH_BRAND.biometricText,
      icon: biometricIcon,
      onPress: onBiometricLogin,
      visible: showBiometric,
      loading: biometricLoading,
    },
  ];

  return (
    <View style={styles.row}>
      {chips.filter((chip) => chip.visible).map((chip) => {
        const chipDisabled =
          disabled ||
          !chip.onPress ||
          (chip.key === 'biometric' && chip.loading);

        return (
          <TouchableOpacity
            key={chip.key}
            style={[
              styles.chip,
              { backgroundColor: chip.backgroundColor },
              chipDisabled && styles.chipDisabled,
            ]}
            onPress={chip.onPress}
            disabled={chipDisabled}
            accessibilityLabel={t(chip.labelKey)}
          >
            {chip.loading ? (
              <ActivityIndicator size="small" color={chip.textColor} />
            ) : (
              <>
                <ChipIcon icon={chip.icon} textColor={chip.textColor} />
                <Text style={[styles.chipLabel, { color: chip.textColor }]}>
                  {t(chip.labelKey)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: AUTH_BRAND.socialBorderRadius,
    minHeight: 56,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});

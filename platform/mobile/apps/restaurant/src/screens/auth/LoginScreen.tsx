import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, HelperText } from 'react-native-paper';
import { authService } from '@/shared/services/auth';
import { useBiometricAuth } from '@/shared/hooks/useBiometricAuth';
import { secureStorage } from '@/shared/services/secure-storage';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';
import { loginSchema, validateForm } from '@/shared/validation/schemas';
import Haptic from '@/shared/utils/haptics';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { AuthScreenHeader } from '../../components/auth/AuthScreenHeader';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { SocialAuthChips } from '../../components/auth/SocialAuthChips';
import { AUTH_BRAND } from '../../components/auth/authScreenTheme';
import { isAuthSkipped } from '@/shared/config/skip-auth';

interface LoginScreenProps {
  navigation: any;
  onAppleLogin?: () => void;
  onGoogleLogin?: () => void;
  onBiometricLogin?: () => void;
  loading?: boolean;
  biometricLoading?: boolean;
}

export default function LoginScreen({
  navigation,
  onAppleLogin,
  onGoogleLogin,
  onBiometricLogin,
  loading: externalLoading = false,
  biometricLoading = false,
}: LoginScreenProps) {
  const { t } = useI18n();
  const colors = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { isAvailable, isEnrolled, biometricType } = useBiometricAuth();
  const biometricIcon =
    biometricType === 'FaceID' ? 'face-recognition' : 'fingerprint';

  const isBusy = loading || externalLoading || biometricLoading;

  useEffect(() => {
    if (isAuthSkipped()) return;

    const tryQuickBiometric = async () => {
      try {
        const enabled = await secureStorage.getBiometricEnabled();
        if (enabled && isAvailable && isEnrolled && onBiometricLogin) {
          onBiometricLogin();
        }
      } catch (err) {
        logger.error('Error loading biometric preference:', err);
      }
    };

    tryQuickBiometric();
  }, [isAvailable, isEnrolled, onBiometricLogin]);

  const validateFields = useCallback((): boolean => {
    const result = validateForm(loginSchema, { email, password });

    if (!result.success) {
      setFieldErrors(result.errors);
      Haptic.errorNotification();
      return false;
    }

    setFieldErrors({});
    return true;
  }, [email, password]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      if (isAuthSkipped()) {
        await authService.enterDevGuestMode();
        Haptic.successNotification();
        return;
      }

      if (!validateFields()) {
        return;
      }

      await authService.login(email, password);
      const biometricEnabled = await secureStorage.getBiometricEnabled();

      if (biometricEnabled) {
        await secureStorage.setUserEmail(email);
      }

      Haptic.successNotification();
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
      Haptic.errorNotification();
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenContainer hasKeyboard>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthScreenHeader
            title="NOOWE Restaurant"
            subtitle={t('auth.loginSubtitle')}
          />

          <AuthTextField
            label={t('auth.email')}
            icon="email-outline"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            placeholder={t('auth.emailPlaceholder')}
            error={fieldErrors.email}
            accessibilityLabel="Email address"
            accessibilityHint="Enter your staff email to log in"
            inputProps={{
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              autoCorrect: false,
            }}
          />

          <AuthTextField
            label={t('auth.password')}
            icon="lock-outline"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            placeholder={t('auth.passwordPlaceholder')}
            error={fieldErrors.password}
            secureTextEntry={!showPassword}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            accessibilityLabel="Password"
            accessibilityHint="Enter your password to log in"
          />

          {error ? <HelperText type="error" style={styles.errorText}>{error}</HelperText> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isBusy}
            accessibilityLabel="Log in"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('auth.login')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialAuthChips
            onGoogleLogin={onGoogleLogin}
            onAppleLogin={onAppleLogin}
            onBiometricLogin={onBiometricLogin}
            showBiometric
            biometricLoading={biometricLoading}
            biometricIcon={biometricIcon}
            disabled={isBusy}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.noAccountQuestion')} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityLabel="Go to registration"
              accessibilityRole="link"
            >
              <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 32,
    },
    errorText: {
      marginBottom: 8,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: AUTH_BRAND.borderRadius,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 28,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: AUTH_BRAND.inputBorder,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: colors.mutedForeground ?? colors.foregroundSecondary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    footerText: {
      fontSize: 15,
      color: colors.mutedForeground ?? colors.foregroundSecondary,
    },
    footerLink: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });

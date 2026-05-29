import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, HelperText } from 'react-native-paper';
import { authService } from '@/shared/services/auth';
import { useBiometricAuth } from '@/shared/hooks/useBiometricAuth';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useAnalyticsContext } from '@/shared/contexts/AnalyticsContext';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { registerSchema, validateForm } from '@/shared/validation/schemas';
import { LegalConsentSection } from '@okinawa/shared/components/LegalConsentSection';
import Haptic from '@/shared/utils/haptics';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { AuthScreenHeader } from '../../components/auth/AuthScreenHeader';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { SocialAuthChips } from '../../components/auth/SocialAuthChips';
import { AUTH_BRAND } from '../../components/auth/authScreenTheme';
import { AuthConsentCheckbox } from '../../components/auth/AuthConsentCheckbox';
import { DEV_GUEST_USER, isAuthSkipped } from '@/shared/config/skip-auth';

interface RegisterScreenProps {
  navigation: any;
  onAppleLogin?: () => void;
  onGoogleLogin?: () => void;
  onBiometricLogin?: () => void;
  loading?: boolean;
  biometricLoading?: boolean;
}

export default function RegisterScreen({
  navigation,
  onAppleLogin,
  onGoogleLogin,
  onBiometricLogin,
  loading: externalLoading = false,
  biometricLoading = false,
}: RegisterScreenProps) {
  useScreenTracking('Register');
  const { t } = useI18n();
  const colors = useColors();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConsentError, setShowConsentError] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const analytics = useAnalytics();
  const { setUser } = useAnalyticsContext();
  const { biometricType } = useBiometricAuth();
  const biometricIcon =
    biometricType === 'FaceID' ? 'face-recognition' : 'fingerprint';

  const isBusy = loading || externalLoading || biometricLoading;

  const clearFieldError = useCallback((field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [fieldErrors]);

  const validateFields = useCallback((): boolean => {
    const result = validateForm(registerSchema, {
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setFieldErrors(result.errors);
      Haptic.errorNotification();
      return false;
    }

    setFieldErrors({});
    return true;
  }, [fullName, email, password, confirmPassword]);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setShowConsentError(false);

    try {
      if (isAuthSkipped()) {
        await authService.enterDevGuestMode();
        try {
          await analytics.logSignUp('email');
          await setUser(DEV_GUEST_USER.id, { account_type: 'customer' });
        } catch {
          // Analytics optional in dev bypass
        }
        Haptic.successNotification();
        return;
      }

      if (!validateFields()) return;

      if (!confirmedAge) {
        setShowAgeError(true);
        Haptic.errorNotification();
        return;
      }

      if (!acceptedLegal) {
        setShowConsentError(true);
        Haptic.errorNotification();
        return;
      }

      const result = await authService.register(email, password, fullName);

      await analytics.logSignUp('email');

      if (result?.user) {
        await setUser(result.user.id, {
          account_type: result.user.role || 'customer',
        });
      }

      Haptic.successNotification();
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registerFailed'));
      Haptic.errorNotification();
      await analytics.logError('Registration failed', err.code || 'REGISTER_ERROR', false);
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
            title={t('auth.createAccount')}
            subtitle={t('auth.registerSubtitle')}
          />

          <AuthTextField
            label={t('auth.fullName')}
            icon="account-outline"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              clearFieldError('fullName');
            }}
            error={fieldErrors.fullName}
            accessibilityLabel="Full name"
            accessibilityHint="Enter your full name"
            inputProps={{ autoCapitalize: 'words' }}
          />

          <AuthTextField
            label={t('auth.email')}
            icon="email-outline"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearFieldError('email');
            }}
            placeholder={t('auth.emailPlaceholder')}
            error={fieldErrors.email}
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address"
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
              clearFieldError('password');
            }}
            placeholder={t('auth.passwordPlaceholder')}
            error={fieldErrors.password}
            secureTextEntry={!showPassword}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            accessibilityLabel="Password"
            accessibilityHint="Create a password for your account"
          />

          <AuthTextField
            label={t('auth.confirmPassword')}
            icon="lock-check-outline"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearFieldError('confirmPassword');
            }}
            placeholder={t('auth.passwordPlaceholder')}
            error={fieldErrors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            showPasswordToggle
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword((v) => !v)}
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm"
          />

          <AuthConsentCheckbox
            checked={confirmedAge}
            onToggle={() => {
              setConfirmedAge(!confirmedAge);
              setShowAgeError(false);
              Haptic.lightImpact();
            }}
            label={t('auth.confirmAge18')}
            showError={showAgeError}
            errorMessage={t('auth.ageRequired')}
          />

          <LegalConsentSection
            acceptedLegal={acceptedLegal}
            onToggleLegal={(value) => {
              setAcceptedLegal(value);
              setShowConsentError(false);
              Haptic.lightImpact();
            }}
            marketingOptIn={marketingConsent}
            onToggleMarketing={(value) => {
              setMarketingConsent(value);
              Haptic.lightImpact();
            }}
            showError={showConsentError}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isBusy}
            accessibilityLabel="Create account"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('auth.register')}</Text>
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
            <Text style={styles.footerText}>{t('auth.hasAccountQuestion')} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityLabel="Go to login"
              accessibilityRole="link"
            >
              <Text style={styles.footerLink}>{t('auth.signIn')}</Text>
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
      paddingTop: 40,
      paddingBottom: 32,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: AUTH_BRAND.borderRadius,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 12,
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

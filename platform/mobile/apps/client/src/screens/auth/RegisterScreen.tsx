import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { authService } from '@/shared/services/auth';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useAnalyticsContext } from '@/shared/contexts/AnalyticsContext';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { registerSchema, validateForm, type RegisterFormData } from '@/shared/validation/schemas';
import { LegalConsentSection } from '@okinawa/shared/components/LegalConsentSection';
import Haptic from '@/shared/utils/haptics';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';

export default function RegisterScreen({ navigation }: any) {
  useScreenTracking('Register');
  const { t } = useI18n();
  const colors = useColors();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      confirmPassword 
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

    setLoading(true);
    setError('');
    setShowConsentError(false);

    try {
      const result = await authService.register(email, password, fullName);

      await analytics.logSignUp('email');

      if (result?.user) {
        await setUser(result.user.id, {
          account_type: result.user.role || 'customer',
        });
      }

      Haptic.successNotification();
      navigation.replace('Main');
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineLarge" style={styles.title}>
          {t('auth.createAccount')}
        </Text>

        <TextInput
          label={t('auth.fullName')}
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            clearFieldError('fullName');
          }}
          style={styles.input}
          error={!!fieldErrors.fullName}
          accessibilityLabel="Full name"
          accessibilityHint="Enter your full name"
          autoCapitalize="words"
        />
        {fieldErrors.fullName ? <HelperText type="error">{fieldErrors.fullName}</HelperText> : null}

        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError('email');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          error={!!fieldErrors.email}
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email address"
        />
        {fieldErrors.email ? <HelperText type="error">{fieldErrors.email}</HelperText> : null}

        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearFieldError('password');
          }}
          secureTextEntry
          style={styles.input}
          error={!!fieldErrors.password}
          accessibilityLabel="Password"
          accessibilityHint="Create a password for your account"
        />
        {fieldErrors.password ? <HelperText type="error">{fieldErrors.password}</HelperText> : null}

        <TextInput
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            clearFieldError('confirmPassword');
          }}
          secureTextEntry
          style={styles.input}
          error={!!fieldErrors.confirmPassword}
          accessibilityLabel="Confirm password"
          accessibilityHint="Re-enter your password to confirm"
        />
        {fieldErrors.confirmPassword ? <HelperText type="error">{fieldErrors.confirmPassword}</HelperText> : null}

        {/* Age Verification — Google Play / LGPD requirement */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Checkbox
            status={confirmedAge ? 'checked' : 'unchecked'}
            onPress={() => {
              setConfirmedAge(!confirmedAge);
              setShowAgeError(false);
              Haptic.lightImpact();
            }}
            color={colors.primary}
          />
          <Text
            style={{ flex: 1, color: colors.text, fontSize: 14 }}
            onPress={() => {
              setConfirmedAge(!confirmedAge);
              setShowAgeError(false);
            }}
          >
            Confirmo que tenho 18 anos ou mais
          </Text>
        </View>
        {showAgeError && (
          <HelperText type="error" visible>
            Você precisa ter 18 anos ou mais para criar uma conta.
          </HelperText>
        )}

        {/* Legal Consent — Terms of Use + Privacy Policy */}
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

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          accessibilityLabel="Create account"
          accessibilityRole="button"
        >
          {t('auth.register')}
        </Button>

        <Button
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Go to login"
          accessibilityRole="button"
        >
          {t('auth.hasAccount')}
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
    color: colors.foreground,
  },
  input: {
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    height: 52,
  },
});

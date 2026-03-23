import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton, Switch } from 'react-native-paper';
import { authService } from '@/shared/services/auth';
import { useBiometricAuth } from '@/shared/hooks/useBiometricAuth';
import { secureStorage } from '@/shared/services/storage';
import { showErrorToast, showSuccessToast } from '@/shared/utils/error-handler';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useAnalyticsContext } from '@/shared/contexts/AnalyticsContext';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';
import { loginSchema, validateForm, type LoginFormData } from '@/shared/validation/schemas';
import Haptic from '@/shared/utils/haptics';

export default function LoginScreen({ navigation }: any) {
  useScreenTracking('Login');
  const { t } = useI18n();
  const colors = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const analytics = useAnalytics();
  const { setUser } = useAnalyticsContext();

  const {
    isAvailable,
    isEnrolled,
    biometricType,
    authenticate,
    getBiometricDisplayName,
  } = useBiometricAuth();

  useEffect(() => {
    loadBiometricPreference();
  }, []);

  const loadBiometricPreference = async () => {
    try {
      const enabled = await secureStorage.getBiometricEnabled();
      setBiometricEnabled(enabled);

      if (enabled && isAvailable && isEnrolled) {
        handleBiometricLogin();
      }
    } catch (err) {
      logger.error('Error loading biometric preference:', err);
    }
  };

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
    // Validate with Zod before submitting
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);

      if (biometricEnabled) {
        await secureStorage.setUserEmail(email);
      }

      await analytics.logLogin('email');

      if (result?.user) {
        await setUser(result.user.id, {
          account_type: result.user.role || 'customer',
        });
      }

      Haptic.successNotification();
      showSuccessToast(t('auth.loginSuccess'));
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
      showErrorToast(err);
      Haptic.errorNotification();

      await analytics.logError('Login failed', err.code || 'LOGIN_ERROR', false);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await authenticate(
        t('auth.useBiometricLogin', { type: getBiometricDisplayName() }),
        t('auth.usePassword')
      );

      if (result.success) {
        const savedEmail = await secureStorage.getUserEmail();
        if (savedEmail) {
          const token = await secureStorage.getAccessToken();
          if (token) {
            await analytics.logLogin(biometricType === 'FaceID' ? 'face_id' : 'fingerprint');

            showSuccessToast(t('auth.biometricLoginSuccess'));
            navigation.replace('Main');
          } else {
            setError(t('auth.loginWithEmailFirst'));
            showErrorToast(new Error(t('auth.loginWithEmailFirst')));
          }
        } else {
          setError(t('auth.noSavedCredentials'));
          showErrorToast(new Error(t('auth.noSavedCredentials')));
        }
      } else {
        setError(result.error || t('auth.biometricFailed'));

        await analytics.logError('Biometric login failed', 'BIOMETRIC_FAILED', false);
      }
    } catch (err: any) {
      setError(err.message || t('auth.biometricFailed'));
      showErrorToast(err);

      await analytics.logError(err.message, 'BIOMETRIC_ERROR', false);
    } finally {
      setLoading(false);
    }
  };

  const toggleBiometric = async (value: boolean) => {
    setBiometricEnabled(value);
    await secureStorage.setBiometricEnabled(value);

    if (value) {
      showSuccessToast(t('auth.biometricEnabled'));
    } else {
      showSuccessToast(t('auth.biometricDisabled'));
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        {t('auth.welcomeBack')}
      </Text>

      <TextInput
        label={t('auth.email')}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (fieldErrors.email) {
            setFieldErrors((prev) => ({ ...prev, email: '' }));
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        error={!!fieldErrors.email}
      />
      {fieldErrors.email ? <HelperText type="error">{fieldErrors.email}</HelperText> : null}

      <TextInput
        label={t('auth.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (fieldErrors.password) {
            setFieldErrors((prev) => ({ ...prev, password: '' }));
          }
        }}
        secureTextEntry
        style={styles.input}
        error={!!fieldErrors.password}
      />
      {fieldErrors.password ? <HelperText type="error">{fieldErrors.password}</HelperText> : null}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        {t('auth.login')}
      </Button>

      {isAvailable && isEnrolled && (
        <>
          <Button
            mode="outlined"
            onPress={handleBiometricLogin}
            loading={loading}
            style={styles.biometricButton}
            icon={biometricType === 'FaceID' ? 'face-recognition' : 'fingerprint'}
          >
            {t('auth.loginWith', { type: getBiometricDisplayName() })}
          </Button>

          <View style={styles.biometricToggle}>
            <Text style={{ color: colors.foreground }}>{t('auth.enableBiometric', { type: getBiometricDisplayName() })}</Text>
            <Switch value={biometricEnabled} onValueChange={toggleBiometric} />
          </View>
        </>
      )}

      <Button onPress={() => navigation.navigate('Register')}>
        {t('auth.noAccount')}
      </Button>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
    color: colors.foreground,
  },
  input: {
    marginBottom: 15,
    backgroundColor: colors.card,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
  biometricButton: {
    marginBottom: 15,
  },
  biometricToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
});

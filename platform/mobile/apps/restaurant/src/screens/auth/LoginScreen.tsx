/**
 * LoginScreen - Restaurant App Authentication
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 * Integrates Zod validation and haptic feedback.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { authService } from '@/shared/services/auth';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { loginSchema, validateForm } from '@/shared/validation/schemas';
import Haptic from '@/shared/utils/haptics';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

export default function LoginScreen({ navigation }: any) {
  const { t } = useI18n();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const styles = useMemo(() => StyleSheet.create({
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
      marginBottom: 8,
      backgroundColor: colors.card,
    },
    button: {
      marginTop: 10,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  const clearFieldError = useCallback((field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [fieldErrors]);

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
      await authService.login(email, password);
      Haptic.successNotification();
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
      Haptic.errorNotification();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer hasKeyboard>
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Okinawa Restaurant
      </Text>

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
      />
      {fieldErrors.password ? <HelperText type="error">{fieldErrors.password}</HelperText> : null}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Log in"
      >
        {t('auth.login')}
      </Button>
    </View>
    </ScreenContainer>
  );
}

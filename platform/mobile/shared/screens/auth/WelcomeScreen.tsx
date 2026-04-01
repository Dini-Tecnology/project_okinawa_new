/**
 * WelcomeScreen - Modern Passwordless-First Authentication
 * 
 * Entry point for authentication following the Okinawa specification.
 * Prioritizes Social Login and Phone OTP with biometric as quick-login.
 * 
 * Platform priority:
 * - iOS: Apple > Google > Phone
 * - Android: Google > Phone > Apple
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Image, Platform, Animated } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useI18n } from '@/shared/hooks/useI18n';
import { useBiometricAuth } from '@/shared/hooks/useBiometricAuth';
import { biometricAuthService } from '@/shared/services/biometric-auth';
import { SocialLoginButton } from '@/shared/components/auth';
import Haptic from '@/shared/utils/haptics';
import { useScreenTracking } from '@/shared/hooks/useAnalytics';

interface WelcomeScreenProps {
  navigation: any;
  onAppleLogin: () => void;
  onGoogleLogin: () => void;
  onPhoneLogin: () => void;
  onBiometricLogin: () => void;
  loading?: boolean;
  biometricLoading?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  navigation,
  onAppleLogin,
  onGoogleLogin,
  onPhoneLogin,
  onBiometricLogin,
  loading = false,
  biometricLoading = false,
}) => {
  useScreenTracking('Welcome');
  const { t } = useI18n();
  const colors = useColors();
  const { isAvailable, isEnrolled, biometricType, getBiometricDisplayName } = useBiometricAuth();
  
  const [canQuickLogin, setCanQuickLogin] = useState(false);
  const [checkingBiometric, setCheckingBiometric] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Check for biometric quick login on mount
  useEffect(() => {
    checkBiometricQuickLogin();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkBiometricQuickLogin = async () => {
    try {
      const canLogin = await biometricAuthService.canQuickLogin();
      setCanQuickLogin(canLogin);
      
      // Auto-trigger biometric if available
      if (canLogin) {
        onBiometricLogin();
      }
    } catch (error) {
      console.error('Biometric check failed:', error);
    } finally {
      setCheckingBiometric(false);
    }
  };

  const handleBiometricLogin = useCallback(() => {
    Haptic.mediumImpact();
    onBiometricLogin();
  }, [onBiometricLogin]);

  // Platform-specific button order
  const isIOS = Platform.OS === 'ios';

  if (checkingBiometric) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Logo and Branding */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍽️</Text>
        </View>
        <Text style={styles.title}>Okinawa</Text>
        <Text style={styles.subtitle}>
          {t('auth.welcomeMessage') || 'Your dining experience, reimagined'}
        </Text>
      </View>

      {/* Biometric Quick Login */}
      {canQuickLogin && (
        <View style={styles.biometricSection}>
          <Button
            mode="contained"
            onPress={handleBiometricLogin}
            loading={biometricLoading}
            disabled={loading || biometricLoading}
            style={styles.biometricButton}
            contentStyle={styles.buttonContent}
            icon={biometricType === 'FaceID' ? 'face-recognition' : 'fingerprint'}
          >
            {t('auth.loginWith', { type: getBiometricDisplayName() })}
          </Button>
          
          <Divider style={styles.divider} />
          <Text style={styles.orText}>{t('auth.orContinueWith') || 'or continue with'}</Text>
        </View>
      )}

      {/* Social Login Buttons */}
      <View style={styles.socialButtons}>
        {isIOS ? (
          <>
            <SocialLoginButton
              provider="apple"
              onPress={onAppleLogin}
              loading={loading}
              disabled={loading || biometricLoading}
              variant="primary"
            />
            <SocialLoginButton
              provider="google"
              onPress={onGoogleLogin}
              loading={loading}
              disabled={loading || biometricLoading}
            />
          </>
        ) : (
          <>
            <SocialLoginButton
              provider="google"
              onPress={onGoogleLogin}
              loading={loading}
              disabled={loading || biometricLoading}
              variant="primary"
            />
            <SocialLoginButton
              provider="apple"
              onPress={onAppleLogin}
              loading={loading}
              disabled={loading || biometricLoading}
            />
          </>
        )}
      </View>

      {/* Phone Login */}
      <Button
        mode="text"
        onPress={onPhoneLogin}
        disabled={loading || biometricLoading}
        style={styles.phoneButton}
        icon="cellphone"
      >
        {t('auth.continueWithPhone') || 'Continue with Phone'}
      </Button>

      {/* Email/Password Fallback (subtle) */}
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        disabled={loading || biometricLoading}
        style={styles.emailButton}
        textColor={colors.mutedForeground}
      >
        {t('auth.useEmailPassword') || 'Use email and password'}
      </Button>

      {/* Terms and Privacy */}
      <View style={styles.footer}>
        <Text style={styles.termsText}>
          {t('auth.termsPrefix') || 'By continuing, you agree to our'}{' '}
          <Text style={styles.termsLink}>{t('auth.termsOfService') || 'Terms of Service'}</Text>
          {' '}{t('auth.and') || 'and'}{' '}
          <Text style={styles.termsLink}>{t('auth.privacyPolicy') || 'Privacy Policy'}</Text>
        </Text>
      </View>
    </Animated.View>
    </ScreenContainer>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  biometricSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricButton: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonContent: {
    height: 56,
  },
  divider: {
    width: '100%',
    marginBottom: 8,
  },
  orText: {
    fontSize: 14,
    color: colors.mutedForeground,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    marginTop: -20,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 16,
  },
  phoneButton: {
    marginBottom: 8,
  },
  emailButton: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;

/**
 * PhoneAuthScreen - Phone-based OTP Authentication
 * 
 * Two-step flow:
 * 1. Enter phone number and receive OTP
 * 2. Verify OTP code
 * 
 * Supports WhatsApp and SMS channels with automatic fallback.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button, IconButton, HelperText, ActivityIndicator } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useI18n } from '@/shared/hooks/useI18n';
import { PhoneInput, OTPInput, ResendTimer } from '@/shared/components/auth';
import { otpAuthService, OTPChannel } from '@/shared/services/otp-auth';
import { socialAuthService } from '@/shared/services/social-auth';
import Haptic from '@/shared/utils/haptics';
import { useScreenTracking } from '@/shared/hooks/useAnalytics';

type AuthStep = 'phone' | 'otp' | 'register';

interface PhoneAuthScreenProps {
  navigation: any;
  onSuccess: (result: any) => void;
  purpose?: 'login' | 'registration' | 'verification';
}

export const PhoneAuthScreen: React.FC<PhoneAuthScreenProps> = ({
  navigation,
  onSuccess,
  purpose = 'login',
}) => {
  useScreenTracking('PhoneAuth');
  const { t } = useI18n();
  const colors = useColors();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [channel, setChannel] = useState<OTPChannel>('whatsapp');
  const [tempToken, setTempToken] = useState<string | undefined>();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Shake animation for errors
  const shakeAnim = useState(new Animated.Value(0))[0];

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Haptic.errorNotification();
  }, [shakeAnim]);

  const handlePhoneChange = useCallback((formatted: string, full: string) => {
    setPhoneNumber(formatted);
    setFullPhoneNumber(full);
    setError('');
  }, []);

  const handleSendOTP = async () => {
    if (!fullPhoneNumber || fullPhoneNumber.length < 10) {
      setError(t('auth.invalidPhoneNumber') || 'Please enter a valid phone number');
      shake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await otpAuthService.sendOTP({
        phoneNumber: fullPhoneNumber,
        channel,
        purpose: purpose === 'login' ? 'login' : 'registration',
      });

      if (result.success) {
        Haptic.successNotification();
        setChannel(result.channel);
        setStep('otp');
      } else {
        setError(result.message);
        shake();
      }
    } catch (err: any) {
      setError(err.message || t('auth.otpSendFailed'));
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const deviceInfo = await socialAuthService.getDeviceInfo();
      const result = await otpAuthService.verifyOTP({
        phoneNumber: fullPhoneNumber,
        code,
        tempToken,
        deviceInfo,
      });

      if (result.success) {
        Haptic.successNotification();
        
        if (result.status === 'registration_required') {
          setTempToken(result.biometricEnrollmentToken);
          setStep('register');
        } else {
          onSuccess(result);
        }
      } else {
        setError(result.message || t('auth.invalidOTP'));
        setOtpCode('');
        shake();
      }
    } catch (err: any) {
      setError(err.message || t('auth.otpVerifyFailed'));
      setOtpCode('');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (newChannel: OTPChannel) => {
    setChannel(newChannel);
    setOtpCode('');
    setError('');
    
    try {
      const result = await otpAuthService.sendOTP({
        phoneNumber: fullPhoneNumber,
        channel: newChannel,
        purpose: purpose === 'login' ? 'login' : 'registration',
      });

      if (result.success) {
        Haptic.successNotification();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtpCode('');
      setError('');
    } else {
      navigation.goBack();
    }
  };

  const maskPhone = (phone: string): string => {
    if (phone.length < 6) return phone;
    return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
  };

  return (
    <ScreenContainer hasKeyboard>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={handleBack}
          style={styles.backButton}
        />
      </View>

      <Animated.View 
        style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}
      >
        {step === 'phone' && (
          <>
            <Text style={styles.title}>
              {t('auth.enterPhoneNumber') || 'Enter your phone number'}
            </Text>
            <Text style={styles.subtitle}>
              {t('auth.phoneDescription') || "We'll send you a code to verify your number"}
            </Text>

            <View style={styles.inputContainer}>
              <PhoneInput
                value={phoneNumber}
                onChange={handlePhoneChange}
                error={error}
                autoFocus
                disabled={loading}
              />
            </View>

            <View style={styles.channelInfo}>
              <Text style={styles.channelText}>
                {channel === 'whatsapp' 
                  ? '📱 Code will be sent via WhatsApp'
                  : '💬 Code will be sent via SMS'}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSendOTP}
              loading={loading}
              disabled={loading || !phoneNumber}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {t('auth.continue') || 'Continue'}
            </Button>
          </>
        )}

        {step === 'otp' && (
          <>
            <Text style={styles.title}>
              {t('auth.enterCode') || 'Enter verification code'}
            </Text>
            <Text style={styles.subtitle}>
              {t('auth.codeSentTo', { phone: maskPhone(fullPhoneNumber) }) || 
                `We sent a 6-digit code to ${maskPhone(fullPhoneNumber)}`}
            </Text>

            <View style={styles.otpContainer}>
              <OTPInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleVerifyOTP}
                error={!!error}
                disabled={loading}
                autoFocus
              />
            </View>

            {error && (
              <HelperText type="error" style={styles.errorText}>
                {error}
              </HelperText>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  {t('auth.verifying') || 'Verifying...'}
                </Text>
              </View>
            )}

            <ResendTimer
              initialSeconds={60}
              onResend={handleResendOTP}
              currentChannel={channel}
              disabled={loading}
            />
          </>
        )}
      </Animated.View>
    </ScreenContainer>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  backButton: {
    margin: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  channelInfo: {
    marginBottom: 24,
  },
  channelText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    height: 56,
  },
  otpContainer: {
    marginVertical: 32,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
});

export default PhoneAuthScreen;

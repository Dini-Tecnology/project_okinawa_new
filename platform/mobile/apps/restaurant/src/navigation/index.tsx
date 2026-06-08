/**
 * Restaurant App Navigation — V2 production flow
 *
 * Auth stack + bottom tabs (Liquid Glass) + stack modals for telas secundárias V2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/shared/services/auth';
import { socialAuthService } from '@/shared/services/social-auth';
import { biometricAuthService } from '@/shared/services/biometric-auth';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { logger } from '@/shared/utils/logger';
import { isAuthSkipped } from '@/shared/config/skip-auth';
import { isGoogleNativeOAuthConfigured } from '@/shared/utils/googleOAuthEnv';
import { captureException } from '@/shared/config/sentry';
import {
  fadeScreenOptions,
  modalScreenOptions,
  scaleFadeScreenOptions,
  defaultScreenOptions,
} from '@/shared/config/navigation-animations';
import { RestaurantTabBar } from '../components/navigation/RestaurantTabBar';
import { liquidGlassTabNavigatorScreenOptions } from '@okinawa/shared/components/LiquidGlassBottomNav';
import {
  WelcomeScreen,
  PhoneAuthScreen,
  PhoneRegisterScreen,
  BiometricEnrollmentScreen,
} from '@/shared/screens/auth';
import { PrivacyPolicyScreen, TermsOfServiceScreen, ReConsentScreen } from '@/shared/screens/legal';
import { MaintenanceScreen } from '@/shared/screens/MaintenanceScreen';
import { useMaintenanceCheck } from '@/shared/hooks/useMaintenanceCheck';
import { onConsentRequired } from '@/shared/services/api';
import ApiService from '@okinawa/shared/services/api';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { RESTAURANT_BRANDING } from '../constants/branding';

// V2 production screens
import OwnerHubScreen from '../screens/v2/OwnerHubScreen';
import OrdersScreen from '../screens/v2/OrdersScreen';
import KitchenDisplayScreen from '../screens/v2/KitchenDisplayScreen';
import TablesScreen from '../screens/v2/TablesScreen';
import SettingsScreen from '../screens/v2/SettingsScreen';
import BarKDSScreen from '../screens/v2/BarKDSScreen';
import MenuScreen from '../screens/v2/MenuScreen';
import ReservationsScreen from '../screens/v2/ReservationsScreen';
import StaffScreen from '../screens/v2/StaffScreen';
import TipsScreen from '../screens/v2/TipsScreen';
import FinancialScreen from '../screens/v2/FinancialScreen';
import ReportsScreen from '../screens/v2/ReportsScreen';
import ReviewsScreen from '../screens/v2/ReviewsScreen';
import PromotionsScreen from '../screens/v2/PromotionsScreen';
import LoyaltyScreen from '../screens/v2/LoyaltyScreen';
import RoleDashboardScreen from '../screens/v2/RoleDashboardScreen';
import WaiterScreen from '../screens/v2/WaiterScreen';
import MaitreScreen from '../screens/v2/MaitreScreen';
import QRGeneratorScreen from '../screens/v2/QRGeneratorScreen';
import QRBatchScreen from '../screens/v2/QRBatchScreen';
import OrderPaymentScreen from '../screens/v2/OrderPaymentScreen';
import RestaurantSelectorScreen from '../screens/v2/RestaurantSelectorScreen';
import ServiceConfigScreen from '../screens/v2/ServiceConfigScreen';
import WaitlistScreen from '../screens/v2/WaitlistScreen';
import CallsScreen from '../screens/v2/CallsScreen';
import CasualDiningScreen from '../screens/v2/CasualDiningScreen';
import RestaurantProfileScreen from '../screens/v2/RestaurantProfileScreen';
import BusinessHoursScreen from '../screens/v2/BusinessHoursScreen';
import NotificationSettingsScreen from '../screens/v2/NotificationSettingsScreen';
import PaymentSettingsScreen from '../screens/v2/PaymentSettingsScreen';
import { RestaurantRoleProvider } from '../contexts/RestaurantRoleContext';

WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BootFallback() {
  return (
    <View style={bootStyles.container}>
      <ActivityIndicator size="large" color="#A855F7" />
      <Text style={bootStyles.label}>Carregando Noowe Restaurante...</Text>
    </View>
  );
}

const bootStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  label: {
    marginTop: 16,
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const noopGooglePrompt: Parameters<typeof socialAuthService.signInWithGoogle>[2] = async () => ({
  type: 'cancel',
});

interface AuthStackBodyProps {
  googleLoginAvailable: boolean;
  googleRequest: Parameters<typeof socialAuthService.signInWithGoogle>[0];
  googleResponse: Parameters<typeof socialAuthService.signInWithGoogle>[1];
  googlePromptAsync: Parameters<typeof socialAuthService.signInWithGoogle>[2];
}

function AuthStackWithGoogleConfigured() {
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  return (
    <AuthStackBody
      googleLoginAvailable
      googleRequest={googleRequest}
      googleResponse={googleResponse}
      googlePromptAsync={googlePromptAsync}
    />
  );
}

function AuthStackBody({
  googleLoginAvailable,
  googleRequest,
  googleResponse,
  googlePromptAsync,
}: AuthStackBodyProps) {
  const [authLoading, setAuthLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const enterDevGuestIfSkipped = useCallback(async (): Promise<boolean> => {
    if (!isAuthSkipped()) return false;
    await authService.enterDevGuestMode();
    return true;
  }, []);

  const handleAppleLogin = useCallback(async () => {
    if (await enterDevGuestIfSkipped()) return;
    setAuthLoading(true);
    try {
      const result = await socialAuthService.signInWithApple();
      if (result.success && result.idToken) {
        await authService.socialLogin('apple', result.idToken);
      }
    } catch (error) {
      logger.error('Apple login failed:', error);
    } finally {
      setAuthLoading(false);
    }
  }, [enterDevGuestIfSkipped]);

  const handleGoogleLogin = useCallback(async () => {
    if (await enterDevGuestIfSkipped()) return;
    setAuthLoading(true);
    try {
      const result = await socialAuthService.signInWithGoogle(
        googleRequest,
        googleResponse,
        googlePromptAsync,
      );
      if (result.success && result.idToken) {
        await authService.socialLogin('google', result.idToken);
      }
    } catch (error) {
      logger.error('Google login failed:', error);
    } finally {
      setAuthLoading(false);
    }
  }, [googleRequest, googleResponse, googlePromptAsync, enterDevGuestIfSkipped]);

  const handlePhoneLogin = useCallback((navigation: any) => {
    navigation.navigate('PhoneAuth');
  }, []);

  const handleBiometricLogin = useCallback(async () => {
    if (await enterDevGuestIfSkipped()) return;
    setBiometricLoading(true);
    try {
      await biometricAuthService.authenticate();
    } catch (error) {
      logger.error('Biometric login error:', error);
    } finally {
      setBiometricLoading(false);
    }
  }, [enterDevGuestIfSkipped]);

  const handleAuthSuccess = useCallback((result: any) => {
    logger.info('Auth success:', { userId: result.user?.id });
  }, []);

  return (
    <Stack.Navigator screenOptions={fadeScreenOptions} initialRouteName="Login">
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginScreen
            {...props}
            onAppleLogin={handleAppleLogin}
            onGoogleLogin={handleGoogleLogin}
            onBiometricLogin={handleBiometricLogin}
            loading={authLoading}
            biometricLoading={biometricLoading}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register" options={{ headerShown: false }}>
        {(props) => (
          <RegisterScreen
            {...props}
            onAppleLogin={handleAppleLogin}
            onGoogleLogin={handleGoogleLogin}
            onBiometricLogin={handleBiometricLogin}
            loading={authLoading}
            biometricLoading={biometricLoading}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Welcome" options={{ headerShown: false }}>
        {(props) => (
          <WelcomeScreen
            {...props}
            logoIconSource={RESTAURANT_BRANDING.icon}
            logoFullSource={RESTAURANT_BRANDING.logoFull}
            brandTitle="NOOWE Restaurant"
            googleLoginAvailable={googleLoginAvailable}
            onAppleLogin={handleAppleLogin}
            onGoogleLogin={handleGoogleLogin}
            onPhoneLogin={() => handlePhoneLogin(props.navigation)}
            onBiometricLogin={handleBiometricLogin}
            loading={authLoading}
            biometricLoading={biometricLoading}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PhoneAuth" options={{ ...modalScreenOptions, headerShown: false }}>
        {(props) => <PhoneAuthScreen {...props} onSuccess={handleAuthSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="PhoneRegister" options={{ headerShown: false }}>
        {(props) => (
          <PhoneRegisterScreen
            {...props}
            onSuccess={handleAuthSuccess}
            onBiometricPrompt={() => props.navigation.navigate('BiometricEnrollment')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="BiometricEnrollment" options={{ headerShown: false }}>
        {(props) => (
          <BiometricEnrollmentScreen
            {...props}
            onComplete={() => props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            onSkip={() => props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RestaurantSelector" component={RestaurantSelectorScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  if (isGoogleNativeOAuthConfigured()) {
    return <AuthStackWithGoogleConfigured />;
  }
  return (
    <AuthStackBody
      googleLoginAvailable={false}
      googleRequest={null}
      googleResponse={null}
      googlePromptAsync={noopGooglePrompt}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Hub"
      backBehavior="initialRoute"
      tabBar={(props) => <RestaurantTabBar {...props} />}
      screenOptions={{
        ...liquidGlassTabNavigatorScreenOptions,
        sceneContainerStyle: { backgroundColor: '#FFFFFF' },
        sceneStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Tab.Screen name="Hub" component={OwnerHubScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="Kitchen" component={KitchenDisplayScreen} options={{ title: 'Cozinha' }} />
      <Tab.Screen name="Tables" component={TablesScreen} options={{ title: 'Mesas' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Config' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <RestaurantRoleProvider>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          ...defaultScreenOptions,
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen name="Menu" component={MenuScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Reservations" component={ReservationsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Staff" component={StaffScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Tips" component={TipsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Financial" component={FinancialScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Reports" component={ReportsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Promotions" component={PromotionsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Loyalty" component={LoyaltyScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="RoleDashboard" component={RoleDashboardScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Waiter" component={WaiterScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Maitre" component={MaitreScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="BarKDS" component={BarKDSScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="QRBatch" component={QRBatchScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="OrderPayment" component={OrderPaymentScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="ServiceConfig" component={ServiceConfigScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Waitlist" component={WaitlistScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="Calls" component={CallsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="CasualDining" component={CasualDiningScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="RestaurantProfile" component={RestaurantProfileScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="BusinessHours" component={BusinessHoursScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={scaleFadeScreenOptions} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={scaleFadeScreenOptions} />
      </Stack.Navigator>
    </RestaurantRoleProvider>
  );
}

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresConsent, setRequiresConsent] = useState(false);
  const [consentVersions, setConsentVersions] = useState<{
    currentTermsVersion: string;
    currentPrivacyVersion: string;
  } | null>(null);
  const { isInMaintenance, message: maintenanceMessage, estimatedEnd, clearMaintenance } = useMaintenanceCheck();

  useEffect(() => {
    checkAuth();
    const unsubscribe = authService.onAuthStateChange(setIsAuthenticated);
    const unsubscribeConsent = onConsentRequired((data) => {
      setConsentVersions(data);
      setRequiresConsent(true);
    });
    return () => {
      unsubscribe?.();
      unsubscribeConsent();
    };
  }, []);

  const checkAuth = async () => {
    try {
      if (isAuthSkipped()) {
        setIsAuthenticated(false);
        return;
      }
      const user = await authService.getStoredUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      logger.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigationError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Navigation error:', { error: error.message, stack: error.stack });
    captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  };

  if (isLoading) return <BootFallback />;

  if (requiresConsent && consentVersions) {
    return (
      <ReConsentScreen
        termsVersion={consentVersions.currentTermsVersion}
        privacyVersion={consentVersions.currentPrivacyVersion}
        onConsentAccepted={() => {
          setRequiresConsent(false);
          setConsentVersions(null);
          ApiService.resolveConsentQueue();
        }}
      />
    );
  }

  if (isInMaintenance) {
    return (
      <MaintenanceScreen
        message={maintenanceMessage}
        estimatedEnd={estimatedEnd}
        onMaintenanceOver={clearMaintenance}
      />
    );
  }

  return (
    <View style={styles.appSurface}>
      <ErrorBoundary onError={handleNavigationError}>
        {isAuthenticated ? <MainStack key="restaurant-main" /> : <AuthStack key="restaurant-auth" />}
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  appSurface: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

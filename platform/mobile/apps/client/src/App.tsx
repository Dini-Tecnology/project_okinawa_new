import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { CartProvider } from '@/shared/contexts/CartContext';
import { queryClient } from '@/shared/config/react-query';
import { disableConsoleLogs } from '@/shared/utils/logger';
import { pushNotificationService } from '@/shared/services/push-notifications';
import Navigation from './navigation';
import { theme } from './theme';

export default function App() {
  useEffect(() => {
    // Disable console logs in production
    disableConsoleLogs();

    // Initialize push notifications
    pushNotificationService.initialize();

    return () => {
      pushNotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <PaperProvider theme={theme}>
            <Navigation />
            <StatusBar style="auto" />
            <Toast />
          </PaperProvider>
        </CartProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

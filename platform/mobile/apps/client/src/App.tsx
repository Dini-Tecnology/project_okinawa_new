import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { CartProvider } from '@/shared/contexts/CartContext';
import { ThemeProvider, useOkinawaTheme } from '@/shared/contexts/ThemeContext';
import { queryClient } from '@/shared/config/react-query';
import { disableConsoleLogs } from '@/shared/utils/logger';
import { pushNotificationService } from '@/shared/services/push-notifications';
import Navigation from './navigation';
import { theme as paperLightTheme, paperDarkTheme } from './theme';

/**
 * Inner app wrapper that consumes the ThemeContext to drive the
 * React Native Paper theme between light and dark modes.
 * Must live inside <ThemeProvider>.
 */
function ThemedApp() {
  const { isDark } = useOkinawaTheme();
  const paperTheme = isDark ? paperDarkTheme : paperLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <Navigation />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
    </PaperProvider>
  );
}

export default function App() {
  useEffect(() => {
    disableConsoleLogs();
    pushNotificationService.initialize();

    return () => {
      pushNotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CartProvider>
            <ThemedApp />
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

/**
 * Restaurant App Entry Point
 * 
 * Main application component for the Restaurant management app.
 * Provides context providers for:
 * - React Query for server state management
 * - Paper UI theming
 * - Theme context for light/dark mode
 * - Restaurant context for authenticated restaurant data
 * - WebSocket connection for real-time updates
 * 
 * @module App
 */

import React, { useEffect, Component, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { AppState, AppStateStatus, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Navigation from './navigation';
import { theme } from './theme';
import socketService from './services/socket';
import { authService } from '@/shared/services/auth';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { RestaurantProvider } from '@/shared/contexts/RestaurantContext';

console.log('[APP] ✅ All imports resolved successfully');

// Hide splash as early as possible at the module level.
// This ensures the splash is dismissed even if React tree crashes during mount.
SplashScreen.hideAsync()
  .then(() => console.log('[APP] ✅ SplashScreen.hideAsync() succeeded'))
  .catch((err) => console.warn('[APP] ⚠️ SplashScreen.hideAsync() failed:', err));

// Configure React Query with sensible defaults for restaurant operations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface RootErrorState { hasError: boolean; error: Error | null }

class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorState> {
  state: RootErrorState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[RootErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={rootErrorStyles.container}>
          <Text style={rootErrorStyles.title}>Algo deu errado</Text>
          <Text style={rootErrorStyles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={rootErrorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={rootErrorStyles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const rootErrorStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  message: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#A855F7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

/**
 * AppContent component
 * 
 * Handles WebSocket initialization and app lifecycle events.
 * Separated from App to access context providers.
 */
function AppContent() {
  useEffect(() => {
    // Initialize WebSocket connection when app starts
    initializeWebSocket();

    // Handle app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      subscription.remove();
      socketService.disconnect();
    };
  }, []);

  /**
   * Initialize WebSocket connection with authenticated user
   * Joins restaurant room for real-time order/reservation updates
   */
  const initializeWebSocket = async () => {
    try {
      const user = await authService.getStoredUser();
      if (user) {
        socketService.connect();

        // Setup global socket event handlers for debugging
        socketService.on('connect', () => {
          console.log('[WebSocket] Connected successfully');
        });

        socketService.on('disconnect', () => {
          console.log('[WebSocket] Disconnected');
        });

        socketService.on('error', (error: any) => {
          console.error('[WebSocket] Error:', error);
        });

        // Join restaurant room for real-time updates
        if (user.restaurant_id) {
          socketService.joinRestaurantRoom(user.restaurant_id);
        }
      }
    } catch (error) {
      console.error('[WebSocket] Failed to initialize:', error);
    }
  };

  /**
   * Handle app lifecycle state changes
   * Manages WebSocket connection based on app visibility
   * 
   * @param nextAppState - New app state (active, background, inactive)
   */
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - reconnect if needed
      if (!socketService.isConnected) {
        initializeWebSocket();
      }
    } else if (nextAppState === 'background') {
      // App went to background - disconnect to save battery/resources
      socketService.disconnect();
    }
  };

  return (
    <>
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}

/**
 * Main App component
 * 
 * Sets up the provider hierarchy for the Restaurant app:
 * 1. SafeAreaProvider - handles device safe areas (notch, etc.)
 * 2. QueryClientProvider - React Query for API state
 * 3. ThemeProvider - light/dark mode theming
 * 4. RestaurantProvider - authenticated restaurant context
 * 5. PaperProvider - React Native Paper UI components
 */
export default function App() {
  console.log('[APP] ✅ App component rendering');
  return (
    <RootErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RestaurantProvider>
              <PaperProvider theme={theme}>
                <AppContent />
              </PaperProvider>
            </RestaurantProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}

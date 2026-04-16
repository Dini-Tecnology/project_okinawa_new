import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import logger from './logger';

/**
 * Deep Linking Configuration
 *
 * Supported URL patterns:
 * - okinawa://restaurant/:id - View restaurant details
 * - okinawa://menu/:restaurantId - View restaurant menu
 * - okinawa://order/:orderId - View order details
 * - okinawa://reservation/:reservationId - View reservation
 * - okinawa://qr/:tableId - Open QR scanner / table flow
 *
 * Universal Links:
 * - https://okinawa.app/restaurant/:id
 * - https://okinawa.app/menu/:restaurantId
 * - https://okinawa.app/order/:orderId
 * - https://okinawa.app/reservation/:reservationId
 */

export interface DeepLinkParams {
  path: string;
  params?: Record<string, string>;
}

type RootNavigateFn = (
  name: string,
  params?: Record<string, unknown>
) => void;

let rootNavigate: RootNavigateFn | null = null;
let pendingUrl: string | null = null;

/**
 * Call from the root NavigationContainer `onReady` so deep links use the same
 * stack as @react-navigation/native (not expo-router file routes).
 */
export const registerDeepLinkNavigation = (fn: RootNavigateFn): void => {
  rootNavigate = fn;
  if (pendingUrl) {
    const url = pendingUrl;
    pendingUrl = null;
    handleDeepLink(url);
  }
};

export const unregisterDeepLinkNavigation = (): void => {
  rootNavigate = null;
};

/**
 * Parse deep link URL and extract path and params
 */
export const parseDeepLink = (url: string): DeepLinkParams | null => {
  try {
    const parsed = Linking.parse(url);
    logger.debug('Deep link parsed:', parsed);

    return {
      path: parsed.path || '',
      params: parsed.queryParams as Record<string, string>,
    };
  } catch (error) {
    logger.error('Error parsing deep link:', error);
    return null;
  }
};

/**
 * Handle deep link navigation (React Navigation screen names / params)
 */
export const handleDeepLink = (url: string): void => {
  if (!rootNavigate) {
    pendingUrl = url;
    logger.info('Deep link queued until navigator is ready:', url);
    return;
  }

  const parsed = parseDeepLink(url);
  if (!parsed) {
    logger.warn('Invalid deep link:', url);
    return;
  }

  const rawPath = parsed.path || '';
  const path = rawPath.replace(/^\/+/, '');
  const { params } = parsed;
  logger.info('Handling deep link:', { path, params });

  if (path.startsWith('restaurant/')) {
    const restaurantId = path.split('/')[1];
    if (restaurantId) {
      rootNavigate('Restaurant', { restaurantId });
    }
  } else if (path.startsWith('menu/')) {
    const restaurantId = path.split('/')[1];
    if (restaurantId) {
      rootNavigate('Menu', { restaurantId });
    }
  } else if (path.startsWith('order/')) {
    const orderId = path.split('/')[1];
    if (orderId) {
      rootNavigate('OrderStatus', { orderId });
    }
  } else if (path.startsWith('reservation/')) {
    const reservationId = path.split('/')[1];
    if (reservationId) {
      rootNavigate('ReservationDetail', { reservationId });
    }
  } else if (path.startsWith('qr/')) {
    const tableId = path.split('/')[1];
    rootNavigate('QRScanner', tableId ? { tableId } : undefined);
  } else {
    logger.warn('Unknown deep link path:', path);
  }
};

/**
 * Initialize deep linking listeners (call after registerDeepLinkNavigation)
 */
export const initDeepLinking = (): (() => void) => {
  Linking.getInitialURL().then((url) => {
    if (url) {
      logger.info('App opened with URL:', url);
      handleDeepLink(url);
    }
  });

  const subscription = Linking.addEventListener('url', (event) => {
    logger.info('Received deep link:', event.url);
    handleDeepLink(event.url);
  });

  return () => {
    subscription.remove();
  };
};

/**
 * Create deep link URL
 */
export const createDeepLink = (
  path: string,
  params?: Record<string, string>
): string => {
  const prefix = Linking.createURL('/');
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return `${prefix}${path}${queryString}`;
};

/**
 * Share deep link (for social sharing, etc)
 * Uses expo-sharing for native share sheet
 */
export const shareDeepLink = async (
  path: string,
  params?: Record<string, string>,
  _message?: string
): Promise<void> => {
  const url = createDeepLink(path, params);
  logger.info('Sharing deep link:', url);

  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(url, {
        dialogTitle: 'Compartilhar Link',
        mimeType: 'text/plain',
      });
    } else {
      Alert.alert('Compartilhar', `Link copiado: ${url}`, [{ text: 'OK' }]);
    }
  } catch (error) {
    logger.error('Failed to share deep link:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar o link');
  }
};

/**
 * Prefixes / screen names for configuring linking on the root navigator if needed.
 */
export const deepLinkConfig = {
  prefixes: ['okinawa://', 'https://okinawa.app', 'https://*.okinawa.app'],
  config: {
    screens: {
      Restaurant: 'restaurant/:restaurantId',
      Menu: 'menu/:restaurantId',
      OrderStatus: 'order/:orderId',
      ReservationDetail: 'reservation/:reservationId',
      QRScanner: 'qr/:tableId',
    },
  },
};

export default {
  parseDeepLink,
  handleDeepLink,
  initDeepLinking,
  createDeepLink,
  shareDeepLink,
  deepLinkConfig,
  registerDeepLinkNavigation,
  unregisterDeepLinkNavigation,
};

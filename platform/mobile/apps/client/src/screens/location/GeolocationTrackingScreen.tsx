import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../../shared/theme';
import { typography } from '../../../../shared/theme/typography';
import { spacing } from '../../../../shared/theme/spacing';
import logger from '@okinawa/shared/utils/logger';

type RootStackParamList = {
  GeolocationTracking: {
    restaurantId: string;
    restaurantName: string;
    orderId?: string;
    serviceType: 'drive-thru' | 'food-truck';
    restaurantLocation: {
      latitude: number;
      longitude: number;
    };
  };
};

type GeolocationTrackingRouteProp = RouteProp<RootStackParamList, 'GeolocationTracking'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

const ARRIVAL_THRESHOLD_METERS = 100;
const UPDATE_INTERVAL_MS = 5000;

export const GeolocationTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GeolocationTrackingRouteProp>();
  const colors = useColors();
  const { restaurantId, restaurantName, orderId, serviceType, restaurantLocation } = route.params;

  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<'idle' | 'approaching' | 'nearby' | 'arrived'>('idle');

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      alignItems: 'center',
    },
    title: {
      ...typography.headings.h3,
      color: colors.foreground,
    },
    subtitle: {
      ...typography.body.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    placeholder: {
      width: 40,
    },
    mapContainer: {
      height: 280,
      marginHorizontal: spacing.lg,
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
    },
    mapPlaceholder: {
      flex: 1,
      backgroundColor: colors.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapPlaceholderText: {
      ...typography.body.medium,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    coordsText: {
      ...typography.body.small,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    trackingIndicator: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -20,
      marginTop: -20,
    },
    trackingDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      opacity: 0.8,
    },
    statusCard: {
      margin: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: 20,
    },
    statusHeader: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      gap: spacing.xs,
    },
    statusBadgeText: {
      ...typography.body.medium,
      color: '#FFF',
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      ...typography.headings.h2,
      color: colors.foreground,
    },
    statLabel: {
      ...typography.body.small,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
      marginHorizontal: spacing.md,
    },
    progressContainer: {
      height: 6,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 3,
      marginTop: spacing.lg,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 3,
    },
    instructionsCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.backgroundSecondary,
      padding: spacing.md,
      borderRadius: 12,
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    instructionsText: {
      ...typography.body.small,
      color: colors.textMuted,
      flex: 1,
    },
    actions: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: 12,
      gap: spacing.sm,
    },
    primaryButtonText: {
      ...typography.body.large,
      color: '#FFF',
      fontWeight: '600',
    },
    arrivalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success,
      paddingVertical: spacing.md,
      borderRadius: 12,
      gap: spacing.sm,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: spacing.md,
      borderRadius: 12,
      gap: spacing.sm,
    },
    secondaryButtonText: {
      ...typography.body.large,
      color: colors.primary,
      fontWeight: '600',
    },
    orderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    orderButtonText: {
      ...typography.body.medium,
      color: colors.textMuted,
    },
  }), [colors]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  const updateTrackingStatus = useCallback((distanceMeters: number) => {
    if (distanceMeters <= ARRIVAL_THRESHOLD_METERS) {
      setTrackingStatus('arrived');
      setHasArrived(true);
    } else if (distanceMeters <= 500) {
      setTrackingStatus('nearby');
    } else if (distanceMeters <= 2000) {
      setTrackingStatus('approaching');
    } else {
      setTrackingStatus('idle');
    }
  }, []);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos da sua localização para rastrear sua chegada ao estabelecimento.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurações', onPress: () => Linking.openSettings() },
        ]
      );
    }
    
    return status === 'granted';
  };

  const startTracking = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsTracking(true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: UPDATE_INTERVAL_MS,
        distanceInterval: 10,
      },
      (location) => {
        const newLocation: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        };
        setCurrentLocation(newLocation);

        const dist = calculateDistance(
          newLocation.latitude,
          newLocation.longitude,
          restaurantLocation.latitude,
          restaurantLocation.longitude
        );
        setDistance(dist);
        updateTrackingStatus(dist);

        const avgSpeedMps = 30 * 1000 / 3600;
        const timeSeconds = dist / avgSpeedMps;
        setEstimatedTime(Math.round(timeSeconds / 60));

        const progress = Math.max(0, Math.min(1, 1 - (dist / 5000)));
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 500,
          useNativeDriver: false,
        }).start();

        sendLocationUpdate(newLocation, dist);
      }
    );
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    pulseAnim.stopAnimation();
  };

  const sendLocationUpdate = async (location: LocationData, distance: number) => {
    try {
      logger.log('Sending location update:', { restaurantId, orderId, location, distance });
    } catch (error) {
      logger.error('Failed to send location update:', error);
    }
  };

  const notifyArrival = async () => {
    try {
      Alert.alert(
        'Chegada Confirmada!',
        serviceType === 'drive-thru' 
          ? 'O estabelecimento foi notificado. Por favor, dirija-se à janela de retirada.'
          : 'O food truck foi notificado. Seu pedido estará pronto em instantes!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      logger.error('Failed to notify arrival:', error);
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const getStatusColor = () => {
    switch (trackingStatus) {
      case 'arrived':
        return colors.success;
      case 'nearby':
        return colors.primary;
      case 'approaching':
        return colors.primaryLight;
      default:
        return colors.textMuted;
    }
  };

  const getStatusMessage = () => {
    switch (trackingStatus) {
      case 'arrived':
        return 'Você chegou!';
      case 'nearby':
        return 'Quase lá!';
      case 'approaching':
        return 'A caminho...';
      default:
        return 'Iniciando rastreamento...';
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>
            {serviceType === 'drive-thru' ? 'Drive-Thru' : 'Food Truck'}
          </Text>
          <Text style={styles.subtitle}>{restaurantName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons 
            name={serviceType === 'drive-thru' ? 'car' : 'fast-food'} 
            size={48} 
            color={colors.primary} 
          />
          <Text style={styles.mapPlaceholderText}>Mapa de Rastreamento</Text>
          {currentLocation && (
            <Text style={styles.coordsText}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Tracking Indicator */}
        {isTracking && (
          <Animated.View 
            style={[
              styles.trackingIndicator,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={[styles.trackingDot, { backgroundColor: getStatusColor() }]} />
          </Animated.View>
        )}
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Ionicons 
              name={hasArrived ? 'checkmark-circle' : 'navigate'} 
              size={20} 
              color="#FFF" 
            />
            <Text style={styles.statusBadgeText}>{getStatusMessage()}</Text>
          </View>
        </View>

        {/* Distance & Time */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {distance !== null ? formatDistance(distance) : '--'}
            </Text>
            <Text style={styles.statLabel}>Distância</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {estimatedTime !== null ? `${estimatedTime} min` : '--'}
            </Text>
            <Text style={styles.statLabel}>Tempo estimado</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getStatusColor(),
              }
            ]} 
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.instructionsText}>
            {serviceType === 'drive-thru'
              ? 'Mantenha o app aberto enquanto dirige. Notificaremos o estabelecimento quando você estiver próximo.'
              : 'Acompanhe a localização do food truck em tempo real e saiba quando seu pedido estará pronto.'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isTracking ? (
          <TouchableOpacity style={styles.primaryButton} onPress={startTracking}>
            <Ionicons name="locate" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Iniciar Rastreamento</Text>
          </TouchableOpacity>
        ) : hasArrived ? (
          <TouchableOpacity style={styles.arrivalButton} onPress={notifyArrival}>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Confirmar Chegada</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.secondaryButton} onPress={stopTracking}>
            <Ionicons name="stop-circle" size={24} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Parar Rastreamento</Text>
          </TouchableOpacity>
        )}

        {orderId && (
          <TouchableOpacity style={styles.orderButton}>
            <Ionicons name="receipt" size={20} color={colors.textMuted} />
            <Text style={styles.orderButtonText}>Ver Pedido #{orderId.slice(-6)}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default GeolocationTrackingScreen;

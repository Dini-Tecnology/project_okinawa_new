import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { RestaurantSubscreenHeader } from '../../components/restaurant/RestaurantSubscreenHeader';
import { resolveRestaurantDetail } from '../../constants/restaurantDetailMocks';

type RouteParams = {
  restaurantId?: string;
  restaurantName?: string;
  tableNumber?: number;
};

export default function RestaurantQRScanScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const colors = useColors();
  const params = (route.params ?? {}) as RouteParams;
  const restaurant = useMemo(() => resolveRestaurantDetail(params.restaurantId), [params.restaurantId]);
  const tableNumber = params.tableNumber ?? restaurant.defaultTable.number;
  const tableSeats = restaurant.defaultTable.seats;

  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 24,
        },
        viewfinder: {
          width: 280,
          height: 280,
          borderRadius: 20,
          backgroundColor: colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          overflow: 'hidden',
        },
        corner: {
          position: 'absolute',
          width: 36,
          height: 36,
          borderColor: colors.primary,
        },
        cornerTL: {
          top: 24,
          left: 24,
          borderTopWidth: 4,
          borderLeftWidth: 4,
          borderTopLeftRadius: 8,
        },
        cornerTR: {
          top: 24,
          right: 24,
          borderTopWidth: 4,
          borderRightWidth: 4,
          borderTopRightRadius: 8,
        },
        cornerBL: {
          bottom: 24,
          left: 24,
          borderBottomWidth: 4,
          borderLeftWidth: 4,
          borderBottomLeftRadius: 8,
        },
        cornerBR: {
          bottom: 24,
          right: 24,
          borderBottomWidth: 4,
          borderRightWidth: 4,
          borderBottomRightRadius: 8,
        },
        scanLine: {
          position: 'absolute',
          left: 32,
          right: 32,
          height: 2,
          backgroundColor: colors.primary,
        },
        instruction: {
          fontSize: 15,
          color: colors.foregroundSecondary,
          textAlign: 'center',
          marginBottom: 32,
        },
        successCircle: {
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: '#DCFCE7',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        },
        successTitle: {
          fontSize: 22,
          fontWeight: '800',
          color: colors.foreground,
          marginBottom: 8,
          textAlign: 'center',
        },
        successRestaurant: {
          fontSize: 15,
          color: colors.foregroundSecondary,
          marginBottom: 6,
        },
        successDetail: {
          fontSize: 14,
          color: colors.foregroundMuted,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 20,
        },
        primaryBtn: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingVertical: 16,
          borderRadius: 16,
          backgroundColor: colors.primary,
          marginBottom: 12,
        },
        primaryBtnText: {
          color: colors.primaryForeground,
          fontSize: 16,
          fontWeight: '700',
        },
        outlineBtn: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingVertical: 16,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        outlineBtnText: {
          color: colors.foreground,
          fontSize: 16,
          fontWeight: '700',
        },
      }),
    [colors],
  );

  const navParams = {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    tableNumber,
  };

  if (!scanning) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <RestaurantSubscreenHeader title="Escanear QR Code" />
        <View style={[styles.content, { paddingTop: 8 }]}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={44} color="#16A34A" />
          </View>
          <Text style={styles.successTitle}>Mesa {tableNumber} identificada!</Text>
          <Text style={styles.successRestaurant}>{restaurant.name}</Text>
          <Text style={styles.successDetail}>
            Você está acomodado na Mesa {tableNumber} · {tableSeats} lugares
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('MenuTab')}
            accessibilityRole="button"
            accessibilityLabel="Abrir cardápio"
          >
            <Ionicons name="restaurant" size={22} color={colors.primaryForeground} />
            <Text style={styles.primaryBtnText}>Abrir Cardápio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('RestaurantCallTeam', navParams)}
            accessibilityRole="button"
            accessibilityLabel="Chamar garçom"
          >
            <Ionicons name="hand-left-outline" size={22} color={colors.foreground} />
            <Text style={styles.outlineBtnText}>Chamar Garçom</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <RestaurantSubscreenHeader title="Escanear QR Code" />
      <View style={styles.content}>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <View style={[styles.scanLine, { top: '50%' }]} />
          <Ionicons name="camera-outline" size={56} color={colors.foregroundMuted} />
        </View>
        <Text style={styles.instruction}>Aponte para o QR Code da mesa</Text>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </ScreenContainer>
  );
}

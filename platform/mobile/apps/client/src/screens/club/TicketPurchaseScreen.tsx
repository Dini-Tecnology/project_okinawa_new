/**
 * TicketPurchaseScreen - Buy Club Entry Ticket
 *
 * Allows customers to purchase entry tickets with type selection
 * (Normal/VIP/Birthday), quantity (1-4), and price summary.
 * On success, displays an anti-fraud QR code for door scan.
 *
 * @module client/screens/club
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { t, getLanguage } from '@okinawa/shared/i18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { gradients } from '@okinawa/shared/theme/colors';
import { ApiService } from '@okinawa/shared/services/api';
import * as Haptics from 'expo-haptics';

// ============================================
// TYPES
// ============================================

type TicketType = 'normal' | 'vip' | 'birthday';

interface PurchaseResult {
  id: string;
  qrCode: string;
  qrPayload: string;
  entryType: string;
  quantity: number;
  totalAmount: number;
}

interface TicketPurchaseScreenProps {
  route?: {
    params?: {
      eventId: string;
      restaurantId: string;
      eventName: string;
      eventDate: string;
      coverCharge: number;
      vipCoverCharge: number;
    };
  };
}

// ============================================
// QR CODE DISPLAY COMPONENT
// ============================================

function QrCodeDisplay({
  result,
  colors,
  onDone,
}: {
  result: PurchaseResult;
  colors: ReturnType<typeof useColors>;
  onDone: () => void;
}) {
  return (
    <View style={[qrStyles.container, { backgroundColor: colors.background }]}>
      <View style={qrStyles.content}>
        {/* Icon container instead of emoji */}
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: `${colors.primary}1A`,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 16,
        }}>
          <IconButton icon="ticket-confirmation" size={32} iconColor={colors.primary} style={{ margin: 0 }} />
        </View>
        <Text
          variant="headlineMedium"
          style={{ color: colors.foreground, textAlign: 'center', fontWeight: '700' }}
        >
          {t('club.ticket.purchaseSuccess')}
        </Text>

        {/* QR Code Display */}
        <Card style={[qrStyles.qrCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} mode="elevated">
          <Card.Content style={qrStyles.qrContent}>
            <View
              style={[
                qrStyles.qrPlaceholder,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <IconButton icon="qrcode" size={64} iconColor={colors.foreground} style={{ margin: 0 }} />
              <Text
                variant="bodySmall"
                style={{ color: colors.foregroundSecondary, textAlign: 'center', marginTop: 8 }}
              >
                {result.qrCode}
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={{ color: colors.foregroundMuted, textAlign: 'center', marginTop: 12 }}
            >
              {t('club.ticket.showQr')}
            </Text>
          </Card.Content>
        </Card>

        {/* Ticket Details */}
        <View style={qrStyles.detailsRow}>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {t('club.ticket.type')}:
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foreground, fontWeight: '600' }}>
            {result.entryType.toUpperCase()}
          </Text>
        </View>
        <View style={qrStyles.detailsRow}>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {t('club.ticket.quantity')}:
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foreground, fontWeight: '600' }}>
            {result.quantity}
          </Text>
        </View>
        <View style={qrStyles.detailsRow}>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {t('club.ticket.total')}:
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: colors.primary, fontWeight: '700' }}
          >
            {formatCurrency(result.totalAmount, getLanguage())}
          </Text>
        </View>

        {/* Done button: gradient */}
        <Pressable
          onPress={onDone}
          style={({ pressed }) => [{
            marginTop: 12,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 16 }}>
              {t('common.done')}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const qrStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  content: { gap: 16 },
  qrCard: { borderRadius: 20, marginVertical: 8 },
  qrContent: { alignItems: 'center', padding: 24 },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
});

// ============================================
// TICKET TYPE OPTION
// ============================================

const TICKET_TYPES: { value: TicketType; icon: string }[] = [
  { value: 'normal', icon: 'ticket' },
  { value: 'vip', icon: 'star' },
  { value: 'birthday', icon: 'cake-variant' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function TicketPurchaseScreen({ route }: TicketPurchaseScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();

  const eventId = route?.params?.eventId || '';
  const restaurantId = route?.params?.restaurantId || '';
  const eventName = route?.params?.eventName || '';
  const eventDate = route?.params?.eventDate || '';
  const coverCharge = route?.params?.coverCharge || 0;
  const vipCoverCharge = route?.params?.vipCoverCharge || 0;

  const [ticketType, setTicketType] = useState<TicketType>('normal');
  const [quantity, setQuantity] = useState(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);

  // Price calculation
  const pricePerTicket = useMemo(() => {
    switch (ticketType) {
      case 'vip':
        return vipCoverCharge;
      case 'birthday':
        return 0;
      default:
        return coverCharge;
    }
  }, [ticketType, coverCharge, vipCoverCharge]);

  const totalPrice = pricePerTicket * quantity;

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await ApiService.post('/club-entries', {
        restaurantId,
        eventDate,
        entryType: ticketType === 'normal' ? 'ticket' : ticketType === 'vip' ? 'ticket' : 'birthday',
        quantity,
        ticketType,
      });
      return response.data as PurchaseResult;
    },
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPurchaseResult(data);
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), error.message || t('club.ticket.purchaseError') || t('common.error'));
    },
  });

  const handleQuantityChange = useCallback(
    (delta: number) => {
      setQuantity((prev) => Math.max(1, Math.min(4, prev + delta)));
    },
    [],
  );

  const handlePurchase = useCallback(() => {
    purchaseMutation.mutate();
  }, [purchaseMutation]);

  const handleDone = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getTicketLabel = useCallback((type: TicketType) => {
    switch (type) {
      case 'normal': return t('club.ticket.normal');
      case 'vip': return t('club.ticket.vip');
      case 'birthday': return t('club.ticket.birthday');
    }
  }, []);

  // Show QR code on success
  if (purchaseResult) {
    return (
      <QrCodeDisplay
        result={purchaseResult}
        colors={colors}
        onDone={handleDone}
      />
    );
  }

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
    : '';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Event Header */}
      <Card style={{ borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} mode="elevated">
        <Card.Content>
          <Text
            variant="titleLarge"
            style={{ color: colors.foreground, fontWeight: '700' }}
          >
            {eventName}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: colors.foregroundSecondary, marginTop: 4 }}
          >
            {formattedDate}
          </Text>
        </Card.Content>
      </Card>

      {/* Ticket Type Selector — card-based selection */}
      <View style={styles.section}>
        <Text
          variant="titleMedium"
          style={{ color: colors.foreground, fontWeight: '600', marginBottom: 12 }}
        >
          {t('club.ticket.type')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {TICKET_TYPES.map((tt) => {
            const isSelected = ticketType === tt.value;
            return (
              <TouchableOpacity
                key={tt.value}
                onPress={() => setTicketType(tt.value)}
                style={{
                  flex: 1,
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? `${colors.primary}1A` : colors.card,
                  alignItems: 'center',
                  gap: 8,
                }}
                accessibilityLabel={getTicketLabel(tt.value)}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isSelected ? `${colors.primary}33` : colors.backgroundTertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <IconButton
                    icon={tt.icon}
                    size={20}
                    iconColor={isSelected ? colors.primary : colors.foregroundSecondary}
                    style={{ margin: 0 }}
                  />
                </View>
                <Text style={{
                  fontSize: 13,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? colors.primary : colors.foreground,
                  textAlign: 'center',
                }}>
                  {getTicketLabel(tt.value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Quantity Selector */}
      <View style={styles.section}>
        <Text
          variant="titleMedium"
          style={{ color: colors.foreground, fontWeight: '600', marginBottom: 12 }}
        >
          {t('club.ticket.quantity')}
        </Text>
        <View style={styles.quantityRow}>
          <IconButton
            icon="minus"
            mode="contained-tonal"
            onPress={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            size={24}
          />
          <Text
            variant="headlineMedium"
            style={{ color: colors.foreground, fontWeight: '700', minWidth: 48, textAlign: 'center' }}
          >
            {quantity}
          </Text>
          <IconButton
            icon="plus"
            mode="contained-tonal"
            onPress={() => handleQuantityChange(1)}
            disabled={quantity >= 4}
            size={24}
          />
        </View>
      </View>

      {/* Price Summary */}
      <Card style={{ borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} mode="elevated">
        <Card.Content style={styles.summaryContent}>
          <Text
            variant="titleMedium"
            style={{ color: colors.foreground, fontWeight: '600' }}
          >
            {t('club.ticket.price')}
          </Text>

          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
              {t('club.ticket.type')}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.foreground }}>
              {getTicketLabel(ticketType)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
              {t('club.ticket.quantity')}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.foreground }}>
              {quantity}x {formatCurrency(pricePerTicket, getLanguage())}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text
              variant="titleMedium"
              style={{ color: colors.foreground, fontWeight: '700' }}
            >
              {t('club.ticket.total')}
            </Text>
            <Text
              variant="titleLarge"
              style={{ color: colors.primary, fontWeight: '700' }}
            >
              {formatCurrency(totalPrice, getLanguage())}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Purchase Button — gradient */}
      <Pressable
        onPress={handlePurchase}
        disabled={purchaseMutation.isPending}
        style={({ pressed }) => [{
          marginTop: 4,
          opacity: purchaseMutation.isPending ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        }]}
      >
        <LinearGradient
          colors={gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 16,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 16 }}>
            {purchaseMutation.isPending ? '...' : t('club.ticket.purchase')}
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
});

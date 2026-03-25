import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  Avatar,
  Chip,
  RadioButton,
  Checkbox,
  TextInput,
  Portal,
  Modal,
  SegmentedButtons,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { formatCurrency, getCurrencySymbol } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SplitMode = 'individual' | 'equal' | 'selective' | 'fixed';

interface OrderItem {
  id: string;
  menu_item: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  ordered_by: string;
  ordered_by_name?: string;
}

interface OrderGuest {
  id: string;
  guest_user_id?: string;
  guest_name: string;
  status: string;
  payment_status: string;
  amount_due: number;
  amount_paid: number;
  is_primary: boolean;
}

interface PaymentSplit {
  id: string;
  guest_user_id: string;
  guest_name: string;
  split_mode: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  selected_items?: string[];
}

interface Order {
  id: string;
  restaurant_id: string;
  status: string;
  subtotal_amount: number;
  tax_amount: number;
  tip_amount: number;
  total_amount: number;
  items: OrderItem[];
}

// Skeleton block component
const SkeletonBlock = ({ width, height, style }: { width: number | string; height: number; style?: any }) => {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 6, backgroundColor: colors.backgroundTertiary, opacity },
        style,
      ]}
    />
  );
};

const SplitSkeleton = () => {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary, padding: 16 }}>
      {/* Total card skeleton */}
      <SkeletonBlock width="100%" height={100} style={{ borderRadius: 12, marginBottom: 16 }} />
      {/* Mode selector skeleton */}
      <SkeletonBlock width="100%" height={48} style={{ borderRadius: 8, marginBottom: 16 }} />
      {/* Guest cards skeleton */}
      {[1, 2, 3].map((i) => (
        <SkeletonBlock key={i} width="100%" height={120} style={{ borderRadius: 12, marginBottom: 12 }} />
      ))}
    </View>
  );
};

export default function SplitPaymentScreen() {
  useScreenTracking('Split Payment');
  const analytics = useAnalytics();
  const colors = useColors();

  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  const { orderId } = route.params as { orderId: string };

  const { connected, on, off, joinRoom, leaveRoom } = useWebSocket('/payments');

  const [order, setOrder] = useState<Order | null>(null);
  const [guests, setGuests] = useState<OrderGuest[]>([]);
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Split mode state
  const [splitMode, setSplitMode] = useState<SplitMode>('individual');
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, string>>({});

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<OrderGuest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  useEffect(() => {
    loadData();
  }, [orderId]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (connected && orderId) {
      joinRoom(`payment:${orderId}`);

      const handlePaymentUpdate = (data: any) => {
        if (data.splits) {
          setSplits(data.splits);
        }
        // Reload data to get updated guest payment statuses
        loadData();
      };

      const handlePaymentCompleted = (data: any) => {
        if (data.splits) {
          setSplits(data.splits);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };

      on('payment:split_updated', handlePaymentUpdate);
      on('payment:completed', handlePaymentCompleted);

      return () => {
        off('payment:split_updated', handlePaymentUpdate);
        off('payment:completed', handlePaymentCompleted);
        leaveRoom(`payment:${orderId}`);
      };
    }
  }, [connected, orderId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [orderData, guestsData, splitsData] = await Promise.all([
        ApiService.getOrder(orderId),
        ApiService.getOrderGuests(orderId),
        ApiService.getOrderPaymentSplits(orderId).catch(() => []),
      ]);
      setOrder(orderData);
      setGuests(guestsData);
      setSplits(splitsData);
    } catch (err: any) {
      console.error('Error loading split data:', err);
      setError(t('split.errorCreate'));
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const calculateSplitAmounts = useCallback(() => {
    if (!order || guests.length === 0) return {};

    const amounts: Record<string, number> = {};
    const totalAmount = order.total_amount;
    const guestCount = guests.length;

    switch (splitMode) {
      case 'individual':
        guests.forEach((guest) => {
          const guestItems = order.items.filter(
            (item) => item.ordered_by === guest.guest_user_id,
          );
          amounts[guest.id] = guestItems.reduce(
            (sum, item) => sum + item.total_price,
            0,
          );
        });
        // Distribute tax/tip proportionally
        const subtotal = order.subtotal_amount;
        if (subtotal > 0) {
          const taxTipRatio = (order.tax_amount + order.tip_amount) / subtotal;
          Object.keys(amounts).forEach((guestId) => {
            amounts[guestId] = amounts[guestId] * (1 + taxTipRatio);
          });
        }
        break;

      case 'equal': {
        const equalAmount = totalAmount / guestCount;
        guests.forEach((guest) => {
          amounts[guest.id] = equalAmount;
        });
        break;
      }

      case 'selective':
        guests.forEach((guest) => {
          const guestSelectedItems = selectedItems[guest.id] || [];
          const itemsTotal = order.items
            .filter((item) => guestSelectedItems.includes(item.id))
            .reduce((sum, item) => sum + item.total_price, 0);
          amounts[guest.id] = itemsTotal;
        });
        // Assign remaining to primary guest
        {
          const selectedTotal = Object.values(amounts).reduce((a, b) => a + b, 0);
          const primaryGuest = guests.find((g) => g.is_primary);
          if (primaryGuest && selectedTotal < totalAmount) {
            amounts[primaryGuest.id] =
              (amounts[primaryGuest.id] || 0) + (totalAmount - selectedTotal);
          }
        }
        break;

      case 'fixed': {
        let fixedTotal = 0;
        guests.forEach((guest) => {
          const amount = parseFloat(fixedAmounts[guest.id] || '0');
          amounts[guest.id] = amount;
          fixedTotal += amount;
        });
        const primary = guests.find((g) => g.is_primary);
        if (primary && fixedTotal < totalAmount) {
          amounts[primary.id] =
            (amounts[primary.id] || 0) + (totalAmount - fixedTotal);
        }
        break;
      }
    }

    return amounts;
  }, [order, guests, splitMode, selectedItems, fixedAmounts]);

  const handleToggleItem = useCallback((guestId: string, itemId: string) => {
    setSelectedItems((prev) => {
      const guestItems = prev[guestId] || [];
      if (guestItems.includes(itemId)) {
        return {
          ...prev,
          [guestId]: guestItems.filter((id) => id !== itemId),
        };
      } else {
        return {
          ...prev,
          [guestId]: [...guestItems, itemId],
        };
      }
    });
  }, []);

  const handleFixedAmountChange = useCallback((guestId: string, value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '');
    setFixedAmounts((prev) => ({
      ...prev,
      [guestId]: numValue,
    }));
  }, []);

  const handleCreateSplits = useCallback(async () => {
    if (!order) return;

    setProcessing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const apiSplitMode =
        splitMode === 'fixed'
          ? 'split_selective'
          : splitMode === 'selective'
            ? 'split_selective'
            : splitMode === 'equal'
              ? 'split_equal'
              : 'individual';

      await ApiService.createAllPaymentSplits(orderId, apiSplitMode);
      await loadData();

      await analytics.logEvent('payment_splits_created', {
        order_id: orderId,
        split_mode: splitMode,
        guest_count: guests.length,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('split.createSplits'));
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('common.error'),
        err.response?.data?.message || t('split.errorCreate'),
      );
    } finally {
      setProcessing(false);
    }
  }, [order, splitMode, orderId, guests.length, loadData, analytics, t]);

  const handleOpenPayment = useCallback((guest: OrderGuest) => {
    setSelectedGuest(guest);
    setShowPaymentModal(true);
  }, []);

  const handleProcessPayment = useCallback(async () => {
    if (!selectedGuest || !order) return;

    const amounts = calculateSplitAmounts();
    const amount = amounts[selectedGuest.id] || 0;

    if (amount <= 0) {
      Alert.alert(t('common.error'), t('payment.invalidAmount'));
      return;
    }

    setProcessing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const split = splits.find(
        (s) => s.guest_user_id === selectedGuest.guest_user_id,
      );

      if (!split) {
        Alert.alert(t('common.error'), t('payment.splitNotFound'));
        return;
      }

      // Generate idempotency key
      const idempotencyKey = `split-${split.id}-${Date.now()}`;

      await ApiService.processSplitPayment(
        {
          split_id: split.id,
          amount,
          payment_method: paymentMethod,
        },
        {
          headers: { 'X-Idempotency-Key': idempotencyKey },
        },
      );

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await analytics.logPurchase(orderId, amount, 'BRL');

      setShowPaymentModal(false);
      setSelectedGuest(null);
      await loadData();

      Alert.alert(t('common.success'), t('payment.paymentProcessed'));
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('common.error'),
        err.response?.data?.message || t('split.errorPay'),
      );
    } finally {
      setProcessing(false);
    }
  }, [selectedGuest, order, calculateSplitAmounts, splits, paymentMethod, orderId, loadData, analytics, t]);

  const getPaymentStatusColor = useCallback(
    (status: string) => {
      switch (status) {
        case 'paid':
          return colors.success;
        case 'partial':
          return colors.warning;
        case 'pending':
          return colors.foregroundMuted;
        default:
          return colors.foregroundMuted;
      }
    },
    [colors],
  );

  const getPaymentStatusText = useCallback(
    (status: string) => {
      switch (status) {
        case 'paid':
          return t('split.personPaid');
        case 'partial':
          return t('payment.status.partial');
        case 'pending':
          return t('split.personPending');
        default:
          return status;
      }
    },
    [t],
  );

  const getModeDescription = useCallback(
    (mode: SplitMode): string => {
      switch (mode) {
        case 'individual':
          return t('split.modeIndividualDesc');
        case 'equal':
          return t('split.modeEqualDesc');
        case 'selective':
          return t('split.modeSelectiveDesc');
        case 'fixed':
          return t('split.modeFixedDesc');
      }
    },
    [t],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.backgroundSecondary,
        },
        scrollContent: {
          padding: 16,
          paddingBottom: 32,
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.backgroundSecondary,
          padding: 32,
        },
        errorText: {
          color: colors.error,
          textAlign: 'center',
          marginBottom: 16,
        },
        notFoundContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.backgroundSecondary,
        },
        notFoundText: {
          color: colors.foreground,
        },
        totalCard: {
          marginBottom: 16,
          backgroundColor: colors.primary,
          borderRadius: 12,
        },
        totalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        totalLabel: {
          color: 'rgba(255,255,255,0.8)',
        },
        totalAmount: {
          color: 'white',
          fontWeight: 'bold',
        },
        paidInfo: {
          alignItems: 'flex-end',
        },
        paidLabel: {
          color: 'rgba(255,255,255,0.8)',
        },
        paidAmount: {
          color: 'white',
        },
        allPaidChip: {
          marginTop: 12,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignSelf: 'flex-start',
        },
        allPaidText: {
          color: 'white',
        },
        card: {
          marginBottom: 16,
          backgroundColor: colors.card,
          borderRadius: 12,
        },
        sectionTitle: {
          marginBottom: 12,
          color: colors.foreground,
        },
        segmentedButtons: {
          marginBottom: 12,
        },
        modeDescription: {
          color: colors.foregroundSecondary,
          fontStyle: 'italic',
        },
        guestCard: {
          marginBottom: 12,
          backgroundColor: colors.card,
          borderRadius: 12,
        },
        guestCardPaid: {
          borderWidth: 1,
          borderColor: colors.success + '40',
          backgroundColor: colors.success + '05',
        },
        guestCardCurrent: {
          borderWidth: 1,
          borderColor: colors.primary + '40',
          backgroundColor: colors.primary + '05',
        },
        guestHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        guestInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        guestAvatar: {
          backgroundColor: colors.backgroundTertiary,
        },
        primaryAvatar: {
          backgroundColor: colors.primary,
        },
        paidAvatar: {
          backgroundColor: colors.success,
        },
        guestDetails: {
          marginLeft: 12,
          flex: 1,
        },
        guestName: {
          color: colors.foreground,
        },
        primaryBadge: {
          color: colors.primary,
          fontWeight: 'bold',
        },
        statusChip: {
          marginTop: 4,
          height: 20,
          alignSelf: 'flex-start',
        },
        guestAmount: {
          alignItems: 'flex-end',
        },
        amountText: {
          fontWeight: 'bold',
          color: colors.primary,
        },
        itemSelection: {
          marginTop: 8,
        },
        divider: {
          marginVertical: 12,
          backgroundColor: colors.border,
        },
        selectItemsLabel: {
          marginBottom: 8,
          color: colors.foregroundSecondary,
        },
        selectableItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
        },
        itemInfo: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginLeft: 8,
        },
        itemText: {
          color: colors.foreground,
        },
        itemPrice: {
          color: colors.foregroundSecondary,
        },
        itemPaidText: {
          color: colors.success,
          fontStyle: 'italic',
          fontSize: 12,
        },
        fixedAmountContainer: {
          marginTop: 8,
        },
        fixedMaxLabel: {
          color: colors.foregroundSecondary,
          marginBottom: 4,
          fontSize: 12,
        },
        amountInput: {
          marginBottom: 8,
          backgroundColor: colors.card,
        },
        payButton: {
          marginTop: 12,
          backgroundColor: colors.success,
          borderRadius: 20,
        },
        createSplitsButton: {
          marginTop: 8,
          backgroundColor: colors.primary,
          borderRadius: 20,
        },
        modalContent: {
          backgroundColor: colors.card,
          padding: 20,
          margin: 20,
          borderRadius: 12,
        },
        modalTitle: {
          marginBottom: 16,
          color: colors.foreground,
        },
        paymentSummary: {
          marginBottom: 16,
          padding: 12,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 8,
        },
        paymentSummaryText: {
          color: colors.foreground,
        },
        paymentAmount: {
          marginTop: 4,
          color: colors.primary,
          fontWeight: 'bold',
        },
        radioItem: {
          paddingVertical: 4,
        },
        modalActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 16,
          gap: 8,
        },
      }),
    [colors],
  );

  // Loading skeleton
  if (loading) {
    return <SplitSkeleton />;
  }

  // Error state
  if (error && !order) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={colors.error} />
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={loadData} buttonColor={colors.primary}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  // No order
  if (!order) {
    return (
      <View style={styles.notFoundContainer}>
        <Text variant="bodyLarge" style={styles.notFoundText}>
          {t('payment.orderNotFound')}
        </Text>
      </View>
    );
  }

  const amounts = calculateSplitAmounts();
  const totalPaid = guests.reduce((sum, g) => sum + g.amount_paid, 0);
  const allPaid = totalPaid >= order.total_amount;
  const remaining = Math.max(0, order.total_amount - totalPaid);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Total Card */}
        <Card style={styles.totalCard}>
          <Card.Content>
            <View style={styles.totalHeader}>
              <View>
                <Text variant="bodyMedium" style={styles.totalLabel}>
                  {t('split.total')}
                </Text>
                <Text variant="headlineLarge" style={styles.totalAmount}>
                  {formatCurrency(order.total_amount, getLanguage())}
                </Text>
              </View>
              <View style={styles.paidInfo}>
                <Text variant="bodyMedium" style={styles.paidLabel}>
                  {t('split.totalPaid')}
                </Text>
                <Text variant="titleLarge" style={styles.paidAmount}>
                  {formatCurrency(totalPaid, getLanguage())}
                </Text>
              </View>
            </View>
            {allPaid ? (
              <Chip
                mode="flat"
                icon="check-circle"
                style={styles.allPaidChip}
                textStyle={styles.allPaidText}
              >
                {t('split.allPaid')}
              </Chip>
            ) : (
              <Text
                variant="bodySmall"
                style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}
              >
                {t('split.remaining', { amount: remaining.toFixed(2) })}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Split Mode Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('split.modesTitle')}
            </Text>

            <SegmentedButtons
              value={splitMode}
              onValueChange={(value) => {
                setSplitMode(value as SplitMode);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              buttons={[
                { value: 'individual', label: t('split.modeIndividual') },
                { value: 'equal', label: t('split.modeEqual') },
                { value: 'selective', label: t('split.modeSelective') },
                { value: 'fixed', label: t('split.modeFixed') },
              ]}
              style={styles.segmentedButtons}
            />

            <Text variant="bodySmall" style={styles.modeDescription}>
              {getModeDescription(splitMode)}
            </Text>
          </Card.Content>
        </Card>

        {/* Guest Payment Cards */}
        {guests.map((guest) => {
          const isPaid = guest.payment_status === 'paid';
          const guestCardStyle = isPaid
            ? styles.guestCardPaid
            : guest.is_primary
              ? styles.guestCardCurrent
              : undefined;

          return (
            <Card key={guest.id} style={[styles.guestCard, guestCardStyle]}>
              <Card.Content>
                <View style={styles.guestHeader}>
                  <View style={styles.guestInfo}>
                    <Avatar.Text
                      size={40}
                      label={guest.guest_name.substring(0, 2).toUpperCase()}
                      style={[
                        styles.guestAvatar,
                        isPaid && styles.paidAvatar,
                        !isPaid && guest.is_primary && styles.primaryAvatar,
                      ]}
                    />
                    <View style={styles.guestDetails}>
                      <Text variant="titleSmall" style={styles.guestName}>
                        {guest.guest_name.length > 8
                          ? guest.guest_name.substring(0, 8) + '...'
                          : guest.guest_name}
                        {guest.is_primary && (
                          <Text style={styles.primaryBadge}>
                            {' '}
                            ({t('split.host')})
                          </Text>
                        )}
                      </Text>
                      <Chip
                        mode="flat"
                        icon={isPaid ? 'check' : undefined}
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor:
                              getPaymentStatusColor(guest.payment_status) + '20',
                          },
                        ]}
                        textStyle={{
                          color: getPaymentStatusColor(guest.payment_status),
                          fontSize: 10,
                        }}
                      >
                        {getPaymentStatusText(guest.payment_status)}
                      </Chip>
                    </View>
                  </View>
                  <View style={styles.guestAmount}>
                    <Text variant="titleMedium" style={styles.amountText}>
                      {formatCurrency(amounts[guest.id] || 0, getLanguage())}
                    </Text>
                  </View>
                </View>

                {/* Selective Mode - Item Selection */}
                {splitMode === 'selective' && !isPaid && (
                  <View style={styles.itemSelection}>
                    <Divider style={styles.divider} />
                    <Text variant="bodySmall" style={styles.selectItemsLabel}>
                      {t('split.itemsTitle')}:
                    </Text>
                    {order.items.map((item) => {
                      // Check if item is paid by someone else
                      const paidSplit = splits.find(
                        (s) =>
                          s.status === 'paid' &&
                          s.selected_items?.includes(item.id) &&
                          s.guest_user_id !== guest.guest_user_id,
                      );

                      return (
                        <View key={item.id} style={styles.selectableItem}>
                          <Checkbox
                            status={
                              paidSplit
                                ? 'checked'
                                : selectedItems[guest.id]?.includes(item.id)
                                  ? 'checked'
                                  : 'unchecked'
                            }
                            onPress={() =>
                              !paidSplit && handleToggleItem(guest.id, item.id)
                            }
                            disabled={!!paidSplit}
                            color={paidSplit ? colors.success : undefined}
                          />
                          <View style={styles.itemInfo}>
                            <View style={{ flex: 1 }}>
                              <Text variant="bodyMedium" style={styles.itemText}>
                                {item.quantity}x {item.menu_item.name}
                              </Text>
                              {paidSplit && (
                                <Text style={styles.itemPaidText}>
                                  {t('split.itemsPaidBy', {
                                    name: paidSplit.guest_name,
                                  })}
                                </Text>
                              )}
                            </View>
                            <Text variant="bodySmall" style={styles.itemPrice}>
                              {formatCurrency(item.total_price, getLanguage())}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Fixed Mode - Amount Input */}
                {splitMode === 'fixed' && !isPaid && (
                  <View style={styles.fixedAmountContainer}>
                    <Divider style={styles.divider} />
                    <Text style={styles.fixedMaxLabel}>
                      {t('split.fixedMax', { max: remaining.toFixed(2) })}
                    </Text>
                    <TextInput
                      label={t('payment.enterAmount')}
                      value={fixedAmounts[guest.id] || ''}
                      onChangeText={(value) =>
                        handleFixedAmountChange(guest.id, value)
                      }
                      keyboardType="decimal-pad"
                      mode="outlined"
                      left={<TextInput.Affix text={getCurrencySymbol(getLanguage())} />}
                      style={styles.amountInput}
                    />
                  </View>
                )}

                {/* Pay Button */}
                {!isPaid && !allPaid && (
                  <Button
                    mode="contained"
                    onPress={() => handleOpenPayment(guest)}
                    style={styles.payButton}
                    disabled={allPaid}
                    icon="credit-card"
                  >
                    {t('split.cta', {
                      amount: (amounts[guest.id] || 0).toFixed(2),
                    })}
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        })}

        {/* Create Splits Button */}
        {splits.length === 0 && !allPaid && (
          <Button
            mode="contained"
            onPress={handleCreateSplits}
            loading={processing}
            disabled={processing}
            style={styles.createSplitsButton}
            icon="account-group"
          >
            {t('split.createSplits')}
          </Button>
        )}
      </ScrollView>

      {/* Payment Method Modal */}
      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {t('payment.selectPaymentMethod')}
          </Text>

          {selectedGuest && (
            <View style={styles.paymentSummary}>
              <Text variant="bodyMedium" style={styles.paymentSummaryText}>
                {t('payment.payingFor')}: {selectedGuest.guest_name}
              </Text>
              <Text variant="headlineSmall" style={styles.paymentAmount}>
                {formatCurrency(amounts[selectedGuest.id] || 0, getLanguage())}
              </Text>
            </View>
          )}

          <RadioButton.Group
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <RadioButton.Item
              label={t('payment.creditCard')}
              value="credit_card"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label={t('payment.methodsPix')}
              value="pix"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label={t('payment.methodsApple')}
              value="apple_pay"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label={t('payment.methodsGoogle')}
              value="google_pay"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label={t('payment.methodsWallet')}
              value="wallet"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
          </RadioButton.Group>

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowPaymentModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleProcessPayment}
              loading={processing}
              disabled={processing}
            >
              {t('payment.confirm')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

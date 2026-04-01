/**
 * CouponsScreen - User Coupons & Promo Codes
 *
 * Displays available, used, and expired coupons.
 * Each coupon shows discount value badge, title, validity, terms, and "Use" CTA.
 * Includes "Add coupon" code input functionality.
 *
 * @module client/screens/promotions
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  Button,
  ActivityIndicator,
  Chip,
  TextInput,
  Card,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

type CouponStatus = 'available' | 'used' | 'expired';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  status: CouponStatus;
  valid_until: string;
  terms?: string;
  min_order_value?: number;
}

// ============================================
// SKELETON
// ============================================

function CouponSkeleton({ colors }: { colors: any }) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
            <View style={{ width: '50%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
            <View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function CouponsScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<CouponStatus | 'all'>('available');
  const [couponCode, setCouponCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Fetch coupons
  const {
    data: coupons = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async (): Promise<Coupon[]> => {
      const response = await ApiService.get('/promotions/my-coupons');
      return response.data;
    },
  });

  // Apply coupon code
  const applyCodeMutation = useMutation({
    mutationFn: (code: string) => ApiService.post('/promotions/apply-code', { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setCouponCode('');
      setShowCodeInput(false);
      Alert.alert(t('common.success'), t('coupons.codeApplied'));
    },
    onError: () => {
      Alert.alert(t('common.error'), t('coupons.codeInvalid'));
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredCoupons = useMemo(() => {
    if (filter === 'all') return coupons;
    return coupons.filter((c) => c.status === filter);
  }, [coupons, filter]);

  const handleApplyCode = useCallback(() => {
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    applyCodeMutation.mutate(trimmed);
  }, [couponCode, applyCodeMutation]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return t('coupons.discountPercent', { value: coupon.discount_value });
    }
    return t('coupons.discount', { value: `R$${coupon.discount_value.toFixed(0)}` });
  };

  const getDiscountColor = (coupon: Coupon) => {
    if (coupon.status !== 'available') return colors.foregroundMuted;
    return coupon.discount_value >= 20 ? colors.primary : colors.success;
  };

  const renderCoupon = ({ item: coupon }: { item: Coupon }) => {
    const isInactive = coupon.status !== 'available';
    const discountColor = getDiscountColor(coupon);

    return (
      <Card style={[styles.couponCard, isInactive && styles.couponCardInactive]}>
        <Card.Content style={styles.couponContent}>
          {/* Discount Badge */}
          <View style={[styles.discountBadge, { backgroundColor: `${discountColor}15` }]}>
            <Text
              variant="titleLarge"
              style={[styles.discountText, { color: discountColor }]}
            >
              {getDiscountText(coupon)}
            </Text>
          </View>

          {/* Coupon Info */}
          <View style={styles.couponInfo}>
            <Text
              variant="titleMedium"
              style={[styles.couponTitle, isInactive && styles.couponTitleInactive]}
              numberOfLines={1}
            >
              {coupon.title}
            </Text>

            {coupon.description && (
              <Text variant="bodySmall" style={styles.couponDesc} numberOfLines={2}>
                {coupon.description}
              </Text>
            )}

            <Text variant="bodySmall" style={styles.couponValidity}>
              {t('coupons.validUntil', {
                date: format(new Date(coupon.valid_until), 'dd/MM/yyyy'),
              })}
            </Text>

            {coupon.terms && (
              <Text variant="bodySmall" style={styles.couponTerms} numberOfLines={1}>
                {coupon.terms}
              </Text>
            )}
          </View>

          {/* Action Button */}
          {coupon.status === 'available' && (
            <Button
              mode="contained"
              compact
              style={styles.useButton}
              onPress={() => {
                // Navigate to use coupon or copy code
                Alert.alert(coupon.code, coupon.terms || coupon.description || '');
              }}
            >
              {t('coupons.use')}
            </Button>
          )}

          {isInactive && (
            <Chip compact style={styles.statusChip}>
              {coupon.status === 'used' ? t('coupons.used') : t('coupons.expired')}
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  };

  // ============================================
  // RENDER STATES
  // ============================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('coupons.title')}
          </Text>
        </View>
        <CouponSkeleton colors={colors} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle-outline" size={64} iconColor={colors.foregroundMuted} />
        <Text variant="bodyLarge" style={styles.errorText}>
          {t('coupons.errorLoading')}
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {t('coupons.title')}
        </Text>
        <Button
          mode="text"
          compact
          icon="plus"
          onPress={() => setShowCodeInput(!showCodeInput)}
          textColor={colors.primary}
        >
          {t('coupons.addCode')}
        </Button>
      </View>

      {/* Code Input */}
      {showCodeInput && (
        <View style={styles.codeInputContainer}>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder={t('coupons.addCodePlaceholder')}
            mode="outlined"
            style={styles.codeInput}
            autoCapitalize="characters"
            textColor={colors.foreground}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            accessibilityLabel="Coupon code"
            right={
              <TextInput.Icon
                icon="check"
                onPress={handleApplyCode}
                disabled={!couponCode.trim() || applyCodeMutation.isPending}
              />
            }
          />
          {applyCodeMutation.isPending && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.codeLoading} />
          )}
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as CouponStatus | 'all')}
          buttons={[
            { value: 'available', label: t('coupons.available') },
            { value: 'used', label: t('coupons.used') },
            { value: 'expired', label: t('coupons.expired') },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Coupon List */}
      <FlatList
        data={filteredCoupons}
        keyExtractor={(item) => item.id}
        renderItem={renderCoupon}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="ticket-percent-outline" size={80} iconColor={colors.foregroundMuted} />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {t('coupons.emptyTitle')}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              {t('coupons.emptyMessage')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.foreground,
      fontWeight: 'bold',
    },
    codeInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    codeInput: {
      flex: 1,
      backgroundColor: colors.input,
    },
    codeLoading: {
      marginLeft: 8,
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    segmentedButtons: {},
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    couponCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    couponCardInactive: {
      opacity: 0.6,
    },
    couponContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    discountBadge: {
      width: 72,
      height: 72,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    discountText: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 14,
    },
    couponInfo: {
      flex: 1,
      gap: 2,
    },
    couponTitle: {
      color: colors.foreground,
      fontWeight: '600',
    },
    couponTitleInactive: {
      color: colors.foregroundMuted,
    },
    couponDesc: {
      color: colors.foregroundSecondary,
      lineHeight: 16,
    },
    couponValidity: {
      color: colors.foregroundMuted,
    },
    couponTerms: {
      color: colors.foregroundMuted,
      fontStyle: 'italic',
      fontSize: 10,
    },
    useButton: {
      borderRadius: 8,
    },
    statusChip: {
      backgroundColor: colors.backgroundTertiary,
    },
    // States
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.foregroundSecondary,
      marginTop: 12,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 16,
      borderRadius: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyTitle: {
      marginTop: 16,
      color: colors.foreground,
      textAlign: 'center',
    },
    emptyMessage: {
      marginTop: 8,
      color: colors.foregroundMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

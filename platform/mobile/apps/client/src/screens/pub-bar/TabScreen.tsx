/**
 * TabScreen -- Customer's current tab (comanda) view
 *
 * Displays the running tab for Pub & Bar service type.
 * Shows tab summary (table number, opened-at time, running total),
 * FlatList of rounds in reverse chronological order,
 * and bottom action bar with "Add Round" / "Pay Tab" buttons.
 * Receives real-time updates via WebSocket (tabs gateway).
 *
 * @module client/screens/pub-bar/TabScreen
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Badge,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { t, getLanguage } from '@/shared/i18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { useTab } from '../../hooks/useTab';
import type { TabItem } from '../../hooks/useTab';
import RoundBuilderSheet from './RoundBuilderSheet';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// TYPES
// ============================================

type TabScreenParams = {
  TabScreen: {
    tabId?: string;
    restaurantId: string;
    tableNumber: string;
  };
};

type TabScreenRouteProp = RouteProp<TabScreenParams, 'TabScreen'>;

interface StatusConfig {
  color: string;
  icon: string;
  label: string;
}

interface Round {
  id: string;
  index: number;
  items: TabItem[];
  addedAt: string;
  total: number;
}

// ============================================
// SKELETON LOADER
// ============================================

function TabSkeleton({ colors }: { colors: any }) {
  const skeletonStyle = {
    backgroundColor: colors.backgroundTertiary || colors.border,
    borderRadius: 8,
  };

  return (
    <View style={{ padding: 16 }}>
      {/* Header skeleton */}
      <View style={{ marginBottom: 24 }}>
        <View style={[skeletonStyle, { width: 160, height: 20, marginBottom: 8 }]} />
        <View style={[skeletonStyle, { width: 120, height: 16, marginBottom: 8 }]} />
        <View style={[skeletonStyle, { width: 200, height: 32 }]} />
      </View>

      {/* Round cards skeleton */}
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[skeletonStyle, { width: '100%', height: 120, marginBottom: 12, borderRadius: 12 }]}
        />
      ))}
    </View>
  );
}

// ============================================
// TAB STATUS CHIP
// ============================================

function TabStatusChip({
  status,
  colors,
}: {
  status: string;
  colors: any;
}) {
  let chipColor: string;
  let chipLabel: string;
  let chipIcon: string;

  switch (status) {
    case 'open':
      chipColor = colors.success;
      chipLabel = t('tab.status.open');
      chipIcon = 'circle';
      break;
    case 'closing':
    case 'pending_payment':
      chipColor = colors.warning;
      chipLabel = t('tab.status.pending');
      chipIcon = 'clock-outline';
      break;
    case 'closed':
      chipColor = colors.foregroundMuted || colors.foregroundMuted;
      chipLabel = t('tab.status.closed');
      chipIcon = 'check-circle';
      break;
    default:
      chipColor = colors.foregroundMuted || colors.foregroundMuted;
      chipLabel = status;
      chipIcon = 'help-circle-outline';
  }

  return (
    <Chip
      mode="flat"
      icon={chipIcon}
      style={{ backgroundColor: chipColor + '20', alignSelf: 'flex-start' }}
      textStyle={{ color: chipColor, fontSize: 12, fontWeight: '600' }}
    >
      {chipLabel}
    </Chip>
  );
}

// ============================================
// ROUND CARD
// ============================================

function RoundCard({
  round,
  colors,
}: {
  round: Round;
  colors: any;
}) {
  const formattedTime = useMemo(() => {
    try {
      const date = new Date(round.addedAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }, [round.addedAt]);

  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 12 }}>
      <Card.Content>
        {/* Round header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="glass-mug-variant" size={18} color={colors.primary} />
            <Text
              variant="titleSmall"
              style={{ color: colors.foreground, fontWeight: 'bold' }}
            >
              {t('tab.round.label', { n: String(round.index) })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="clock-outline" size={14} color={colors.foregroundMuted} />
            <Text variant="bodySmall" style={{ color: colors.foregroundMuted }}>
              {formattedTime}
            </Text>
          </View>
        </View>

        {/* Round items */}
        {round.items.map((item) => {
          const itemName = item.menu_item?.name || `Item #${item.menu_item_id.slice(0, 8)}`;
          const lineTotal = (Number(item.unit_price) * item.quantity).toFixed(2);

          return (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 6,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text variant="bodyMedium" style={{ color: colors.foreground }}>
                  {item.quantity}x {itemName}
                </Text>
                {item.special_instructions ? (
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.foregroundMuted, fontStyle: 'italic', marginTop: 2 }}
                  >
                    {item.special_instructions}
                  </Text>
                ) : null}
              </View>
              <Text
                variant="bodyMedium"
                style={{ color: colors.foreground, fontWeight: '600' }}
              >
                {formatCurrency(Number(lineTotal), getLanguage())}
              </Text>
            </View>
          );
        })}

        {/* Round subtotal */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text variant="bodySmall" style={{ color: colors.foregroundMuted }}>
            {t('tab.round.subtotal')}
          </Text>
          <Text
            variant="titleSmall"
            style={{ color: colors.primary, fontWeight: 'bold' }}
          >
            {formatCurrency(round.total, getLanguage())}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TabScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<TabScreenRouteProp>();
  const { tabId, restaurantId, tableNumber } = route.params;

  const [roundBuilderVisible, setRoundBuilderVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleShareTab = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await import('@okinawa/shared/services/api').then(m => m.default.post(`/tabs/${tabId}/invite`, {}));
      setInviteCode(res.data?.inviteCode || tabId.slice(0, 8).toUpperCase());
      setInviteModalVisible(true);
    } catch {
      setInviteCode(tabId.slice(0, 8).toUpperCase());
      setInviteModalVisible(true);
    }
  }, [tabId]);

  const resolvedTabId = tabId || '';

  const {
    tab,
    isLoading,
    isError,
    tabTotal,
    itemCount,
    refetch,
    wsConnected,
  } = useTab(resolvedTabId);

  // Group tab items into rounds by created_at timestamp proximity
  const rounds = useMemo<Round[]>(() => {
    if (!tab?.items || tab.items.length === 0) return [];

    // Sort items by created_at ascending
    const sortedItems = [...tab.items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    // Group items that were added within 30 seconds of each other into the same round
    const ROUND_THRESHOLD_MS = 30 * 1000;
    const groupedRounds: Round[] = [];
    let currentGroup: TabItem[] = [];
    let groupStart = 0;

    sortedItems.forEach((item, idx) => {
      const itemTime = new Date(item.created_at).getTime();

      if (currentGroup.length === 0) {
        currentGroup = [item];
        groupStart = itemTime;
      } else if (itemTime - groupStart <= ROUND_THRESHOLD_MS) {
        currentGroup.push(item);
      } else {
        // Close current group
        groupedRounds.push({
          id: `round-${groupedRounds.length + 1}`,
          index: groupedRounds.length + 1,
          items: currentGroup,
          addedAt: currentGroup[0].created_at,
          total: currentGroup.reduce(
            (sum, i) => sum + Number(i.unit_price) * i.quantity,
            0,
          ),
        });
        currentGroup = [item];
        groupStart = itemTime;
      }
    });

    // Close last group
    if (currentGroup.length > 0) {
      groupedRounds.push({
        id: `round-${groupedRounds.length + 1}`,
        index: groupedRounds.length + 1,
        items: currentGroup,
        addedAt: currentGroup[0].created_at,
        total: currentGroup.reduce(
          (sum, i) => sum + Number(i.unit_price) * i.quantity,
          0,
        ),
      });
    }

    // Reverse for most recent first
    return groupedRounds.reverse();
  }, [tab?.items]);

  // Format opened-at time
  const openedAtFormatted = useMemo(() => {
    if (!tab?.created_at) return '';
    try {
      const date = new Date(tab.created_at);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [tab?.created_at]);

  // Handle "Add Round" press
  const handleAddRound = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRoundBuilderVisible(true);
  }, []);

  // Handle "Pay Tab" press
  const handlePayTab = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TabPayment', {
      tabId: resolvedTabId,
      restaurantId: tab?.restaurant_id || restaurantId,
      total: tabTotal,
    });
  }, [navigation, resolvedTabId, tab?.restaurant_id, restaurantId, tabTotal]);

  // Memoized styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        },
        tabTitle: {
          color: colors.foreground,
          fontWeight: 'bold',
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginBottom: 8,
        },
        infoItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        infoText: {
          color: colors.foregroundMuted,
        },
        wsIndicator: {
          width: 8,
          height: 8,
          borderRadius: 4,
          marginLeft: 8,
        },
        totalContainer: {
          flexDirection: 'row',
          alignItems: 'baseline',
          marginTop: 8,
        },
        totalLabel: {
          color: colors.foregroundMuted,
          marginRight: 8,
        },
        totalAmount: {
          color: colors.primary,
          fontWeight: 'bold',
        },
        itemCountBadge: {
          marginLeft: 12,
        },
        listContent: {
          paddingTop: 12,
          paddingBottom: 120,
        },
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 80,
          paddingHorizontal: 32,
        },
        emptyText: {
          textAlign: 'center',
          color: colors.foregroundMuted,
          marginTop: 16,
        },
        bottomBar: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 28,
        },
        bottomTotal: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        },
        bottomButtons: {
          flexDirection: 'row',
          gap: 12,
        },
        addRoundButton: {
          flex: 1,
        },
        payTabButton: {
          flex: 1,
        },
        errorContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 80,
          paddingHorizontal: 32,
        },
        errorText: {
          textAlign: 'center',
          color: colors.error,
          marginTop: 16,
          marginBottom: 16,
        },
      }),
    [colors],
  );

  // --- Loading state ---
  if (isLoading) {
    return (
      <ScreenContainer>
      <View style={styles.container}>
        <TabSkeleton colors={colors} />
      </View>
    
      </ScreenContainer>
    );
  }

  // --- Error state ---
  if (isError || !tab) {
    return (
      <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text variant="bodyLarge" style={styles.errorText}>
            {t('common.error')}
          </Text>
          <Button mode="contained" onPress={() => refetch()}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    
      </ScreenContainer>
    );
  }

  const tableLabel = tab.table?.number || tab.table?.label || tableNumber || '-';
  const isTabOpen = tab.status === 'open';

  // --- Render round ---
  const renderRound = ({ item }: { item: Round }) => (
    <RoundCard round={item} colors={colors} />
  );

  // --- Empty state ---
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="glass-mug-variant"
        size={64}
        color={colors.foregroundMuted || colors.foregroundMuted}
      />
      <Text variant="bodyLarge" style={styles.emptyText}>
        {t('tab.empty')}
      </Text>
      <Button
        mode="contained"
        onPress={handleAddRound}
        style={{ marginTop: 16 }}
        icon="plus"
      >
        {t('tab.addRound')}
      </Button>
    </View>
  );

  return (
    <ScreenContainer>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.tabTitle}>
            {t('tab.title')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TabStatusChip status={tab.status} colors={colors} />
            <View
              style={[
                styles.wsIndicator,
                {
                  backgroundColor: wsConnected ? colors.success : colors.error,
                },
              ]}
              accessibilityLabel={wsConnected ? 'Connected' : 'Disconnected'}
            />
          </View>
        </View>

        {/* Table number and opened-at info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="table-furniture" size={16} color={colors.foregroundMuted} />
            <Text variant="bodyMedium" style={styles.infoText}>
              {t('tab.table')}: {tableLabel}
            </Text>
          </View>
          {openedAtFormatted ? (
            <View style={styles.infoItem}>
              <Icon name="clock-outline" size={16} color={colors.foregroundMuted} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {t('tab.opened')}: {openedAtFormatted}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Running total */}
        <View style={styles.totalContainer}>
          <Text variant="bodyMedium" style={styles.totalLabel}>
            {t('tab.total')}
          </Text>
          <Text variant="headlineMedium" style={styles.totalAmount}>
            {formatCurrency(tabTotal, getLanguage())}
          </Text>
          <Badge
            style={[styles.itemCountBadge, { backgroundColor: colors.primary }]}
          >
            {`${itemCount} ${t('tab.items')}`}
          </Badge>
        </View>
      </View>

      {/* Rounds List */}
      <FlatList
        data={rounds}
        renderItem={renderRound}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
          />
        }
      />

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text variant="bodyLarge" style={{ color: colors.foregroundMuted }}>
            {t('tab.total')}
          </Text>
          <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
            {formatCurrency(tabTotal, getLanguage())}
          </Text>
        </View>
        <View style={styles.bottomButtons}>
          {isTabOpen && (
            <Button
              mode="contained"
              onPress={handleAddRound}
              style={styles.addRoundButton}
              icon="plus-circle"
              accessibilityLabel={t('tab.addRound')}
            >
              {t('tab.addRound')}
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={handlePayTab}
            style={styles.payTabButton}
            icon="cash-register"
            accessibilityLabel={t('tab.pay')}
          >
            {t('tab.pay')}
          </Button>
        </View>
      </View>

      {/* Share Tab FAB */}
      <FAB
        icon="qrcode"
        onPress={handleShareTab}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 100,
          backgroundColor: colors.primary,
        }}
        color={colors.primaryForeground}
        accessibilityLabel={t('tab.shareTab')}
      />

      {/* Invite QR Modal */}
      <Portal>
        <Modal
          visible={inviteModalVisible}
          onDismiss={() => setInviteModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: colors.card,
            margin: 24,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Text variant="titleLarge" style={{ color: colors.foreground, fontWeight: '700', marginBottom: 16 }}>
            {t('tab.inviteTitle')}
          </Text>
          <View style={{
            width: 180, height: 180, borderRadius: 12,
            backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, borderWidth: 2, borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 48 }}>📱</Text>
            <Text variant="headlineSmall" style={{ color: '#000', fontWeight: '800', marginTop: 8 }}>
              {inviteCode}
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: colors.foregroundMuted, textAlign: 'center', marginBottom: 16 }}>
            {t('tab.inviteDesc')}
          </Text>
          <Button mode="contained" onPress={() => setInviteModalVisible(false)} style={{ width: '100%' }}>
            {t('common.done')}
          </Button>
        </Modal>
      </Portal>

      {/* Round Builder Bottom Sheet */}
      <RoundBuilderSheet
        visible={roundBuilderVisible}
        onDismiss={() => setRoundBuilderVisible(false)}
        tabId={resolvedTabId}
        restaurantId={tab.restaurant_id}
      />
    </View>
  
    </ScreenContainer>
  );
}

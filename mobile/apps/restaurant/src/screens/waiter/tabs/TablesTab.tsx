/**
 * TablesTab — "Mesas" tab (Level 1 - table list)
 *
 * Displays a FlatList of waiter's assigned tables with
 * summary cards, pull-to-refresh, skeleton loading,
 * and empty state.
 *
 * @module waiter/tabs/TablesTab
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import TableSummaryCard from '../components/TableSummaryCard';
import type { WaiterTable } from '../types/waiter.types';

interface TablesTabProps {
  tables: WaiterTable[];
  isLoading: boolean;
  isRefetching: boolean;
  pickedUpIds: string[];
  onRefresh: () => void;
  onSelectTable: (tableNumber: number) => void;
}

export default function TablesTab({
  tables,
  isLoading,
  isRefetching,
  pickedUpIds,
  onRefresh,
  onSelectTable,
}: TablesTabProps) {
  const colors = useColors();
  const { t } = useI18n();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        listContent: {
          padding: 12,
        },
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 80,
        },
        emptyIcon: {
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: colors.foregroundMuted + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        emptyTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
        },
        emptySubtitle: {
          fontSize: 12,
          color: colors.foregroundMuted,
          marginTop: 4,
          textAlign: 'center',
        },
        skeletonCard: {
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
          height: 100,
          marginBottom: 10,
        },
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        },
      }),
    [colors],
  );

  const renderItem = ({ item }: { item: WaiterTable }) => (
    <TableSummaryCard
      table={item}
      pickedUpIds={pickedUpIds}
      onPress={() => onSelectTable(item.number)}
    />
  );

  const keyExtractor = (item: WaiterTable) => item.id;

  // Skeleton loading
  if (isLoading) {
    return (
      <View style={styles.listContent}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    );
  }

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon
          name="table-furniture"
          size={32}
          color={colors.foregroundMuted}
        />
      </View>
      <Text style={styles.emptyTitle}>{t('waiter.tables.empty_title')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('waiter.tables.empty_subtitle')}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={tables}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={EmptyComponent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    />
  );
}

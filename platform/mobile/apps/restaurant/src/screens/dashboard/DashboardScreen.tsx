import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import type { DashboardStats, RevenueData } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

const screenWidth = Dimensions.get('window').width;

// ============================================
// QUERY KEYS
// ============================================

export const dashboardQueryKeys = {
  dashboard: ['restaurant', 'dashboard'] as const,
};

// ============================================
// API FUNCTIONS
// ============================================

const fetchDashboard = async (): Promise<{ stats: DashboardStats; revenueData: RevenueData[] }> => {
  const analyticsData = await ApiService.getAnalytics();
  return {
    stats: analyticsData.stats,
    revenueData: analyticsData.revenueData || [],
  };
};

// ============================================
// COMPONENT
// ============================================

export default function DashboardScreen() {
  const { t } = useI18n();
  const { theme, isDark } = useOkinawaTheme();
  const colors = useColors();
  const queryClient = useQueryClient();

  // ---- Main dashboard query with 30s polling fallback ----
  const {
    data: dashboardData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: dashboardQueryKeys.dashboard,
    queryFn: fetchDashboard,
    staleTime: 10_000,
    refetchInterval: 30_000, // poll every 30s as WebSocket fallback
  });

  const stats = dashboardData?.stats ?? null;
  const revenueData = dashboardData?.revenueData ?? [];

  // isRefreshing = a background refetch after initial load
  const refreshing = isFetching && !isLoading;

  // ---- WebSocket subscription for real-time dashboard updates ----
  const { on, off, connected } = useWebSocket('/');

  useEffect(() => {
    if (!connected) return;

    const handleDashboardUpdate = (data: { stats: DashboardStats; revenueData: RevenueData[] }) => {
      queryClient.setQueryData(dashboardQueryKeys.dashboard, data);
    };

    on('dashboard:update', handleDashboardUpdate);

    return () => {
      off('dashboard:update', handleDashboardUpdate);
    };
  }, [connected, on, off, queryClient]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    title: {
      marginHorizontal: 20,
      marginVertical: 16,
      color: colors.foreground,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
    },
    statCard: {
      width: '48%',
      margin: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    statContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    card: {
      margin: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    cardTitle: {
      marginBottom: 16,
      color: colors.foreground,
    },
    tableStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    tableStat: {
      alignItems: 'center',
    },
    progressContainer: {
      flex: 1,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 4,
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: 16,
      paddingHorizontal: 16,
    },
    metricCard: {
      flex: 1,
      elevation: 2,
      backgroundColor: colors.card,
    },
    metricContent: {
      alignItems: 'center',
    },
    chart: {
      marginTop: 16,
      borderRadius: 16,
    },
    statText: {
      color: colors.foreground,
    },
    statLabel: {
      color: colors.foregroundSecondary,
    },
  }), [colors]);

  const chartConfig = useMemo(() => ({
    backgroundColor: colors.primary,
    backgroundGradientFrom: colors.primary,
    backgroundGradientTo: colors.secondary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
  }), [colors]);

  if (isLoading) {
    return (
      <ScreenContainer>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <Text variant="headlineLarge" style={styles.title}>
        {t('restaurantNav.dashboard')}
      </Text>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="receipt-text" size={32} iconColor={colors.primary} />
            <View>
              <Text variant="displaySmall" style={styles.statText}>{stats?.today_orders || 0}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('financial.todayOrders')}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="cash" size={32} iconColor={colors.success} />
            <View>
              <Text variant="displaySmall" style={styles.statText}>R$ {stats?.today_revenue.toFixed(0) || 0}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('financial.todayRevenue')}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="clock-fast" size={32} iconColor={colors.warning} />
            <View>
              <Text variant="displaySmall" style={styles.statText}>{stats?.active_orders || 0}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('orders.activeOrders')}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="calendar-check" size={32} iconColor={colors.info} />
            <View>
              <Text variant="displaySmall" style={styles.statText}>{stats?.pending_reservations || 0}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('reservations.pendingReservations')}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Tables Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            {t('tables.tableStatus')}
          </Text>
          <View style={styles.tableStats}>
            <View style={styles.tableStat}>
              <Text variant="headlineMedium" style={styles.statText}>
                {stats?.tables_occupied || 0}/{stats?.tables_total || 0}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('tables.status.occupied')}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((stats?.tables_occupied || 0) / (stats?.tables_total || 1)) * 100}%` },
                  ]}
                />
              </View>
              <Text variant="bodySmall" style={styles.statLabel}>
                {(((stats?.tables_occupied || 0) / (stats?.tables_total || 1)) * 100).toFixed(0)}% {t('tables.occupancy')}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Performance Metrics */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <IconButton icon="timer-sand" size={24} iconColor={colors.foregroundSecondary} />
            <Text variant="labelMedium" style={styles.statLabel}>{t('kds.avgTime')}</Text>
            <Text variant="titleLarge" style={styles.statText}>{stats?.avg_preparation_time || 0} min</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <IconButton icon="star" size={24} iconColor={colors.ratingGold} />
            <Text variant="labelMedium" style={styles.statLabel}>{t('reviews.satisfaction')}</Text>
            <Text variant="titleLarge" style={styles.statText}>{stats?.customer_satisfaction.toFixed(1) || 0}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Revenue Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            {t('financial.weeklyRevenue')}
          </Text>
          {revenueData.length > 0 && (
            <LineChart
              data={{
                labels: revenueData.map(d => d.date),
                datasets: [{ data: revenueData.map(d => d.amount) }],
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
    </ScreenContainer>
  );
}

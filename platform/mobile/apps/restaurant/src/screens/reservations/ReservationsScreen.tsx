import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, FAB, Chip, Searchbar } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { format } from 'date-fns';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  special_requests?: string;
  table?: {
    id: string;
    table_number: string;
  };
  // Group booking fields (EPIC 17)
  is_group_booking?: boolean;
  group_size?: number;
  group_coordinator_name?: string;
  group_coordinator_phone?: string;
  deposit_required?: boolean;
  deposit_amount?: number;
  pre_fixed_menu?: boolean;
}

export default function ReservationsScreen({ navigation }: any) {
  const { t } = useI18n();
  const colors = useColors();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'today' | 'group'>('all');

  useEffect(() => {
    loadReservations();
  }, [filter]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') {
        if (filter === 'today') {
          params.date = format(new Date(), 'yyyy-MM-dd');
        } else if (filter === 'group') {
          params.is_group = true;
        } else {
          params.status = filter;
        }
      }
      const response = await ApiService.getReservations(params);
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await ApiService.updateReservationStatus(id, status);
      loadReservations();
    } catch (error) {
      console.error('Failed to update reservation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.success;
      case 'seated': return colors.info;
      case 'completed': return colors.foregroundMuted;
      case 'cancelled': return colors.error;
      default: return colors.foregroundMuted;
    }
  };

  const filteredReservations = reservations.filter((reservation) =>
    reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.customer_phone.includes(searchQuery)
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    searchbar: {
      margin: 15,
      elevation: 2,
      backgroundColor: colors.card,
    },
    filters: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      marginBottom: 10,
      gap: 8,
    },
    filterChip: {
      marginRight: 5,
    },
    list: {
      padding: 15,
    },
    card: {
      marginBottom: 15,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    headerLeft: {
      flex: 1,
    },
    customerName: {
      color: colors.foreground,
    },
    customerPhone: {
      color: colors.foregroundSecondary,
    },
    details: {
      marginVertical: 10,
      gap: 5,
    },
    detailText: {
      color: colors.foreground,
    },
    specialRequests: {
      marginTop: 10,
      fontStyle: 'italic',
      color: colors.foregroundSecondary,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 15,
      gap: 10,
    },
    actionButton: {
      flex: 1,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyText: {
      color: colors.foregroundSecondary,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  const renderReservation = ({ item }: { item: Reservation }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.customerName}>{item.customer_name}</Text>
            <Text variant="bodySmall" style={styles.customerPhone}>{item.customer_phone}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Chip
              style={{ backgroundColor: getStatusColor(item.status) }}
              textStyle={{ color: colors.primaryForeground }}
            >
              {t(`reservations.status.${item.status}`)}
            </Chip>
            {item.is_group_booking && (
              <Chip
                style={{ backgroundColor: colors.info }}
                textStyle={{ color: colors.primaryForeground, fontWeight: 'bold' }}
                icon="account-group"
              >
                {t('groupBooking.badge')}
              </Chip>
            )}
          </View>
        </View>

        {/* Group coordinator info (EPIC 17) */}
        {item.is_group_booking && item.group_coordinator_name && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: colors.backgroundTertiary, borderRadius: 8 }}>
            <Text variant="labelSmall" style={{ color: colors.foregroundSecondary }}>
              {t('groupBooking.coordinator')}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.foreground }}>
              {item.group_coordinator_name} {item.group_coordinator_phone ? `- ${item.group_coordinator_phone}` : ''}
            </Text>
            {item.deposit_required && item.deposit_amount && (
              <Text variant="bodySmall" style={{ color: colors.primary, marginTop: 4 }}>
                {t('groupBooking.deposit')}: R$ {Number(item.deposit_amount).toFixed(2)}
              </Text>
            )}
          </View>
        )}

        <View style={styles.details}>
          <Text variant="bodyMedium" style={styles.detailText}>
            {format(new Date(item.reservation_time), 'dd/MM/yyyy HH:mm')}
          </Text>
          <Text variant="bodyMedium" style={styles.detailText}>
            {t('reservations.partySize')}: {item.party_size}
          </Text>
          {item.table && (
            <Text variant="bodyMedium" style={styles.detailText}>
              {t('tables.table')}: {item.table.table_number}
            </Text>
          )}
        </View>

        {item.special_requests && (
          <Text variant="bodySmall" style={styles.specialRequests}>
            {t('reservations.specialRequests')}: {item.special_requests}
          </Text>
        )}

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => updateStatus(item.id, 'confirmed')}
              style={styles.actionButton}
              buttonColor={colors.primary}
              accessibilityRole="button"
              accessibilityLabel={`${t('common.confirm')} ${item.customer_name}`}
            >
              {t('common.confirm')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateStatus(item.id, 'cancelled')}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={`${t('common.cancel')} ${item.customer_name}`}
            >
              {t('common.cancel')}
            </Button>
          </View>
        )}

        {item.status === 'confirmed' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => updateStatus(item.id, 'seated')}
              style={styles.actionButton}
              buttonColor={colors.primary}
              accessibilityRole="button"
              accessibilityLabel={`${t('reservations.status.seated')} ${item.customer_name}`}
            >
              {t('reservations.status.seated')}
            </Button>
          </View>
        )}

        {item.status === 'seated' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => updateStatus(item.id, 'completed')}
              style={styles.actionButton}
              buttonColor={colors.success}
              accessibilityRole="button"
              accessibilityLabel={`${t('reservations.status.completed')} ${item.customer_name}`}
            >
              {t('reservations.status.completed')}
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <Searchbar
        placeholder={t('common.search')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        accessibilityLabel={t('common.search')}
      />

      <View style={styles.filters}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
          selectedColor={colors.primary}
          accessibilityRole="button"
          accessibilityLabel={t('common.viewAll')}
          accessibilityState={{ selected: filter === 'all' }}
        >
          {t('common.viewAll')}
        </Chip>
        <Chip
          selected={filter === 'today'}
          onPress={() => setFilter('today')}
          style={styles.filterChip}
          selectedColor={colors.primary}
          accessibilityRole="button"
          accessibilityLabel={t('time.today')}
          accessibilityState={{ selected: filter === 'today' }}
        >
          {t('time.today')}
        </Chip>
        <Chip
          selected={filter === 'pending'}
          onPress={() => setFilter('pending')}
          style={styles.filterChip}
          selectedColor={colors.primary}
          accessibilityRole="button"
          accessibilityLabel={t('reservations.status.pending')}
          accessibilityState={{ selected: filter === 'pending' }}
        >
          {t('reservations.status.pending')}
        </Chip>
        <Chip
          selected={filter === 'confirmed'}
          onPress={() => setFilter('confirmed')}
          style={styles.filterChip}
          selectedColor={colors.primary}
          accessibilityRole="button"
          accessibilityLabel={t('reservations.status.confirmed')}
          accessibilityState={{ selected: filter === 'confirmed' }}
        >
          {t('reservations.status.confirmed')}
        </Chip>
        <Chip
          selected={filter === 'group'}
          onPress={() => setFilter('group')}
          style={styles.filterChip}
          selectedColor={colors.info}
          icon="account-group"
          accessibilityRole="button"
          accessibilityLabel={t('groupBooking.badge')}
          accessibilityState={{ selected: filter === 'group' }}
        >
          {t('groupBooking.badge')}
        </Chip>
      </View>

      <FlatList
        data={filteredReservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={styles.emptyText}>{t('empty.reservations')}</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReservation')}
        accessibilityRole="button"
        accessibilityLabel={t('reservations.createReservation')}
      />
    </View>
    </ScreenContainer>
  );
}

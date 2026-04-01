import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Text, Card, Chip, FAB, Portal, Modal, Button, TextInput } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

/**
 * Table interface defines the structure of restaurant tables
 */
interface Table {
  id: string;
  table_number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position_x: number;
  position_y: number;
  current_order?: {
    id: string;
    total_amount: number;
    items_count: number;
  };
  current_reservation?: {
    id: string;
    customer_name: string;
    party_size: number;
  };
}

const { width } = Dimensions.get('window');
const TABLE_SIZE = 80;
const GRID_COLS = Math.floor((width - 40) / (TABLE_SIZE + 10));

/**
 * FloorPlanScreen - Visual table management for restaurant staff
 * Displays interactive floor plan with table status indicators
 * Uses semantic design tokens via useColors() for theme-aware styling
 */
export default function FloorPlanScreen({ navigation }: any) {
  const { t } = useI18n();
  const colors = useColors();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTables();
    // Refresh tables every 10 seconds for real-time updates
    const interval = setInterval(loadTables, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Loads tables from API
   */
  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getTables();
      setTables(response.data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates table status via API
   * @param tableId - Table unique identifier
   * @param status - New status to set
   */
  const updateTableStatus = async (tableId: string, status: string) => {
    try {
      await ApiService.updateTableStatus(tableId, status);
      loadTables();
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to update table:', error);
    }
  };

  /**
   * Returns color based on table status using semantic tokens
   * @param status - Current table status
   */
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      available: colors.success,
      occupied: colors.error,
      reserved: colors.warning,
      cleaning: colors.info,
    };
    return statusColors[status] || colors.foregroundMuted;
  };

  /**
   * Opens table detail modal
   * @param table - Selected table object
   */
  const handleTablePress = (table: Table) => {
    setSelectedTable(table);
    setModalVisible(true);
  };

  // Dynamic styles using semantic tokens for full theme support
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 15,
      backgroundColor: colors.card,
      elevation: 2,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    legendColor: {
      width: 20,
      height: 20,
      borderRadius: 4,
    },
    legendText: {
      color: colors.foreground,
    },
    floorPlan: {
      flex: 1,
    },
    floorPlanContent: {
      minHeight: 600,
    },
    grid: {
      position: 'relative',
      minHeight: 600,
    },
    table: {
      position: 'absolute',
      width: TABLE_SIZE,
      height: TABLE_SIZE,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
    tableNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primaryForeground,
    },
    tableSeats: {
      fontSize: 12,
      color: colors.primaryForeground,
    },
    modal: {
      backgroundColor: colors.card,
      padding: 20,
      margin: 20,
      borderRadius: 12,
    },
    modalTitle: {
      marginBottom: 20,
      textAlign: 'center',
      color: colors.foreground,
    },
    modalContent: {
      marginBottom: 20,
    },
    modalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    modalLabel: {
      color: colors.foreground,
    },
    orderCard: {
      marginTop: 15,
      backgroundColor: colors.background,
    },
    orderTitle: {
      color: colors.foreground,
    },
    orderText: {
      color: colors.foregroundSecondary,
    },
    viewOrderButton: {
      marginTop: 10,
    },
    modalActions: {
      gap: 10,
      marginBottom: 10,
    },
    actionButton: {
      marginVertical: 5,
    },
    closeButton: {
      marginTop: 10,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  /**
   * Renders individual table on the floor plan
   * @param table - Table object to render
   */
  const renderTable = (table: Table) => {
    const col = table.position_x % GRID_COLS;
    const row = Math.floor(table.position_x / GRID_COLS);

    return (
      <Pressable
        key={table.id}
        onPress={() => handleTablePress(table)}
        accessibilityRole="button"
        accessibilityLabel={`Table ${table.table_number}, ${table.seats} seats, status ${table.status}`}
        accessibilityHint="Opens table detail and status options"
        style={[
          styles.table,
          {
            backgroundColor: getStatusColor(table.status),
            left: 20 + col * (TABLE_SIZE + 10),
            top: 20 + row * (TABLE_SIZE + 10),
          },
        ]}
      >
        <Text style={styles.tableNumber}>{table.table_number}</Text>
        <Text style={styles.tableSeats}>{table.seats}</Text>
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
    <View style={styles.container}>
      {/* Status Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text variant="bodySmall" style={styles.legendText}>{t('tables.status.available')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text variant="bodySmall" style={styles.legendText}>{t('tables.status.occupied')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
          <Text variant="bodySmall" style={styles.legendText}>{t('tables.status.reserved')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.info }]} />
          <Text variant="bodySmall" style={styles.legendText}>{t('tables.status.cleaning')}</Text>
        </View>
      </View>

      {/* Floor Plan Grid */}
      <ScrollView
        style={styles.floorPlan}
        contentContainerStyle={styles.floorPlanContent}
      >
        <View style={styles.grid}>
          {tables.map(renderTable)}
        </View>
      </ScrollView>

      {/* Table Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedTable && (
            <>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                {t('tables.table')} {selectedTable.table_number}
              </Text>

              <View style={styles.modalContent}>
                <View style={styles.modalRow}>
                  <Text variant="bodyMedium" style={styles.modalLabel}>{t('orders.orderStatus')}:</Text>
                  <Chip
                    style={{ backgroundColor: getStatusColor(selectedTable.status) }}
                    textStyle={{ color: colors.primaryForeground }}
                  >
                    {t(`tables.status.${selectedTable.status}`)}
                  </Chip>
                </View>

                <View style={styles.modalRow}>
                  <Text variant="bodyMedium" style={styles.modalLabel}>{t('reservations.guests')}:</Text>
                  <Text variant="bodyMedium" style={styles.modalLabel}>{selectedTable.seats}</Text>
                </View>

                {selectedTable.current_order && (
                  <Card style={styles.orderCard}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.orderTitle}>{t('orders.title')}</Text>
                      <Text variant="bodyMedium" style={styles.orderText}>
                        {t('menu.items')}: {selectedTable.current_order.items_count}
                      </Text>
                      <Text variant="bodyMedium" style={styles.orderText}>
                        {t('orders.total')}: R$ {selectedTable.current_order.total_amount.toFixed(2)}
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          navigation.navigate('Orders', {
                            orderId: selectedTable.current_order?.id,
                          });
                          setModalVisible(false);
                        }}
                        style={styles.viewOrderButton}
                      >
                        {t('common.view')}
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                {selectedTable.current_reservation && (
                  <Card style={styles.orderCard}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.orderTitle}>{t('reservations.title')}</Text>
                      <Text variant="bodyMedium" style={styles.orderText}>
                        {t('reservations.guests')}: {selectedTable.current_reservation.customer_name}
                      </Text>
                      <Text variant="bodyMedium" style={styles.orderText}>
                        {t('reservations.partySize')}: {selectedTable.current_reservation.party_size}
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              </View>

              {/* Status Action Buttons */}
              <View style={styles.modalActions}>
                {selectedTable.status === 'available' && (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => updateTableStatus(selectedTable.id, 'occupied')}
                      style={styles.actionButton}
                      buttonColor={colors.primary}
                    >
                      {t('tables.status.occupied')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => updateTableStatus(selectedTable.id, 'reserved')}
                      style={styles.actionButton}
                    >
                      {t('tables.status.reserved')}
                    </Button>
                  </>
                )}

                {selectedTable.status === 'occupied' && (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => updateTableStatus(selectedTable.id, 'cleaning')}
                      style={styles.actionButton}
                      buttonColor={colors.primary}
                    >
                      {t('tables.status.cleaning')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={styles.actionButton}
                    >
                      {t('common.close')}
                    </Button>
                  </>
                )}

                {selectedTable.status === 'cleaning' && (
                  <Button
                    mode="contained"
                    onPress={() => updateTableStatus(selectedTable.id, 'available')}
                    style={styles.actionButton}
                    buttonColor={colors.success}
                  >
                    {t('tables.status.available')}
                  </Button>
                )}

                {selectedTable.status === 'reserved' && (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => updateTableStatus(selectedTable.id, 'occupied')}
                      style={styles.actionButton}
                      buttonColor={colors.primary}
                    >
                      {t('reservations.status.seated')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => updateTableStatus(selectedTable.id, 'available')}
                      style={styles.actionButton}
                    >
                      {t('reservations.cancelReservation')}
                    </Button>
                  </>
                )}
              </View>

              <Button onPress={() => setModalVisible(false)} style={styles.closeButton}>
                {t('common.close')}
              </Button>
            </>
          )}
        </Modal>
      </Portal>

      {/* Refresh FAB */}
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={loadTables}
        label={t('common.refresh')}
        color={colors.primaryForeground}
        accessibilityRole="button"
        accessibilityLabel="Refresh floor plan"
      />
    </View>
    </ScreenContainer>
  );
}
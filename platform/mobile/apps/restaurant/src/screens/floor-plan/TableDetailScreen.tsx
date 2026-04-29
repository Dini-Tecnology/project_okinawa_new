/**
 * TableDetailScreen - Restaurant Table Details
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Chip, Button, IconButton, ActivityIndicator, Divider, TextInput } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  current_order_id?: string;
  current_reservation_id?: string;
  notes?: string;
}

type RouteParams = {
  TableDetail: {
    tableId: string;
  };
};

export default function TableDetailScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const route = useRoute<RouteProp<RouteParams, 'TableDetail'>>();
  const navigation = useNavigation();
  const { tableId } = route.params;

  /**
   * Dynamic status colors based on current theme
   */
  const getStatusColor = useCallback((status: TableStatus): string => {
    const statusColors: Record<TableStatus, string> = {
      available: colors.success,
      occupied: colors.destructive,
      reserved: colors.warning,
      cleaning: colors.info,
    };
    return statusColors[status] || colors.mutedForeground;
  }, [colors]);

  const getStatusLabel = (status: TableStatus): string => {
    return t(`tables.status.${status}` as any);
  };

  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundColor: colors.background,
    },
    backButton: {
      marginTop: 16,
    },
    card: {
      margin: 16,
      marginBottom: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      marginBottom: 16,
    },
    tableInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    icon: {
      margin: 0,
      padding: 0,
      marginRight: 8,
    },
    headerTitle: {
      color: colors.foreground,
    },
    capacity: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    statusChip: {
      alignSelf: 'flex-start',
    },
    chipText: {
      color: colors.cardForeground,
      fontSize: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    smallIcon: {
      margin: 0,
      padding: 0,
      marginRight: 4,
    },
    detailText: {
      color: colors.foreground,
    },
    sectionTitle: {
      marginBottom: 16,
      color: colors.foreground,
    },
    orderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    orderText: {
      color: colors.foreground,
    },
    actionButton: {
      marginBottom: 8,
    },
    notesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    notesTitle: {
      color: colors.foreground,
    },
    notesInput: {
      marginBottom: 12,
      backgroundColor: colors.card,
    },
    notesText: {
      color: colors.mutedForeground,
    },
    notesActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    quickActions: {
      gap: 12,
    },
    occupyButton: {
      backgroundColor: colors.destructive,
    },
    cleaningButton: {
      backgroundColor: colors.info,
    },
    availableButton: {
      backgroundColor: colors.success,
    },
  }), [colors]);

  useEffect(() => {
    loadTable();
  }, [tableId]);

  const loadTable = async () => {
    try {
      setLoading(true);
      const tables = await ApiService.getTables();
      const foundTable = tables.find((tbl: any) => tbl.id === tableId);
      if (foundTable) {
        setTable(foundTable);
        setNotes(foundTable.notes || '');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TableStatus) => {
    if (!table) return;

    try {
      await ApiService.updateTableStatus(table.id, newStatus);
      setTable({ ...table, status: newStatus });
      Alert.alert(t('common.success'), t('success.updated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleSaveNotes = async () => {
    if (!table) return;

    try {
      await ApiService.updateTableNotes(table.id, notes);
      setTable({ ...table, notes });
      setEditingNotes(false);
      Alert.alert(t('common.success'), t('success.saved'));
    } catch (error) {
      console.error('Failed to update table notes:', error);
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  if (loading) {
    return (
      <ScreenContainer hasKeyboard>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  if (!table) {
    return (
      <ScreenContainer hasKeyboard>
      <View style={styles.emptyContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={colors.mutedForeground} />
        <Text variant="headlineSmall" style={{ color: colors.foreground }}>{t('tables.tableNotFound')}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          {t('common.back')}
        </Button>
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer hasKeyboard>
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.tableInfo}>
              <IconButton icon="table-furniture" size={48} iconColor={colors.primary} style={styles.icon} />
              <View>
                <Text variant="headlineMedium" style={styles.headerTitle}>{t('tables.table')} {table.table_number}</Text>
                <Text variant="bodyLarge" style={styles.capacity}>
                  {t('tables.capacity')}: {table.capacity} {t('tables.persons')}
                </Text>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(table.status) }]}
              textStyle={styles.chipText}
            >
              {getStatusLabel(table.status)}
            </Chip>
          </View>

          {table.location && (
            <View style={styles.detailRow}>
              <IconButton icon="map-marker" size={20} style={styles.smallIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodyLarge" style={styles.detailText}>{t('tables.location')}: {table.location}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {table.current_order_id && table.status === 'occupied' && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('tables.currentOrder')}
            </Text>
            <View style={styles.orderInfo}>
              <IconButton icon="receipt" size={24} style={styles.smallIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodyLarge" style={styles.orderText}>#{table.current_order_id.slice(0, 8)}</Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to order detail */}}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="View current order details"
            >
              {t('tables.seeOrderDetails')}
            </Button>
          </Card.Content>
        </Card>
      )}

      {table.current_reservation_id && table.status === 'reserved' && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('tables.currentReservation')}
            </Text>
            <View style={styles.orderInfo}>
              <IconButton icon="calendar-check" size={24} style={styles.smallIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodyLarge" style={styles.orderText}>#{table.current_reservation_id.slice(0, 8)}</Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to reservation detail */}}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="View current reservation details"
            >
              {t('tables.seeReservationDetails')}
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.notesHeader}>
            <Text variant="titleLarge" style={styles.notesTitle}>{t('tables.notes')}</Text>
            {!editingNotes && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setEditingNotes(true)}
                iconColor={colors.info}
                accessibilityRole="button"
                accessibilityLabel="Edit table notes"
              />
            )}
          </View>
          {editingNotes ? (
            <>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('tables.addNotes')}
                style={styles.notesInput}
                accessibilityLabel="Table notes"
              />
              <View style={styles.notesActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setNotes(table.notes || '');
                    setEditingNotes(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel editing notes"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveNotes}
                  accessibilityRole="button"
                  accessibilityLabel="Save table notes"
                >
                  {t('common.save')}
                </Button>
              </View>
            </>
          ) : (
            <Text variant="bodyMedium" style={styles.notesText}>
              {notes || t('tables.noNotes')}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('tables.quickActions')}
          </Text>
          <View style={styles.quickActions}>
            {table.status === 'available' && (
              <>
                <Button
                  mode="contained"
                  onPress={() => handleStatusChange('occupied')}
                  style={[styles.actionButton, styles.occupyButton]}
                  icon="account-group"
                  accessibilityRole="button"
                  accessibilityLabel="Mark table as occupied"
                >
                  {t('tables.markOccupied')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleStatusChange('reserved')}
                  style={styles.actionButton}
                  icon="calendar-check"
                  accessibilityRole="button"
                  accessibilityLabel="Mark table as reserved"
                >
                  {t('tables.markReserved')}
                </Button>
              </>
            )}
            {table.status === 'occupied' && (
              <>
                <Button
                  mode="contained"
                  onPress={() => handleStatusChange('cleaning')}
                  style={[styles.actionButton, styles.cleaningButton]}
                  icon="broom"
                  accessibilityRole="button"
                  accessibilityLabel="Mark table as cleaning"
                >
                  {t('tables.markCleaning')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleStatusChange('available')}
                  style={styles.actionButton}
                  textColor={colors.success}
                  icon="check-circle"
                  accessibilityRole="button"
                  accessibilityLabel="Release table and mark as available"
                >
                  {t('tables.releaseTable')}
                </Button>
              </>
            )}
            {table.status === 'cleaning' && (
              <Button
                mode="contained"
                onPress={() => handleStatusChange('available')}
                style={[styles.actionButton, styles.availableButton]}
                icon="check-circle"
                accessibilityRole="button"
                accessibilityLabel="Finish cleaning and mark table as available"
              >
                {t('tables.finishCleaning')}
              </Button>
            )}
            {table.status === 'reserved' && (
              <>
                <Button
                  mode="contained"
                  onPress={() => handleStatusChange('occupied')}
                  style={[styles.actionButton, styles.occupyButton]}
                  icon="account-check"
                  accessibilityRole="button"
                  accessibilityLabel="Customer arrived, mark table as occupied"
                >
                  {t('tables.customerArrived')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleStatusChange('available')}
                  style={styles.actionButton}
                  textColor={colors.destructive}
                  icon="close-circle"
                  accessibilityRole="button"
                  accessibilityLabel="Cancel reservation and release table"
                >
                  {t('reservations.cancelReservation')}
                </Button>
              </>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
    </ScreenContainer>
  );
}

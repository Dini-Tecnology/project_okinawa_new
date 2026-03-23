/**
 * WaiterActionBar — Horizontal Quick Action Buttons
 *
 * A horizontally scrollable row of quick action buttons for the waiter,
 * displayed at the bottom or top of a table detail view. Each action
 * shows a confirmation bottom sheet before firing the API call.
 *
 * Actions:
 * - Call Attention (notify table)
 * - Send Message (text notification to table)
 * - Transfer Table (opens table picker modal)
 * - Request Courtesy (creates approval: POST /approvals type: courtesy)
 * - Print Bill (sends print command)
 * - Finish Service (marks table service as complete)
 *
 * @module waiter/components/WaiterActionBar
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Text, Button, Portal, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';
import {
  handleCourtesyRequest,
  handleTableTransfer,
} from '../utils/waiterEventActions';

// ============================================
// TYPES
// ============================================

export interface WaiterActionBarProps {
  tableId: string;
  tableNumber: number;
  guestId?: string;
  waiterName?: string;
  /** Available tables for transfer (id + number) */
  availableTables?: Array<{ id: string; number: number }>;
  /** Callback after an action completes */
  onActionComplete?: (action: string, success: boolean) => void;
}

interface ActionConfig {
  id: string;
  icon: string;
  labelKey: string;
  color: string;
  requiresConfirmation: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function WaiterActionBar({
  tableId,
  tableNumber,
  guestId,
  waiterName,
  availableTables = [],
  onActionComplete,
}: WaiterActionBarProps) {
  const { t } = useI18n();
  const colors = useColors();

  // Modal states
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ============================================
  // ACTION DEFINITIONS
  // ============================================

  const actions: ActionConfig[] = useMemo(
    () => [
      {
        id: 'callAttention',
        icon: 'phone-ring-outline',
        labelKey: 'waiter.actions.callAttention',
        color: colors.warning,
        requiresConfirmation: true,
      },
      {
        id: 'sendMessage',
        icon: 'message-text-outline',
        labelKey: 'waiter.actions.sendMessage',
        color: colors.info,
        requiresConfirmation: true,
      },
      {
        id: 'transferTable',
        icon: 'swap-horizontal',
        labelKey: 'waiter.actions.transferTable',
        color: colors.secondary,
        requiresConfirmation: false, // Has its own modal
      },
      {
        id: 'requestCourtesy',
        icon: 'star-outline',
        labelKey: 'waiter.actions.requestCourtesy',
        color: colors.accent,
        requiresConfirmation: true,
      },
      {
        id: 'printBill',
        icon: 'printer-outline',
        labelKey: 'waiter.actions.printBill',
        color: colors.foregroundSecondary,
        requiresConfirmation: true,
      },
      {
        id: 'finishService',
        icon: 'check-circle-outline',
        labelKey: 'waiter.actions.finishService',
        color: colors.success,
        requiresConfirmation: true,
      },
    ],
    [colors],
  );

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const triggerHaptic = useCallback(() => {
    // Haptics integration — safely attempt to trigger
    try {
      const Haptics = require('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not available — skip silently
    }
  }, []);

  const executeAction = useCallback(
    async (actionId: string) => {
      setActionLoading(actionId);
      triggerHaptic();

      try {
        switch (actionId) {
          case 'callAttention': {
            await ApiService.post(`/tables/${tableId}/notify`, {
              type: 'attention',
              tableNumber,
            });
            onActionComplete?.('callAttention', true);
            break;
          }

          case 'sendMessage': {
            // In a full implementation, this would open a message compose UI.
            // For now, send a standard notification.
            await ApiService.post(`/tables/${tableId}/notify`, {
              type: 'message',
              tableNumber,
              message: t('waiter.actions.defaultMessage'),
            });
            onActionComplete?.('sendMessage', true);
            break;
          }

          case 'transferTable': {
            setTransferModalVisible(true);
            setActionLoading(null);
            return; // Don't clear loading here, modal handles it
          }

          case 'requestCourtesy': {
            const result = await handleCourtesyRequest(
              tableId,
              guestId || '',
              undefined,
              waiterName,
              tableNumber,
            );
            onActionComplete?.('requestCourtesy', result.success);
            if (!result.success) {
              Alert.alert(t('common.error'), result.error || t('errors.generic'));
            }
            break;
          }

          case 'printBill': {
            await ApiService.post(`/tables/${tableId}/print-bill`, {
              tableNumber,
            });
            onActionComplete?.('printBill', true);
            break;
          }

          case 'finishService': {
            await ApiService.patch(`/tables/${tableId}/finish-service`);
            onActionComplete?.('finishService', true);
            break;
          }

          default:
            break;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('errors.generic');
        Alert.alert(t('common.error'), message);
        onActionComplete?.(actionId, false);
      } finally {
        setActionLoading(null);
      }
    },
    [tableId, tableNumber, guestId, waiterName, t, onActionComplete, triggerHaptic],
  );

  const handleActionPress = useCallback(
    (action: ActionConfig) => {
      if (action.id === 'transferTable') {
        executeAction(action.id);
        return;
      }

      if (action.requiresConfirmation) {
        Alert.alert(
          t(action.labelKey),
          t('waiter.actions.confirmAction', { action: t(action.labelKey) }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.confirm'),
              onPress: () => executeAction(action.id),
            },
          ],
        );
      } else {
        executeAction(action.id);
      }
    },
    [executeAction, t],
  );

  const handleTransferSelect = useCallback(
    async (toTableId: string) => {
      setTransferModalVisible(false);
      setActionLoading('transferTable');
      triggerHaptic();

      try {
        const result = await handleTableTransfer(tableId, toTableId);
        onActionComplete?.('transferTable', result.success);
        if (!result.success) {
          Alert.alert(t('common.error'), result.error || t('errors.generic'));
        }
      } catch (error) {
        Alert.alert(t('common.error'), t('errors.generic'));
        onActionComplete?.('transferTable', false);
      } finally {
        setActionLoading(null);
      }
    },
    [tableId, t, onActionComplete, triggerHaptic],
  );

  // ============================================
  // STYLES
  // ============================================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
        scrollContent: {
          paddingHorizontal: 12,
          gap: 10,
          flexDirection: 'row',
        },
        actionButton: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
          minWidth: 80,
          gap: 6,
        },
        actionButtonDisabled: {
          opacity: 0.5,
        },
        actionIcon: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        actionLabel: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.foregroundSecondary,
          textAlign: 'center',
        },
        // Transfer Modal
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        modalContent: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 16,
          paddingBottom: Platform.OS === 'ios' ? 34 : 24,
          maxHeight: '60%',
        },
        modalHandle: {
          width: 36,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.border,
          alignSelf: 'center',
          marginBottom: 16,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.foreground,
          paddingHorizontal: 20,
          marginBottom: 16,
        },
        tableOption: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 12,
        },
        tableOptionNumber: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.foreground,
        },
        cancelButton: {
          paddingVertical: 14,
          alignItems: 'center',
          marginTop: 8,
        },
        cancelButtonText: {
          color: colors.error,
          fontWeight: '600',
          fontSize: 16,
        },
      }),
    [colors],
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={styles.container} testID="waiter-action-bar">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => {
          const isLoading = actionLoading === action.id;

          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionButton,
                isLoading && styles.actionButtonDisabled,
              ]}
              onPress={() => handleActionPress(action)}
              disabled={isLoading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t(action.labelKey)}
              testID={`action-${action.id}`}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${action.color}20` },
                ]}
              >
                <Icon name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={2}>
                {t(action.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Table Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTransferModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {t('waiter.actions.transferTable')}
            </Text>

            <FlatList
              data={availableTables.filter((tbl) => tbl.id !== tableId)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.tableOption}
                  onPress={() => handleTransferSelect(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t('tables.tableNumber', {
                    number: String(item.number),
                  })}
                >
                  <Icon
                    name="table-furniture"
                    size={24}
                    color={colors.foregroundSecondary}
                  />
                  <Text style={styles.tableOptionNumber}>
                    {t('tables.tableNumber', {
                      number: String(item.number),
                    })}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.foregroundMuted }}>
                    {t('common.noResults')}
                  </Text>
                </View>
              }
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setTransferModalVisible(false)}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

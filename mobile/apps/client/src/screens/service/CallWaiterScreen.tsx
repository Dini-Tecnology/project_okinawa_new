/**
 * CallWaiterScreen
 *
 * Allows customers to discreetly request waiter assistance
 * with various service needs. Connects to real POST /calls endpoint
 * and listens for WebSocket updates (call:updated) to show real-time status.
 *
 * @module screens/service
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  IconButton,
  ActivityIndicator,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import ApiService from '@/shared/services/api';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/theme';
import { io, Socket } from 'socket.io-client';

// ============================================
// TYPES
// ============================================

interface CallReason {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  callType: 'waiter' | 'manager' | 'help' | 'emergency';
  priority: 'normal' | 'high';
}

interface ServiceCallResponse {
  id: string;
  restaurant_id: string;
  status: 'pending' | 'acknowledged' | 'resolved' | 'cancelled';
  call_type: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function CallWaiterScreen() {
  useScreenTracking('Call Waiter');
  const { t } = useI18n();
  const colors = useColors();
  const route = useRoute();
  const navigation = useNavigation();
  const analytics = useAnalytics();
  const socketRef = useRef<Socket | null>(null);

  const { restaurantId, reservationId, tableId } = route.params as {
    restaurantId: string;
    reservationId?: string;
    tableId?: string;
  };

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [callSent, setCallSent] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string>('pending');

  // i18n-based call reasons
  const CALL_REASONS: CallReason[] = useMemo(
    () => [
      {
        id: 'waiter',
        icon: 'account-tie',
        titleKey: 'calls.type.waiter',
        descriptionKey: 'callWaiter.reasonTitle',
        callType: 'waiter' as const,
        priority: 'normal' as const,
      },
      {
        id: 'manager',
        icon: 'shield-account',
        titleKey: 'calls.type.manager',
        descriptionKey: 'callWaiter.selectType',
        callType: 'manager' as const,
        priority: 'normal' as const,
      },
      {
        id: 'help',
        icon: 'help-circle',
        titleKey: 'calls.type.help',
        descriptionKey: 'callWaiter.addMessage',
        callType: 'help' as const,
        priority: 'normal' as const,
      },
      {
        id: 'emergency',
        icon: 'alert-circle',
        titleKey: 'calls.type.emergency',
        descriptionKey: 'calls.type.emergency',
        callType: 'emergency' as const,
        priority: 'high' as const,
      },
    ],
    [],
  );

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!callSent || !callId) return;

    const apiBaseUrl = ApiService.getBaseUrl?.() || '';
    const socket = io(`${apiBaseUrl}/calls`, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRestaurant', { restaurantId });
    });

    socket.on('call:updated', (data: ServiceCallResponse) => {
      if (data.id === callId) {
        setCallStatus(data.status);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [callSent, callId, restaurantId]);

  // Create call mutation
  const createCallMutation = useMutation({
    mutationFn: (payload: {
      restaurant_id: string;
      table_id?: string;
      call_type: string;
      message?: string;
    }) => ApiService.post('/calls', payload),
    onSuccess: (response: ServiceCallResponse) => {
      setCallId(response.id);
      setCallSent(true);
      setCallStatus('pending');
      analytics.logEvent('waiter_called', {
        restaurant_id: restaurantId,
        call_type: selectedReason,
      });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('errors.generic'),
      );
    },
  });

  // Cancel call mutation
  const cancelCallMutation = useMutation({
    mutationFn: (id: string) => ApiService.patch(`/calls/${id}/cancel`),
    onSuccess: () => {
      analytics.logEvent('waiter_call_cancelled', { call_id: callId });
      setCallSent(false);
      setCallId(null);
      setSelectedReason(null);
      setAdditionalMessage('');
      setCallStatus('pending');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('errors.generic'),
      );
    },
  });

  const handleCallWaiter = useCallback(() => {
    if (!selectedReason) {
      Alert.alert(t('common.error'), t('callWaiter.selectReason'));
      return;
    }

    const reason = CALL_REASONS.find((r) => r.id === selectedReason);
    if (!reason) return;

    createCallMutation.mutate({
      restaurant_id: restaurantId,
      table_id: tableId,
      call_type: reason.callType,
      message: additionalMessage || undefined,
    });
  }, [selectedReason, restaurantId, tableId, additionalMessage, CALL_REASONS, t, createCallMutation]);

  const handleCancelCall = useCallback(() => {
    if (!callId) return;

    Alert.alert(
      t('callWaiter.cancelConfirmTitle'),
      t('callWaiter.cancelConfirmMessage'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          onPress: () => cancelCallMutation.mutate(callId),
        },
      ],
    );
  }, [callId, t, cancelCallMutation]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          padding: 15,
        },
        title: {
          marginBottom: 8,
          color: colors.foreground,
        },
        subtitle: {
          color: colors.foregroundSecondary,
          marginBottom: 20,
        },
        card: {
          marginBottom: 15,
          backgroundColor: colors.card,
        },
        sectionTitle: {
          marginBottom: 15,
          color: colors.foreground,
        },
        reasonItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderRadius: 8,
        },
        reasonItemSelected: {
          backgroundColor: colors.warningBackground,
        },
        reasonIcon: {
          marginRight: 8,
        },
        reasonContent: {
          flex: 1,
        },
        reasonTitleRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        reasonTitle: {
          fontWeight: '500',
          color: colors.foreground,
        },
        reasonTitleSelected: {
          color: colors.primary,
          fontWeight: '600',
        },
        priorityIcon: {
          margin: 0,
          marginLeft: 4,
        },
        divider: {
          marginVertical: 4,
        },
        messageInput: {
          backgroundColor: colors.input,
        },
        noteCard: {
          marginBottom: 15,
          backgroundColor: colors.warningBackground,
        },
        noteContainer: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        noteText: {
          flex: 1,
          color: colors.foregroundSecondary,
        },
        callButton: {
          marginBottom: 30,
          backgroundColor: colors.primary,
          paddingVertical: 8,
        },
        successContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 30,
        },
        successTitle: {
          marginTop: 16,
          textAlign: 'center',
          color: colors.foreground,
        },
        successMessage: {
          marginTop: 8,
          textAlign: 'center',
          color: colors.foregroundSecondary,
        },
        waitingCard: {
          marginTop: 30,
          width: '100%',
          backgroundColor: colors.warningBackground,
        },
        acknowledgedCard: {
          marginTop: 30,
          width: '100%',
          backgroundColor: colors.successBackground,
        },
        waitingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        waitingText: {
          marginLeft: 12,
          color: colors.primary,
        },
        acknowledgedText: {
          marginLeft: 12,
          color: colors.success,
          fontWeight: '600',
        },
        cancelCallButton: {
          marginTop: 30,
          borderColor: colors.error,
        },
        backButton: {
          marginTop: 15,
        },
      }),
    [colors],
  );

  // Success / Waiting state
  if (callSent) {
    const isAcknowledged = callStatus === 'acknowledged';
    const isResolved = callStatus === 'resolved';

    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <IconButton
            icon={isResolved ? 'check-circle' : isAcknowledged ? 'run-fast' : 'check-circle'}
            size={80}
            iconColor={isResolved ? colors.success : isAcknowledged ? colors.success : colors.success}
          />
          <Text variant="headlineSmall" style={styles.successTitle}>
            {isAcknowledged
              ? t('callWaiter.onMyWay')
              : t('callWaiter.callSent')}
          </Text>
          <Text variant="bodyMedium" style={styles.successMessage}>
            {t('callWaiter.staffNotified')}
          </Text>

          {isAcknowledged ? (
            <Card style={styles.acknowledgedCard}>
              <Card.Content>
                <View style={styles.waitingRow}>
                  <IconButton
                    icon="run-fast"
                    size={24}
                    iconColor={colors.success}
                    style={{ margin: 0 }}
                  />
                  <Text variant="bodyMedium" style={styles.acknowledgedText}>
                    {t('callWaiter.onMyWay')}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ) : !isResolved ? (
            <Card style={styles.waitingCard}>
              <Card.Content>
                <View style={styles.waitingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.waitingText}>
                    {t('callWaiter.waitingService')}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ) : null}

          {callStatus === 'pending' && (
            <Button
              mode="outlined"
              onPress={handleCancelCall}
              loading={cancelCallMutation.isPending}
              disabled={cancelCallMutation.isPending}
              style={styles.cancelCallButton}
              textColor={colors.error}
              icon="close"
            >
              {t('callWaiter.cancelCall')}
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textColor={colors.primary}
          >
            {t('common.back')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {t('callWaiter.title')}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {t('callWaiter.selectType')}
      </Text>

      {/* Reason Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('callWaiter.reasonTitle')}
          </Text>

          <RadioButton.Group
            value={selectedReason || ''}
            onValueChange={setSelectedReason}
          >
            {CALL_REASONS.map((reason, index) => (
              <React.Fragment key={reason.id}>
                <TouchableOpacity
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.id && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={styles.reasonIcon}>
                    <IconButton
                      icon={reason.icon}
                      size={24}
                      iconColor={
                        selectedReason === reason.id
                          ? colors.primary
                          : colors.foregroundSecondary
                      }
                    />
                  </View>
                  <View style={styles.reasonContent}>
                    <View style={styles.reasonTitleRow}>
                      <Text
                        variant="bodyLarge"
                        style={[
                          styles.reasonTitle,
                          selectedReason === reason.id &&
                            styles.reasonTitleSelected,
                        ]}
                      >
                        {t(reason.titleKey)}
                      </Text>
                      {reason.priority === 'high' && (
                        <IconButton
                          icon="alert"
                          size={16}
                          iconColor={colors.error}
                          style={styles.priorityIcon}
                        />
                      )}
                    </View>
                  </View>
                  <RadioButton value={reason.id} color={colors.primary} />
                </TouchableOpacity>
                {index < CALL_REASONS.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Additional Message */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('callWaiter.addMessage')}
          </Text>
          <TextInput
            value={additionalMessage}
            onChangeText={setAdditionalMessage}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder={t('calls.message')}
            style={styles.messageInput}
          />
        </Card.Content>
      </Card>

      {/* Info Note */}
      <Card style={styles.noteCard}>
        <Card.Content>
          <View style={styles.noteContainer}>
            <IconButton
              icon="information"
              size={24}
              iconColor={colors.primary}
            />
            <Text variant="bodySmall" style={styles.noteText}>
              {t('callWaiter.paymentNote')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleCallWaiter}
        loading={createCallMutation.isPending}
        disabled={createCallMutation.isPending || !selectedReason}
        style={styles.callButton}
        buttonColor={colors.primary}
        icon="bell-ring"
      >
        {t('callWaiter.send')}
      </Button>
    </ScrollView>
  );
}

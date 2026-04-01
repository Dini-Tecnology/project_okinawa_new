/**
 * CallWaiterScreen - Call for Service
 *
 * Allows customers to call a waiter, manager, or request help/emergency
 * from their table. Posts to /calls endpoint and shows success state
 * with auto-dismiss after 3 seconds.
 *
 * @module client/screens/calls
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { gradients } from '@okinawa/shared/theme/colors';
import { ApiService } from '@okinawa/shared/services/api';
import { useWebSocket } from '@okinawa/shared/hooks/useWebSocket';

// ============================================
// TYPES
// ============================================

type CallType = 'waiter' | 'manager' | 'help' | 'emergency';

interface CallWaiterScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      tableNumber: string;
    };
  };
}

interface CallTypeOption {
  type: CallType;
  icon: string;
  labelKey: string;
  isEmergency?: boolean;
  /** Semantic color key for the icon container */
  colorKey: 'primary' | 'secondary' | 'info' | 'error';
}

interface CallPayload {
  restaurantId: string;
  tableId: string;
  callType: CallType;
  message?: string;
}

// ============================================
// CONSTANTS
// ============================================

const CALL_TYPES: CallTypeOption[] = [
  { type: 'waiter', icon: 'account', labelKey: 'calls.type.waiter', colorKey: 'primary' },
  { type: 'manager', icon: 'briefcase', labelKey: 'calls.type.manager', colorKey: 'secondary' },
  { type: 'help', icon: 'help-circle', labelKey: 'calls.type.help', colorKey: 'info' },
  { type: 'emergency', icon: 'alert', labelKey: 'calls.type.emergency', isEmergency: true, colorKey: 'error' },
];

const AUTO_DISMISS_MS = 3000;
const MAX_MESSAGE_LENGTH = 200;

// ============================================
// SKELETON
// ============================================

function CallSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ width: '60%', height: 24, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
      <View style={{ width: '80%', height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{ width: '46%', height: 100, borderRadius: 20, backgroundColor: colors.backgroundTertiary }}
          />
        ))}
      </View>
      <View style={{ width: '100%', height: 80, borderRadius: 16, backgroundColor: colors.backgroundTertiary, marginTop: 12 }} />
      <View style={{ width: '100%', height: 52, borderRadius: 16, backgroundColor: colors.backgroundTertiary, marginTop: 12 }} />
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CallWaiterScreen({ route }: CallWaiterScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const restaurantId = route?.params?.restaurantId || '';
  const tableNumber = route?.params?.tableNumber || '';

  const [selectedType, setSelectedType] = useState<CallType | null>(null);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // WebSocket connection to /calls namespace for real-time call status updates
  const { on, off, emit: wsEmit, connected } = useWebSocket('/calls');

  // Helper to get color value from colorKey
  const getTypeColor = useCallback((colorKey: string): string => {
    switch (colorKey) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'info': return colors.info;
      case 'error': return colors.error;
      default: return colors.primary;
    }
  }, [colors]);

  const getTypeBgColor = useCallback((colorKey: string): string => {
    switch (colorKey) {
      case 'primary': return `${colors.primary}1A`;
      case 'secondary': return `${colors.secondary}1A`;
      case 'info': return colors.infoBackground;
      case 'error': return colors.errorBackground;
      default: return `${colors.primary}1A`;
    }
  }, [colors]);

  // Join user room on connect so the server can send call updates
  useEffect(() => {
    if (connected) {
      wsEmit('joinUser', {});
    }
  }, [connected, wsEmit]);

  // Listen for call:updated WebSocket events
  useEffect(() => {
    if (!activeCallId) return;

    const handleCallUpdated = (data: any) => {
      if (data.id !== activeCallId) return;

      if (data.status === 'acknowledged') {
        setCallStatus('acknowledged');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (data.status === 'resolved') {
        setCallStatus('resolved');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    on('call:updated', handleCallUpdated);

    return () => {
      off('call:updated', handleCallUpdated);
    };
  }, [activeCallId, on, off]);

  // Auto-dismiss success after 3 seconds
  useEffect(() => {
    if (showSuccess && !activeCallId) {
      dismissTimer.current = setTimeout(() => {
        navigation.goBack();
      }, AUTO_DISMISS_MS);
    }
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [showSuccess, activeCallId, navigation]);

  const callMutation = useMutation({
    mutationFn: (payload: CallPayload) => ApiService.post<{ id: string }>('/calls', payload),
    onSuccess: (data: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('common.success'),
        t('calls.callWaiter.success') || 'Garçom chamado!',
      );
      setShowSuccess(true);
      if (data?.id) {
        setActiveCallId(data.id);
      }
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('common.error'),
        error.message || t('calls.callWaiter.errorMsg') || 'Não foi possível chamar o garçom. Tente novamente.',
      );
    },
  });

  const handleSubmit = useCallback(() => {
    if (!selectedType) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    callMutation.mutate({
      restaurantId,
      tableId: tableNumber,
      callType: selectedType,
      message: message.trim() || undefined,
    });
  }, [selectedType, restaurantId, tableNumber, message, callMutation]);

  const handleDismissSuccess = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    navigation.goBack();
  }, [navigation]);

  // --- Success state ---
  if (showSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          {/* Large green gradient circle */}
          <LinearGradient
            colors={[colors.success, `${colors.success}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton icon="check" size={48} iconColor={colors.primaryForeground} style={{ margin: 0 }} />
          </LinearGradient>
          <Text variant="headlineSmall" style={{ color: colors.foreground, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
            {callStatus === 'acknowledged'
              ? t('calls.callWaiter.acknowledged') || 'Garçom notificado'
              : callStatus === 'resolved'
                ? t('calls.callWaiter.resolved') || 'Resolvido'
                : t('calls.callWaiter.success')}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary, marginTop: 4, textAlign: 'center' }}>
            {callStatus === 'acknowledged'
              ? t('calls.callWaiter.acknowledgedMsg') || 'Um garçom está a caminho'
              : callStatus === 'resolved'
                ? t('calls.callWaiter.resolvedMsg') || 'Sua solicitação foi atendida'
                : t('calls.callWaiter.successMsg')}
          </Text>
          <Button mode="text" onPress={handleDismissSuccess} style={{ marginTop: 24 }} textColor={colors.primary}>
            {t('common.back')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>
            {t('calls.callWaiter.title')}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary, marginTop: 4 }}>
            {t('calls.callWaiter.select')}
          </Text>
        </View>

        {/* Call Type Buttons */}
        <View style={styles.typeGrid}>
          {CALL_TYPES.map((ct) => {
            const isSelected = selectedType === ct.type;
            const typeColor = getTypeColor(ct.colorKey);
            const typeBgColor = getTypeBgColor(ct.colorKey);
            const borderColor = isSelected ? typeColor : colors.border;
            const bgColor = isSelected ? typeBgColor : colors.card;

            return (
              <TouchableOpacity
                key={ct.type}
                style={[styles.typeButton, {
                  borderColor,
                  backgroundColor: bgColor,
                  borderWidth: isSelected ? 2 : 1,
                }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedType(ct.type);
                }}
                accessibilityRole="button"
                accessibilityLabel={t(ct.labelKey)}
                accessibilityState={{ selected: isSelected }}
              >
                {/* Icon container with semantic background */}
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: typeBgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 4,
                }}>
                  <IconButton
                    icon={ct.icon}
                    size={24}
                    iconColor={typeColor}
                    style={{ margin: 0 }}
                  />
                </View>
                <Text
                  variant="bodyLarge"
                  style={{
                    color: isSelected ? typeColor : colors.foreground,
                    fontWeight: '600',
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {t(ct.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Optional Message */}
        <View style={styles.messageSection}>
          <TextInput
            value={message}
            onChangeText={(text) => setMessage(text.slice(0, MAX_MESSAGE_LENGTH))}
            mode="outlined"
            label={t('calls.callWaiter.message')}
            multiline
            numberOfLines={3}
            maxLength={MAX_MESSAGE_LENGTH}
            right={<TextInput.Affix text={`${message.length}/${MAX_MESSAGE_LENGTH}`} />}
            style={{ backgroundColor: colors.card }}
            accessibilityLabel="Optional message for the waiter"
          />
        </View>

        {/* Submit Button — gradient from primary to accent */}
        <Pressable
          onPress={handleSubmit}
          disabled={callMutation.isPending || !selectedType}
          accessibilityRole="button"
          accessibilityLabel="Call for service"
          accessibilityState={{ disabled: callMutation.isPending || !selectedType }}
          style={({ pressed }) => [{
            marginTop: 24,
            opacity: (callMutation.isPending || !selectedType) ? 0.5 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <IconButton icon="bell-ring" size={20} iconColor={colors.primaryForeground} style={{ margin: 0 }} />
            <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 16 }}>
              {callMutation.isPending ? '...' : t('calls.callWaiter.submit')}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Error state */}
        {callMutation.isError && (
          <Text variant="bodySmall" style={{ color: colors.error, textAlign: 'center', marginTop: 12 }}>
            {t('common.error')} - {t('common.retry')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    minHeight: 120,
  },
  messageSection: {
    marginTop: 24,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});

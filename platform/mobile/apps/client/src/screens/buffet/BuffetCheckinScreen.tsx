import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { spacing, borderRadius } from '@okinawa/shared/theme/spacing';
import { typography } from '@okinawa/shared/theme/typography';
import ApiService from '@/shared/services/api';

interface BuffetCheckinProps {
  restaurantId: string;
  pricePerPerson: number;
  restaurantName: string;
}

/**
 * BuffetCheckinScreen
 *
 * Client-side screen for buffet entry. Displays a QR code for entry,
 * allows selecting the number of covers (people), shows the per-person price,
 * and provides a "Call Waiter" button after seating.
 */
export default function BuffetCheckinScreen({
  restaurantId,
  pricePerPerson,
  restaurantName,
}: BuffetCheckinProps) {
  const { t } = useI18n();
  const { isDark } = useOkinawaTheme();
  const colors = useColors();

  const [covers, setCovers] = useState(1);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [tableAssignment, setTableAssignment] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = useMemo(() => covers * pricePerPerson, [covers, pricePerPerson]);

  const handleIncrement = useCallback(() => {
    setCovers((prev) => Math.min(prev + 1, 20));
  }, []);

  const handleDecrement = useCallback(() => {
    setCovers((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleCheckin = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.post(`/buffet/${restaurantId}/checkin`, {
        covers,
      });
      setQrCode(response.qrCode);
      setTableAssignment(response.tableNumber);
      setIsCheckedIn(true);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, covers, t]);

  const handleCallWaiter = useCallback(async () => {
    try {
      await ApiService.post(`/restaurants/${restaurantId}/call-waiter`, {
        tableNumber: tableAssignment,
      });
      Alert.alert(t('common.success'), t('common.done'));
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  }, [restaurantId, tableAssignment, t]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.foreground }]}>
          {t('buffet.title')}
        </Text>
        <Text style={[typography.bodyLarge, { color: colors.foregroundSecondary }]}>
          {restaurantName}
        </Text>
      </View>

      {!isCheckedIn ? (
        <>
          {/* Cover count selector */}
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content>
              <Text style={[typography.h3, { color: colors.foreground }]}>
                {t('buffet.covers')}
              </Text>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    {
                      backgroundColor: colors.backgroundTertiary,
                      opacity: covers <= 1 ? 0.4 : 1,
                    },
                  ]}
                  onPress={handleDecrement}
                  disabled={covers <= 1}
                >
                  <Text style={[typography.h2, { color: colors.foreground }]}>-</Text>
                </TouchableOpacity>

                <Text style={[typography.displayMedium, { color: colors.primary }]}>
                  {covers}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    {
                      backgroundColor: colors.backgroundTertiary,
                      opacity: covers >= 20 ? 0.4 : 1,
                    },
                  ]}
                  onPress={handleIncrement}
                  disabled={covers >= 20}
                >
                  <Text style={[typography.h2, { color: colors.foreground }]}>+</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* Price display */}
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content>
              <View style={styles.priceRow}>
                <Text style={[typography.bodyLarge, { color: colors.foregroundSecondary }]}>
                  {t('buffet.perPerson')}
                </Text>
                <Text style={[typography.priceMedium, { color: colors.foreground }]}>
                  {formatCurrency(pricePerPerson, getLanguage())}
                </Text>
              </View>

              <Divider style={{ marginVertical: spacing[3] }} />

              <View style={styles.priceRow}>
                <Text style={[typography.h3, { color: colors.foreground }]}>
                  {t('common.total') ?? 'Total'}
                </Text>
                <Text style={[typography.priceDisplay, { color: colors.primary }]}>
                  {formatCurrency(totalPrice, getLanguage())}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Check-in button */}
          <Button
            mode="contained"
            onPress={handleCheckin}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.checkinButton, { backgroundColor: colors.primary }]}
            labelStyle={[typography.buttonLarge, { color: colors.primaryForeground }]}
          >
            {t('buffet.checkin')}
          </Button>
        </>
      ) : (
        <>
          {/* QR Code display */}
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content style={styles.qrContainer}>
              <View
                style={[
                  styles.qrPlaceholder,
                  { borderColor: colors.border },
                ]}
              >
                <Text style={[typography.displaySmall, { color: colors.foreground }]}>
                  {qrCode}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.foregroundSecondary }]}>
                  {t('qrCode.scanToJoin')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Table assignment */}
          {tableAssignment && (
            <Card style={[styles.card, { backgroundColor: colors.successBackground }]}>
              <Card.Content style={styles.tableAssignment}>
                <Text style={[typography.labelMedium, { color: colors.success }]}>
                  {t('floorFlow.tableNumber', { number: tableAssignment })}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.foregroundSecondary }]}>
                  {covers} {t('buffet.covers')} - {formatCurrency(totalPrice, getLanguage())}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Call Waiter button */}
          <Button
            mode="outlined"
            onPress={handleCallWaiter}
            style={[styles.callWaiterButton, { borderColor: colors.primary }]}
            labelStyle={[typography.buttonLarge, { color: colors.primary }]}
          >
            {t('service.callWaiter') ?? t('waiterCalls.title')}
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing[12],
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  card: {
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing[4],
    borderRadius: borderRadius.card,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    marginTop: spacing[4],
    paddingVertical: spacing[3],
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkinButton: {
    marginHorizontal: spacing.screenHorizontal,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[1],
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  tableAssignment: {
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
  },
  callWaiterButton: {
    marginHorizontal: spacing.screenHorizontal,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[1],
  },
});

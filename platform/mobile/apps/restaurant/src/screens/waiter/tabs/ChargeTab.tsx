/**
 * ChargeTab — "Cobrar" tab (global payment view)
 *
 * Displays all tables with per-guest payment status,
 * progress circles, and charge buttons for guests
 * who need waiter-assisted payment.
 *
 * @module waiter/tabs/ChargeTab
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { useWaiterPayment } from '../hooks/useWaiterPayment';
import type { WaiterTable } from '../types/waiter.types';

interface ChargeTabProps {
  tables: WaiterTable[];
}

export default function ChargeTab({ tables }: ChargeTabProps) {
  const colors = useColors();
  const { t } = useI18n();
  const payment = useWaiterPayment();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        content: {
          padding: 12,
          gap: 10,
        },
        infoBanner: {
          borderRadius: 12,
          backgroundColor: colors.primary + '08',
          borderWidth: 1,
          borderColor: colors.primary + '15',
          padding: 12,
        },
        infoBannerTitle: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.foreground,
        },
        infoBannerText: {
          fontSize: 10,
          color: colors.foregroundMuted,
          marginTop: 2,
        },
        tableCard: {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
        },
        tableHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 10,
          backgroundColor: colors.backgroundSecondary + '80',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tableNumber: {
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: colors.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tableNumberText: {
          fontWeight: '700',
          fontSize: 14,
          color: colors.primary,
        },
        tableHeaderInfo: {
          flex: 1,
        },
        tableCustomer: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foreground,
        },
        tableStats: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 2,
        },
        statText: {
          fontSize: 10,
          fontWeight: '500',
        },
        progressCircle: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        progressText: {
          fontSize: 10,
          fontWeight: '700',
          color: colors.foreground,
        },
        guestList: {
          padding: 8,
          gap: 4,
        },
        guestRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: 8,
          borderRadius: 8,
        },
        guestAvatar: {
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        guestAvatarText: {
          fontSize: 8,
          fontWeight: '700',
        },
        guestBody: {
          flex: 1,
        },
        guestName: {
          fontSize: 12,
          fontWeight: '500',
          color: colors.foreground,
        },
        guestStatus: {
          fontSize: 10,
          color: colors.foregroundMuted,
        },
        guestTotal: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.foreground,
        },
        chargeBtn: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.primary,
          marginLeft: 4,
        },
        chargeBtnText: {
          fontSize: 10,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
      }),
    [colors],
  );

  // Global payment flow (method/processing/done)
  if (payment.step !== 'guests') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <PaymentMethodSelector
          step={payment.step}
          tableNumber={0}
          guestName={payment.selectedGuestName}
          amount={0}
          isProcessing={payment.isProcessing}
          onSelectMethod={payment.selectMethod}
          onConfirm={payment.confirmPayment}
          onBack={payment.goBack}
          onNext={payment.goToNext}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>
          {t('waiter.charge.smart_billing')}
        </Text>
        <Text style={styles.infoBannerText}>
          {t('waiter.charge.info_banner')}
        </Text>
      </View>

      {/* Tables with guest payment status */}
      {tables.map((table) => {
        const guests = table.guests;
        const paidCount = guests.filter((g) => g.paid).length;
        const needsWaiter = guests.filter((g) => !g.paid && !g.hasApp);
        const waitingApp = guests.filter((g) => !g.paid && g.hasApp);

        return (
          <View key={table.id} style={styles.tableCard}>
            {/* Table header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableNumber}>
                <Text style={styles.tableNumberText}>{table.number}</Text>
              </View>
              <View style={styles.tableHeaderInfo}>
                <Text style={styles.tableCustomer}>{table.customerName}</Text>
                <View style={styles.tableStats}>
                  <Text style={[styles.statText, { color: colors.success }]}>
                    {t('waiter.charge.guests_paid_count', { paid: paidCount })}
                  </Text>
                  {waitingApp.length > 0 && (
                    <Text style={[styles.statText, { color: colors.info }]}>
                      {'\u00B7'} {t('waiter.charge.guests_app_count', { count: waitingApp.length })}
                    </Text>
                  )}
                  {needsWaiter.length > 0 && (
                    <Text style={[styles.statText, { color: colors.warning, fontWeight: '700' }]}>
                      {'\u00B7'} {t('waiter.charge.guests_no_app_count', { count: needsWaiter.length })}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>
                  {paidCount}/{guests.length}
                </Text>
              </View>
            </View>

            {/* Guest list */}
            <View style={styles.guestList}>
              {guests.map((guest) => {
                const guestTotal = guest.orders.reduce(
                  (a, o) => a + o.price * o.qty,
                  0,
                );
                const avatarColor = guest.paid
                  ? colors.success
                  : guest.hasApp
                    ? colors.info
                    : colors.warning;

                return (
                  <View
                    key={guest.id}
                    style={[
                      styles.guestRow,
                      {
                        opacity: guest.paid ? 0.4 : 1,
                        backgroundColor: !guest.paid && !guest.hasApp
                          ? colors.warning + '08'
                          : 'transparent',
                        borderWidth: !guest.paid && !guest.hasApp ? 1 : 0,
                        borderColor: colors.warning + '20',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.guestAvatar,
                        { backgroundColor: avatarColor + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.guestAvatarText, { color: avatarColor }]}
                      >
                        {guest.paid ? '\u2713' : guest.hasApp ? '\u{1F4F1}' : '!'}
                      </Text>
                    </View>
                    <View style={styles.guestBody}>
                      <Text style={styles.guestName}>{guest.name}</Text>
                      <Text style={styles.guestStatus}>
                        {guest.paid
                          ? t('waiter.charge.guest_paid_via', { method: guest.method || '' })
                          : guest.hasApp
                            ? t('waiter.charge.guest_on_app')
                            : t('waiter.charge.guest_needs_waiter')}
                      </Text>
                    </View>
                    <Text style={styles.guestTotal}>R$ {guestTotal}</Text>
                    {!guest.paid && !guest.hasApp && (
                      <TouchableOpacity
                        style={styles.chargeBtn}
                        onPress={() => payment.selectGuest(guest.name)}
                        accessibilityLabel={`${t('waiter.charge.action_charge')} ${guest.name}`}
                        accessibilityRole="button"
                      >
                        <Text style={styles.chargeBtnText}>
                          {t('waiter.charge.action_charge')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

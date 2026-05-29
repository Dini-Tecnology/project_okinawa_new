import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { RestaurantSubscreenHeader } from '../../components/restaurant/RestaurantSubscreenHeader';
import {
  SelectChip,
  SelectionSection,
  HintBanner,
  ObservationsField,
} from '../../components/restaurant/SelectionControls';
import {
  MOCK_RESERVE_DATES,
  MOCK_RESERVE_GUESTS,
  MOCK_RESERVE_TIMES,
  resolveRestaurantDetail,
} from '../../constants/restaurantDetailMocks';

export default function RestaurantReserveScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const colors = useColors();
  const { restaurantId } = (route.params ?? {}) as { restaurantId?: string };
  const restaurant = useMemo(() => resolveRestaurantDetail(restaurantId), [restaurantId]);

  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedTime, setSelectedTime] = useState('20:00');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1 },
        content: { paddingHorizontal: 16, paddingBottom: 28 },
        restaurantCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: 16,
          backgroundColor: colors.backgroundTertiary,
          marginBottom: 16,
        },
        restaurantIcon: {
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        restaurantName: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
        },
        restaurantLocation: {
          fontSize: 14,
          color: colors.foregroundSecondary,
          marginTop: 2,
        },
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },
        timeGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },
        timeChip: {
          width: '22%',
          minWidth: 72,
        },
        cta: {
          marginTop: 8,
          paddingVertical: 16,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: 'center',
        },
        ctaText: {
          color: colors.primaryForeground,
          fontSize: 16,
          fontWeight: '700',
        },
      }),
    [colors],
  );

  const handleConfirm = () => {
    const dateLabel = MOCK_RESERVE_DATES.find((d) => d.id === selectedDate)?.label ?? selectedDate;
    Alert.alert(
      'Reserva confirmada',
      `${restaurant.name}\n${dateLabel} às ${selectedTime} · ${guests} pessoa(s)`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <RestaurantSubscreenHeader title="Reservar Mesa" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.restaurantCard}>
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant-outline" size={22} color={colors.foregroundMuted} />
          </View>
          <View>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantLocation}>
              {restaurant.neighborhood}, {restaurant.city}
            </Text>
          </View>
        </View>

        <HintBanner message="Selecione data, horário e convidados para reservar" />

        <SelectionSection title="Data">
          <View style={styles.chipRow}>
            {MOCK_RESERVE_DATES.map((d) => (
              <SelectChip
                key={d.id}
                label={d.label}
                selected={selectedDate === d.id}
                onPress={() => setSelectedDate(d.id)}
              />
            ))}
          </View>
        </SelectionSection>

        <SelectionSection title="Horário">
          <View style={styles.timeGrid}>
            {MOCK_RESERVE_TIMES.map((time) => (
              <View key={time} style={styles.timeChip}>
                <SelectChip
                  label={time}
                  selected={selectedTime === time}
                  disabled={time === '21:00'}
                  onPress={() => setSelectedTime(time)}
                />
              </View>
            ))}
          </View>
        </SelectionSection>

        <SelectionSection title="Convidados">
          <View style={styles.chipRow}>
            {MOCK_RESERVE_GUESTS.map((g) => (
              <SelectChip
                key={g}
                label={g}
                variant="circle"
                selected={guests === g}
                onPress={() => setGuests(g)}
              />
            ))}
          </View>
        </SelectionSection>

        <ObservationsField value={notes} onChangeText={setNotes} />

        <TouchableOpacity
          style={styles.cta}
          onPress={handleConfirm}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Confirmar reserva"
        >
          <Text style={styles.ctaText}>Confirmar Reserva</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

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
} from '../../components/restaurant/SelectionControls';
import {
  MOCK_QUEUE_PARTY,
  MOCK_QUEUE_PREFERENCES,
  resolveRestaurantDetail,
} from '../../constants/restaurantDetailMocks';

export default function RestaurantVirtualQueueScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const colors = useColors();
  const { restaurantId } = (route.params ?? {}) as { restaurantId?: string };
  const restaurant = useMemo(() => resolveRestaurantDetail(restaurantId), [restaurantId]);

  const [partySize, setPartySize] = useState('2');
  const [preference, setPreference] = useState('qualquer');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1 },
        content: { paddingHorizontal: 16, paddingBottom: 28 },
        summaryCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: 16,
          backgroundColor: colors.backgroundTertiary,
          marginBottom: 24,
        },
        summaryIcon: {
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: '#FFF0EA',
          alignItems: 'center',
          justifyContent: 'center',
        },
        summaryName: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
        },
        summarySub: {
          fontSize: 14,
          color: colors.foregroundSecondary,
          marginTop: 2,
        },
        statusBlock: {
          alignItems: 'center',
          marginBottom: 28,
        },
        statusCircle: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#FFF0EA',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        statusTitle: {
          fontSize: 20,
          fontWeight: '800',
          color: colors.foreground,
          marginBottom: 6,
        },
        statusSub: {
          fontSize: 15,
          color: colors.foregroundSecondary,
        },
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },
        prefRow: {
          flexDirection: 'row',
          gap: 10,
        },
        prefChip: {
          flex: 1,
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

  const handleJoin = () => {
    Alert.alert(
      'Fila virtual',
      `Você entrou na fila do ${restaurant.name} para ${partySize} pessoa(s).`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <RestaurantSubscreenHeader title="Fila Virtual" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="restaurant" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryName}>{restaurant.name}</Text>
            <Text style={styles.summarySub}>
              Lotação atual:{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {restaurant.occupancy}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.statusBlock}>
          <View style={styles.statusCircle}>
            <Ionicons name="timer-outline" size={44} color={colors.primary} />
          </View>
          <Text style={styles.statusTitle}>{restaurant.queueGroups} grupos na fila</Text>
          <Text style={styles.statusSub}>
            Espera estimada: ~{restaurant.queueWaitMinutes} min
          </Text>
        </View>

        <SelectionSection title="Quantas pessoas?">
          <View style={styles.chipRow}>
            {MOCK_QUEUE_PARTY.map((n) => (
              <SelectChip
                key={n}
                label={n}
                selected={partySize === n}
                onPress={() => setPartySize(n)}
              />
            ))}
          </View>
        </SelectionSection>

        <SelectionSection title="Preferência">
          <View style={styles.prefRow}>
            {MOCK_QUEUE_PREFERENCES.map((pref) => (
              <View key={pref.id} style={styles.prefChip}>
                <SelectChip
                  label={pref.label}
                  selected={preference === pref.id}
                  onPress={() => setPreference(pref.id)}
                />
              </View>
            ))}
          </View>
        </SelectionSection>

        <TouchableOpacity
          style={styles.cta}
          onPress={handleJoin}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Entrar na fila virtual"
        >
          <Text style={styles.ctaText}>Entrar na Fila Virtual</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

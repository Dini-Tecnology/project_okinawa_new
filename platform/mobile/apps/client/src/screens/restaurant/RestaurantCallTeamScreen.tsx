import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { RestaurantSubscreenHeader } from '../../components/restaurant/RestaurantSubscreenHeader';
import {
  MOCK_CALL_TEAM_OPTIONS,
  resolveRestaurantDetail,
} from '../../constants/restaurantDetailMocks';

type RouteParams = {
  restaurantId?: string;
  tableNumber?: number;
};

export default function RestaurantCallTeamScreen() {
  const route = useRoute();
  const colors = useColors();
  const params = (route.params ?? {}) as RouteParams;
  const restaurant = useMemo(() => resolveRestaurantDetail(params.restaurantId), [params.restaurantId]);
  const tableNumber = params.tableNumber ?? restaurant.defaultTable.number;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1 },
        content: { paddingHorizontal: 16, paddingBottom: 28, gap: 12 },
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: 18,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        iconBox: {
          width: 48,
          height: 48,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        cardTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: 4,
        },
        cardSub: {
          fontSize: 13,
          lineHeight: 18,
          color: colors.foregroundSecondary,
        },
      }),
    [colors],
  );

  const handleCall = (title: string) => {
    Alert.alert(
      'Chamado enviado',
      `${title} — Mesa ${tableNumber} · ${restaurant.name}`,
      [{ text: 'OK' }],
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <RestaurantSubscreenHeader
        title="Chamar Equipe"
        subtitle={`Mesa ${tableNumber} · ${restaurant.name}`}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {MOCK_CALL_TEAM_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.card}
            onPress={() => handleCall(option.title)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={option.title}
          >
            <View style={[styles.iconBox, { backgroundColor: option.iconBg }]}>
              <Ionicons name={option.icon} size={24} color={option.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardSub}>{option.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

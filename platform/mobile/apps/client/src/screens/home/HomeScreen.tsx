import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import {
  MOCK_CATEGORIES,
  MOCK_FEATURED_RESTAURANT,
  MOCK_NEARBY_RESTAURANTS,
  MOCK_NOTIFICATION_COUNT,
  MOCK_QUICK_ACTIONS,
} from '../../constants/homeMocks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 16;

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFavorite, setIsFavorite] = useState(false);

  const featured = MOCK_FEATURED_RESTAURANT;

  const openNotifications = useCallback(() => {
    navigation.navigate('Profile', { screen: 'ProfileNotifications' });
  }, [navigation]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContent: {
          paddingBottom: 24,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingHorizontal: CARD_HORIZONTAL_PADDING,
          paddingTop: 8,
          paddingBottom: 12,
        },
        greeting: {
          color: colors.foregroundSecondary,
          fontSize: 14,
          marginBottom: 4,
        },
        headerTitle: {
          color: colors.foreground,
          fontSize: 26,
          fontWeight: '700',
          letterSpacing: -0.5,
        },
        bellButton: {
          padding: 8,
          marginTop: 4,
        },
        badge: {
          position: 'absolute',
          top: 4,
          right: 4,
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#EF4444',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        },
        badgeText: {
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: '700',
        },
        hintBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: CARD_HORIZONTAL_PADDING,
          marginBottom: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: '#FFF3EE',
          gap: 10,
        },
        hintText: {
          flex: 1,
          color: colors.primary,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 20,
        },
        searchWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: CARD_HORIZONTAL_PADDING,
          marginBottom: 16,
          paddingHorizontal: 14,
          height: 48,
          borderRadius: 14,
          backgroundColor: colors.backgroundTertiary,
          gap: 10,
        },
        searchInput: {
          flex: 1,
          fontSize: 15,
          color: colors.foreground,
          padding: 0,
        },
        chipsRow: {
          paddingHorizontal: CARD_HORIZONTAL_PADDING,
          gap: 8,
          paddingBottom: 4,
        },
        chip: {
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 24,
          backgroundColor: colors.backgroundTertiary,
        },
        chipSelected: {
          backgroundColor: colors.primary,
        },
        chipText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foregroundSecondary,
        },
        chipTextSelected: {
          color: colors.primaryForeground,
        },
        chipScroll: {
          marginBottom: 16,
        },
        featuredCard: {
          marginHorizontal: CARD_HORIZONTAL_PADDING,
          marginBottom: 20,
          borderRadius: 20,
          overflow: 'hidden',
          height: SCREEN_WIDTH * 0.62,
          backgroundColor: colors.backgroundTertiary,
        },
        featuredImage: {
          ...StyleSheet.absoluteFillObject,
          width: '100%',
          height: '100%',
        },
        featuredGradient: {
          ...StyleSheet.absoluteFillObject,
        },
        featuredTopRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: 14,
        },
        tapPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
        },
        tapPillText: {
          color: colors.primaryForeground,
          fontSize: 13,
          fontWeight: '600',
        },
        favoriteBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0,0,0,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        featuredBottom: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
        },
        ratingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6,
        },
        ratingText: {
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '600',
        },
        featuredName: {
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: '700',
          marginBottom: 4,
        },
        featuredMeta: {
          color: 'rgba(255,255,255,0.9)',
          fontSize: 14,
        },
        quickActions: {
          flexDirection: 'row',
          paddingHorizontal: CARD_HORIZONTAL_PADDING,
          gap: 10,
          marginBottom: 24,
        },
        quickAction: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 14,
          borderRadius: 16,
          backgroundColor: colors.backgroundSecondary,
        },
        quickActionLabel: {
          marginTop: 8,
          fontSize: 12,
          color: colors.foregroundSecondary,
          fontWeight: '500',
          textAlign: 'center',
        },
        sectionTitle: {
          paddingHorizontal: CARD_HORIZONTAL_PADDING,
          marginBottom: 12,
          color: colors.foreground,
          fontSize: 18,
          fontWeight: '700',
        },
        nearbyItem: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: CARD_HORIZONTAL_PADDING,
          padding: 14,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        nearbyIcon: {
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: '#FFF3EE',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        },
        nearbyInfo: {
          flex: 1,
        },
        nearbyName: {
          color: colors.foreground,
          fontWeight: '700',
          fontSize: 16,
          marginBottom: 4,
        },
        nearbySub: {
          color: colors.foregroundSecondary,
          fontSize: 14,
        },
        nearbyRating: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        nearbyRatingText: {
          color: colors.foreground,
          fontWeight: '600',
          fontSize: 14,
        },
      }),
    [colors],
  );

  const handleRestaurantPress = useCallback(
    (restaurantId: string = featured.id) => {
      navigation.navigate('Restaurant', { restaurantId });
    },
    [navigation, featured.id],
  );

  const handleQuickAction = useCallback(
    (route: string, params?: Record<string, unknown>) => {
      if (route === 'MenuTab') {
        navigation.navigate('MenuTab');
        return;
      }
      navigation.navigate(route as never, params as never);
    },
    [navigation],
  );

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getTimeGreeting()}</Text>
            <Text style={styles.headerTitle}>Descubra experiências</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={openNotifications}
            accessibilityRole="button"
            accessibilityLabel="Notificações"
          >
            <Ionicons name="notifications-outline" size={26} color={colors.foreground} />
            {MOCK_NOTIFICATION_COUNT > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{MOCK_NOTIFICATION_COUNT}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <TouchableOpacity
          style={styles.hintBanner}
          activeOpacity={0.85}
          onPress={() => handleRestaurantPress()}
          accessibilityRole="button"
          accessibilityLabel="Toque no restaurante para começar sua jornada"
        >
          <Ionicons name="flash" size={20} color={colors.primary} />
          <Text style={styles.hintText}>
            Toque no restaurante para começar sua jornada
          </Text>
        </TouchableOpacity>

        {/* Busca */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.foregroundMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes, pratos..."
            placeholderTextColor={colors.foregroundMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Buscar restaurantes e pratos"
          />
        </View>

        {/* Categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipScroll}
        >
          {MOCK_CATEGORIES.map((cat) => {
            const selected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Card destaque */}
        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.92}
          onPress={() => handleRestaurantPress()}
          accessibilityRole="button"
          accessibilityLabel={`${featured.name}, ${featured.rating} estrelas`}
        >
          <Image
            source={{ uri: featured.imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.featuredGradient}
          />
          <View style={styles.featuredTopRow}>
            <View style={styles.tapPill}>
              <Ionicons name="flash" size={14} color={colors.primaryForeground} />
              <Text style={styles.tapPillText}>Toque aqui</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={() => setIsFavorite((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.featuredBottom}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {featured.rating} ({featured.reviewCount})
              </Text>
            </View>
            <Text style={styles.featuredName}>{featured.name}</Text>
            <Text style={styles.featuredMeta}>
              {featured.cuisine} · {featured.priceLevel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Ações rápidas */}
        <View style={styles.quickActions}>
          {MOCK_QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={() =>
                handleQuickAction(
                  action.route,
                  'params' in action ? action.params : undefined,
                )
              }
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Ionicons name={action.icon} size={26} color={colors.primary} />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Perto de você */}
        <Text style={styles.sectionTitle}>Perto de você</Text>
        {MOCK_NEARBY_RESTAURANTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.nearbyItem}
            onPress={() => handleRestaurantPress(item.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.distanceM} metros`}
          >
            <View style={styles.nearbyIcon}>
              <Ionicons name="restaurant" size={26} color={colors.primary} />
            </View>
            <View style={styles.nearbyInfo}>
              <Text style={styles.nearbyName}>{item.name}</Text>
              <Text style={styles.nearbySub}>
                {item.cuisine} · {item.distanceM}m
              </Text>
            </View>
            <View style={styles.nearbyRating}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.nearbyRatingText}>{item.rating}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

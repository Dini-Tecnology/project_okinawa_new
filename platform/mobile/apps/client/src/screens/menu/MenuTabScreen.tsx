import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import {
  MOCK_MENU_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_MENU_RESTAURANT,
  type MockMenuCategoryId,
  type MockMenuItem,
} from '../../constants/menuTabMocks';

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(0)}`;
}

type MenuTabStyles = ReturnType<typeof createStyles>;

function MenuListItem({
  item,
  onPress,
  styles,
  mutedColor,
}: {
  item: MockMenuItem;
  onPress: () => void;
  styles: MenuTabStyles;
  mutedColor: string;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatPrice(item.price)}`}
    >
      <Image
        source={item.image}
        style={styles.menuImage}
        resizeMode="cover"
        accessibilityLabel={`Foto de ${item.name}`}
      />
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.popular && (
            <View style={styles.popularTag}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuFooter}>
          <Text style={styles.menuPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.prepTime}>
            <Ionicons name="time-outline" size={14} color={mutedColor} />
            <Text style={styles.prepTimeText}>{item.prepMinutes}min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: {
  background: string;
  backgroundTertiary: string;
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  primary: string;
  primaryForeground: string;
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.foreground,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 16,
    },
    quickBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.backgroundTertiary,
    },
    quickBtnAccent: {
      backgroundColor: '#FFF3EE',
      borderWidth: 1,
      borderColor: '#FFD4C2',
    },
    quickBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.foreground,
    },
    quickBtnTextAccent: {
      color: colors.primary,
    },
    categoryScroll: {
      marginBottom: 8,
    },
    categoryRow: {
      paddingHorizontal: 16,
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: colors.backgroundTertiary,
    },
    categoryChipActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foregroundSecondary,
    },
    categoryTextActive: {
      color: colors.primaryForeground,
    },
    progressTrack: {
      height: 4,
      marginHorizontal: 16,
      marginBottom: 14,
      borderRadius: 2,
      backgroundColor: colors.backgroundTertiary,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: colors.foregroundMuted,
    },
    hintBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: '#FFF3EE',
      borderWidth: 1,
      borderColor: '#FFD4C2',
      gap: 10,
    },
    hintText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: colors.primary,
      lineHeight: 18,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 88,
      gap: 14,
    },
    menuItem: {
      flexDirection: 'row',
      gap: 14,
    },
    menuImage: {
      width: 88,
      height: 88,
      borderRadius: 14,
      backgroundColor: colors.backgroundTertiary,
    },
    menuContent: {
      flex: 1,
      justifyContent: 'center',
    },
    menuTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 4,
    },
    menuName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      flexShrink: 1,
    },
    popularTag: {
      backgroundColor: '#FFF3EE',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    popularText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    menuDescription: {
      fontSize: 13,
      color: colors.foregroundSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    menuFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    prepTime: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    prepTimeText: {
      fontSize: 12,
      color: colors.foregroundMuted,
    },
  });
}

/** Aba Cardápio — layout conforme mockup, dados mockados */
export default function MenuTabScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<MockMenuCategoryId>('entradas');

  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredItems = useMemo(
    () => MOCK_MENU_ITEMS.filter((item) => item.categoryId === selectedCategory),
    [selectedCategory],
  );

  const categoryIndex = MOCK_MENU_CATEGORIES.findIndex((c) => c.id === selectedCategory);
  const progress =
    MOCK_MENU_CATEGORIES.length > 1
      ? (categoryIndex + 1) / MOCK_MENU_CATEGORIES.length
      : 1;

  const goHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const openComanda = useCallback(() => {
    navigation.navigate('TabScreen', {
      restaurantId: MOCK_MENU_RESTAURANT.id,
      tableNumber: MOCK_MENU_RESTAURANT.tableNumber,
    });
  }, [navigation]);

  const callWaiter = useCallback(() => {
    navigation.navigate('CallWaiter', {
      restaurantId: MOCK_MENU_RESTAURANT.id,
      tableNumber: MOCK_MENU_RESTAURANT.tableNumber,
    });
  }, [navigation]);

  const openPairing = useCallback(() => {
    Alert.alert(
      'Harmonização IA',
      'Assistente de harmonização em breve. Selecione pratos para receber sugestões personalizadas.',
    );
  }, []);

  const onItemPress = useCallback(
    (item: MockMenuItem) => {
      navigation.navigate('MenuItemDetail', { itemId: item.id });
    },
    [navigation],
  );

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={goHome}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao início"
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cardápio</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={openComanda}
            accessibilityRole="button"
            accessibilityLabel="Ver comanda"
          >
            <Ionicons name="receipt-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Ações rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={callWaiter}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Chamar garçom"
          >
            <Ionicons name="flame" size={18} color={colors.primary} />
            <Text style={styles.quickBtnText}>Chamar Garçom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, styles.quickBtnAccent]}
            onPress={openPairing}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Harmonização IA"
          >
            <MaterialCommunityIcons name="brain" size={20} color={colors.primary} />
            <Text style={[styles.quickBtnText, styles.quickBtnTextAccent]}>Harmonização IA</Text>
          </TouchableOpacity>
        </View>

        {/* Categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRow}
        >
          {MOCK_MENU_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Barra de progresso */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Banner */}
        <View style={styles.hintBanner}>
          <Ionicons name="flash" size={18} color={colors.primary} />
          <Text style={styles.hintText}>
            Toque em um prato para ver detalhes e adicionar à comanda
          </Text>
        </View>

        {/* Lista de pratos */}
        <View style={styles.listContent}>
          {filteredItems.map((item) => (
            <MenuListItem
              key={item.id}
              item={item}
              styles={styles}
              mutedColor={colors.foregroundMuted}
              onPress={() => onItemPress(item)}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

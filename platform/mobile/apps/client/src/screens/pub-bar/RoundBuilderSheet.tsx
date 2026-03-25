/**
 * RoundBuilderSheet — Bottom sheet for building a round of drinks
 *
 * Displayed as a Modal with Animated slide-up, since @gorhom/bottom-sheet
 * is not available in the project dependencies.
 *
 * Features:
 * - Drink menu grouped by category (Beer, Wine, Spirits, Cocktails, Soft Drinks)
 * - Search bar for filtering items
 * - Quantity counters with haptic feedback
 * - Running total for the round
 * - "Add to Tab" CTA that sends items via POST /tabs/:tabId/items
 *
 * @module client/screens/pub-bar/RoundBuilderSheet
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Chip,
  Searchbar,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';

import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { t, getLanguage } from '@/shared/i18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import ApiService from '@/shared/services/api';
import { queryKeys } from '@/shared/config/react-query';
import { useTab } from '../../hooks/useTab';
import type { AddTabItemPayload } from '../../hooks/useTab';

// ============================================
// TYPES
// ============================================

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url?: string | null;
  is_available: boolean;
}

interface RoundItem {
  menuItem: MenuItem;
  quantity: number;
}

interface RoundBuilderSheetProps {
  visible: boolean;
  onDismiss: () => void;
  tabId: string;
  restaurantId: string;
}

// ============================================
// CONSTANTS
// ============================================

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

const DRINK_CATEGORIES = [
  { key: 'all', label: 'all', icon: 'view-grid' },
  { key: 'beer', label: 'Beer', icon: 'beer' },
  { key: 'wine', label: 'Wine', icon: 'glass-wine' },
  { key: 'spirits', label: 'Spirits', icon: 'bottle-wine' },
  { key: 'cocktails', label: 'Cocktails', icon: 'glass-cocktail' },
  { key: 'soft_drinks', label: 'Soft Drinks', icon: 'cup-water' },
];

// ============================================
// QUANTITY COUNTER
// ============================================

function QuantityCounter({
  quantity,
  onAdd,
  onRemove,
  colors,
}: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary || colors.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {quantity > 0 ? (
        <>
          <IconButton
            icon="minus"
            size={18}
            onPress={onRemove}
            iconColor={colors.error}
            accessibilityLabel={t('common.remove')}
          />
          <Text
            variant="titleSmall"
            style={{ minWidth: 24, textAlign: 'center', color: colors.foreground, fontWeight: 'bold' }}
          >
            {quantity}
          </Text>
          <IconButton
            icon="plus"
            size={18}
            onPress={onAdd}
            iconColor={colors.primary}
            accessibilityLabel={t('common.add')}
          />
        </>
      ) : (
        <IconButton
          icon="plus"
          size={18}
          onPress={onAdd}
          iconColor={colors.primary}
          accessibilityLabel={t('common.add')}
        />
      )}
    </View>
  );
}

// ============================================
// DRINK ITEM ROW
// ============================================

function DrinkItemRow({
  item,
  quantity,
  onAdd,
  onRemove,
  colors,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: quantity > 0 ? (colors.primaryBackground || colors.background) : 'transparent',
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text
          variant="titleSmall"
          style={{ color: colors.foreground, fontWeight: '600' }}
        >
          {item.name}
        </Text>
        {item.description ? (
          <Text
            variant="bodySmall"
            style={{ color: colors.mutedForeground, marginTop: 2 }}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
        <Text
          variant="bodyMedium"
          style={{ color: colors.primary, fontWeight: '600', marginTop: 2 }}
        >
          {formatCurrency(Number(item.price), getLanguage())}
        </Text>
      </View>
      <QuantityCounter
        quantity={quantity}
        onAdd={onAdd}
        onRemove={onRemove}
        colors={colors}
      />
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoundBuilderSheet({
  visible,
  onDismiss,
  tabId,
  restaurantId,
}: RoundBuilderSheetProps) {
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [roundItems, setRoundItems] = useState<Map<string, RoundItem>>(new Map());

  const { addItem, isAddingItem } = useTab(tabId);

  // Fetch drink menu for this restaurant
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: queryKeys.restaurants.menu(restaurantId),
    queryFn: () => ApiService.get(`/restaurants/${restaurantId}/menu-items`, {
      params: { category_type: 'drinks', is_available: true },
    }),
    enabled: visible && !!restaurantId,
  });

  // Animate sheet in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  // Round total
  const roundTotal = useMemo(() => {
    let total = 0;
    roundItems.forEach((roundItem) => {
      total += Number(roundItem.menuItem.price) * roundItem.quantity;
    });
    return total;
  }, [roundItems]);

  // Total items in round
  const roundItemCount = useMemo(() => {
    let count = 0;
    roundItems.forEach((roundItem) => {
      count += roundItem.quantity;
    });
    return count;
  }, [roundItems]);

  // Add item to round
  const handleAdd = useCallback(
    (item: MenuItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRoundItems((prev) => {
        const next = new Map(prev);
        const existing = next.get(item.id);
        if (existing) {
          next.set(item.id, { ...existing, quantity: existing.quantity + 1 });
        } else {
          next.set(item.id, { menuItem: item, quantity: 1 });
        }
        return next;
      });
    },
    [],
  );

  // Remove item from round
  const handleRemove = useCallback(
    (item: MenuItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRoundItems((prev) => {
        const next = new Map(prev);
        const existing = next.get(item.id);
        if (existing && existing.quantity > 1) {
          next.set(item.id, { ...existing, quantity: existing.quantity - 1 });
        } else {
          next.delete(item.id);
        }
        return next;
      });
    },
    [],
  );

  // Submit round to tab
  const handleSubmitRound = useCallback(async () => {
    if (roundItems.size === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const items: AddTabItemPayload[] = [];
    roundItems.forEach((roundItem) => {
      items.push({
        menu_item_id: roundItem.menuItem.id,
        quantity: roundItem.quantity,
        unit_price: Number(roundItem.menuItem.price),
      });
    });

    try {
      // Send each item individually as the backend expects AddTabItemDto (single item)
      for (const item of items) {
        await addItem(item);
      }

      // Clear round and close sheet
      setRoundItems(new Map());
      setSearchQuery('');
      setSelectedCategory('all');
      onDismiss();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  }, [roundItems, addItem, onDismiss]);

  // Close sheet and reset
  const handleClose = useCallback(() => {
    setRoundItems(new Map());
    setSearchQuery('');
    setSelectedCategory('all');
    onDismiss();
  }, [onDismiss]);

  // Memoized styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        sheet: {
          height: SHEET_HEIGHT,
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
        },
        handle: {
          width: 40,
          height: 4,
          backgroundColor: colors.border,
          borderRadius: 2,
          alignSelf: 'center',
          marginTop: 8,
          marginBottom: 4,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          color: colors.foreground,
          fontWeight: 'bold',
        },
        searchContainer: {
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        categoryChips: {
          paddingHorizontal: 16,
          paddingBottom: 8,
        },
        categoryChip: {
          marginRight: 8,
        },
        listContent: {
          paddingBottom: 100,
        },
        emptyContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        },
        emptyText: {
          color: colors.mutedForeground,
          marginTop: 12,
        },
        footer: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 28,
        },
        footerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        },
        totalLabel: {
          color: colors.mutedForeground,
        },
        totalAmount: {
          color: colors.foreground,
          fontWeight: 'bold',
        },
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 80,
        },
      }),
    [colors],
  );

  // --- Render drink item ---
  const renderDrinkItem = useCallback(
    ({ item }: { item: MenuItem }) => {
      const roundItem = roundItems.get(item.id);
      const quantity = roundItem?.quantity || 0;

      return (
        <DrinkItemRow
          item={item}
          quantity={quantity}
          onAdd={() => handleAdd(item)}
          onRemove={() => handleRemove(item)}
          colors={colors}
        />
      );
    },
    [roundItems, handleAdd, handleRemove, colors],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Drag handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <Text variant="titleLarge" style={styles.headerTitle}>
                  {t('tab.round.title')}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleClose}
                  accessibilityLabel={t('common.close')}
                />
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder={t('tab.round.search')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ backgroundColor: colors.card, elevation: 0 }}
                />
              </View>

              {/* Category Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChips}
              >
                {DRINK_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.key}
                    icon={cat.icon}
                    selected={selectedCategory === cat.key}
                    onPress={() => setSelectedCategory(cat.key)}
                    style={styles.categoryChip}
                    mode={selectedCategory === cat.key ? 'flat' : 'outlined'}
                  >
                    {cat.key === 'all' ? t('common.all') : cat.label}
                  </Chip>
                ))}
              </ScrollView>

              {/* Drink List */}
              {menuLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredItems}
                  renderItem={renderDrinkItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Icon
                        name="glass-mug-variant"
                        size={48}
                        color={colors.foregroundMuted || colors.mutedForeground}
                      />
                      <Text variant="bodyLarge" style={styles.emptyText}>
                        {t('tab.round.empty')}
                      </Text>
                    </View>
                  }
                />
              )}

              {/* Footer with total and CTA */}
              {roundItemCount > 0 && (
                <View style={styles.footer}>
                  <View style={styles.footerRow}>
                    <Text variant="bodyLarge" style={styles.totalLabel}>
                      {t('tab.round.total')} ({roundItemCount} {t('tab.items')})
                    </Text>
                    <Text variant="titleLarge" style={styles.totalAmount}>
                      {formatCurrency(roundTotal, getLanguage())}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={handleSubmitRound}
                    loading={isAddingItem}
                    disabled={isAddingItem || roundItemCount === 0}
                    icon="plus-circle"
                    accessibilityLabel={t('tab.round.add')}
                  >
                    {t('tab.round.add')}
                  </Button>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * RoundBuilderSheet - Add a Round of Items to the Tab
 *
 * Screen for building a new round with filter chips, search,
 * menu item list with quantity controls, cart summary, and submit.
 *
 * @module client/screens/pub
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Chip,
  Searchbar,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ApiService } from '@okinawa/shared/services/api';

// ============================================
// TYPES
// ============================================

interface RoundBuilderSheetProps {
  route?: {
    params?: {
      tabId: string;
      restaurantId: string;
    };
  };
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string | null;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

type FilterCategory = 'all' | 'drinks' | 'food' | 'snacks';

// ============================================
// CONSTANTS
// ============================================

const FILTERS: { key: FilterCategory; labelKey: string }[] = [
  { key: 'all', labelKey: 'tab.round.builder.filter.all' },
  { key: 'drinks', labelKey: 'tab.round.builder.filter.drinks' },
  { key: 'food', labelKey: 'tab.round.builder.filter.food' },
  { key: 'snacks', labelKey: 'tab.round.builder.filter.snacks' },
];

// ============================================
// SKELETON
// ============================================

function BuilderSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <View style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: colors.backgroundTertiary }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ width: 70, height: 32, borderRadius: 16, backgroundColor: colors.backgroundTertiary }} />
        ))}
      </View>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: 48, borderRadius: 8, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: 60, height: 32, borderRadius: 16, backgroundColor: colors.backgroundTertiary }} />
        </View>
      ))}
    </View>
  );
}

// ============================================
// MENU ITEM ROW
// ============================================

function MenuItemRow({
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
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyLarge" style={{ color: colors.foreground, fontWeight: '600' }}>{item.name}</Text>
        {item.description ? (
          <Text variant="bodySmall" style={{ color: colors.foregroundSecondary }} numberOfLines={1}>{item.description}</Text>
        ) : null}
        <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600', marginTop: 2 }}>
          R$ {Number(item.price).toFixed(2)}
        </Text>
      </View>
      <View style={styles.quantityControl}>
        {quantity > 0 ? (
          <>
            <IconButton icon="minus" size={18} onPress={onRemove} iconColor={colors.error} style={{ margin: 0 }} />
            <Text variant="titleSmall" style={{ minWidth: 24, textAlign: 'center', color: colors.foreground, fontWeight: '700' }}>
              {quantity}
            </Text>
          </>
        ) : null}
        <IconButton icon="plus" size={18} onPress={onAdd} iconColor={colors.primary} style={{ margin: 0 }} />
      </View>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoundBuilderSheet({ route }: RoundBuilderSheetProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const tabId = route?.params?.tabId || '';
  const restaurantId = route?.params?.restaurantId || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());

  // Fetch menu items
  const { data: menuItems = [], isLoading, isError } = useQuery<MenuItem[]>({
    queryKey: ['menu-items', restaurantId],
    queryFn: async () => {
      const response = await ApiService.get(`/menu-items?restaurantId=${restaurantId}`);
      return response.data || response || [];
    },
    enabled: !!restaurantId,
  });

  // Submit round mutation
  const addRoundMutation = useMutation({
    mutationFn: (items: Array<{ menuItemId: string; quantity: number; unitPrice: number }>) =>
      ApiService.post(`/tabs/${tabId}/rounds`, { items }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  // Filter items
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (selectedFilter !== 'all') {
      items = items.filter((item) => item.category?.toLowerCase().includes(selectedFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, selectedFilter, searchQuery]);

  // Cart computations
  const cartTotal = useMemo(() => {
    let total = 0;
    cart.forEach((ci) => { total += Number(ci.menuItem.price) * ci.quantity; });
    return total;
  }, [cart]);

  const cartItemCount = useMemo(() => {
    let count = 0;
    cart.forEach((ci) => { count += ci.quantity; });
    return count;
  }, [cart]);

  const handleAdd = useCallback((item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      next.set(item.id, { menuItem: item, quantity: (existing?.quantity || 0) + 1 });
      return next;
    });
  }, []);

  const handleRemove = useCallback((item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing && existing.quantity > 1) {
        next.set(item.id, { ...existing, quantity: existing.quantity - 1 });
      } else {
        next.delete(item.id);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (cart.size === 0) return;
    const items: Array<{ menuItemId: string; quantity: number; unitPrice: number }> = [];
    cart.forEach((ci) => {
      items.push({ menuItemId: ci.menuItem.id, quantity: ci.quantity, unitPrice: Number(ci.menuItem.price) });
    });
    addRoundMutation.mutate(items);
  }, [cart, addRoundMutation]);

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => {
      const cartItem = cart.get(item.id);
      return (
        <MenuItemRow
          item={item}
          quantity={cartItem?.quantity || 0}
          onAdd={() => handleAdd(item)}
          onRemove={() => handleRemove(item)}
          colors={colors}
        />
      );
    },
    [cart, handleAdd, handleRemove, colors],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={{ fontSize: 48, marginBottom: 8 }}>🔍</Text>
        <Text variant="bodyLarge" style={{ color: colors.foregroundMuted, textAlign: 'center' }}>
          {t('tab.round.builder.empty')}
        </Text>
      </View>
    ),
    [colors],
  );

  // --- Loading ---
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>
            {t('tab.round.builder.title')}
          </Text>
        </View>
        <BuilderSkeleton colors={colors} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>
          {t('tab.round.builder.title')}
        </Text>
      </View>

      {/* Search */}
      <Searchbar
        placeholder={t('tab.round.builder.search')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[styles.searchbar, { backgroundColor: colors.card }]}
        elevation={0}
      />

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            selected={selectedFilter === f.key}
            onPress={() => setSelectedFilter(f.key)}
            mode={selectedFilter === f.key ? 'flat' : 'outlined'}
            style={styles.filterChip}
          >
            {t(f.labelKey)}
          </Chip>
        ))}
      </ScrollView>

      {/* Error state */}
      {isError && (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={{ color: colors.error }}>{t('common.error')}</Text>
        </View>
      )}

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: cartItemCount > 0 ? 140 : 40 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary + Submit */}
      {cartItemCount > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.footerRow}>
            <Text variant="bodyLarge" style={{ color: colors.foregroundSecondary }}>
              {t('tab.round.builder.subtotal')} ({cartItemCount})
            </Text>
            <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: '700' }}>
              R$ {cartTotal.toFixed(2)}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={addRoundMutation.isPending}
            disabled={addRoundMutation.isPending}
            icon="plus-circle"
          >
            {t('tab.round.builder.add')}
          </Button>
        </View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  searchbar: { marginHorizontal: 16, marginBottom: 8, borderRadius: 8 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterChip: { marginRight: 4 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  quantityControl: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
  },
  footerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
});

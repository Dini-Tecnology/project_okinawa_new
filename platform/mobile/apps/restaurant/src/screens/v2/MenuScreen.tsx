import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { UtensilsCrossed, Plus, Tag, Eye, EyeOff } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import { V2Shell } from './shared/V2Shell';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_name?: string;
  category_id?: string;
  is_available: boolean;
  image_url?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function MenuScreen() {
  const colors = useColors();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const buildCategories = (raw: MenuItem[]): MenuCategory[] => {
    const catMap = new Map<string, MenuCategory>();
    for (const item of raw) {
      const catId = item.category_id ?? '__uncategorized';
      const catName = item.category_name ?? 'Sem categoria';
      if (!catMap.has(catId)) catMap.set(catId, { id: catId, name: catName, items: [] });
      catMap.get(catId)!.items.push(item);
    }
    return [...catMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  };

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await supabaseApiAdapter.getMenu(undefined, showAll);
      const items: MenuItem[] = Array.isArray(data) ? data : [];
      setCategories(buildCategories(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cardápio');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showAll]);

  useEffect(() => { void load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); void load(); };

  const toggleItem = async (item: MenuItem) => {
    setToggling(item.id);
    try {
      await supabaseApiAdapter.toggleMenuItem(item.id, !item.is_available);
      void load();
    } catch (err) {
      console.warn('Erro ao alterar disponibilidade:', err);
    } finally {
      setToggling(null);
    }
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const availableItems = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.is_available).length,
    0,
  );

  return (
    <V2Shell
      title="Cardápio"
      subtitle="Gestão de itens e categorias"
      showBack
      headerRight={
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}40`, borderWidth: 1 }]}
          onPress={() => setShowAll((v) => !v)}
        >
          {showAll ? <Eye size={14} color={colors.primary} /> : <EyeOff size={14} color={colors.primary} />}
          <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 4 }}>
            {showAll ? 'Todos' : 'Ativos'}
          </Text>
        </TouchableOpacity>
      }
    >
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text style={{ textAlign: 'center', color: colors.foregroundSecondary, marginTop: 24 }}>
            Carregando cardápio…
          </Text>
        )}
        {error && (
          <Text style={{ textAlign: 'center', color: '#EF4444', marginTop: 24 }}>{error}</Text>
        )}

        {!loading && !error && (
          <>
            {/* Summary */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <UtensilsCrossed size={18} color={colors.primary} />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>
                  {availableItems}
                </Text>
                <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Disponíveis</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Tag size={18} color="#F59E0B" />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>
                  {categories.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Categorias</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Plus size={18} color="#6366F1" />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>
                  {totalItems}
                </Text>
                <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Total</Text>
              </View>
            </View>

            {categories.length === 0 && (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <UtensilsCrossed size={32} color={colors.foregroundSecondary} />
                <Text style={{ color: colors.foregroundSecondary, marginTop: 10, textAlign: 'center' }}>
                  Nenhum item cadastrado no cardápio.
                </Text>
              </View>
            )}

            {categories.map((cat) => (
              <View key={cat.id} style={{ marginBottom: 20 }}>
                <Text style={[styles.catTitle, { color: colors.foreground }]}>{cat.name}</Text>
                <View style={[styles.itemList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {cat.items.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.itemRow,
                        index < cat.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        !item.is_available && { opacity: 0.5 },
                      ]}
                    >
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.thumb} />
                      ) : (
                        <View style={[styles.thumbPlaceholder, { backgroundColor: `${colors.primary}15` }]}>
                          <UtensilsCrossed size={18} color={colors.primary} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: colors.foreground }}>{item.name}</Text>
                        {item.description ? (
                          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.foregroundSecondary }}>
                            {item.description}
                          </Text>
                        ) : null}
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 2 }}>
                          {fmt(item.price)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.availBtn,
                          {
                            backgroundColor: item.is_available ? '#F0FDF4' : '#FEF2F2',
                            borderColor: item.is_available ? '#22C55E' : '#EF4444',
                            opacity: toggling === item.id ? 0.6 : 1,
                          },
                        ]}
                        onPress={() => void toggleItem(item)}
                        disabled={toggling === item.id}
                      >
                        {item.is_available ? (
                          <Eye size={14} color="#22C55E" />
                        ) : (
                          <EyeOff size={14} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center' },
  catTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  itemList: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumb: { width: 48, height: 48, borderRadius: 10 },
  thumbPlaceholder: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  availBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center', marginTop: 24 },
});

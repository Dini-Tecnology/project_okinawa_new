import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, Card, Button, FAB, Chip, Searchbar, IconButton } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  allergens?: string[];
  dietary_info?: string[];
}

export default function MenuScreen({ navigation }: any) {
  const { t } = useI18n();
  const colors = useColors();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getMenu();
      const items = response.data;
      setMenuItems(items);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(items.map((item: MenuItem) => item.category))
      );
      setCategories(['all', ...uniqueCategories] as string[]);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuItems();
    setRefreshing(false);
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await ApiService.updateMenuItem(itemId, {
        is_available: !currentStatus,
      });
      loadMenuItems();
    } catch (error) {
      console.error('Failed to update item availability:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await ApiService.deleteMenuItem(itemId);
      loadMenuItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    searchbar: {
      margin: 15,
      elevation: 2,
      backgroundColor: colors.card,
    },
    categories: {
      marginBottom: 10,
    },
    categoriesContent: {
      paddingHorizontal: 15,
    },
    categoryFilterChip: {
      marginRight: 8,
    },
    list: {
      padding: 15,
    },
    card: {
      marginBottom: 15,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    headerLeft: {
      flex: 1,
      gap: 5,
    },
    headerRight: {
      alignItems: 'flex-end',
      gap: 5,
    },
    categoryChip: {
      alignSelf: 'flex-start',
    },
    title: {
      color: colors.foreground,
    },
    price: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    description: {
      marginVertical: 10,
      color: colors.foregroundSecondary,
    },
    details: {
      marginTop: 10,
      gap: 8,
    },
    detailText: {
      color: colors.foregroundSecondary,
    },
    allergens: {
      color: colors.error,
      fontWeight: '500',
    },
    dietaryInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
      marginTop: 5,
    },
    dietaryChip: {
      height: 24,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyText: {
      color: colors.foregroundSecondary,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.title}>{item.name}</Text>
            <Chip
              style={styles.categoryChip}
              textStyle={{ fontSize: 12 }}
            >
              {item.category}
            </Chip>
          </View>
          <View style={styles.headerRight}>
            <Text variant="titleLarge" style={styles.price}>
              R$ {item.price.toFixed(2)}
            </Text>
            <Chip
              style={{
                backgroundColor: item.is_available ? colors.success : colors.error,
              }}
              textStyle={{ color: '#fff', fontSize: 11 }}
            >
              {item.is_available ? t('menu.available') : t('menu.unavailable')}
            </Chip>
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.details}>
          <Text variant="bodySmall" style={styles.detailText}>
            {t('menu.preparationTime')}: {item.preparation_time} min
          </Text>
          {item.allergens && item.allergens.length > 0 && (
            <Text variant="bodySmall" style={styles.allergens}>
              {t('menu.allergens')}: {item.allergens.join(', ')}
            </Text>
          )}
          {item.dietary_info && item.dietary_info.length > 0 && (
            <View style={styles.dietaryInfo}>
              {item.dietary_info.map((info, index) => (
                <Chip key={index} compact style={styles.dietaryChip}>
                  {info}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          mode={item.is_available ? 'outlined' : 'contained'}
          onPress={() => toggleAvailability(item.id, item.is_available)}
          accessibilityRole="button"
          accessibilityLabel={item.is_available ? `Mark ${item.name} as unavailable` : `Mark ${item.name} as available`}
        >
          {item.is_available ? t('menu.unavailable') : t('menu.available')}
        </Button>
        <IconButton
          icon="pencil"
          onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.name}`}
        />
        <IconButton
          icon="delete"
          iconColor={colors.error}
          onPress={() => {
            Alert.alert(t('common.confirm'), t('common.confirm') + '?', [
              { text: t('common.no'), style: 'cancel' },
              { text: t('common.yes'), onPress: () => deleteItem(item.id) },
            ]);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={t('common.search')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.categories}>
        <FlashList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
              style={styles.categoryFilterChip}
              selectedColor={colors.primary}
            >
              {item === 'all' ? t('common.viewAll') : item.charAt(0).toUpperCase() + item.slice(1)}
            </Chip>
          )}
          keyExtractor={(item) => item}
          estimatedItemSize={80}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      <FlashList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={styles.emptyText}>{t('empty.menu')}</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateMenuItem')}
        accessibilityRole="button"
        accessibilityLabel={t('menu.editItem')}
      />
    </View>
  );
}

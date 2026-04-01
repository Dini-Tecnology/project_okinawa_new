/**
 * MenuItemDetailScreen - Restaurant Menu Item Details
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Card, Chip, Button, IconButton, ActivityIndicator, TextInput, Switch, Divider } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import ApiService from '@/shared/services/api';
import type { MenuItem } from '../../types';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type RouteParams = {
  MenuItemDetail: {
    itemId: string;
  };
};

export default function MenuItemDetailScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const route = useRoute<RouteProp<RouteParams, 'MenuItemDetail'>>();
  const navigation = useNavigation();
  const { itemId } = route.params;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [calories, setCalories] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [allergens, setAllergens] = useState('');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundColor: colors.background,
    },
    backButton: {
      marginTop: 16,
    },
    image: {
      width: '100%',
      height: 250,
      resizeMode: 'cover',
    },
    card: {
      margin: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    headerTitle: {
      color: colors.foreground,
    },
    headerActions: {
      flexDirection: 'row',
    },
    price: {
      color: colors.success,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    description: {
      color: colors.mutedForeground,
      marginBottom: 16,
    },
    divider: {
      marginVertical: 16,
      backgroundColor: colors.border,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    badge: {
      backgroundColor: colors.accent,
    },
    vegBadge: {
      backgroundColor: colors.successMuted,
    },
    vegText: {
      color: colors.success,
    },
    veganBadge: {
      backgroundColor: colors.successMuted,
    },
    veganText: {
      color: colors.success,
    },
    details: {
      flexDirection: 'row',
      gap: 24,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailIcon: {
      margin: 0,
      padding: 0,
      marginRight: 4,
    },
    detailText: {
      color: colors.foreground,
    },
    allergensCard: {
      backgroundColor: colors.warningBackground,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    allergensLabel: {
      fontWeight: '600',
      marginBottom: 4,
      color: colors.foreground,
    },
    allergensText: {
      color: colors.mutedForeground,
    },
    availability: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    availabilityText: {
      color: colors.foreground,
    },
    editTitle: {
      marginBottom: 24,
      color: colors.foreground,
    },
    input: {
      marginBottom: 16,
      backgroundColor: colors.card,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfInput: {
      flex: 1,
    },
    switches: {
      gap: 16,
      marginTop: 8,
      marginBottom: 24,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    switchLabel: {
      color: colors.foreground,
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    actionButton: {
      flex: 1,
    },
  }), [colors]);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const menu = await ApiService.getMenu();
      const foundItem = menu.find((i: MenuItem) => i.id === itemId);
      if (foundItem) {
        setItem(foundItem);
        populateForm(foundItem);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (menuItem: MenuItem) => {
    setName(menuItem.name);
    setDescription(menuItem.description || '');
    setPrice(menuItem.price.toFixed(2));
    setPreparationTime(menuItem.preparation_time?.toString() || '');
    setCalories(menuItem.calories?.toString() || '');
    setIsAvailable(menuItem.is_available ?? true);
    setIsVegetarian((menuItem as any).is_vegetarian || false);
    setIsVegan((menuItem as any).is_vegan || false);
    setAllergens(menuItem.allergens?.join(', ') || '');
  };

  const handleSave = async () => {
    if (!item) return;

    if (!name.trim() || !price.trim()) {
      Alert.alert(t('common.error'), t('menu.nameRequired'));
      return;
    }

    try {
      setSaving(true);
      const updatedData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        preparation_time: preparationTime ? parseInt(preparationTime) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        is_available: isAvailable,
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        allergens: allergens ? allergens.split(',').map(a => a.trim()).filter(Boolean) : [],
      };

      await ApiService.updateMenuItem(item.id, updatedData);
      setItem({ ...item, ...updatedData });
      setEditing(false);
      Alert.alert(t('common.success'), t('menu.saveSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      t('menu.deleteItem'),
      t('menu.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteMenuItem(item.id);
              Alert.alert(t('common.success'), t('menu.deleteSuccess'), [
                { text: t('common.ok'), onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert(t('common.error'), t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async () => {
    if (!item) return;

    try {
      await ApiService.toggleMenuItemAvailability(item.id);
      setItem({ ...item, is_available: !item.is_available });
      setIsAvailable(!item.is_available);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  if (loading) {
    return (
      <ScreenContainer hasKeyboard>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer hasKeyboard>
      <View style={styles.emptyContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={colors.mutedForeground} />
        <Text variant="headlineSmall" style={{ color: colors.foreground }}>{t('menu.itemNotFound')}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          {t('common.back')}
        </Button>
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer hasKeyboard>
    <ScrollView style={styles.container}>
      {item.image_url && !editing && (
        <Image source={{ uri: item.image_url }} style={styles.image} accessibilityLabel={`Photo of ${item.name}`} />
      )}

      <Card style={styles.card}>
        <Card.Content>
          {!editing ? (
            <>
              <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerTitle}>{item.name}</Text>
                <View style={styles.headerActions}>
                  <IconButton
                    icon="pencil"
                    size={24}
                    iconColor={colors.info}
                    onPress={() => setEditing(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.name}`}
                  />
                  <IconButton
                    icon="delete"
                    size={24}
                    iconColor={colors.destructive}
                    onPress={handleDelete}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.name}`}
                  />
                </View>
              </View>

              <Text variant="headlineSmall" style={styles.price}>
                R$ {item.price.toFixed(2)}
              </Text>

              {item.description && (
                <Text variant="bodyLarge" style={styles.description}>
                  {item.description}
                </Text>
              )}

              <Divider style={styles.divider} />

              <View style={styles.badges}>
                {item.category && (
                  <Chip style={styles.badge} icon="tag">
                    {typeof item.category === 'string' ? item.category : item.category.name}
                  </Chip>
                )}
                {(item as any).is_vegetarian && (
                  <Chip style={styles.vegBadge} textStyle={styles.vegText} icon="leaf">
                    {t('menu.dietaryInfo.vegetarian')}
                  </Chip>
                )}
                {(item as any).is_vegan && (
                  <Chip style={styles.veganBadge} textStyle={styles.veganText} icon="sprout">
                    {t('menu.dietaryInfo.vegan')}
                  </Chip>
                )}
              </View>

              <View style={styles.details}>
                {item.preparation_time && (
                  <View style={styles.detailRow}>
                    <IconButton icon="clock-outline" size={20} style={styles.detailIcon} iconColor={colors.mutedForeground} />
                    <Text variant="bodyMedium" style={styles.detailText}>{item.preparation_time} min</Text>
                  </View>
                )}
                {item.calories && (
                  <View style={styles.detailRow}>
                    <IconButton icon="fire" size={20} style={styles.detailIcon} iconColor={colors.mutedForeground} />
                    <Text variant="bodyMedium" style={styles.detailText}>{item.calories} kcal</Text>
                  </View>
                )}
              </View>

              {item.allergens && item.allergens.length > 0 && (
                <View style={styles.allergensCard}>
                  <Text variant="labelLarge" style={styles.allergensLabel}>
                    {t('menu.allergens')}:
                  </Text>
                  <Text variant="bodyMedium" style={styles.allergensText}>
                    {item.allergens.join(', ')}
                  </Text>
                </View>
              )}

              <Divider style={styles.divider} />

              <View style={styles.availability}>
                <Text variant="titleMedium" style={styles.availabilityText}>{t('menu.availableForSale')}</Text>
                <Switch value={item.is_available} onValueChange={handleToggleAvailability} accessibilityLabel="Toggle item availability" />
              </View>
            </>
          ) : (
            <>
              <Text variant="headlineSmall" style={styles.editTitle}>
                {t('menu.editItem')}
              </Text>

              <TextInput
                mode="outlined"
                label={t('menu.name') + ' *'}
                value={name}
                onChangeText={setName}
                style={styles.input}
                accessibilityLabel="Item name"
              />

              <TextInput
                mode="outlined"
                label={t('menu.description')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={styles.input}
                accessibilityLabel="Item description"
              />

              <TextInput
                mode="outlined"
                label={t('menu.priceLabel') + ' *'}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                style={styles.input}
                accessibilityLabel="Item price"
              />

              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  label={t('menu.prepTimeLabel')}
                  value={preparationTime}
                  onChangeText={setPreparationTime}
                  keyboardType="number-pad"
                  style={[styles.input, styles.halfInput]}
                  accessibilityLabel="Preparation time in minutes"
                />
                <TextInput
                  mode="outlined"
                  label={t('menu.calories')}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="number-pad"
                  style={[styles.input, styles.halfInput]}
                  accessibilityLabel="Calories"
                />
              </View>

              <TextInput
                mode="outlined"
                label={t('menu.allergensHint')}
                value={allergens}
                onChangeText={setAllergens}
                placeholder={t('menu.allergensPlaceholder')}
                style={styles.input}
                accessibilityLabel="Allergens, comma separated"
              />

              <View style={styles.switches}>
                <View style={styles.switchRow}>
                  <Text variant="bodyLarge" style={styles.switchLabel}>{t('menu.available')}</Text>
                  <Switch value={isAvailable} onValueChange={setIsAvailable} accessibilityLabel="Available for sale" />
                </View>
                <View style={styles.switchRow}>
                  <Text variant="bodyLarge" style={styles.switchLabel}>{t('menu.dietaryInfo.vegetarian')}</Text>
                  <Switch value={isVegetarian} onValueChange={setIsVegetarian} accessibilityLabel="Vegetarian" />
                </View>
                <View style={styles.switchRow}>
                  <Text variant="bodyLarge" style={styles.switchLabel}>{t('menu.dietaryInfo.vegan')}</Text>
                  <Switch value={isVegan} onValueChange={setIsVegan} accessibilityLabel="Vegan" />
                </View>
              </View>

              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    populateForm(item);
                    setEditing(false);
                  }}
                  style={styles.actionButton}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel editing item"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.actionButton}
                  loading={saving}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Save item changes"
                >
                  {t('common.save')}
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
    </ScreenContainer>
  );
}

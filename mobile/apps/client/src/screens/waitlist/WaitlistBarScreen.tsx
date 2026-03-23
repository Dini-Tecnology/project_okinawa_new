import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Card, Button, IconButton, Divider, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ApiService } from '@okinawa/shared/services/api';

interface BarMenuItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: string;
}

interface CartItem extends BarMenuItem {
  quantity: number;
}

interface WaitlistBarScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      entryId: string;
    };
  };
}

// Static bar menu data (v1)
const BAR_MENU: BarMenuItem[] = [
  { id: '1', name: 'Caipirinha', price: 22, icon: 'glass-cocktail', category: 'drinks' },
  { id: '2', name: 'Cerveja Artesanal', price: 18, icon: 'beer', category: 'drinks' },
  { id: '3', name: 'Suco Natural', price: 12, icon: 'cup', category: 'drinks' },
  { id: '4', name: 'Agua com Gas', price: 8, icon: 'water', category: 'drinks' },
  { id: '5', name: 'Porcao de Pao de Alho', price: 16, icon: 'bread-slice', category: 'appetizer' },
  { id: '6', name: 'Bruschetta Caprese', price: 24, icon: 'food', category: 'appetizer' },
];

export default function WaitlistBarScreen({ route }: WaitlistBarScreenProps) {
  const colors = useColors();
  const navigation = useNavigation();
  const entryId = route?.params?.entryId || '';

  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const handleAddItem = useCallback((item: BarMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  }, []);

  const handleConfirmOrder = useCallback(async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      await ApiService.post(`/restaurant/waitlist/${entryId}/bar-order`, {
        items: cart.map((item) => ({
          item_name: item.name,
          item_price: item.price,
          quantity: item.quantity,
        })),
      });

      Alert.alert(t('common.success'), t('waitlistBar.orderSent'));
      setCart([]);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }, [cart, entryId, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getItemQuantity = useCallback(
    (itemId: string): number => {
      const item = cart.find((i) => i.id === itemId);
      return item?.quantity || 0;
    },
    [cart],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          padding: 16,
          paddingBottom: 8,
        },
        title: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: 4,
        },
        hint: {
          fontSize: 14,
          color: colors.foregroundSecondary,
          marginBottom: 16,
        },
        menuList: {
          paddingHorizontal: 16,
        },
        menuItem: {
          marginBottom: 12,
          borderRadius: 12,
        },
        menuItemContent: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
        },
        menuItemInfo: {
          flex: 1,
          marginLeft: 12,
        },
        menuItemName: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
        },
        menuItemPrice: {
          fontSize: 14,
          color: colors.primary,
          fontWeight: '600',
        },
        quantityControls: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        quantityText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
          marginHorizontal: 8,
          minWidth: 20,
          textAlign: 'center',
        },
        cartSection: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 16,
          paddingBottom: 32,
        },
        cartTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 8,
        },
        cartItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 4,
        },
        cartItemText: {
          fontSize: 14,
          color: colors.foreground,
        },
        cartItemPrice: {
          fontSize: 14,
          color: colors.foregroundSecondary,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 8,
          marginTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        totalLabel: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
        },
        totalValue: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.primary,
        },
        confirmButton: {
          marginTop: 16,
          borderRadius: 12,
          backgroundColor: colors.primary,
        },
        backButton: {
          marginTop: 8,
          borderRadius: 12,
        },
        emptyCart: {
          fontSize: 14,
          color: colors.foregroundMuted,
          textAlign: 'center',
          paddingVertical: 8,
        },
      }),
    [colors],
  );

  const renderMenuItem = useCallback(
    ({ item }: { item: BarMenuItem }) => {
      const qty = getItemQuantity(item.id);
      return (
        <Card style={styles.menuItem} accessibilityLabel={item.name}>
          <View style={styles.menuItemContent}>
            <IconButton
              icon={item.icon}
              size={28}
              iconColor={colors.primary}
              accessibilityLabel={item.name}
            />
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemPrice}>
                R$ {item.price.toFixed(2)}
              </Text>
            </View>
            <View style={styles.quantityControls}>
              {qty > 0 && (
                <>
                  <IconButton
                    icon="minus-circle-outline"
                    size={24}
                    iconColor={colors.error}
                    onPress={() => handleRemoveItem(item.id)}
                    accessibilityLabel={`${t('common.delete')} ${item.name}`}
                  />
                  <Text style={styles.quantityText}>{qty}</Text>
                </>
              )}
              <IconButton
                icon="plus-circle-outline"
                size={24}
                iconColor={colors.primary}
                onPress={() => handleAddItem(item)}
                accessibilityLabel={`${t('common.add') || 'Add'} ${item.name}`}
              />
            </View>
          </View>
        </Card>
      );
    },
    [colors, styles, getItemQuantity, handleAddItem, handleRemoveItem],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('waitlistBar.title')}</Text>
        <Text style={styles.hint}>{t('waitlistBar.hint')}</Text>
      </View>

      <FlatList
        data={BAR_MENU}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
        getItemLayout={(_, index) => ({
          length: 76,
          offset: 76 * index,
          index,
        })}
      />

      {/* Cart section */}
      <View style={styles.cartSection}>
        <Text style={styles.cartTitle}>{t('waitlistBar.yourOrder')}</Text>

        {cart.length === 0 ? (
          <Text style={styles.emptyCart}>{t('waitlistBar.emptyCart')}</Text>
        ) : (
          <>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.cartItemText}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.cartItemPrice}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('waitlistBar.total')}</Text>
              <Text style={styles.totalValue}>
                R$ {subtotal.toFixed(2)}
              </Text>
            </View>
          </>
        )}

        {cart.length > 0 ? (
          <Button
            mode="contained"
            onPress={handleConfirmOrder}
            loading={submitting}
            disabled={submitting}
            style={styles.confirmButton}
            icon="check"
            accessibilityLabel={t('waitlistBar.confirm')}
          >
            {t('waitlistBar.confirm')}
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={handleGoBack}
            style={styles.backButton}
            icon="arrow-left"
            accessibilityLabel={t('waitlistBar.back')}
          >
            {t('waitlistBar.back')}
          </Button>
        )}
      </View>
    </View>
  );
}

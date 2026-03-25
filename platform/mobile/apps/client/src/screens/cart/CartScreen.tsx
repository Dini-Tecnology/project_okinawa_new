import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Button, IconButton, TextInput, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ApiService from '@/shared/services/api';
import { useCart } from '@/shared/contexts/CartContext';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { formatCurrency, getCurrencySymbol } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';

/**
 * CartScreen - Shopping cart management screen
 * Displays cart items with quantity controls, tip selection, and checkout functionality
 * Uses semantic design tokens via useColors() for theme-aware styling
 */
export default function CartScreen() {
  const navigation = useNavigation();
  const cart = useCart();
  const { t } = useI18n();
  const colors = useColors();

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [loading, setLoading] = useState(false);

  /**
   * Updates special instructions for a specific cart item
   * @param itemId - Unique identifier of the cart item
   * @param instructions - Special preparation instructions
   */
  const updateItemInstructions = (itemId: string, instructions: string) => {
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      // Update special instructions in the cart item
    }
  };

  // Calculate order totals
  const getSubtotal = () => cart.total;
  const getTax = () => getSubtotal() * 0.1;
  const getTip = () => tipAmount || (getSubtotal() * tipPercentage) / 100;
  const getTotal = () => getSubtotal() + getTax() + getTip();

  /**
   * Sets tip percentage and clears custom tip amount
   * @param percentage - Tip percentage (10, 15, or 20)
   */
  const setTipByPercentage = (percentage: number) => {
    setTipPercentage(percentage);
    setTipAmount(0);
  };

  /**
   * Processes checkout and creates order via API
   * Includes validation, order creation, and optional tip creation
   */
  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      Alert.alert(t('common.error'), t('cart.empty'));
      return;
    }

    if (!cart.restaurantId) {
      Alert.alert(t('common.error'), t('errors.generic'));
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        restaurant_id: cart.restaurantId,
        items: cart.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions,
        })),
        order_type: 'dine_in' as const,
        special_instructions: specialInstructions,
      };

      const order = await ApiService.createOrder(orderData);

      // Create tip if amount is greater than zero
      if (getTip() > 0) {
        await ApiService.createTip({
          order_id: order.id,
          amount: getTip(),
        });
      }

      cart.clearCart();

      Alert.alert(
        t('common.success'),
        t('orders.orderPlaced') || 'Seu pedido foi realizado!',
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('Payment', { orderId: order.id }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('errors.generic')
      );
    } finally {
      setLoading(false);
    }
  };

  // Dynamic styles using semantic tokens for theme support
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: 15,
      paddingBottom: 100,
    },
    title: {
      marginBottom: 15,
      color: colors.foreground,
    },
    card: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      color: colors.foreground,
    },
    price: {
      marginTop: 4,
      color: colors.foregroundSecondary,
    },
    quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    quantity: {
      minWidth: 30,
      textAlign: 'center',
      color: colors.foreground,
    },
    itemTotal: {
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: colors.primary,
    },
    instructionsInput: {
      marginTop: 10,
      backgroundColor: colors.backgroundSecondary,
    },
    orderInstructions: {
      marginBottom: 15,
      backgroundColor: colors.backgroundSecondary,
    },
    tipCard: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    tipTitle: {
      marginBottom: 15,
      color: colors.foreground,
    },
    tipButtons: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 15,
    },
    tipButton: {
      flex: 1,
    },
    customTipInput: {
      marginTop: 5,
      backgroundColor: colors.backgroundSecondary,
    },
    summaryCard: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    summaryTitle: {
      marginBottom: 15,
      color: colors.foreground,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    summaryText: {
      color: colors.foreground,
    },
    divider: {
      marginVertical: 10,
      backgroundColor: colors.border,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      color: colors.foreground,
    },
    totalAmount: {
      fontWeight: 'bold',
      color: colors.primary,
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
    backButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
    },
    checkoutBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 15,
      elevation: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    checkoutInfo: {
      flex: 1,
    },
    checkoutLabel: {
      color: colors.foregroundSecondary,
    },
    checkoutTotal: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    checkoutButton: {
      backgroundColor: colors.primary,
    },
  }), [colors]);

  /**
   * Renders individual cart item with quantity controls and instructions
   */
  const renderCartItem = ({ item }: { item: typeof cart.items[0] }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text variant="titleMedium" style={styles.itemName}>{item.name}</Text>
            <Text variant="bodyMedium" style={styles.price}>
              {formatCurrency(item.price, getLanguage())} {t('menu.each') || 'cada'}
            </Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => cart.removeItem(item.id)}
            iconColor={colors.error}
          />
        </View>

        <View style={styles.quantityControl}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => cart.updateQuantity(item.id, item.quantity - 1)}
            mode="contained"
          />
          <Text variant="titleMedium" style={styles.quantity}>
            {item.quantity}
          </Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => cart.updateQuantity(item.id, item.quantity + 1)}
            mode="contained"
          />
          <Text variant="titleMedium" style={styles.itemTotal}>
            {formatCurrency(item.price * item.quantity, getLanguage())}
          </Text>
        </View>

        <TextInput
          label={t('orders.specialInstructions')}
          value={item.special_instructions || ''}
          onChangeText={(text) => updateItemInstructions(item.id, text)}
          mode="outlined"
          multiline
          numberOfLines={2}
          style={styles.instructionsInput}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text variant="headlineSmall" style={styles.title}>
            {t('cart.title')}
          </Text>
        }
        ListFooterComponent={
          <>
            <TextInput
              label={t('orders.specialInstructions')}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.orderInstructions}
            />

            <Card style={styles.tipCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.tipTitle}>
                  {t('tips.addTip')}
                </Text>
                <View style={styles.tipButtons}>
                  <Button
                    mode={tipPercentage === 10 && !tipAmount ? 'contained' : 'outlined'}
                    onPress={() => setTipByPercentage(10)}
                    style={styles.tipButton}
                  >
                    10%
                  </Button>
                  <Button
                    mode={tipPercentage === 15 && !tipAmount ? 'contained' : 'outlined'}
                    onPress={() => setTipByPercentage(15)}
                    style={styles.tipButton}
                  >
                    15%
                  </Button>
                  <Button
                    mode={tipPercentage === 20 && !tipAmount ? 'contained' : 'outlined'}
                    onPress={() => setTipByPercentage(20)}
                    style={styles.tipButton}
                  >
                    20%
                  </Button>
                </View>
                <TextInput
                  label={t('tips.customTip')}
                  value={tipAmount > 0 ? tipAmount.toString() : ''}
                  onChangeText={(text) => {
                    const amount = parseFloat(text) || 0;
                    setTipAmount(amount);
                    setTipPercentage(0);
                  }}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text={getCurrencySymbol(getLanguage())} />}
                  style={styles.customTipInput}
                />
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.summaryTitle}>
                  {t('orders.orderSummary') || 'Resumo do Pedido'}
                </Text>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryText}>{t('cart.subtotal')}</Text>
                  <Text variant="bodyMedium" style={styles.summaryText}>{formatCurrency(getSubtotal(), getLanguage())}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryText}>{t('orders.tax')} (10%)</Text>
                  <Text variant="bodyMedium" style={styles.summaryText}>{formatCurrency(getTax(), getLanguage())}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryText}>{t('orders.tip')}</Text>
                  <Text variant="bodyMedium" style={styles.summaryText}>{formatCurrency(getTip(), getLanguage())}</Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text variant="titleLarge" style={styles.totalLabel}>{t('cart.total')}</Text>
                  <Text variant="titleLarge" style={styles.totalAmount}>
                    {formatCurrency(getTotal(), getLanguage())}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={styles.emptyText}>{t('cart.empty')}</Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              {t('cart.continueShopping')}
            </Button>
          </View>
        }
      />

      {cart.items.length > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.checkoutInfo}>
            <Text variant="bodySmall" style={styles.checkoutLabel}>
              {t('cart.total')}
            </Text>
            <Text variant="titleLarge" style={styles.checkoutTotal}>
              {formatCurrency(getTotal(), getLanguage())}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleCheckout}
            loading={loading}
            disabled={loading}
            style={styles.checkoutButton}
          >
            {t('cart.checkout')}
          </Button>
        </View>
      )}
    </View>
  );
}
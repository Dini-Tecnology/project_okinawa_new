import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { Text, Card, Button, RadioButton, TextInput, Divider, IconButton, ActivityIndicator, Portal } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import ApiService from '@/shared/services/api';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';

/**
 * Luhn algorithm for card number validation
 * https://en.wikipedia.org/wiki/Luhn_algorithm
 */
const isValidCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');

  // Must be 13-19 digits (standard card lengths)
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Detect card brand from number
 */
const getCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  if (/^6011|65|64[4-9]/.test(cleaned)) return 'Discover';
  if (/^36|38|30[0-5]/.test(cleaned)) return 'Diners';
  if (/^35/.test(cleaned)) return 'JCB';
  if (/^50|5[6-9]|6/.test(cleaned)) return 'Maestro';

  return 'Unknown';
};

interface Order {
  id: string;
  restaurant_id: string;
  subtotal_amount: number;
  tax_amount: number;
  tip_amount: number;
  total_amount: number;
  status: string;
  items: Array<{
    id: string;
    menu_item: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
}

interface Wallet {
  id: string;
  balance: number;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last4?: string;
  card_holder_name?: string;
  card_exp_month?: string;
  card_exp_year?: string;
  is_default: boolean;
}

export default function PaymentScreen() {
  useScreenTracking('Payment');

  const route = useRoute();
  const navigation = useNavigation();
  const colors = useColors();
  const { orderId } = route.params as { orderId: string };

  const analytics = useAnalytics();

  const [order, setOrder] = useState<Order | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'saved_card' | 'new_card' | 'cash' | 'pix' | 'wallet'>('saved_card');

  // New card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // PIX
  const [pixKey, setPixKey] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      const [orderResponse, walletResponse, methodsResponse] = await Promise.all([
        ApiService.getOrder(orderId),
        ApiService.getWallet(),
        ApiService.getPaymentMethods(),
      ]);

      setOrder(orderResponse);
      setWallet(walletResponse);
      setPaymentMethods(methodsResponse);

      // Set default payment method
      const defaultMethod = methodsResponse.find((m: PaymentMethod) => m.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
        setPaymentType('saved_card');
      } else if (methodsResponse.length > 0) {
        setSelectedMethod(methodsResponse[0].id);
        setPaymentType('saved_card');
      } else {
        setPaymentType('new_card');
      }
    } catch (error) {
      logger.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load payment information');
      await analytics.logError('Failed to load payment data', 'PAYMENT_DATA_LOAD_ERROR', false);
    } finally {
      setInitialLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateNewCard = () => {
    const cleanedNumber = cardNumber.replace(/\s/g, '');

    // Validate card number length (13-19 digits depending on brand)
    if (!cleanedNumber || cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }

    // Validate card number with Luhn algorithm
    if (!isValidCardNumber(cleanedNumber)) {
      Alert.alert('Error', 'Invalid card number. Please check and try again.');
      return false;
    }

    // Detect and validate card brand
    const brand = getCardBrand(cleanedNumber);
    if (brand === 'Unknown') {
      Alert.alert('Warning', 'Card brand not recognized. Please verify the card number.');
    }

    // Validate cardholder name
    if (!cardName || cardName.length < 3) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return false;
    }

    // Validate name contains only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(cardName)) {
      Alert.alert('Error', 'Cardholder name should only contain letters');
      return false;
    }

    // Validate expiry format
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }

    // Validate month is valid (01-12)
    const [month, year] = cardExpiry.split('/');
    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) {
      Alert.alert('Error', 'Invalid expiry month. Please enter a value between 01-12.');
      return false;
    }

    // Validate expiry date is not in the past
    const expDate = new Date(2000 + parseInt(year), monthNum - 1);
    const now = new Date();
    now.setDate(1); // Compare by month only
    if (expDate < now) {
      Alert.alert('Error', 'Card has expired. Please use a valid card.');
      return false;
    }

    // Validate CVV (3 digits for most cards, 4 for Amex)
    const expectedCVVLength = brand === 'Amex' ? 4 : 3;
    if (!cardCVV || cardCVV.length !== expectedCVVLength) {
      Alert.alert('Error', `Please enter a valid CVV (${expectedCVVLength} digits for ${brand})`);
      return false;
    }

    // CVV should only contain digits
    if (!/^\d+$/.test(cardCVV)) {
      Alert.alert('Error', 'CVV should only contain numbers');
      return false;
    }

    return true;
  };

  const validatePixPayment = () => {
    if (!pixKey || pixKey.length < 5) {
      Alert.alert('Error', 'Please enter a valid PIX key');
      return false;
    }
    return true;
  };

  const handleAddNewCard = async () => {
    if (!validateNewCard()) return;

    try {
      setLoading(true);
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const [expMonth, expYear] = cardExpiry.split('/');

      await ApiService.addPaymentMethod({
        method_type: 'credit_card',
        card_number: cleanedNumber,
        card_holder_name: cardName,
        card_exp_month: expMonth,
        card_exp_year: '20' + expYear,
        card_cvv: cardCVV,
      });

      await analytics.logAddPaymentMethod('credit_card');

      Alert.alert('Success', 'Card added successfully');
      setShowAddCardModal(false);

      // Clear form
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCVV('');

      // Reload payment methods
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add card');
      await analytics.logError('Failed to add payment method', 'ADD_PAYMENT_METHOD_ERROR', false);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    // Validate based on payment type
    if (paymentType === 'new_card') {
      if (!validateNewCard()) return;
    } else if (paymentType === 'pix') {
      if (!validatePixPayment()) return;
    } else if (paymentType === 'wallet') {
      if (!wallet || wallet.balance < order.total_amount) {
        Alert.alert('Error', 'Insufficient wallet balance');
        return;
      }
    } else if (paymentType === 'saved_card') {
      if (!selectedMethod) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }
    }

    setLoading(true);
    try {
      const paymentData: any = {
        order_id: orderId,
        amount: order.total_amount,
      };

      if (paymentType === 'saved_card') {
        paymentData.payment_method = 'saved_card';
        paymentData.payment_method_id = selectedMethod;
      } else if (paymentType === 'new_card') {
        paymentData.payment_method = 'credit_card';
        const cleanedNumber = cardNumber.replace(/\s/g, '');
        const [expMonth, expYear] = cardExpiry.split('/');

        paymentData.tokenized_card = {
          card_number: cleanedNumber,
          card_holder_name: cardName,
          card_exp_month: expMonth,
          card_exp_year: '20' + expYear,
          card_cvv: cardCVV,
        };
      } else if (paymentType === 'pix') {
        paymentData.payment_method = 'pix';
        paymentData.pix_key = pixKey;
      } else if (paymentType === 'wallet') {
        paymentData.payment_method = 'wallet';
      } else if (paymentType === 'cash') {
        paymentData.payment_method = 'cash';
      }

      await ApiService.processPayment(paymentData);

      await analytics.logPurchase(orderId, order.total_amount, 'BRL');

      setPaymentSuccess(true);

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }, 2000);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed. Please try again.');
      await analytics.logError('Payment failed', 'PAYMENT_ERROR', false);
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      padding: 15,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    loadingText: {
      marginTop: 15,
      color: colors.foregroundSecondary,
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      padding: 20,
    },
    successTitle: {
      marginTop: 20,
      color: colors.success,
    },
    successText: {
      marginTop: 10,
      color: colors.foregroundSecondary,
      textAlign: 'center',
    },
    title: {
      marginBottom: 20,
      color: colors.foreground,
    },
    card: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    sectionTitle: {
      marginBottom: 15,
      color: colors.foreground,
    },
    orderItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    divider: {
      marginVertical: 15,
      backgroundColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalAmount: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    input: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    halfInput: {
      flex: 1,
    },
    pixNote: {
      color: colors.foregroundSecondary,
      fontStyle: 'italic',
    },
    cashNoticeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cashNote: {
      flex: 1,
      color: colors.foregroundSecondary,
    },
    walletInfo: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    walletBalance: {
      color: colors.primary,
      fontWeight: 'bold',
      marginTop: 5,
    },
    insufficientFunds: {
      color: colors.error,
      textAlign: 'center',
      marginTop: 10,
    },
    addCardButton: {
      marginTop: 10,
    },
    payButton: {
      marginBottom: 30,
      backgroundColor: colors.primary,
    },
    modalContainer: {
      backgroundColor: colors.card,
      margin: 20,
      borderRadius: 8,
    },
    orderText: {
      color: colors.foreground,
    },
    summaryText: {
      color: colors.foreground,
    },
    bodyText: {
      color: colors.foreground,
    },
  }), [colors]);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payment information...</Text>
      </View>
    );
  }

  if (paymentSuccess) {
    return (
      <View style={styles.successContainer}>
        <IconButton icon="check-circle" size={80} iconColor={colors.success} />
        <Text variant="headlineMedium" style={styles.successTitle}>Payment Successful!</Text>
        <Text variant="bodyLarge" style={styles.successText}>
          Thank you for your order
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.bodyText}>Order not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Payment
        </Text>

        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Summary
            </Text>

            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Text variant="bodyMedium" style={styles.orderText}>
                  {item.quantity}x {item.menu_item.name}
                </Text>
                <Text variant="bodyMedium" style={styles.orderText}>
                  ${(item.menu_item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <Divider style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryText}>Subtotal</Text>
              <Text variant="bodyMedium" style={styles.summaryText}>${order.subtotal_amount.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryText}>Tax</Text>
              <Text variant="bodyMedium" style={styles.summaryText}>${order.tax_amount.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryText}>Tip</Text>
              <Text variant="bodyMedium" style={styles.summaryText}>${order.tip_amount.toFixed(2)}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.bodyText}>Total</Text>
              <Text variant="titleLarge" style={styles.totalAmount}>
                ${order.total_amount.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Method Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Method
            </Text>

            <RadioButton.Group
              onValueChange={(value) => setPaymentType(value as any)}
              value={paymentType}
            >
              {paymentMethods.length > 0 && (
                <RadioButton.Item label="Saved Card" value="saved_card" labelStyle={{ color: colors.foreground }} />
              )}
              <RadioButton.Item label="New Card" value="new_card" labelStyle={{ color: colors.foreground }} />
              <RadioButton.Item label="PIX" value="pix" labelStyle={{ color: colors.foreground }} />
              <RadioButton.Item
                label={`Wallet (Balance: $${wallet?.balance.toFixed(2) || '0.00'})`}
                value="wallet"
                disabled={!wallet || wallet.balance < order.total_amount}
                labelStyle={{ color: colors.foreground }}
              />
              <RadioButton.Item label="Cash (Pay at restaurant)" value="cash" labelStyle={{ color: colors.foreground }} />
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Saved Cards */}
        {paymentType === 'saved_card' && paymentMethods.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Select Card
              </Text>

              <RadioButton.Group
                onValueChange={setSelectedMethod}
                value={selectedMethod}
              >
                {paymentMethods.map((method) => (
                  <RadioButton.Item
                    key={method.id}
                    label={`${method.card_holder_name} •••• ${method.card_last4} (${method.card_exp_month}/${method.card_exp_year})`}
                    value={method.id}
                    labelStyle={{ color: colors.foreground }}
                  />
                ))}
              </RadioButton.Group>

              <Button
                mode="outlined"
                onPress={() => setShowAddCardModal(true)}
                style={styles.addCardButton}
                icon="plus"
              >
                Add New Card
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* New Card Form */}
        {paymentType === 'new_card' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Card Details
              </Text>

              <TextInput
                label="Card Number"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="credit-card" />}
              />

              <TextInput
                label="Cardholder Name"
                value={cardName}
                onChangeText={setCardName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />

              <View style={styles.row}>
                <TextInput
                  label="Expiry (MM/YY)"
                  value={cardExpiry}
                  onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                />

                <TextInput
                  label="CVV"
                  value={cardCVV}
                  onChangeText={setCardCVV}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* PIX Form */}
        {paymentType === 'pix' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                PIX Payment
              </Text>

              <TextInput
                label="PIX Key (Email, Phone, or CPF)"
                value={pixKey}
                onChangeText={setPixKey}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
              />

              <Text variant="bodySmall" style={styles.pixNote}>
                You will receive a QR code to complete the payment
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Cash Notice */}
        {paymentType === 'cash' && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cashNoticeContainer}>
                <IconButton icon="information" size={24} iconColor={colors.primary} />
                <Text variant="bodyMedium" style={styles.cashNote}>
                  You will pay in cash when you arrive at the restaurant.
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Wallet Info */}
        {paymentType === 'wallet' && wallet && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.walletInfo}>
                <Text variant="bodyLarge" style={styles.bodyText}>Current Balance:</Text>
                <Text variant="headlineSmall" style={styles.walletBalance}>
                  ${wallet.balance.toFixed(2)}
                </Text>
              </View>
              {wallet.balance < order.total_amount && (
                <Text variant="bodySmall" style={styles.insufficientFunds}>
                  Insufficient balance. Please add funds to your wallet or choose another payment method.
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handlePayment}
          loading={loading}
          disabled={loading}
          style={styles.payButton}
        >
          {paymentType === 'cash' ? 'Confirm Order' : `Pay $${order.total_amount.toFixed(2)}`}
        </Button>
      </ScrollView>

      {/* Add Card Modal */}
      <Portal>
        <Modal
          visible={showAddCardModal}
          onDismiss={() => setShowAddCardModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Title title="Add New Card" titleStyle={{ color: colors.foreground }} />
            <Card.Content>
              <TextInput
                label="Card Number"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Cardholder Name"
                value={cardName}
                onChangeText={setCardName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />

              <View style={styles.row}>
                <TextInput
                  label="Expiry (MM/YY)"
                  value={cardExpiry}
                  onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />

                <TextInput
                  label="CVV"
                  value={cardCVV}
                  onChangeText={setCardCVV}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setShowAddCardModal(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleAddNewCard} loading={loading}>
                Add Card
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </>
  );
}

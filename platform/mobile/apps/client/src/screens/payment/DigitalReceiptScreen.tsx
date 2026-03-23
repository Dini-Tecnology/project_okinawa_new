import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useColors } from '@okinawa/shared/theme';
import { typography } from '@okinawa/shared/theme/typography';
import { spacing } from '@okinawa/shared/theme/spacing';
import logger from '@okinawa/shared/utils/logger';

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptData {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCNPJ: string;
  date: string;
  time: string;
  tableNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cardLastDigits?: string;
  tipAmount?: number;
  splitInfo?: {
    totalParticipants: number;
    yourShare: number;
  };
}

interface DigitalReceiptScreenProps {
  navigation: any;
  route: {
    params: {
      receipt: ReceiptData;
    };
  };
}

export const DigitalReceiptScreen: React.FC<DigitalReceiptScreenProps> = ({
  navigation,
  route,
}) => {
  const colors = useColors();
  
  // Mock receipt data for demonstration
  const receipt: ReceiptData = route.params?.receipt || {
    id: 'RCP-2024-001234',
    restaurantName: 'Sakura Ramen House',
    restaurantAddress: 'Av. Paulista, 1234 - São Paulo, SP',
    restaurantCNPJ: '12.345.678/0001-90',
    date: '15/01/2024',
    time: '20:45',
    tableNumber: 'Mesa 12',
    items: [
      { id: '1', name: 'Ramen Tonkotsu', quantity: 2, unitPrice: 48.90, total: 97.80 },
      { id: '2', name: 'Gyoza (8 un)', quantity: 1, unitPrice: 32.90, total: 32.90 },
      { id: '3', name: 'Edamame', quantity: 1, unitPrice: 18.90, total: 18.90 },
      { id: '4', name: 'Cerveja Sapporo', quantity: 3, unitPrice: 24.90, total: 74.70 },
    ],
    subtotal: 224.30,
    serviceFee: 22.43,
    discount: 0,
    total: 246.73,
    paymentMethod: 'Cartão de Crédito',
    cardLastDigits: '4532',
    tipAmount: 25.00,
    splitInfo: {
      totalParticipants: 2,
      yourShare: 135.87,
    },
  };

  const [showFullReceipt, setShowFullReceipt] = useState(true);

  const shareReceipt = async () => {
    try {
      await Share.share({
        message: `Comprovante de Pagamento\n${receipt.restaurantName}\n${receipt.date} ${receipt.time}\nTotal: R$ ${receipt.total.toFixed(2)}\nNº ${receipt.id}`,
        title: 'Compartilhar Comprovante',
      });
    } catch (error) {
      logger.error('Error sharing:', error);
    }
  };

  const downloadReceipt = async () => {
    try {
      // Generate receipt content as text (in production, use a PDF library)
      const receiptContent = `
========================================
        COMPROVANTE DE PAGAMENTO
========================================

${receipt.restaurantName}
${receipt.restaurantAddress}
CNPJ: ${receipt.restaurantCNPJ}

Data: ${receipt.date} ${receipt.time}
Mesa: ${receipt.tableNumber}
Comprovante: ${receipt.id}

----------------------------------------
ITENS:
${receipt.items.map(item => 
  `${item.quantity}x ${item.name.padEnd(20)} R$ ${item.total.toFixed(2)}`
).join('\n')}

----------------------------------------
Subtotal:        R$ ${receipt.subtotal.toFixed(2)}
Taxa de Serviço: R$ ${receipt.serviceFee.toFixed(2)}
${receipt.discount > 0 ? `Desconto:        -R$ ${receipt.discount.toFixed(2)}\n` : ''}${receipt.tipAmount ? `Gorjeta:         R$ ${receipt.tipAmount.toFixed(2)}\n` : ''}----------------------------------------
TOTAL:           R$ ${receipt.total.toFixed(2)}

Pagamento: ${receipt.paymentMethod}${receipt.cardLastDigits ? ` (**** ${receipt.cardLastDigits})` : ''}

========================================
        Obrigado pela preferência!
========================================
`;

      // Save to file
      const fileName = `comprovante_${receipt.id}_${Date.now()}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, receiptContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: 'Salvar Comprovante',
        });
      } else {
        Alert.alert(
          'Comprovante Salvo',
          `Arquivo salvo em: ${filePath}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      logger.error('Error downloading receipt:', error);
      Alert.alert('Erro', 'Não foi possível baixar o comprovante');
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold as any,
      color: colors.foreground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    successBanner: {
      alignItems: 'center',
      padding: spacing.xl,
      borderRadius: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.successBackground,
    },
    successIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      backgroundColor: colors.success,
    },
    successTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold as any,
      marginBottom: spacing.xs,
      color: colors.success,
    },
    successSubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.foregroundSecondary,
    },
    receiptCard: {
      borderRadius: spacing.lg,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    restaurantSection: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    restaurantName: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold as any,
      marginBottom: spacing.xs,
      color: colors.foreground,
    },
    restaurantDetail: {
      fontSize: typography.sizes.xs,
      textAlign: 'center',
      color: colors.foregroundSecondary,
    },
    divider: {
      height: 1,
      marginHorizontal: spacing.lg,
      backgroundColor: colors.border,
    },
    orderInfo: {
      padding: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    orderInfoRow: {
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: typography.sizes.xs,
      marginBottom: 2,
      color: colors.foregroundSecondary,
    },
    infoValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold as any,
      color: colors.foreground,
    },
    itemsSection: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold as any,
      marginBottom: spacing.md,
      color: colors.foreground,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    itemInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    itemQty: {
      fontSize: typography.sizes.sm,
      width: 30,
      color: colors.foregroundSecondary,
    },
    itemName: {
      fontSize: typography.sizes.sm,
      flex: 1,
      color: colors.foreground,
    },
    itemPrice: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium as any,
      color: colors.foreground,
    },
    totalsSection: {
      padding: spacing.lg,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    totalLabel: {
      fontSize: typography.sizes.sm,
      color: colors.foregroundSecondary,
    },
    totalValue: {
      fontSize: typography.sizes.sm,
      color: colors.foreground,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
      marginTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    grandTotalLabel: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold as any,
      color: colors.foreground,
    },
    grandTotalValue: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold as any,
      color: colors.primary,
    },
    splitSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      margin: spacing.lg,
      borderRadius: spacing.md,
      gap: spacing.md,
      backgroundColor: colors.backgroundSecondary,
    },
    splitInfo: {
      flex: 1,
    },
    splitLabel: {
      fontSize: typography.sizes.xs,
      color: colors.foregroundSecondary,
    },
    splitValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold as any,
      color: colors.foreground,
    },
    paymentSection: {
      padding: spacing.lg,
    },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentMethod: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium as any,
      color: colors.foreground,
    },
    paymentDetail: {
      fontSize: typography.sizes.xs,
      color: colors.foregroundSecondary,
    },
    loyaltyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: spacing.lg,
      marginTop: spacing.lg,
      gap: spacing.md,
      backgroundColor: `${colors.primary}15`,
    },
    loyaltyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loyaltyInfo: {
      flex: 1,
    },
    loyaltyTitle: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold as any,
      color: colors.foreground,
    },
    loyaltySubtitle: {
      fontSize: typography.sizes.xs,
      color: colors.foregroundSecondary,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: spacing.md,
      borderWidth: 1,
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium as any,
      color: colors.foreground,
    },
    footer: {
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    doneButton: {
      paddingVertical: spacing.md,
      borderRadius: spacing.md,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    doneButtonText: {
      color: colors.primaryForeground,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold as any,
    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Comprovante Digital
        </Text>
        <TouchableOpacity onPress={shareReceipt}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color={colors.primaryForeground} />
          </View>
          <Text style={styles.successTitle}>
            Pagamento Confirmado
          </Text>
          <Text style={styles.successSubtitle}>
            {receipt.date} às {receipt.time}
          </Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Restaurant Info */}
          <View style={styles.restaurantSection}>
            <Text style={styles.restaurantName}>
              {receipt.restaurantName}
            </Text>
            <Text style={styles.restaurantDetail}>
              {receipt.restaurantAddress}
            </Text>
            <Text style={styles.restaurantDetail}>
              CNPJ: {receipt.restaurantCNPJ}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Order Info */}
          <View style={styles.orderInfo}>
            <View style={styles.orderInfoRow}>
              <Text style={styles.infoLabel}>Nº Pedido</Text>
              <Text style={styles.infoValue}>{receipt.id}</Text>
            </View>
            <View style={styles.orderInfoRow}>
              <Text style={styles.infoLabel}>Mesa</Text>
              <Text style={styles.infoValue}>{receipt.tableNumber}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Itens</Text>
            {receipt.items.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQty}>
                    {item.quantity}x
                  </Text>
                  <Text style={styles.itemName}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  R$ {item.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                R$ {receipt.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Taxa de serviço (10%)
              </Text>
              <Text style={styles.totalValue}>
                R$ {receipt.serviceFee.toFixed(2)}
              </Text>
            </View>
            {receipt.tipAmount && receipt.tipAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Gorjeta</Text>
                <Text style={styles.totalValue}>
                  R$ {receipt.tipAmount.toFixed(2)}
                </Text>
              </View>
            )}
            {receipt.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.success }]}>Desconto</Text>
                <Text style={[styles.totalValue, { color: colors.success }]}>
                  -R$ {receipt.discount.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                R$ {(receipt.total + (receipt.tipAmount || 0)).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Split Info */}
          {receipt.splitInfo && (
            <>
              <View style={styles.divider} />
              <View style={styles.splitSection}>
                <Ionicons name="people" size={20} color={colors.primary} />
                <View style={styles.splitInfo}>
                  <Text style={styles.splitLabel}>
                    Dividido entre {receipt.splitInfo.totalParticipants} pessoas
                  </Text>
                  <Text style={styles.splitValue}>
                    Sua parte: R$ {receipt.splitInfo.yourShare.toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentRow}>
              <Ionicons name="card" size={20} color={colors.primary} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentMethod}>
                  {receipt.paymentMethod}
                </Text>
                {receipt.cardLastDigits && (
                  <Text style={styles.paymentDetail}>
                    •••• {receipt.cardLastDigits}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Loyalty Points Earned */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyIcon}>
            <Ionicons name="star" size={24} color={colors.primary} />
          </View>
          <View style={styles.loyaltyInfo}>
            <Text style={styles.loyaltyTitle}>
              +24 pontos de fidelidade
            </Text>
            <Text style={styles.loyaltySubtitle}>
              Total acumulado: 344 pontos
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={downloadReceipt}
          >
            <Ionicons name="download-outline" size={20} color={colors.foreground} />
            <Text style={styles.actionButtonText}>
              Baixar PDF
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={shareReceipt}
          >
            <Ionicons name="mail-outline" size={20} color={colors.foreground} />
            <Text style={styles.actionButtonText}>
              Enviar por E-mail
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.doneButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DigitalReceiptScreen;

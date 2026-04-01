/**
 * QRScannerScreen (Restaurant App)
 *
 * Camera-based QR code scanner for table association and verification.
 * Allows staff to scan table QR codes for quick order/table lookup.
 *
 * @module screens/scanner
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Vibration, Linking } from 'react-native';
import { Text, Button, IconButton, Card, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import ApiService from '@okinawa/shared/services/api';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { t } from '@okinawa/shared/i18n';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type QRCodeType = 'table' | 'menu' | 'order' | 'unknown';

interface ScanResult {
  type: QRCodeType;
  data: any;
  message: string;
}

export default function QRScannerScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    permissionContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    permissionTitle: {
      marginTop: 16,
      textAlign: 'center',
      color: colors.foreground,
    },
    permissionText: {
      marginTop: 8,
      textAlign: 'center',
      color: colors.foregroundMuted,
    },
    permissionButton: {
      marginTop: 24,
      backgroundColor: colors.primary,
    },
    settingsButton: {
      marginTop: 12,
    },
    camera: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingHorizontal: 10,
      backgroundColor: colors.overlay,
    },
    headerTitle: {
      color: colors.primaryForeground,
      fontSize: 18,
      fontWeight: '600',
    },
    scannerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scannerFrame: {
      width: 250,
      height: 250,
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: colors.primary,
    },
    cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
    cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
    processingIndicator: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -20,
      marginLeft: -20,
    },
    instruction: {
      color: colors.primaryForeground,
      marginTop: 24,
      fontSize: 16,
    },
    resultContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 40,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    resultInfo: {
      flex: 1,
      marginLeft: 8,
    },
    resultType: {
      color: colors.primary,
      textTransform: 'uppercase',
    },
    resultMessage: {
      marginTop: 4,
      color: colors.foreground,
    },
    resultActions: {
      gap: 10,
    },
    actionButton: {
      backgroundColor: colors.primary,
    },
    scanAgainButton: {
      borderColor: colors.primary,
    },
    footer: {
      alignItems: 'center',
      paddingBottom: 50,
      backgroundColor: colors.overlay,
      paddingTop: 20,
    },
    footerText: {
      color: colors.primaryForeground,
      fontSize: 14,
      marginBottom: 16,
    },
    supportedTypes: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
    typeItem: {
      alignItems: 'center',
    },
    typeText: {
      color: colors.primaryForeground,
      fontSize: 12,
      marginTop: -8,
    },
  }), [colors]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const parseQRCode = (data: string): { type: QRCodeType; payload: any } => {
    try {
      if (data.startsWith('okinawa://')) {
        const url = new URL(data);
        const path = url.pathname;
        const params = Object.fromEntries(url.searchParams);

        if (path.includes('/table/')) {
          const tableId = path.split('/table/')[1];
          return { type: 'table', payload: { tableId, ...params } };
        }
        if (path.includes('/menu/')) {
          const restaurantId = path.split('/menu/')[1];
          return { type: 'menu', payload: { restaurantId, ...params } };
        }
        if (path.includes('/order/')) {
          const orderId = path.split('/order/')[1];
          return { type: 'order', payload: { orderId, ...params } };
        }
      }

      if (data.startsWith('http://') || data.startsWith('https://')) {
        const url = new URL(data);
        if (url.hostname.includes('okinawa')) {
          const path = url.pathname;
          if (path.includes('/t/')) {
            const tableCode = path.split('/t/')[1];
            return { type: 'table', payload: { tableCode } };
          }
        }
      }

      if (data.match(/^[A-Z0-9]{6,12}$/)) {
        return { type: 'table', payload: { tableCode: data } };
      }

      return { type: 'unknown', payload: { raw: data } };
    } catch {
      return { type: 'unknown', payload: { raw: data } };
    }
  };

  const processQRCode = async (type: QRCodeType, payload: any): Promise<ScanResult> => {
    switch (type) {
      case 'table':
        try {
          const response = await ApiService.get(`/tables/by-code/${payload.tableId || payload.tableCode}`);
          return {
            type: 'table',
            data: response.data,
            message: t('scanner.tableFound', { table: response.data?.table_number ?? '' }),
          };
        } catch {
          return { type: 'table', data: null, message: t('scanner.tableError') };
        }
      case 'order':
        return { type: 'order', data: payload, message: t('scanner.orderFound') };
      case 'menu':
        return { type: 'menu', data: payload, message: t('scanner.menuFound') };
      default:
        return { type: 'unknown', data: payload, message: t('scanner.unknownCode') };
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    Vibration.vibrate(100);

    const { type, payload } = parseQRCode(data);
    const result = await processQRCode(type, payload);

    setScanResult(result);
    setProcessing(false);
  };

  const handleAction = () => {
    if (!scanResult) return;
    switch (scanResult.type) {
      case 'table':
        if (scanResult.data) {
          navigation.navigate('TableDetail', { tableId: scanResult.data.id });
        }
        break;
      case 'order':
        navigation.navigate('OrderDetail', { orderId: scanResult.data.orderId });
        break;
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult(null);
  };

  if (!permission) {
    return (
      <ScreenContainer>
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
      <View style={styles.permissionContainer}>
        <IconButton icon="camera-off" size={64} iconColor={colors.foregroundMuted} />
        <Text variant="headlineSmall" style={styles.permissionTitle}>
          {t('scanner.cameraPermission')}
        </Text>
        <Text variant="bodyMedium" style={styles.permissionText}>
          {t('scanner.cameraPermissionMessage')}
        </Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles.permissionButton}
          icon="camera"
        >
          {t('scanner.allowCamera')}
        </Button>
        <Button
          mode="text"
          onPress={() => Linking.openSettings()}
          style={styles.settingsButton}
        >
          {t('scanner.openSettings')}
        </Button>
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.header}>
          <IconButton
            icon="close"
            iconColor={colors.primaryForeground}
            size={24}
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('common.close')}
          />
          <Text style={styles.headerTitle}>{t('scanner.scanQR')}</Text>
          <IconButton
            icon={flashOn ? 'flash' : 'flash-off'}
            iconColor={colors.primaryForeground}
            size={24}
            onPress={() => setFlashOn(!flashOn)}
            accessibilityLabel={flashOn ? 'Turn off flash' : 'Turn on flash'}
          />
        </View>

        <View style={styles.scannerContainer}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {processing && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.processingIndicator}
              />
            )}
          </View>
          <Text style={styles.instruction}>{t('scanner.pointCamera')}</Text>
        </View>

        {scanResult && (
          <View style={styles.resultContainer}>
            <Card style={styles.resultCard}>
              <Card.Content>
                <View style={styles.resultHeader}>
                  <IconButton
                    icon={
                      scanResult.type === 'table'
                        ? 'table-furniture'
                        : scanResult.type === 'order'
                        ? 'receipt'
                        : 'qrcode'
                    }
                    size={32}
                    iconColor={colors.primary}
                  />
                  <View style={styles.resultInfo}>
                    <Text variant="labelLarge" style={styles.resultType}>
                      {scanResult.type}
                    </Text>
                    <Text variant="bodyMedium" style={styles.resultMessage}>
                      {scanResult.message}
                    </Text>
                  </View>
                </View>
                <View style={styles.resultActions}>
                  {scanResult.data && (
                    <Button
                      mode="contained"
                      onPress={handleAction}
                      style={styles.actionButton}
                    >
                      {t('scanner.continue')}
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    onPress={handleScanAgain}
                    style={styles.scanAgainButton}
                  >
                    {t('scanner.scanAgain')}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('scanner.supportedTypes')}</Text>
          <View style={styles.supportedTypes}>
            <View style={styles.typeItem}>
              <IconButton icon="table-furniture" size={20} iconColor={colors.primaryForeground} />
              <Text style={styles.typeText}>{t('common.tables')}</Text>
            </View>
            <View style={styles.typeItem}>
              <IconButton icon="receipt" size={20} iconColor={colors.primaryForeground} />
              <Text style={styles.typeText}>{t('common.orders')}</Text>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
    </ScreenContainer>
  );
}

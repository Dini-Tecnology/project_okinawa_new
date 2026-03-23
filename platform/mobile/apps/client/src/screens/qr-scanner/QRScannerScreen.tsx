import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import ApiService from '@/shared/services/api';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';

interface QRCodeData {
  type: 'table' | 'menu' | 'payment' | 'restaurant' | 'invitation';
  restaurantId: string;
  tableId?: string;
  orderId?: string;
  signature?: string;
  version?: number;
  metadata?: Record<string, any>;
}

interface ParsedSecureQR {
  restaurantId: string;
  tableId: string;
  signature: string;
  version: number;
}

type RouteParams = {
  QRScanner: {
    orderId?: string;
    mode?: 'table' | 'payment' | 'any';
  };
};

export default function QRScannerScreen() {
  useScreenTracking('QR Scanner');

  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'QRScanner'>>();
  const analytics = useAnalytics();
  const colors = useColors();

  const scanMode = route.params?.mode || 'any';
  const orderId = route.params?.orderId;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Este app precisa de acesso à câmera para escanear QR codes.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configurações',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      logger.error('Error requesting camera permission:', error);
      Alert.alert('Erro', 'Não foi possível solicitar permissão para a câmera');
      await analytics.logError('Camera permission error', 'CAMERA_PERMISSION_ERROR', false);
    }
  };

  /**
   * Parse secure QR code URL
   * Format: https://app.okinawa.com/scan/{restaurantId}/{tableId}?sig={signature}&v={version}
   * Or: okinawa://table/{restaurantId}/{tableId}?sig={signature}&v={version}
   */
  const parseSecureQRUrl = (url: string): ParsedSecureQR | null => {
    try {
      // Deep link format
      if (url.startsWith('okinawa://table/')) {
        const match = url.match(/okinawa:\/\/table\/([^/]+)\/([^?]+)\?sig=([^&]+)(?:&v=(\d+))?/);
        if (!match) return null;
        
        return {
          restaurantId: match[1],
          tableId: match[2],
          signature: match[3],
          version: parseInt(match[4] || '1', 10),
        };
      }

      // Web URL format
      if (url.includes('/scan/')) {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts[0] !== 'scan' || pathParts.length < 3) return null;
        
        const signature = urlObj.searchParams.get('sig');
        const version = urlObj.searchParams.get('v');
        
        if (!signature) return null;
        
        return {
          restaurantId: pathParts[1],
          tableId: pathParts[2],
          signature,
          version: parseInt(version || '1', 10),
        };
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Try to parse as secure QR code first
      const secureQR = parseSecureQRUrl(data);

      if (secureQR) {
        await handleSecureTableQR(secureQR);
        return;
      }

      // Legacy QR code handling
      let qrData: QRCodeData;

      try {
        if (data.includes('?data=')) {
          const url = new URL(data);
          const dataParam = url.searchParams.get('data');
          if (dataParam) {
            qrData = JSON.parse(decodeURIComponent(dataParam));
          } else {
            throw new Error('No data parameter found');
          }
        } else {
          qrData = JSON.parse(data);
        }
      } catch (parseError) {
        logger.error('Failed to parse QR data locally:', parseError);

        const validationResult = await ApiService.validateQRCode(data);

        if (!validationResult.valid || !validationResult.data) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('QR Code Inválido', 'Este QR code não é válido ou não é do Okinawa.');
          resetScanner();
          return;
        }

        qrData = validationResult.data;
      }

      await analytics.logQRScan(qrData.type, qrData.restaurantId);

      handleQRData(qrData);
    } catch (error) {
      logger.error('Error processing QR code:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erro',
        'Não foi possível processar o QR code. Tente novamente.',
        [{ text: 'OK', onPress: resetScanner }]
      );
      await analytics.logError('QR code processing failed', 'QR_SCAN_ERROR', false);
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Handle secure table QR code with HMAC validation
   */
  const handleSecureTableQR = async (parsed: ParsedSecureQR) => {
    try {
      // Validate signature with backend
      const validation = await ApiService.validateTableQRCode({
        restaurant_id: parsed.restaurantId,
        table_id: parsed.tableId,
        signature: parsed.signature,
        version: parsed.version,
      });

      if (!validation.valid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'QR Code Inválido',
          validation.error || 'Este QR code não é válido ou foi alterado.',
          [{ text: 'OK', onPress: resetScanner }]
        );
        return;
      }

      await analytics.logQRScan('table', parsed.restaurantId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show welcome dialog and offer to start session
      Alert.alert(
        'Mesa Identificada! 🎉',
        `Bem-vindo! Você está na ${validation.table?.table_number || 'mesa'}.\n\nDeseja iniciar sua experiência?`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel', 
            onPress: resetScanner 
          },
          {
            text: 'Iniciar',
            onPress: () => startTableSession(parsed, validation),
          },
        ]
      );
    } catch (error) {
      logger.error('Error validating secure QR:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível validar o QR code. Tente novamente.');
      resetScanner();
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Start a new table session after QR validation
   */
  const startTableSession = async (
    parsed: ParsedSecureQR,
    validation: any
  ) => {
    try {
      setProcessing(true);

      const session = await ApiService.startTableSession({
        restaurant_id: parsed.restaurantId,
        table_id: parsed.tableId,
        signature: parsed.signature,
        version: parsed.version,
        guest_count: 1, // Can be updated later
      });

      // Navigate to session/menu screen
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs' as never,
          },
        ],
      });

      // Then navigate to the restaurant/menu
      setTimeout(() => {
        navigation.navigate('Restaurant' as never, {
          restaurantId: parsed.restaurantId,
          tableId: parsed.tableId,
          sessionId: session.id,
        } as never);
      }, 100);

    } catch (error) {
      logger.error('Error starting session:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a sessão. Tente novamente.');
      resetScanner();
    } finally {
      setProcessing(false);
    }
  };

  const handleQRData = (data: QRCodeData) => {
    switch (data.type) {
      case 'table':
        if (data.tableId) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'Mesa Identificada',
            `Você escaneou a mesa do restaurante. Deseja ver o cardápio?`,
            [
              { text: 'Cancelar', style: 'cancel', onPress: resetScanner },
              {
                text: 'Ver Cardápio',
                onPress: () => {
                  navigation.navigate('Menu' as never, {
                    restaurantId: data.restaurantId,
                    tableId: data.tableId,
                  } as never);
                },
              },
            ]
          );
        }
        break;

      case 'menu':
        navigation.navigate('Restaurant' as never, {
          restaurantId: data.restaurantId,
        } as never);
        break;

      case 'payment':
        if (data.orderId && data.metadata?.amount) {
          navigation.navigate('Payment' as never, {
            restaurantId: data.restaurantId,
            orderId: data.orderId,
            amount: data.metadata.amount,
          } as never);
        } else {
          Alert.alert('Erro', 'Dados de pagamento incompletos no QR code.');
          resetScanner();
        }
        break;

      case 'restaurant':
        navigation.navigate('Restaurant' as never, {
          restaurantId: data.restaurantId,
        } as never);
        break;

      case 'invitation':
        // Handle guest invitation QR codes
        if (data.metadata?.inviteToken) {
          navigation.navigate('AcceptInvitation' as never, {
            token: data.metadata.inviteToken,
          } as never);
        } else {
          Alert.alert('Erro', 'Convite inválido.');
          resetScanner();
        }
        break;

      default:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('QR Code Desconhecido', 'Tipo de QR code não reconhecido.');
        resetScanner();
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProcessing(false);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="camera-off" size={80} color={colors.foregroundMuted} />
        <Text variant="headlineSmall" style={styles.noPermissionTitle}>
          Câmera Não Disponível
        </Text>
        <Text variant="bodyMedium" style={styles.noPermissionText}>
          Você precisa permitir o acesso à câmera para escanear QR codes.
        </Text>
        <Button
          mode="contained"
          onPress={requestCameraPermission}
          style={styles.permissionButton}
        >
          Solicitar Permissão
        </Button>
        <Button
          mode="outlined"
          onPress={() => Linking.openSettings()}
          style={styles.settingsButton}
        >
          Abrir Configurações
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onCameraReady={() => setCameraReady(true)}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <IconButton
              icon="close"
              iconColor="#fff"
              size={28}
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            />
            <Text variant="titleLarge" style={styles.headerTitle}>
              {scanMode === 'table' ? 'Escanear Mesa' : 
               scanMode === 'payment' ? 'Escanear Pagamento' : 
               'Escanear QR Code'}
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            {processing ? (
              <>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.instructionText}>Validando QR code...</Text>
              </>
            ) : scanned ? (
              <>
                <Icon name="check-circle" size={48} color={colors.success} />
                <Text style={styles.instructionText}>QR Code Escaneado!</Text>
              </>
            ) : (
              <>
                <Icon name="qrcode-scan" size={48} color="#fff" />
                <Text style={styles.instructionText}>
                  {scanMode === 'table' 
                    ? 'Aponte para o QR Code da mesa'
                    : 'Posicione o QR code dentro do quadro'}
                </Text>
                <Text style={styles.subInstructionText}>
                  O escaneamento será automático
                </Text>
              </>
            )}

            {scanned && !processing && (
              <Button
                mode="contained"
                onPress={resetScanner}
                style={styles.rescanButton}
                buttonColor="#fff"
                textColor="#000"
              >
                Escanear Novamente
              </Button>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.foregroundMuted,
  },
  noPermissionTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: colors.foreground,
  },
  noPermissionText: {
    color: colors.foregroundMuted,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  permissionButton: {
    marginBottom: 10,
  },
  settingsButton: {
    marginTop: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingBottom: 80,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 40,
  },
  subInstructionText: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  rescanButton: {
    marginTop: 20,
  },
});

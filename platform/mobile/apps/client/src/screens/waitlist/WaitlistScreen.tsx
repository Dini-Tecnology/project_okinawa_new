import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Chip,
  Card,
  IconButton,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useAuth } from '@okinawa/shared/hooks/useAuth';
import { useWebSocket } from '@okinawa/shared/hooks/useWebSocket';
import { ApiService } from '@okinawa/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface WaitlistEntry {
  id: string;
  position: number;
  estimated_wait_minutes: number | null;
  status: 'waiting' | 'called' | 'seated' | 'no_show' | 'cancelled';
  customer_name: string;
  party_size: number;
  has_kids: boolean;
  table_number: string | null;
  waitlist_bar_orders: Array<{ itemName: string; itemPrice: number; quantity: number }>;
}

interface WaitlistScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      entryId?: string;
    };
  };
}

export default function WaitlistScreen({ route }: WaitlistScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const restaurantId = route?.params?.restaurantId || '';

  // Form state
  const [guestName, setGuestName] = useState(user?.full_name || '');
  const [partySize, setPartySize] = useState('2');
  const [preference, setPreference] = useState('qualquer');
  const [hasKids, setHasKids] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Queue state
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Position animation
  const positionAnim = useRef(new Animated.Value(0)).current;

  // FIX-13: WebSocket listeners for waitlist events
  const { connected, on, off, joinRoom, leaveRoom } = useWebSocket('/waitlist');

  useEffect(() => {
    if (!connected || !restaurantId || !user?.id) return;

    joinRoom(`waitlist:${restaurantId}:user:${user.id}`);

    const handleWaitlistCalled = (data: any) => {
      // User has been called — their table is ready
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('waitlist.tableReady'),
        t('waitlist.tableReadyDesc', { table: data?.table_number || '' }),
      );
      // Update entry state
      setEntry((prev) =>
        prev
          ? { ...prev, status: 'called', table_number: data?.table_number ?? prev.table_number }
          : prev,
      );
    };

    const handleWaitlistUpdate = (data: any) => {
      // Position or wait time changed
      if (data?.position != null || data?.estimated_wait_minutes != null) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEntry((prev) =>
          prev
            ? {
                ...prev,
                position: data.position ?? prev.position,
                estimated_wait_minutes: data.estimated_wait_minutes ?? prev.estimated_wait_minutes,
              }
            : prev,
        );
      }
    };

    on('waitlist:called', handleWaitlistCalled);
    on('waitlist:update', handleWaitlistUpdate);

    return () => {
      off('waitlist:called', handleWaitlistCalled);
      off('waitlist:update', handleWaitlistUpdate);
      leaveRoom(`waitlist:${restaurantId}:user:${user.id}`);
    };
  }, [connected, restaurantId, user?.id]);

  // Check if already in queue
  const fetchMyPosition = useCallback(async () => {
    try {
      const response = await ApiService.get(
        `/restaurant/waitlist/my?restaurant_id=${restaurantId}`,
      );
      if (response.data) {
        setEntry(response.data);
        positionAnim.setValue(response.data.position);
      }
    } catch (error) {
      // Not in queue yet
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId, positionAnim]);

  // If we have an entryId from route, fetch by ID
  const fetchByEntryId = useCallback(async () => {
    if (route?.params?.entryId) {
      try {
        const response = await ApiService.get(
          `/restaurant/waitlist/position/${route.params.entryId}`,
        );
        setEntry(response.data);
        positionAnim.setValue(response.data.position);
      } catch (error) {
        // Entry not found
      } finally {
        setLoading(false);
      }
    }
  }, [route?.params?.entryId, positionAnim]);

  useEffect(() => {
    if (route?.params?.entryId) {
      fetchByEntryId();
    } else {
      fetchMyPosition();
    }
  }, [fetchMyPosition, fetchByEntryId, route?.params?.entryId]);

  // Animate position changes
  useEffect(() => {
    if (entry) {
      Animated.spring(positionAnim, {
        toValue: entry.position,
        useNativeDriver: false,
        tension: 40,
        friction: 7,
      }).start();
    }
  }, [entry?.position, positionAnim, entry]);

  const handleJoinQueue = useCallback(async () => {
    if (!guestName.trim()) {
      Alert.alert(t('common.error'), t('waitlist.guestName'));
      return;
    }

    const size = parseInt(partySize, 10);
    if (!size || size < 1) {
      Alert.alert(t('common.error'), t('waitlist.partySize'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await ApiService.post('/restaurant/waitlist', {
        restaurant_id: restaurantId,
        guest_name: guestName.trim(),
        party_size: size,
        preference,
        has_kids: hasKids,
        notes: notes.trim() || undefined,
      });

      setEntry({
        id: response.data.id,
        position: response.data.position,
        estimated_wait_minutes: response.data.estimatedWaitMinutes,
        status: 'waiting',
        customer_name: guestName,
        party_size: size,
        has_kids: hasKids,
        table_number: null,
        waitlist_bar_orders: [],
      });

      // Navigate to FamilyMode if kids
      if (hasKids) {
        navigation.navigate(
          'FamilyModeScreen' as never,
          { restaurantId, entryId: response.data.id } as never,
        );
      }
    } catch (error: any) {
      if (error?.response?.status === 503) {
        Alert.alert(t('common.error'), t('waitlist.unavailable'));
      } else {
        Alert.alert(t('common.error'), error?.message || t('common.error'));
      }
    } finally {
      setSubmitting(false);
    }
  }, [guestName, partySize, preference, hasKids, notes, restaurantId, navigation]);

  const handleLeaveQueue = useCallback(() => {
    Alert.alert(t('waitlist.leave'), t('waitlist.leaveConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.patch(`/restaurant/waitlist/${entry?.id}/cancel`);
            setEntry(null);
          } catch (error) {
            // Handle error silently
          }
        },
      },
    ]);
  }, [entry?.id]);

  const handleOrderDrinks = useCallback(() => {
    navigation.navigate(
      'WaitlistBarScreen' as never,
      { restaurantId, entryId: entry?.id } as never,
    );
  }, [navigation, restaurantId, entry?.id]);

  const handleViewMenu = useCallback(() => {
    navigation.navigate(
      'MenuScreen' as never,
      { restaurantId, familyMode: hasKids } as never,
    );
  }, [navigation, restaurantId, hasKids]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyPosition();
  }, [fetchMyPosition]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          padding: 16,
        },
        title: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: 20,
        },
        input: {
          marginBottom: 16,
          backgroundColor: colors.card,
        },
        segmentedContainer: {
          marginBottom: 16,
        },
        segmentLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 8,
        },
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 4,
          marginBottom: 16,
        },
        switchLabel: {
          fontSize: 16,
          color: colors.foreground,
        },
        submitButton: {
          marginTop: 8,
          marginBottom: 24,
          borderRadius: 12,
          backgroundColor: colors.primary,
        },
        // Position view styles
        positionContainer: {
          alignItems: 'center',
          paddingVertical: 32,
        },
        positionRing: {
          width: 160,
          height: 160,
          borderRadius: 80,
          borderWidth: 4,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        positionNumber: {
          fontSize: 48,
          fontWeight: '700',
          color: colors.primary,
        },
        positionLabel: {
          fontSize: 16,
          color: colors.foregroundSecondary,
          marginBottom: 4,
        },
        estimateText: {
          fontSize: 14,
          color: colors.foregroundSecondary,
          marginBottom: 24,
        },
        statsRow: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginBottom: 24,
        },
        statChip: {
          alignItems: 'center',
        },
        statValue: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
        },
        statLabel: {
          fontSize: 12,
          color: colors.foregroundSecondary,
        },
        calledBanner: {
          backgroundColor: colors.success,
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          marginBottom: 24,
        },
        calledTitle: {
          fontSize: 20,
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: 4,
        },
        calledDesc: {
          fontSize: 14,
          color: '#FFFFFF',
        },
        whileWaitingTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 12,
        },
        actionCard: {
          marginBottom: 12,
          borderRadius: 12,
        },
        actionCardContent: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        },
        actionTextContainer: {
          flex: 1,
          marginLeft: 12,
        },
        actionTitle: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
        },
        actionDesc: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        leaveButton: {
          marginTop: 16,
          borderColor: colors.error,
        },
        leaveButtonLabel: {
          color: colors.error,
        },
        loadingContainer: {
          flex: 1,
          backgroundColor: colors.background,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors],
  );

  // Loading state
  if (loading) {
    return (
      <ScreenContainer>
      <View style={styles.loadingContainer}>
        <View style={[skeletonStyles.card, { backgroundColor: colors.card }]}>
          <View style={[skeletonStyles.title, { backgroundColor: colors.backgroundTertiary }]} />
        </View>
      </View>
    
      </ScreenContainer>
    );
  }

  // Position view (already in queue)
  if (entry) {
    const isCalled = entry.status === 'called';
    const isNext = entry.position === 1;

    return (
      <ScreenContainer>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Called banner */}
          {isCalled && (
            <View style={styles.calledBanner}>
              <Text style={styles.calledTitle}>
                {t('waitlist.tableReady')}
              </Text>
              <Text style={styles.calledDesc}>
                {t('waitlist.tableReadyDesc', {
                  table: entry.table_number || '',
                })}
              </Text>
            </View>
          )}

          {/* Position ring */}
          <View style={styles.positionContainer}>
            <View
              style={[
                styles.positionRing,
                isCalled && { borderColor: colors.success },
              ]}
            >
              <Animated.Text style={styles.positionNumber}>
                {entry.position}
              </Animated.Text>
            </View>
            <Text style={styles.positionLabel}>
              {t('waitlist.position', { pos: entry.position })}
            </Text>
            <Text style={styles.estimateText}>
              {t('waitlist.estimate', {
                min: entry.estimated_wait_minutes || entry.position * 5,
              })}
            </Text>
          </View>

          {/* Stats chips */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{entry.party_size}</Text>
              <Text style={styles.statLabel}>{t('waitlist.people')}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>
                {entry.table_number || '-'}
              </Text>
              <Text style={styles.statLabel}>{t('waitlist.table')}</Text>
            </View>
            <View style={styles.statChip}>
              <Text
                style={[
                  styles.statValue,
                  isCalled && { color: colors.success },
                ]}
              >
                {isCalled
                  ? t('waitlist.statusCalled')
                  : t('waitlist.statusWaiting')}
              </Text>
              <Text style={styles.statLabel}>{t('waitlist.status')}</Text>
            </View>
          </View>

          {/* While waiting actions */}
          {!isCalled && (
            <>
              <Text style={styles.whileWaitingTitle}>
                {t('waitlist.whileWaiting')}
              </Text>

              <Card
                style={styles.actionCard}
                onPress={handleOrderDrinks}
                accessibilityLabel={t('waitlist.orderDrinks')}
              >
                <View style={styles.actionCardContent}>
                  <IconButton
                    icon="glass-cocktail"
                    size={24}
                    iconColor={colors.primary}
                    accessibilityLabel={t('waitlist.orderDrinks')}
                  />
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>
                      {t('waitlist.orderDrinks')}
                    </Text>
                    <Text style={styles.actionDesc}>
                      {t('waitlist.orderDrinksDesc')}
                    </Text>
                  </View>
                </View>
              </Card>

              <Card
                style={styles.actionCard}
                onPress={handleViewMenu}
                accessibilityLabel={t('waitlist.viewMenu')}
              >
                <View style={styles.actionCardContent}>
                  <IconButton
                    icon="book-open-outline"
                    size={24}
                    iconColor={colors.secondary}
                    accessibilityLabel={t('waitlist.viewMenu')}
                  />
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>
                      {t('waitlist.viewMenu')}
                    </Text>
                    <Text style={styles.actionDesc}>
                      {t('waitlist.viewMenuDesc')}
                    </Text>
                  </View>
                </View>
              </Card>
            </>
          )}

          {/* Leave queue button */}
          {!isCalled && (
            <Button
              mode="outlined"
              onPress={handleLeaveQueue}
              style={styles.leaveButton}
              labelStyle={styles.leaveButtonLabel}
              icon="exit-to-app"
              accessibilityLabel={t('waitlist.leave')}
            >
              {t('waitlist.leave')}
            </Button>
          )}
        </View>
      </ScrollView>
    
      </ScreenContainer>
    );
  }

  // Join form
  return (
    <ScreenContainer hasKeyboard>
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('waitlist.joinTitle')}</Text>

        <TextInput
          label={t('waitlist.guestName')}
          value={guestName}
          onChangeText={setGuestName}
          style={styles.input}
          mode="outlined"
          accessibilityLabel={t('waitlist.guestName')}
        />

        <TextInput
          label={t('waitlist.partySize')}
          value={partySize}
          onChangeText={setPartySize}
          style={styles.input}
          mode="outlined"
          keyboardType="number-pad"
          accessibilityLabel={t('waitlist.partySize')}
        />

        <View style={styles.segmentedContainer}>
          <Text style={styles.segmentLabel}>
            {t('waitlist.preference')}
          </Text>
          <SegmentedButtons
            value={preference}
            onValueChange={setPreference}
            buttons={[
              { value: 'salao', label: t('waitlist.prefSalao') },
              { value: 'terraco', label: t('waitlist.prefTerraco') },
              { value: 'qualquer', label: t('waitlist.prefAny') },
            ]}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('waitlist.hasKids')}</Text>
          <Switch
            value={hasKids}
            onValueChange={setHasKids}
            color={colors.primary}
            accessibilityLabel={t('waitlist.hasKids')}
          />
        </View>

        <TextInput
          label={t('waitlist.notes')}
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={2}
          accessibilityLabel={t('waitlist.notes')}
        />

        <Button
          mode="contained"
          onPress={handleJoinQueue}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          icon="account-group"
          accessibilityLabel={t('waitlist.joinButton')}
        >
          {t('waitlist.joinButton')}
        </Button>
      </View>
    </ScrollView>
  
    </ScreenContainer>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    height: 48,
    width: 80,
    borderRadius: 8,
  },
});

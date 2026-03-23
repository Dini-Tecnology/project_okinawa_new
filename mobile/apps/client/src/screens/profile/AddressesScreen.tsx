/**
 * AddressesScreen - User Saved Addresses
 *
 * Displays a list of saved addresses with label, full address, and default badge.
 * Supports adding new addresses, setting default, and deleting.
 * Address form is presented as a modal.
 *
 * @module client/screens/profile
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  IconButton,
  Button,
  ActivityIndicator,
  FAB,
  Chip,
  TextInput,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';

// ============================================
// TYPES
// ============================================

interface Address {
  id: string;
  label: 'home' | 'work' | 'other';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
}

interface AddressFormData {
  label: 'home' | 'work' | 'other';
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

const LABEL_ICONS: Record<string, string> = {
  home: 'home',
  work: 'briefcase',
  other: 'map-marker',
};

const EMPTY_FORM: AddressFormData = {
  label: 'home',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
};

// ============================================
// SKELETON
// ============================================

function AddressSkeleton({ colors }: { colors: any }) {
  return (
    <View style={{ padding: 16, gap: 10 }}>
      {[1, 2].map((i) => (
        <View
          key={i}
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.card,
            gap: 8,
          }}
        >
          <View style={{ width: '30%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '80%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '50%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
        </View>
      ))}
    </View>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function AddressesScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_FORM);

  // Fetch addresses
  const {
    data: addresses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => ApiService.get('/users/addresses'),
  });

  // Add address
  const addMutation = useMutation({
    mutationFn: (data: AddressFormData) => ApiService.post('/users/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setFormVisible(false);
      setFormData(EMPTY_FORM);
      Alert.alert(t('common.success'), t('addresses.savedSuccess'));
    },
    onError: () => {
      Alert.alert(t('common.error'), t('addresses.errorSaving'));
    },
  });

  // Delete address
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.delete(`/users/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert(t('common.success'), t('addresses.deletedSuccess'));
    },
    onError: () => {
      Alert.alert(t('common.error'), t('addresses.errorDeleting'));
    },
  });

  // Set default
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => ApiService.patch(`/users/addresses/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert(t('common.success'), t('addresses.defaultSuccess'));
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLongPress = useCallback(
    (address: Address) => {
      Alert.alert(
        address.street,
        undefined,
        [
          {
            text: t('addresses.setDefault'),
            onPress: () => setDefaultMutation.mutate(address.id),
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
              Alert.alert(t('addresses.deleteConfirm'), undefined, [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.delete'),
                  style: 'destructive',
                  onPress: () => deleteMutation.mutate(address.id),
                },
              ]);
            },
          },
          { text: t('common.cancel'), style: 'cancel' },
        ],
      );
    },
    [t, setDefaultMutation, deleteMutation],
  );

  const handleSaveAddress = useCallback(() => {
    if (!formData.street || !formData.number || !formData.city || !formData.state || !formData.zip) {
      Alert.alert(t('common.error'), t('common.required'));
      return;
    }
    addMutation.mutate(formData);
  }, [formData, addMutation, t]);

  const updateField = useCallback(
    (field: keyof AddressFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  const getFullAddress = (addr: Address) => {
    const parts = [`${addr.street}, ${addr.number}`];
    if (addr.complement) parts.push(addr.complement);
    parts.push(`${addr.neighborhood} - ${addr.city}/${addr.state}`);
    parts.push(addr.zip);
    return parts.join('\n');
  };

  // ============================================
  // RENDER STATES
  // ============================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="map-marker" size={24} iconColor={colors.primary} style={{ margin: 0 }} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('addresses.title')}
          </Text>
        </View>
        <AddressSkeleton colors={colors} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle-outline" size={64} iconColor={colors.foregroundMuted} />
        <Text variant="bodyLarge" style={styles.errorText}>
          {t('addresses.errorLoading')}
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton icon="map-marker" size={24} iconColor={colors.primary} style={{ margin: 0 }} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('addresses.title')}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.headerCount}>
          {t('addresses.count', { count: addresses.length })}
        </Text>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="map-marker-off" size={80} iconColor={colors.foregroundMuted} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            {t('addresses.emptyTitle')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyMessage}>
            {t('addresses.emptyMessage')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item: address }) => (
            <TouchableOpacity
              style={[styles.addressCard, address.is_default && styles.addressCardDefault]}
              onLongPress={() => handleLongPress(address)}
              activeOpacity={0.7}
            >
              <View style={styles.addressTop}>
                <View style={styles.addressLabelRow}>
                  <IconButton
                    icon={LABEL_ICONS[address.label] || 'map-marker'}
                    size={20}
                    iconColor={colors.primary}
                    style={{ margin: 0 }}
                  />
                  <Text variant="titleMedium" style={styles.addressLabel}>
                    {t(`addresses.labels.${address.label}`)}
                  </Text>
                </View>
                {address.is_default && (
                  <Chip
                    compact
                    style={styles.defaultChip}
                    textStyle={styles.defaultChipText}
                  >
                    {t('addresses.defaultBadge')}
                  </Chip>
                )}
              </View>
              <Text variant="bodyMedium" style={styles.addressText}>
                {getFullAddress(address)}
              </Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <Text variant="bodySmall" style={styles.tipText}>
              {t('addresses.tip')}
            </Text>
          }
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        onPress={() => {
          setFormData(EMPTY_FORM);
          setFormVisible(true);
        }}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color={colors.primaryForeground}
      />

      {/* Address Form Dialog */}
      <Portal>
        <Dialog
          visible={formVisible}
          onDismiss={() => setFormVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={{ color: colors.foreground }}>
            {t('addresses.addNew')}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView style={styles.formScroll}>
                {/* Label Selector */}
                <View style={styles.labelRow}>
                  {(['home', 'work', 'other'] as const).map((label) => (
                    <Chip
                      key={label}
                      selected={formData.label === label}
                      onPress={() => updateField('label', label)}
                      style={styles.labelChip}
                      icon={LABEL_ICONS[label]}
                    >
                      {t(`addresses.labels.${label}`)}
                    </Chip>
                  ))}
                </View>

                <TextInput
                  label={t('addresses.form.street')}
                  value={formData.street}
                  onChangeText={(v) => updateField('street', v)}
                  mode="outlined"
                  style={styles.input}
                  textColor={colors.foreground}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />

                <View style={styles.formRow}>
                  <TextInput
                    label={t('addresses.form.number')}
                    value={formData.number}
                    onChangeText={(v) => updateField('number', v)}
                    mode="outlined"
                    style={[styles.input, { flex: 1 }]}
                    keyboardType="numeric"
                    textColor={colors.foreground}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                  <TextInput
                    label={t('addresses.form.complement')}
                    value={formData.complement}
                    onChangeText={(v) => updateField('complement', v)}
                    mode="outlined"
                    style={[styles.input, { flex: 2 }]}
                    textColor={colors.foreground}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                </View>

                <TextInput
                  label={t('addresses.form.neighborhood')}
                  value={formData.neighborhood}
                  onChangeText={(v) => updateField('neighborhood', v)}
                  mode="outlined"
                  style={styles.input}
                  textColor={colors.foreground}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />

                <View style={styles.formRow}>
                  <TextInput
                    label={t('addresses.form.city')}
                    value={formData.city}
                    onChangeText={(v) => updateField('city', v)}
                    mode="outlined"
                    style={[styles.input, { flex: 2 }]}
                    textColor={colors.foreground}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                  <TextInput
                    label={t('addresses.form.state')}
                    value={formData.state}
                    onChangeText={(v) => updateField('state', v)}
                    mode="outlined"
                    style={[styles.input, { flex: 1 }]}
                    maxLength={2}
                    autoCapitalize="characters"
                    textColor={colors.foreground}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                </View>

                <TextInput
                  label={t('addresses.form.zip')}
                  value={formData.zip}
                  onChangeText={(v) => updateField('zip', v)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={9}
                  textColor={colors.foreground}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setFormVisible(false)} textColor={colors.foregroundSecondary}>
              {t('common.cancel')}
            </Button>
            <Button
              onPress={handleSaveAddress}
              loading={addMutation.isPending}
              textColor={colors.primary}
            >
              {t('addresses.form.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      color: colors.foreground,
      fontWeight: 'bold',
    },
    headerCount: {
      color: colors.foregroundMuted,
      marginTop: 4,
      marginLeft: 32,
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    addressCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    addressCardDefault: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    addressTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    addressLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    addressLabel: {
      color: colors.foreground,
      fontWeight: '600',
    },
    defaultChip: {
      backgroundColor: colors.successBackground,
      height: 28,
    },
    defaultChipText: {
      color: colors.success,
      fontSize: 11,
      fontWeight: '600',
    },
    addressText: {
      color: colors.foregroundSecondary,
      lineHeight: 20,
    },
    tipText: {
      color: colors.foregroundMuted,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 24,
      lineHeight: 18,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 24,
      borderRadius: 16,
    },
    dialog: {
      backgroundColor: colors.card,
      maxHeight: '80%',
    },
    formScroll: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    labelRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    labelChip: {
      backgroundColor: colors.backgroundSecondary,
    },
    input: {
      marginBottom: 12,
      backgroundColor: colors.input,
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
    },
    // States
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.foregroundSecondary,
      marginTop: 12,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 16,
      borderRadius: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyTitle: {
      marginTop: 16,
      color: colors.foreground,
      textAlign: 'center',
    },
    emptyMessage: {
      marginTop: 8,
      color: colors.foregroundMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

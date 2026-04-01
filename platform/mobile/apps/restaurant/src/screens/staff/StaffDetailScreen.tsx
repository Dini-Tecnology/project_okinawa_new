/**
 * StaffDetailScreen - Restaurant Staff Member Details
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Chip, Button, IconButton, ActivityIndicator, Avatar, List, Divider } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ApiService from '@/shared/services/api';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import type { User } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type RouteParams = {
  StaffDetail: {
    staffId: string;
  };
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  manager: 'Gerente',
  waiter: 'Garçom',
  chef: 'Chef',
  cashier: 'Caixa',
  delivery: 'Entregador',
};

export default function StaffDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'StaffDetail'>>();
  const navigation = useNavigation();
  const colors = useColors();
  const { t } = useI18n();
  const { staffId } = route.params;

  const [staff, setStaff] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Dynamic role colors based on current theme
   */
  const getRoleColor = useCallback((role?: string): string => {
    if (!role) return colors.mutedForeground;
    const roleColors: Record<string, string> = {
      owner: colors.primary,
      manager: colors.info,
      waiter: colors.success,
      chef: colors.warning,
      cashier: colors.info,
      delivery: colors.info,
    };
    return roleColors[role.toLowerCase()] || colors.mutedForeground;
  }, [colors]);

  const getRoleLabel = (role?: string) => {
    if (!role) return 'Sem cargo';
    return ROLE_LABELS[role.toLowerCase()] || role;
  };

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
    card: {
      margin: 16,
      marginBottom: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerInfo: {
      flex: 1,
      marginLeft: 16,
    },
    headerName: {
      color: colors.foreground,
    },
    email: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    phoneIcon: {
      margin: 0,
      padding: 0,
      marginRight: 4,
    },
    phoneText: {
      color: colors.foreground,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    roleChip: {
      height: 32,
    },
    chipText: {
      color: colors.cardForeground,
      fontSize: 13,
    },
    sectionTitle: {
      marginBottom: 12,
      color: colors.foreground,
    },
    listItemTitle: {
      color: colors.foreground,
    },
    listItemDescription: {
      color: colors.mutedForeground,
    },
    removeButton: {
      borderColor: colors.destructive,
      marginTop: 8,
    },
  }), [colors]);

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const staffList = await ApiService.getStaff();
      const foundStaff = staffList.find((s: User) => s.id === staffId);
      if (foundStaff) {
        setStaff(foundStaff);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = () => {
    if (!staff) return;

    Alert.alert(
      t('staff.removeStaff'),
      `${t('staff.removeStaffConfirm')} ${staff.full_name}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.removeStaff(staff.id);
              Alert.alert(t('common.success'), t('staff.staffRemoved'), [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.generic'));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  if (!staff) {
    return (
      <ScreenContainer>
      <View style={styles.emptyContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={colors.mutedForeground} />
        <Text variant="headlineSmall" style={{ color: colors.foreground }}>{t('staff.notFound')}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          {t('common.back')}
        </Button>
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            {staff.avatar_url ? (
              <Avatar.Image size={80} source={{ uri: staff.avatar_url }} />
            ) : (
              <Avatar.Text
                size={80}
                label={staff.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
                style={{ backgroundColor: getRoleColor(staff.roles?.[0]?.role) }}
              />
            )}
            <View style={styles.headerInfo}>
              <Text variant="headlineMedium" style={styles.headerName}>{staff.full_name}</Text>
              <Text variant="bodyLarge" style={styles.email}>
                {staff.email}
              </Text>
              {staff.phone && (
                <View style={styles.phoneRow}>
                  <IconButton icon="phone" size={16} style={styles.phoneIcon} iconColor={colors.mutedForeground} />
                  <Text variant="bodyMedium" style={styles.phoneText}>{staff.phone}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.badges}>
            <Chip
              style={[styles.roleChip, { backgroundColor: getRoleColor(staff.roles?.[0]?.role) }]}
              textStyle={styles.chipText}
              icon="shield-account"
            >
              {getRoleLabel(staff.roles?.[0]?.role)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('staff.information')}
          </Text>
          <List.Item
            title="Email"
            titleStyle={styles.listItemTitle}
            description={staff.email}
            descriptionStyle={styles.listItemDescription}
            left={props => <List.Icon {...props} icon="email" color={colors.mutedForeground} />}
          />
          {staff.phone && (
            <List.Item
              title={t('profile.phone')}
              titleStyle={styles.listItemTitle}
              description={staff.phone}
              descriptionStyle={styles.listItemDescription}
              left={props => <List.Icon {...props} icon="phone" color={colors.mutedForeground} />}
            />
          )}
          <List.Item
            title={t('staff.roles?.[0]?.role')}
            titleStyle={styles.listItemTitle}
            description={getRoleLabel(staff.roles?.[0]?.role)}
            descriptionStyle={styles.listItemDescription}
            left={props => <List.Icon {...props} icon="briefcase" color={colors.mutedForeground} />}
          />
          {(staff as any).created_at && (
            <List.Item
              title={t('staff.memberSince')}
              titleStyle={styles.listItemTitle}
              description={format(new Date((staff as any).created_at), "dd/MM/yyyy", { locale: ptBR })}
              descriptionStyle={styles.listItemDescription}
              left={props => <List.Icon {...props} icon="calendar" color={colors.mutedForeground} />}
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('staff.actions')}
          </Text>
          <Button
            mode="outlined"
            onPress={handleRemoveStaff}
            style={styles.removeButton}
            textColor={colors.destructive}
            icon="account-remove"
            accessibilityRole="button"
            accessibilityLabel={`${t('staff.removeFromTeam')} ${staff.full_name}`}
          >
            {t('staff.removeFromTeam')}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
    </ScreenContainer>
  );
}

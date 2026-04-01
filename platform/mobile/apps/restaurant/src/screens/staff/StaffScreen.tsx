import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, Card, Button, FAB, Chip, Searchbar, Avatar, IconButton } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface StaffMember {
  id: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  role: 'owner' | 'manager' | 'chef' | 'waiter' | 'barman' | 'maitre';
  status: 'active' | 'inactive' | 'on_break';
  shift_start?: string;
  shift_end?: string;
  current_shift?: {
    id: string;
    clock_in: string;
    clock_out?: string;
  };
}

export default function StaffScreen({ navigation }: any) {
  const { t } = useI18n();
  const colors = useColors();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const roles = ['all', 'owner', 'manager', 'chef', 'waiter', 'barman', 'maitre'];

  useEffect(() => {
    loadStaff();
  }, [filterRole]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterRole !== 'all') {
        params.role = filterRole;
      }
      const response = await ApiService.getStaff();
      setStaff(response.data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
  };

  const updateStatus = async (staffId: string, status: string) => {
    try {
      await ApiService.updateStaffRole(staffId, status);
      loadStaff();
    } catch (error) {
      console.error('Failed to update staff status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.foregroundMuted;
      case 'on_break': return colors.warning;
      default: return colors.foregroundMuted;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return colors.accent;
      case 'manager': return colors.info;
      case 'chef': return colors.error;
      case 'waiter': return colors.success;
      case 'barman': return colors.warning;
      case 'maitre': return colors.info;
      default: return colors.foregroundMuted;
    }
  };

  const filteredStaff = staff.filter((member) =>
    member.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    searchbar: {
      margin: 15,
      elevation: 2,
      backgroundColor: colors.card,
    },
    filters: {
      marginBottom: 10,
    },
    filtersContent: {
      paddingHorizontal: 15,
    },
    filterChip: {
      marginRight: 8,
    },
    list: {
      padding: 15,
    },
    card: {
      marginBottom: 15,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    info: {
      flex: 1,
    },
    name: {
      color: colors.foreground,
    },
    email: {
      color: colors.foregroundSecondary,
      marginTop: 2,
    },
    badges: {
      gap: 5,
      alignItems: 'flex-end',
    },
    shiftInfo: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    shiftText: {
      color: colors.foregroundSecondary,
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
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  const renderStaffMember = ({ item }: { item: StaffMember }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar.Image
              size={48}
              source={
                item.profile.avatar_url
                  ? { uri: item.profile.avatar_url }
                  : require('@/shared/assets/default-avatar.png')
              }
            />
            <View style={styles.info}>
              <Text variant="titleMedium" style={styles.name}>{item.profile.full_name}</Text>
              <Text variant="bodySmall" style={styles.email}>
                {item.profile.email}
              </Text>
            </View>
          </View>
          <View style={styles.badges}>
            <Chip
              style={{ backgroundColor: getRoleColor(item.role) }}
              textStyle={{ color: colors.primaryForeground, fontSize: 11 }}
            >
              {(t(`staff.roles.${item.role}`) || item.role).toUpperCase()}
            </Chip>
            <Chip
              style={{ backgroundColor: getStatusColor(item.status) }}
              textStyle={{ color: colors.primaryForeground, fontSize: 11 }}
            >
              {(t(`staff.status.${item.status}`) || item.status.replace('_', ' ')).toUpperCase()}
            </Chip>
          </View>
        </View>

        {item.current_shift && (
          <View style={styles.shiftInfo}>
            <Text variant="bodySmall" style={styles.shiftText}>
              {t('staff.currentlyOnShift')}{' '}
              {new Date(item.current_shift.clock_in).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {item.shift_start && item.shift_end && !item.current_shift && (
          <View style={styles.shiftInfo}>
            <Text variant="bodySmall" style={styles.shiftText}>
              {t('staff.scheduled')}: {item.shift_start} - {item.shift_end}
            </Text>
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        {item.status === 'active' && (
          <Button
            mode="outlined"
            onPress={() => updateStatus(item.id, 'on_break')}
            compact
            accessibilityRole="button"
            accessibilityLabel={`${t('staff.startBreak')} ${item.profile.full_name}`}
          >
            {t('staff.startBreak')}
          </Button>
        )}
        {item.status === 'on_break' && (
          <Button
            mode="contained"
            onPress={() => updateStatus(item.id, 'active')}
            compact
            buttonColor={colors.primary}
            accessibilityRole="button"
            accessibilityLabel={`${t('staff.endBreak')} ${item.profile.full_name}`}
          >
            {t('staff.endBreak')}
          </Button>
        )}
        <IconButton
          icon="account-details"
          onPress={() => navigation.navigate('StaffDetail', { staffId: item.id })}
          iconColor={colors.foregroundSecondary}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.profile.full_name}`}
        />
        <IconButton
          icon="clock"
          onPress={() => navigation.navigate('StaffSchedule', { staffId: item.id })}
          iconColor={colors.foregroundSecondary}
          accessibilityRole="button"
          accessibilityLabel={`View schedule for ${item.profile.full_name}`}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <Searchbar
        placeholder={t('staff.searchStaff')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filters}>
        <FlashList
          horizontal
          data={roles}
          renderItem={({ item }) => (
            <Chip
              selected={filterRole === item}
              onPress={() => setFilterRole(item)}
              style={styles.filterChip}
              selectedColor={colors.primary}
            >
              {item === 'all' ? t('common.all') : (t(`staff.roles.${item}`) || item.charAt(0).toUpperCase() + item.slice(1))}
            </Chip>
          )}
          keyExtractor={(item) => item}
          estimatedItemSize={72}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      <FlashList
        data={filteredStaff}
        renderItem={renderStaffMember}
        keyExtractor={(item) => item.id}
        estimatedItemSize={72}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={styles.emptyText}>{t('staff.noStaffFound')}</Text>
          </View>
        }
      />

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddStaff')}
        accessibilityRole="button"
        accessibilityLabel="Add new staff member"
      />
    </View>
    </ScreenContainer>
  );
}

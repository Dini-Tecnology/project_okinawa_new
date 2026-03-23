import React, { useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Text, Card, Button, IconButton, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface Activity {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  active: boolean;
  ageRange?: string;
}

interface AgeSuggestion {
  ageRange: string;
  suggestions: Array<{ key: string; icon: string }>;
}

interface FamilyActivitiesScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      entryId: string;
      estimatedWait?: number;
    };
  };
}

// Static activities data (v1)
const ACTIVITIES: Activity[] = [
  {
    id: '1',
    nameKey: 'activities.colorir',
    descKey: 'activities.colorirDesc',
    icon: 'palette',
    active: true,
  },
  {
    id: '2',
    nameKey: 'activities.quiz',
    descKey: 'activities.quizDesc',
    icon: 'gamepad-variant',
    active: true,
  },
  {
    id: '3',
    nameKey: 'activities.treasure',
    descKey: 'activities.treasureDesc',
    icon: 'treasure-chest',
    active: false,
  },
  {
    id: '4',
    nameKey: 'activities.chef',
    descKey: 'activities.chefDesc',
    icon: 'chef-hat',
    active: true,
  },
];

// Age-based suggestions
const AGE_SUGGESTIONS: AgeSuggestion[] = [
  {
    ageRange: '0-2',
    suggestions: [
      { key: 'activities.nursingSpace', icon: 'baby-bottle-outline' },
      { key: 'activities.babyChair', icon: 'seat' },
    ],
  },
  {
    ageRange: '3-6',
    suggestions: [
      { key: 'activities.coloringBooks', icon: 'book-open-page-variant' },
      { key: 'activities.kidsArea', icon: 'human-child' },
    ],
  },
  {
    ageRange: '7-12',
    suggestions: [
      { key: 'activities.tabletGames', icon: 'tablet' },
      { key: 'activities.wifiKids', icon: 'wifi' },
    ],
  },
];

export default function FamilyActivitiesScreen({ route }: FamilyActivitiesScreenProps) {
  const colors = useColors();
  const navigation = useNavigation();
  const restaurantId = route?.params?.restaurantId || '';
  const estimatedWait = route?.params?.estimatedWait || 15;

  const handleGoToMenu = useCallback(() => {
    navigation.navigate(
      'MenuScreen' as never,
      { restaurantId, familyMode: true } as never,
    );
  }, [navigation, restaurantId]);

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
          marginBottom: 8,
        },
        hint: {
          fontSize: 14,
          color: colors.foregroundSecondary,
          marginBottom: 8,
        },
        waitEstimate: {
          fontSize: 14,
          color: colors.primary,
          fontWeight: '600',
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.foreground,
          marginTop: 24,
          marginBottom: 12,
        },
        activityCard: {
          marginBottom: 12,
          borderRadius: 12,
          borderWidth: 1,
        },
        activityCardActive: {
          borderColor: `${colors.primary}40`,
          backgroundColor: `${colors.primary}08`,
        },
        activityCardInactive: {
          borderColor: colors.border,
          opacity: 0.5,
        },
        activityContent: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        },
        activityTextContainer: {
          flex: 1,
          marginLeft: 12,
        },
        activityName: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
        },
        activityDesc: {
          fontSize: 13,
          color: colors.foregroundSecondary,
          marginTop: 2,
        },
        statusBadge: {
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 4,
        },
        statusBadgeActive: {
          backgroundColor: `${colors.success}20`,
        },
        statusBadgeInactive: {
          backgroundColor: `${colors.foregroundMuted}20`,
        },
        statusText: {
          fontSize: 12,
          fontWeight: '600',
        },
        statusTextActive: {
          color: colors.success,
        },
        statusTextInactive: {
          color: colors.foregroundMuted,
        },
        suggestionCard: {
          marginBottom: 8,
          borderRadius: 10,
          backgroundColor: colors.card,
        },
        suggestionContent: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
        },
        suggestionText: {
          fontSize: 14,
          color: colors.foreground,
          marginLeft: 8,
          flex: 1,
        },
        ageRangeLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
          marginBottom: 8,
          marginTop: 8,
        },
        goToMenuButton: {
          marginTop: 32,
          marginBottom: 24,
          borderRadius: 12,
          backgroundColor: colors.primary,
        },
      }),
    [colors],
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('activities.title')}</Text>
        <Text style={styles.hint}>{t('activities.hint')}</Text>
        <Text style={styles.waitEstimate}>
          {t('activities.estimatedWait', { min: estimatedWait })}
        </Text>

        {/* Activities list */}
        {ACTIVITIES.map((activity) => (
          <Card
            key={activity.id}
            style={[
              styles.activityCard,
              activity.active
                ? styles.activityCardActive
                : styles.activityCardInactive,
            ]}
            accessibilityLabel={t(activity.nameKey)}
          >
            <View style={styles.activityContent}>
              <IconButton
                icon={activity.icon}
                size={28}
                iconColor={activity.active ? colors.primary : colors.foregroundMuted}
                accessibilityLabel={t(activity.nameKey)}
              />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityName}>
                  {t(activity.nameKey)}
                </Text>
                <Text style={styles.activityDesc}>
                  {t(activity.descKey)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  activity.active
                    ? styles.statusBadgeActive
                    : styles.statusBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    activity.active
                      ? styles.statusTextActive
                      : styles.statusTextInactive,
                  ]}
                >
                  {activity.active
                    ? t('activities.available')
                    : t('activities.comingSoon')}
                </Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Age-based suggestions */}
        <Text style={styles.sectionTitle}>
          {t('activities.hint')}
        </Text>

        {AGE_SUGGESTIONS.map((group) => (
          <View key={group.ageRange}>
            <Text style={styles.ageRangeLabel}>
              {group.ageRange} {t('familyMode.childYears', { age: '' }).trim()}
            </Text>
            {group.suggestions.map((suggestion) => (
              <Card
                key={suggestion.key}
                style={styles.suggestionCard}
                accessibilityLabel={t(suggestion.key)}
              >
                <View style={styles.suggestionContent}>
                  <IconButton
                    icon={suggestion.icon}
                    size={20}
                    iconColor={colors.secondary}
                    accessibilityLabel={t(suggestion.key)}
                  />
                  <Text style={styles.suggestionText}>
                    {t(suggestion.key)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ))}

        {/* Go to menu button */}
        <Button
          mode="contained"
          onPress={handleGoToMenu}
          style={styles.goToMenuButton}
          icon="book-open-outline"
          accessibilityLabel={t('activities.goToMenu')}
        >
          {t('activities.goToMenu')}
        </Button>
      </View>
    </ScrollView>
  );
}

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ApiService } from '@okinawa/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface ChildInfo {
  id: string;
  name: string;
  age: number;
  allergies: string[];
}

interface FamilyModeScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      entryId: string;
    };
  };
}

const ALLERGY_OPTIONS = [
  { key: 'gluten', labelKey: 'familyMode.allergyGluten' },
  { key: 'lactose', labelKey: 'familyMode.allergyLactose' },
  { key: 'peanut', labelKey: 'familyMode.allergyPeanut' },
  { key: 'seafood', labelKey: 'familyMode.allergySeafood' },
  { key: 'eggs', labelKey: 'familyMode.allergyEggs' },
  { key: 'none', labelKey: 'familyMode.allergyNone' },
];

const FAMILY_FEATURES = [
  {
    icon: 'silverware-fork-knife',
    titleKey: 'familyMode.kidsMenu',
    descKey: 'familyMode.kidsMenuDesc',
  },
  {
    icon: 'seat',
    titleKey: 'familyMode.highchair',
    descKey: 'familyMode.highchairDesc',
  },
  {
    icon: 'puzzle',
    titleKey: 'familyMode.activityKit',
    descKey: 'familyMode.activityKitDesc',
  },
  {
    icon: 'lightning-bolt',
    titleKey: 'familyMode.kidsFirst',
    descKey: 'familyMode.kidsFirstDesc',
  },
  {
    icon: 'alert-circle-outline',
    titleKey: 'familyMode.allergenAlert',
    descKey: 'familyMode.allergenAlertDesc',
  },
];

export default function FamilyModeScreen({ route }: FamilyModeScreenProps) {
  const colors = useColors();
  const navigation = useNavigation();
  const restaurantId = route?.params?.restaurantId || '';
  const entryId = route?.params?.entryId || '';

  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [saving, setSaving] = useState(false);

  const handleToggleAllergy = useCallback((allergy: string) => {
    setSelectedAllergies((prev) => {
      if (allergy === 'none') {
        return ['none'];
      }
      const filtered = prev.filter((a) => a !== 'none');
      if (filtered.includes(allergy)) {
        return filtered.filter((a) => a !== allergy);
      }
      return [...filtered, allergy];
    });
  }, []);

  const handleAddChild = useCallback(() => {
    if (!childName.trim()) {
      Alert.alert(t('common.error'), t('familyMode.childName'));
      return;
    }

    const age = parseInt(childAge, 10);
    if (!age || age < 1 || age > 17) {
      Alert.alert(t('common.error'), t('familyMode.childAge'));
      return;
    }

    const allergies = selectedAllergies.includes('none')
      ? []
      : [...selectedAllergies];
    if (customAllergy.trim()) {
      allergies.push(customAllergy.trim());
    }

    const newChild: ChildInfo = {
      id: Date.now().toString(),
      name: childName.trim(),
      age,
      allergies,
    };

    setChildren((prev) => [...prev, newChild]);
    setChildName('');
    setChildAge('');
    setSelectedAllergies([]);
    setCustomAllergy('');
    setShowAddChild(false);
  }, [childName, childAge, selectedAllergies, customAllergy]);

  const handleSaveFamilyInfo = useCallback(async () => {
    setSaving(true);
    try {
      await ApiService.patch(`/restaurant/waitlist/${entryId}/family`, {
        has_kids: true,
        kids_ages: children.map((c) => c.age),
        kids_allergies: children.flatMap((c) => c.allergies),
      });

      // Navigate to activities screen
      (navigation as any).navigate(
        'FamilyActivitiesScreen',
        { restaurantId, entryId },
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  }, [children, entryId, restaurantId, navigation]);

  const handleSeeActivities = useCallback(() => {
    (navigation as any).navigate(
      'FamilyActivitiesScreen',
      { restaurantId, entryId },
    );
  }, [navigation, restaurantId, entryId]);

  const handleSeeMenu = useCallback(() => {
    (navigation as any).navigate(
      'MenuScreen',
      { restaurantId, familyMode: true },
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
        activatedCard: {
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          backgroundColor: colors.primary,
        },
        activatedTitle: {
          fontSize: 20,
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: 4,
        },
        activatedIcon: {
          position: 'absolute',
          right: 16,
          top: 16,
        },
        featuresList: {
          marginBottom: 24,
        },
        featureItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
        },
        featureTextContainer: {
          flex: 1,
          marginLeft: 12,
        },
        featureTitle: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
        },
        featureDesc: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 12,
        },
        childCard: {
          marginBottom: 12,
          borderRadius: 12,
        },
        childCardContent: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        },
        childAvatar: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#9333EA',
          alignItems: 'center',
          justifyContent: 'center',
        },
        childAvatarText: {
          color: '#FFFFFF',
          fontWeight: '600',
          fontSize: 16,
        },
        childInfo: {
          flex: 1,
          marginLeft: 12,
        },
        childNameText: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
        },
        childAgeText: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        childAllergies: {
          fontSize: 12,
          color: colors.warning,
          marginTop: 2,
        },
        addChildButton: {
          marginBottom: 16,
          borderColor: colors.primary,
          borderRadius: 12,
        },
        formContainer: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        },
        input: {
          marginBottom: 12,
          backgroundColor: colors.background,
        },
        allergiesLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 8,
        },
        allergiesRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
        },
        allergyChip: {
          borderRadius: 8,
        },
        allergyChipSelected: {
          backgroundColor: `${colors.primary}20`,
        },
        formActions: {
          flexDirection: 'row',
          gap: 12,
          marginTop: 8,
        },
        formActionButton: {
          flex: 1,
          borderRadius: 12,
        },
        bottomButtons: {
          marginTop: 24,
          gap: 12,
        },
        activitiesButton: {
          borderRadius: 12,
          backgroundColor: colors.primary,
        },
        menuButton: {
          borderRadius: 12,
          borderColor: colors.primary,
        },
        summaryCard: {
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        summaryTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 8,
        },
        summaryItem: {
          fontSize: 14,
          color: colors.foregroundSecondary,
          marginBottom: 4,
        },
        saveButton: {
          borderRadius: 12,
          backgroundColor: colors.success,
          marginBottom: 8,
        },
      }),
    [colors],
  );

  return (
    <ScreenContainer hasKeyboard>
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Activated card */}
        <View style={styles.activatedCard}>
          <Text style={styles.activatedTitle}>
            {t('familyMode.activated')}
          </Text>
          <IconButton
            icon="baby-face-outline"
            size={32}
            iconColor="#FFFFFF"
            style={styles.activatedIcon}
            accessibilityLabel={t('familyMode.title')}
          />
        </View>

        {/* Features list */}
        <View style={styles.featuresList}>
          {FAMILY_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconButton
                icon={feature.icon}
                size={24}
                iconColor={colors.primary}
                accessibilityLabel={t(feature.titleKey)}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
              </View>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={colors.success}
                accessibilityLabel={t('common.success')}
              />
            </View>
          ))}
        </View>

        <Divider style={{ marginBottom: 24 }} />

        {/* Children section */}
        <Text style={styles.sectionTitle}>
          {t('familyMode.childrenTitle')}
        </Text>

        {/* Registered children */}
        {children.map((child) => (
          <Card key={child.id} style={styles.childCard}>
            <View style={styles.childCardContent}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>
                  {child.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childNameText}>{child.name}</Text>
                <Text style={styles.childAgeText}>
                  {t('familyMode.childYears', { age: child.age })}
                </Text>
                {child.allergies.length > 0 && (
                  <Text style={styles.childAllergies}>
                    {t('familyMode.childAllergies')}: {child.allergies.join(', ')}
                  </Text>
                )}
              </View>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={colors.success}
                accessibilityLabel={t('common.success')}
              />
            </View>
          </Card>
        ))}

        {/* Add child form */}
        {showAddChild ? (
          <View style={styles.formContainer}>
            <TextInput
              label={t('familyMode.childName')}
              value={childName}
              onChangeText={setChildName}
              style={styles.input}
              mode="outlined"
              accessibilityLabel={t('familyMode.childName')}
            />

            <TextInput
              label={t('familyMode.childAge')}
              value={childAge}
              onChangeText={setChildAge}
              style={styles.input}
              mode="outlined"
              keyboardType="number-pad"
              accessibilityLabel={t('familyMode.childAge')}
            />

            <Text style={styles.allergiesLabel}>
              {t('familyMode.childAllergies')}
            </Text>
            <View style={styles.allergiesRow}>
              {ALLERGY_OPTIONS.map((allergy) => (
                <Chip
                  key={allergy.key}
                  selected={selectedAllergies.includes(allergy.key)}
                  onPress={() => handleToggleAllergy(allergy.key)}
                  style={[
                    styles.allergyChip,
                    selectedAllergies.includes(allergy.key) &&
                      styles.allergyChipSelected,
                  ]}
                  compact
                  accessibilityLabel={t(allergy.labelKey)}
                >
                  {t(allergy.labelKey)}
                </Chip>
              ))}
            </View>

            <TextInput
              label={t('familyMode.childAllergies') + ' (custom)'}
              value={customAllergy}
              onChangeText={setCustomAllergy}
              style={styles.input}
              mode="outlined"
              accessibilityLabel={t('familyMode.childAllergies')}
            />

            <View style={styles.formActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddChild(false)}
                style={styles.formActionButton}
                accessibilityLabel={t('common.cancel')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddChild}
                style={[styles.formActionButton, { backgroundColor: colors.primary }]}
                accessibilityLabel={t('common.confirm')}
              >
                {t('common.confirm')}
              </Button>
            </View>
          </View>
        ) : (
          <Button
            mode="outlined"
            onPress={() => setShowAddChild(true)}
            style={styles.addChildButton}
            icon="plus"
            accessibilityLabel={t('familyMode.addChild')}
          >
            {t('familyMode.addChild')}
          </Button>
        )}

        {/* Summary card */}
        {children.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {t('familyMode.summary')}
            </Text>
            {children.map((child) => (
              <Text key={child.id} style={styles.summaryItem}>
                {child.name} - {t('familyMode.childYears', { age: child.age })}
                {child.allergies.length > 0 ? ` (${child.allergies.join(', ')})` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Save and navigate buttons */}
        {children.length > 0 && (
          <Button
            mode="contained"
            onPress={handleSaveFamilyInfo}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            icon="check"
            accessibilityLabel={t('common.confirm')}
          >
            {t('common.confirm')}
          </Button>
        )}

        <View style={styles.bottomButtons}>
          <Button
            mode="contained"
            onPress={handleSeeActivities}
            style={styles.activitiesButton}
            icon="puzzle"
            accessibilityLabel={t('familyMode.seeActivities')}
          >
            {t('familyMode.seeActivities')}
          </Button>

          <Button
            mode="outlined"
            onPress={handleSeeMenu}
            style={styles.menuButton}
            icon="book-open-outline"
            accessibilityLabel={t('familyMode.seeMenu')}
          >
            {t('familyMode.seeMenu')}
          </Button>
        </View>
      </View>
    </ScrollView>
  
    </ScreenContainer>
  );
}

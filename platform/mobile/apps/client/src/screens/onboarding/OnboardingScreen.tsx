/**
 * OnboardingScreen - Client App Onboarding Flow
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { t } from '@okinawa/shared/i18n';
import logger from '@okinawa/shared/utils/logger';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slideConfigs = [
  { id: '1', icon: 'compass', titleKey: 'onboarding.slides.explore_title', descKey: 'onboarding.slides.explore_desc', color: '#FF6B6B' },
  { id: '2', icon: 'qrcode-scan', titleKey: 'onboarding.slides.orders_title', descKey: 'onboarding.slides.orders_desc', color: '#4ECDC4' },
  { id: '3', icon: 'calendar-check', titleKey: 'onboarding.slides.reserve_title', descKey: 'onboarding.slides.reserve_desc', color: '#FFB84D' },
  { id: '4', icon: 'star', titleKey: 'onboarding.slides.rate_title', descKey: 'onboarding.slides.rate_desc', color: '#9B59B6' },
];

const cuisineKeys = [
  'italian', 'japanese', 'brazilian', 'french', 'mexican', 'chinese',
  'thai', 'indian', 'arabic', 'american', 'mediterranean', 'vegetarian',
  'vegan', 'fast_food', 'seafood', 'steakhouse',
];

const dietaryKeys = [
  'vegetarian', 'vegan', 'gluten_free', 'lactose_free',
  'kosher', 'halal', 'organic', 'low_carb',
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: { 
      flex: 1,
      backgroundColor: colors.background,
    },
    slide: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingHorizontal: 40,
    },
    iconContainer: {
      width: 180, 
      height: 180, 
      borderRadius: 90, 
      justifyContent: 'center', 
      alignItems: 'center',
      marginBottom: 40, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2, 
      shadowRadius: 20, 
      elevation: 10,
    },
    title: { 
      fontWeight: 'bold', 
      textAlign: 'center', 
      marginBottom: 20,
      color: colors.foreground,
    },
    description: { 
      textAlign: 'center', 
      lineHeight: 24,
      color: colors.foregroundMuted,
    },
    pagination: { 
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingVertical: 20,
    },
    dot: { 
      width: 10, 
      height: 10, 
      borderRadius: 5, 
      marginHorizontal: 5, 
      opacity: 0.3,
    },
    activeDot: { 
      width: 30, 
      opacity: 1,
    },
    navigation: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 20, 
      paddingBottom: 40,
    },
    skipButton: { 
      flex: 1,
    },
    nextButton: { 
      flex: 2, 
      marginLeft: 10, 
      borderRadius: 12,
    },
    buttonContent: { 
      paddingVertical: 8,
    },
    preferencesContainer: { 
      flex: 1,
      backgroundColor: colors.background,
    },
    preferencesHeader: { 
      paddingHorizontal: 20, 
      paddingTop: 60, 
      paddingBottom: 20,
      backgroundColor: colors.muted,
    },
    preferencesTitle: { 
      fontWeight: 'bold', 
      marginBottom: 10,
      color: colors.foreground,
    },
    preferencesSubtitle: {
      color: colors.foregroundMuted,
    },
    scrollContent: { 
      paddingBottom: 100,
    },
    preferencesContent: { 
      paddingHorizontal: 20, 
      paddingTop: 20,
    },
    section: { 
      marginBottom: 30,
    },
    sectionTitle: { 
      fontWeight: 'bold', 
      marginBottom: 5,
      color: colors.foreground,
    },
    sectionDescription: { 
      marginBottom: 15,
      color: colors.foregroundMuted,
    },
    chipContainer: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 8,
    },
    chip: { 
      marginBottom: 8,
    },
    preferencesFooter: { 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      padding: 20, 
      borderTopWidth: 1,
      backgroundColor: colors.background,
      borderTopColor: colors.border,
    },
    finishButton: { 
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      setShowPreferences(true);
    }
  };

  const handleSkip = () => setShowPreferences(true);

  const slides = slideConfigs.map((s) => ({
    ...s,
    title: t(s.titleKey),
    description: t(s.descKey),
  }));

  const cuisineTypes = cuisineKeys.map((key) => ({
    key,
    label: t(`onboarding.cuisines.${key}`),
  }));

  const dietaryPreferences = dietaryKeys.map((key) => ({
    key,
    label: t(`onboarding.dietary.${key}`),
  }));

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleDietary = (dietary: string) => {
    setSelectedDietary((prev) =>
      prev.includes(dietary) ? prev.filter((d) => d !== dietary) : [...prev, dietary]
    );
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify({
        cuisines: selectedCuisines,
        dietary: selectedDietary,
        onboardingCompleted: true,
      }));
      navigation.goBack();
    } catch (error) {
      logger.error('Error saving preferences:', error);
      navigation.goBack();
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width }]} accessibilityLabel={item.title}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={100} color="#fff" />
      </View>
      <Text variant="displaySmall" style={styles.title}>
        {item.title}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {item.description}
      </Text>
    </View>
  );

  if (showPreferences) {
    return (
      <View style={styles.preferencesContainer}>
        <View style={styles.preferencesHeader}>
          <Text variant="headlineMedium" style={styles.preferencesTitle}>
            {t('onboarding.preferences.title')}
          </Text>
          <Text variant="bodyMedium" style={styles.preferencesSubtitle}>
            {t('onboarding.preferences.subtitle')}
          </Text>
        </View>

        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <View style={styles.preferencesContent}>
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  {t('onboarding.preferences.cuisine_title')}
                </Text>
                <Text variant="bodySmall" style={styles.sectionDescription}>
                  {t('onboarding.preferences.cuisine_desc')}
                </Text>
                <View style={styles.chipContainer}>
                  {cuisineTypes.map((cuisine) => (
                    <Chip
                      key={cuisine.key}
                      selected={selectedCuisines.includes(cuisine.key)}
                      onPress={() => toggleCuisine(cuisine.key)}
                      style={styles.chip}
                      showSelectedCheck
                      accessibilityLabel={cuisine.label}
                    >
                      {cuisine.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  {t('onboarding.preferences.dietary_title')}
                </Text>
                <Text variant="bodySmall" style={styles.sectionDescription}>
                  {t('onboarding.preferences.dietary_desc')}
                </Text>
                <View style={styles.chipContainer}>
                  {dietaryPreferences.map((dietary) => (
                    <Chip
                      key={dietary.key}
                      selected={selectedDietary.includes(dietary.key)}
                      onPress={() => toggleDietary(dietary.key)}
                      style={styles.chip}
                      showSelectedCheck
                      accessibilityLabel={dietary.label}
                    >
                      {dietary.label}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.scrollContent}
        />

        <View style={styles.preferencesFooter}>
          <Button
            mode="contained"
            onPress={handleFinish}
            style={styles.finishButton}
            contentStyle={styles.buttonContent}
          >
            {selectedCuisines.length > 0 || selectedDietary.length > 0 ? t('onboarding.preferences.continue') : t('onboarding.preferences.skip_for_now')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
              { backgroundColor: slides[currentIndex].color },
            ]}
          />
        ))}
      </View>

      <View style={styles.navigation}>
        <Button mode="text" onPress={handleSkip} textColor={colors.foregroundMuted} style={styles.skipButton} accessibilityLabel={t('onboarding.skip')}>
          {t('onboarding.skip')}
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: slides[currentIndex].color }]}
          contentStyle={styles.buttonContent}
          accessibilityLabel={currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
        >
          {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
        </Button>
      </View>
    </View>
  );
}

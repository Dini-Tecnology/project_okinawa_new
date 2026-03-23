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
import logger from '@okinawa/shared/utils/logger';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'compass',
    title: 'Explore Restaurantes',
    description: 'Descubra os melhores restaurantes perto de você com recomendações personalizadas baseadas em IA',
    color: '#FF6B6B',
  },
  {
    id: '2',
    icon: 'qrcode-scan',
    title: 'Pedidos Rápidos',
    description: 'Escaneie QR codes nas mesas e faça pedidos diretamente do seu celular, sem esperar',
    color: '#4ECDC4',
  },
  {
    id: '3',
    icon: 'calendar-check',
    title: 'Reserve Mesas',
    description: 'Reserve sua mesa com antecedência e receba confirmação instantânea do restaurante',
    color: '#FFB84D',
  },
  {
    id: '4',
    icon: 'star',
    title: 'Avalie e Favorite',
    description: 'Deixe avaliações, salve seus restaurantes favoritos e ajude outros a descobrir novos lugares',
    color: '#9B59B6',
  },
];

const cuisineTypes = [
  'Italiana', 'Japonesa', 'Brasileira', 'Francesa', 'Mexicana', 'Chinesa',
  'Tailandesa', 'Indiana', 'Árabe', 'Americana', 'Mediterrânea', 'Vegetariana',
  'Vegana', 'Fast Food', 'Frutos do Mar', 'Churrascaria',
];

const dietaryPreferences = [
  'Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose',
  'Kosher', 'Halal', 'Orgânico', 'Low Carb',
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
      color: colors.mutedForeground,
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
      color: colors.mutedForeground,
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
      color: colors.mutedForeground,
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
      navigation.navigate('Auth' as never);
    } catch (error) {
      logger.error('Error saving preferences:', error);
      navigation.navigate('Auth' as never);
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
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
            Personalize sua Experiência
          </Text>
          <Text variant="bodyMedium" style={styles.preferencesSubtitle}>
            Selecione suas preferências culinárias (opcional)
          </Text>
        </View>

        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <View style={styles.preferencesContent}>
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Tipos de Culinária
                </Text>
                <Text variant="bodySmall" style={styles.sectionDescription}>
                  Quais culinárias você mais gosta?
                </Text>
                <View style={styles.chipContainer}>
                  {cuisineTypes.map((cuisine) => (
                    <Chip
                      key={cuisine}
                      selected={selectedCuisines.includes(cuisine)}
                      onPress={() => toggleCuisine(cuisine)}
                      style={styles.chip}
                      showSelectedCheck
                    >
                      {cuisine}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Restrições Alimentares
                </Text>
                <Text variant="bodySmall" style={styles.sectionDescription}>
                  Alguma restrição ou preferência especial?
                </Text>
                <View style={styles.chipContainer}>
                  {dietaryPreferences.map((dietary) => (
                    <Chip
                      key={dietary}
                      selected={selectedDietary.includes(dietary)}
                      onPress={() => toggleDietary(dietary)}
                      style={styles.chip}
                      showSelectedCheck
                    >
                      {dietary}
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
            {selectedCuisines.length > 0 || selectedDietary.length > 0 ? 'Continuar' : 'Pular por Agora'}
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
        <Button mode="text" onPress={handleSkip} textColor={colors.mutedForeground} style={styles.skipButton}>
          Pular
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: slides[currentIndex].color }]}
          contentStyle={styles.buttonContent}
        >
          {currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
        </Button>
      </View>
    </View>
  );
}

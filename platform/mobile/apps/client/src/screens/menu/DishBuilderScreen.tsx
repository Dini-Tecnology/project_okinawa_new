import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { fontSize, fontWeight } from '@okinawa/shared/theme/typography';
import { spacing } from '@okinawa/shared/theme/spacing';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface Ingredient {
  id: string;
  name: string;
  price: number;
  calories: number;
  category: 'base' | 'protein' | 'topping' | 'sauce' | 'extra';
  image: string;
}

interface DishBuilderScreenProps {
  navigation: any;
  route: {
    params: {
      dishType: string;
    };
  };
}

const ingredients: Record<string, Ingredient[]> = {
  base: [
    { id: 'b1', name: 'Arroz Branco', price: 0, calories: 130, category: 'base', image: '🍚' },
    { id: 'b2', name: 'Arroz Integral', price: 2, calories: 110, category: 'base', image: '🍘' },
    { id: 'b3', name: 'Mix de Folhas', price: 0, calories: 15, category: 'base', image: '🥬' },
    { id: 'b4', name: 'Quinoa', price: 4, calories: 120, category: 'base', image: '🌾' },
  ],
  protein: [
    { id: 'p1', name: 'Frango Grelhado', price: 8, calories: 165, category: 'protein', image: '🍗' },
    { id: 'p2', name: 'Carne Bovina', price: 12, calories: 250, category: 'protein', image: '🥩' },
    { id: 'p3', name: 'Salmão', price: 16, calories: 208, category: 'protein', image: '🐟' },
    { id: 'p4', name: 'Tofu', price: 6, calories: 76, category: 'protein', image: '🧈' },
  ],
  topping: [
    { id: 't1', name: 'Tomate', price: 0, calories: 18, category: 'topping', image: '🍅' },
    { id: 't2', name: 'Pepino', price: 0, calories: 8, category: 'topping', image: '🥒' },
    { id: 't3', name: 'Cenoura', price: 0, calories: 25, category: 'topping', image: '🥕' },
    { id: 't4', name: 'Milho', price: 1, calories: 86, category: 'topping', image: '🌽' },
    { id: 't5', name: 'Abacate', price: 4, calories: 160, category: 'topping', image: '🥑' },
    { id: 't6', name: 'Ovo Cozido', price: 2, calories: 78, category: 'topping', image: '🥚' },
  ],
  sauce: [
    { id: 's1', name: 'Molho Caesar', price: 0, calories: 78, category: 'sauce', image: '🥣' },
    { id: 's2', name: 'Tahine', price: 2, calories: 89, category: 'sauce', image: '🫕' },
    { id: 's3', name: 'Molho de Iogurte', price: 0, calories: 45, category: 'sauce', image: '🥛' },
    { id: 's4', name: 'Azeite e Limão', price: 0, calories: 60, category: 'sauce', image: '🍋' },
  ],
  extra: [
    { id: 'e1', name: 'Queijo Parmesão', price: 4, calories: 110, category: 'extra', image: '🧀' },
    { id: 'e2', name: 'Croutons', price: 2, calories: 65, category: 'extra', image: '🍞' },
    { id: 'e3', name: 'Castanhas', price: 3, calories: 95, category: 'extra', image: '🥜' },
    { id: 'e4', name: 'Bacon Bits', price: 4, calories: 120, category: 'extra', image: '🥓' },
  ],
};

const categoryLabels: Record<string, string> = {
  base: 'Base',
  protein: 'Proteína',
  topping: 'Toppings',
  sauce: 'Molho',
  extra: 'Extras',
};

export const DishBuilderScreen: React.FC<DishBuilderScreenProps> = ({
  navigation,
  route,
}) => {
  const { isDark } = useOkinawaTheme();
  const colors = useColors();
  const { dishType } = route.params;

  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, string[]>>({
    base: [],
    protein: [],
    topping: [],
    sauce: [],
    extra: [],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['base', 'protein', 'topping', 'sauce', 'extra'];

  const toggleIngredient = (category: string, id: string, maxSelection?: number) => {
    setSelectedIngredients(prev => {
      const current = prev[category];
      if (current.includes(id)) {
        return { ...prev, [category]: current.filter(i => i !== id) };
      }
      if (maxSelection && current.length >= maxSelection) {
        return { ...prev, [category]: [...current.slice(1), id] };
      }
      return { ...prev, [category]: [...current, id] };
    });
  };

  const totals = useMemo(() => {
    let price = 0;
    let calories = 0;
    
    Object.entries(selectedIngredients).forEach(([category, ids]) => {
      ids.forEach(id => {
        const ingredient = ingredients[category].find(i => i.id === id);
        if (ingredient) {
          price += ingredient.price;
          calories += ingredient.calories;
        }
      });
    });

    return { price: price + 15, calories }; // Base price + ingredients
  }, [selectedIngredients]);

  const getSelectedCount = () => {
    return Object.values(selectedIngredients).flat().length;
  };

  const addToOrder = () => {
    const customDish = {
      id: `custom-${Date.now()}`,
      name: `${dishType} Personalizado`,
      ingredients: selectedIngredients,
      price: totals.price,
      calories: totals.calories,
    };
    navigation.navigate('SharedOrder', { addItems: [customDish] });
  };

  const currentCategory = steps[currentStep];

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold as any,
      color: colors.foreground,
    },
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    stepWrapper: {
      alignItems: 'center',
    },
    stepDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginBottom: spacing.xs,
      position: 'relative',
    },
    stepBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success,
    },
    stepBadgeText: {
      color: colors.primaryForeground,
      fontSize: 10,
      fontWeight: 'bold',
    },
    stepLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium as any,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold as any,
      marginBottom: spacing.md,
      color: colors.foreground,
    },
    hint: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular as any,
      color: colors.foregroundMuted,
    },
    ingredientsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    ingredientCard: {
      width: '48%',
      padding: spacing.md,
      borderRadius: spacing.lg,
      borderWidth: 2,
      alignItems: 'center',
      position: 'relative',
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    ingredientCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    ingredientEmoji: {
      fontSize: 40,
      marginBottom: spacing.sm,
    },
    ingredientName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold as any,
      textAlign: 'center',
      marginBottom: 2,
      color: colors.foreground,
    },
    ingredientCalories: {
      fontSize: fontSize.xs,
      color: colors.foregroundMuted,
    },
    ingredientPrice: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold as any,
      marginTop: spacing.xs,
      color: colors.primary,
    },
    checkmark: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      borderTopWidth: 1,
      backgroundColor: colors.card,
      borderTopColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    summaryLabel: {
      fontSize: fontSize.sm,
      color: colors.foregroundMuted,
    },
    summaryCalories: {
      fontSize: fontSize.xs,
      color: colors.foregroundMuted,
    },
    summaryPrice: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold as any,
      color: colors.foreground,
    },
    footerButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    backButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: spacing.lg,
      borderWidth: 1,
      alignItems: 'center',
      borderColor: colors.border,
    },
    backButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium as any,
      color: colors.foreground,
    },
    nextButton: {
      flex: 2,
      flexDirection: 'row',
      paddingVertical: spacing.md,
      borderRadius: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.primary,
    },
    nextButtonDisabled: {
      backgroundColor: colors.backgroundTertiary,
    },
    nextButtonText: {
      color: colors.primaryForeground,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold as any,
    },
  }), [colors]);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Monte seu {dishType}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step}
            style={styles.stepWrapper}
            onPress={() => setCurrentStep(index)}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${categoryLabels[step]} step`}
            accessibilityState={{ selected: index === currentStep }}
          >
            <View
              style={[
                styles.stepDot,
                { backgroundColor: index <= currentStep ? colors.primary : colors.backgroundTertiary },
              ]}
            >
              {selectedIngredients[step].length > 0 && (
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>
                    {selectedIngredients[step].length}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                { color: index === currentStep ? colors.primary : colors.foregroundMuted },
              ]}
            >
              {categoryLabels[step]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          Escolha {currentCategory === 'base' || currentCategory === 'protein' ? 'sua' : 'seus'} {categoryLabels[currentCategory].toLowerCase()}
          {(currentCategory === 'base' || currentCategory === 'protein' || currentCategory === 'sauce') && (
            <Text style={styles.hint}> (1 opção)</Text>
          )}
        </Text>

        <View style={styles.ingredientsGrid}>
          {ingredients[currentCategory].map(ingredient => {
            const isSelected = selectedIngredients[currentCategory].includes(ingredient.id);
            return (
              <TouchableOpacity
                key={ingredient.id}
                style={[
                  styles.ingredientCard,
                  isSelected && styles.ingredientCardSelected,
                ]}
                onPress={() => toggleIngredient(
                  currentCategory,
                  ingredient.id,
                  ['base', 'protein', 'sauce'].includes(currentCategory) ? 1 : undefined
                )}
                accessibilityRole="button"
                accessibilityLabel={`${ingredient.name}, ${ingredient.calories} kcal${ingredient.price > 0 ? `, +R$ ${ingredient.price.toFixed(2)}` : ''}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.ingredientEmoji}>{ingredient.image}</Text>
                <Text style={styles.ingredientName}>
                  {ingredient.name}
                </Text>
                <Text style={styles.ingredientCalories}>
                  {ingredient.calories} kcal
                </Text>
                {ingredient.price > 0 && (
                  <Text style={styles.ingredientPrice}>
                    +R$ {ingredient.price.toFixed(2)}
                  </Text>
                )}
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color={colors.primaryForeground} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>
              {getSelectedCount()} ingredientes
            </Text>
            <Text style={styles.summaryCalories}>
              {totals.calories} kcal
            </Text>
          </View>
          <Text style={styles.summaryPrice}>
            R$ {totals.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.footerButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(prev => prev - 1)}
              accessibilityRole="button"
              accessibilityLabel="Previous step"
            >
              <Text style={styles.backButtonText}>
                Voltar
              </Text>
            </TouchableOpacity>
          )}
          
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setCurrentStep(prev => prev + 1)}
              accessibilityRole="button"
              accessibilityLabel="Next step"
            >
              <Text style={styles.nextButtonText}>Próximo</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.nextButton,
                getSelectedCount() === 0 && styles.nextButtonDisabled,
              ]}
              onPress={addToOrder}
              disabled={getSelectedCount() === 0}
              accessibilityRole="button"
              accessibilityLabel="Add custom dish to order"
              accessibilityState={{ disabled: getSelectedCount() === 0 }}
            >
              <Text style={styles.nextButtonText}>Adicionar ao Pedido</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

export default DishBuilderScreen;

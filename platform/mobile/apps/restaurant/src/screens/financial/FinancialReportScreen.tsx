/**
 * FinancialReportScreen
 * 
 * Displays comprehensive financial reports for restaurant management.
 * Includes revenue charts, expense breakdowns, and profit/loss analysis.
 * Supports export functionality in multiple formats (PDF, CSV, Excel).
 * 
 * Features:
 * - Period selection (week, month, year)
 * - Revenue visualization with line charts
 * - Expense breakdown with bar charts
 * - Net profit calculation and display
 * - Report export functionality
 * 
 * @module restaurant/screens/financial
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { formatCurrency, getCurrencySymbol } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { useRestaurant } from '@/shared/contexts/RestaurantContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// CONSTANTS
// ============================================

const screenWidth = Dimensions.get('window').width;

type PeriodType = 'week' | 'month' | 'year';
type ExportFormat = 'pdf' | 'csv' | 'excel';

// ============================================
// MAIN COMPONENT
// ============================================

export default function FinancialReportScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const { restaurantId } = useRestaurant();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('month');

  // Memoized styles based on theme colors
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Mock data - replace with real API call
  const revenueData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{ data: [850, 1200, 980, 1450, 1890, 2100, 1650] }],
  };

  const expensesData = {
    labels: ['Produtos', 'Pessoal', 'Aluguel', 'Outros'],
    datasets: [{ data: [4500, 3200, 2000, 800] }],
  };

  /**
   * Calculates date range based on selected period.
   * Returns start and end dates for the report.
   */
  const getDateRange = useCallback(() => {
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'year':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    return { startDate, endDate };
  }, [period]);

  /**
   * Handles financial report export.
   * Supports PDF, CSV, and Excel formats.
   * 
   * @param format - Export format (pdf, csv, excel)
   */
  const handleExportReport = useCallback(async (exportFormat: ExportFormat = 'pdf') => {
    if (!restaurantId) {
      Alert.alert('Erro', 'Restaurant ID não disponível');
      return;
    }

    setExporting(true);
    
    try {
      const { startDate, endDate } = getDateRange();
      
      // Call API to export report
      const result = await ApiService.exportFinancialReport({
        restaurant_id: restaurantId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        format: exportFormat,
        report_type: 'detailed',
      });

      // Handle the export result based on format
      if (exportFormat === 'pdf') {
        // For PDF, the result would typically be a blob or download URL
        Alert.alert('Sucesso', 'Relatório PDF gerado com sucesso!');
      } else {
        // For CSV/Excel, show success message
        Alert.alert('Sucesso', `Relatório ${exportFormat.toUpperCase()} exportado com sucesso!`);
      }

      console.log('Export result:', result);
    } catch (error) {
      console.error('Failed to export report:', error);
      Alert.alert('Erro', 'Não foi possível exportar o relatório. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }, [restaurantId, getDateRange]);

  /**
   * Shows export format selection dialog.
   */
  const showExportOptions = useCallback(() => {
    Alert.alert(
      'Exportar Relatório',
      'Selecione o formato de exportação:',
      [
        { text: 'PDF', onPress: () => handleExportReport('pdf') },
        { text: 'CSV', onPress: () => handleExportReport('csv') },
        { text: 'Excel', onPress: () => handleExportReport('excel') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }, [handleExportReport]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <ScreenContainer>
    <ScrollView style={styles.container}>
      {/* Period Selection Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('financial.reportPeriod')}
          </Text>
          <View style={styles.periodButtons}>
            <Chip
              selected={period === 'week'}
              onPress={() => setPeriod('week')}
              style={styles.periodChip}
              accessibilityLabel="View weekly report"
              accessibilityState={{ selected: period === 'week' }}
            >
              {t('financial.week')}
            </Chip>
            <Chip
              selected={period === 'month'}
              onPress={() => setPeriod('month')}
              style={styles.periodChip}
              accessibilityLabel="View monthly report"
              accessibilityState={{ selected: period === 'month' }}
            >
              {t('financial.month')}
            </Chip>
            <Chip
              selected={period === 'year'}
              onPress={() => setPeriod('year')}
              style={styles.periodChip}
              accessibilityLabel="View yearly report"
              accessibilityState={{ selected: period === 'year' }}
            >
              {t('financial.year')}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Revenue Chart Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('financial.revenue')}
          </Text>
          <LineChart
            data={revenueData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: colors.success,
              backgroundGradientFrom: colors.success,
              backgroundGradientTo: colors.successLight || colors.success,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text variant="labelMedium" style={styles.summaryLabel}>
                {t('financial.total')}
              </Text>
              <Text variant="headlineSmall" style={styles.revenueValue}>
                {formatCurrency(10120, getLanguage())}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="labelMedium" style={styles.summaryLabel}>
                {t('financial.dailyAverage')}
              </Text>
              <Text variant="titleLarge" style={styles.text}>{formatCurrency(1445.71, getLanguage())}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Expenses Chart Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('financial.expenses')}
          </Text>
          <BarChart
            data={expensesData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: colors.error,
              backgroundGradientFrom: colors.error,
              backgroundGradientTo: colors.errorLight || colors.error,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text variant="labelMedium" style={styles.summaryLabel}>
                {t('financial.total')}
              </Text>
              <Text variant="headlineSmall" style={styles.expenseValue}>
                {formatCurrency(10500, getLanguage())}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Net Profit Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('financial.netProfit')}
          </Text>
          <View style={styles.profitContainer}>
            <Text variant="displaySmall" style={styles.profitValue}>
              -{formatCurrency(380, getLanguage())}
            </Text>
            <Chip style={styles.negativeChip} textStyle={styles.chipText}>
              -3.6%
            </Chip>
          </View>
          <Text variant="bodyMedium" style={styles.profitNote}>
            {t('financial.expenseExceedRevenue')}
          </Text>
        </Card.Content>
      </Card>

      {/* Export Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={showExportOptions}
          icon="download"
          style={styles.exportButton}
          loading={exporting}
          disabled={exporting}
          accessibilityLabel="Export financial report"
        >
          {exporting ? 'Exportando...' : t('financial.exportPdf')}
        </Button>
      </View>
    </ScrollView>
    </ScreenContainer>
  );
}

// ============================================
// STYLES
// ============================================

/**
 * Creates themed StyleSheet for the component.
 * 
 * @param colors - Theme colors from useColors hook
 * @returns StyleSheet object
 */
const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    card: {
      margin: 16,
      marginBottom: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    title: {
      marginBottom: 16,
      color: colors.foreground,
    },
    text: {
      color: colors.foreground,
    },
    periodButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    periodChip: {
      flex: 1,
    },
    chart: {
      marginTop: 16,
      borderRadius: 16,
    },
    summary: {
      flexDirection: 'row',
      gap: 24,
      marginTop: 24,
    },
    summaryItem: {
      flex: 1,
    },
    summaryLabel: {
      color: colors.foregroundMuted,
      marginBottom: 4,
    },
    revenueValue: {
      color: colors.success,
      fontWeight: 'bold',
    },
    expenseValue: {
      color: colors.error,
      fontWeight: 'bold',
    },
    profitContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    profitValue: {
      color: colors.error,
      fontWeight: 'bold',
    },
    negativeChip: {
      backgroundColor: colors.errorLight,
    },
    chipText: {
      color: colors.error,
      fontSize: 14,
    },
    profitNote: {
      color: colors.foregroundMuted,
      fontStyle: 'italic',
    },
    actions: {
      padding: 16,
    },
    exportButton: {
      marginBottom: 16,
    },
  });

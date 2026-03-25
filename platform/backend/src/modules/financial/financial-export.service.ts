import { Injectable, Logger } from '@nestjs/common';
import { FinancialReportService } from './financial-report.service';
import { FinancialTransactionService } from './financial-transaction.service';
import { EXPORT } from '@common/constants/limits';

@Injectable()
export class FinancialExportService {
  private readonly logger = new Logger(FinancialExportService.name);

  constructor(
    private readonly reportService: FinancialReportService,
    private readonly transactionService: FinancialTransactionService,
  ) {}

  /**
   * Export financial report in various formats.
   * Generates report data suitable for CSV, Excel, or PDF export.
   *
   * @param restaurantId - Restaurant identifier
   * @param startDate - Report start date
   * @param endDate - Report end date
   * @param format - Export format (pdf, csv, excel)
   * @param reportType - Type of report (summary, detailed, transactions)
   * @returns Formatted report data or download URL
   */
  async exportReport(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'csv' | 'excel',
    reportType: 'summary' | 'detailed' | 'transactions',
  ) {
    // Get base data based on report type
    let reportData: Record<string, unknown>;

    switch (reportType) {
      case 'summary':
        reportData = await this.reportService.getSummary(restaurantId, {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
        break;
      case 'detailed':
        const profitLoss = await this.reportService.getProfitLossStatement(
          restaurantId,
          startDate,
          endDate,
        );
        const cashFlow = await this.reportService.getCashFlow(
          restaurantId,
          startDate,
          endDate,
        );
        reportData = { profit_loss: profitLoss, cash_flow: cashFlow };
        break;
      case 'transactions':
        const transactionsData = await this.transactionService.getTransactions(
          restaurantId,
          { start_date: startDate.toISOString(), end_date: endDate.toISOString() },
          EXPORT.MAX_TRANSACTIONS, // Max transactions for export
          0,
        );
        reportData = transactionsData;
        break;
    }

    // Format data based on export format
    if (format === 'csv') {
      return this.formatAsCSV(reportData, reportType);
    } else if (format === 'excel') {
      return this.formatAsExcel(reportData, reportType);
    } else {
      // PDF format - return structured data for PDF generation
      return {
        format: 'pdf',
        report_type: reportType,
        generated_at: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        data: reportData,
      };
    }
  }

  /**
   * Format report data as CSV string.
   */
  private formatAsCSV(data: Record<string, unknown>, reportType: string): string {
    if (reportType === 'transactions' && data.transactions) {
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
      const transactions = data.transactions as Array<{ transaction_date: string; type: string; category: string; amount: number; description?: string }>;
      const rows = transactions.map((t) => [
        new Date(t.transaction_date).toISOString().split('T')[0],
        t.type,
        t.category,
        t.amount,
        t.description || '',
      ]);
      return [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');
    }

    // Summary format
    if (data.summary) {
      return Object.entries(data.summary)
        .map(([key, value]) => `${key},${value}`)
        .join('\n');
    }

    return JSON.stringify(data);
  }

  /**
   * Format report data for Excel export.
   * Returns structured data that can be processed by Excel libraries.
   */
  private formatAsExcel(data: Record<string, unknown>, reportType: string): Record<string, unknown> {
    return {
      format: 'excel',
      sheets: [
        {
          name: reportType === 'transactions' ? 'Transactions' : 'Summary',
          data: reportType === 'transactions' ? data.transactions : [data.summary],
        },
      ],
    };
  }
}

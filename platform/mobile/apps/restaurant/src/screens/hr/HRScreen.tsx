import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons, DataTable, Button, Chip } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useColors } from '@/shared/theme';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface HRSummary {
  total_staff: number;
  active_staff: number;
  on_break_staff: number;
  total_hours_worked: number;
  average_hours_per_staff: number;
  payroll_summary: {
    total_payroll: number;
    total_tips: number;
    total_bonuses: number;
  };
}

interface Attendance {
  staff_id: string;
  staff_name: string;
  total_hours: number;
  days_worked: number;
  late_arrivals: number;
  early_departures: number;
}

interface LeaveRequest {
  id: string;
  staff_member: {
    id: string;
    name: string;
  };
  leave_type: 'vacation' | 'sick' | 'personal';
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export default function HRScreen({ navigation }: any) {
  const colors = useColors();
  const [period, setPeriod] = useState('current');
  const [summary, setSummary] = useState<HRSummary | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHRData();
  }, [period]);

  const loadHRData = async () => {
    setLoading(true);
    try {
      const { start, end } =
        period === 'current'
          ? { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }
          : { start: new Date(), end: new Date() };

      const user = await ApiService.getCurrentUser();
      const restaurantId = (user as any).roles?.[0]?.restaurant_id;

      if (!restaurantId) {
        throw new Error('No restaurant found for user');
      }

      const [summaryResponse, attendanceResponse, leaveResponse] = await Promise.all([
        ApiService.getFinancialSummary({
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        }),
        ApiService.getAttendance({
          restaurant_id: restaurantId,
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
        }),
        ApiService.getLeaveRequests({
          restaurant_id: restaurantId,
          status: 'pending',
        }),
      ]);

      setSummary(summaryResponse as any);
      setAttendance(attendanceResponse as any);
      setLeaveRequests(leaveResponse as any);
    } catch (error) {
      // Error loading HR data
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHRData();
    setRefreshing(false);
  };

  const handleLeaveRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await ApiService.updateLeaveRequest(requestId, { status });
      loadHRData();
    } catch (error) {
      // Error updating leave request
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      vacation: '#4CAF50',
      sick: '#F44336',
      personal: '#FF9800',
    };
    return typeColors[type] || '#9E9E9E';
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    segmentedButtons: {
      margin: 15,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 15,
      paddingTop: 0,
      gap: 15,
    },
    summaryCard: {
      flex: 1,
      minWidth: '45%' as any,
      backgroundColor: colors.card,
    },
    cardLabel: {
      color: colors.foregroundMuted,
      marginBottom: 5,
    },
    active: {
      color: colors.success,
      fontWeight: 'bold' as const,
    },
    onBreak: {
      color: colors.warning,
      fontWeight: 'bold' as const,
    },
    card: {
      margin: 15,
      marginTop: 0,
      backgroundColor: colors.card,
    },
    payrollRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    payrollAmount: {
      fontWeight: '600' as const,
      color: colors.foreground,
    },
    totalRow: {
      borderTopWidth: 2,
      borderTopColor: colors.foreground,
      marginTop: 10,
      paddingTop: 15,
    },
    totalAmount: {
      fontWeight: 'bold' as const,
      color: colors.success,
    },
    emptyText: {
      color: colors.foregroundMuted,
      textAlign: 'center' as const,
      paddingVertical: 20,
    },
    leaveRequest: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    leaveHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    leaveDates: {
      color: colors.foregroundMuted,
      marginBottom: 5,
    },
    leaveReason: {
      color: colors.foregroundMuted,
      fontStyle: 'italic' as const,
      marginBottom: 10,
    },
    leaveActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    approveButton: {
      flex: 1,
      backgroundColor: colors.success,
    },
    rejectButton: {
      flex: 1,
    },
  }), [colors]);

  return (
    <ScreenContainer>
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <SegmentedButtons
        value={period}
        onValueChange={setPeriod}
        buttons={[
          { value: 'current', label: 'Current Month' },
          { value: 'last', label: 'Last Month' },
        ]}
        style={styles.segmentedButtons}
      />

      {summary && (
        <>
          <View style={styles.grid}>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>Total Staff</Text>
                <Text variant="displaySmall">{summary.total_staff}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>Active Now</Text>
                <Text variant="displaySmall" style={styles.active}>{summary.active_staff}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>On Break</Text>
                <Text variant="displaySmall" style={styles.onBreak}>{summary.on_break_staff}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>Avg Hours</Text>
                <Text variant="displaySmall">{summary.average_hours_per_staff.toFixed(1)}</Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.card}>
            <Card.Title title="Payroll Summary" />
            <Card.Content>
              <View style={styles.payrollRow}>
                <Text variant="bodyMedium">Total Payroll</Text>
                <Text variant="bodyMedium" style={styles.payrollAmount}>
                  ${summary.payroll_summary.total_payroll.toFixed(2)}
                </Text>
              </View>
              <View style={styles.payrollRow}>
                <Text variant="bodyMedium">Total Tips</Text>
                <Text variant="bodyMedium" style={styles.payrollAmount}>
                  ${summary.payroll_summary.total_tips.toFixed(2)}
                </Text>
              </View>
              <View style={styles.payrollRow}>
                <Text variant="bodyMedium">Total Bonuses</Text>
                <Text variant="bodyMedium" style={styles.payrollAmount}>
                  ${summary.payroll_summary.total_bonuses.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.payrollRow, styles.totalRow]}>
                <Text variant="titleMedium">Total</Text>
                <Text variant="titleMedium" style={styles.totalAmount}>
                  ${(summary.payroll_summary.total_payroll + summary.payroll_summary.total_tips + summary.payroll_summary.total_bonuses).toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      <Card style={styles.card}>
        <Card.Title title="Attendance Report" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Staff</DataTable.Title>
              <DataTable.Title numeric>Hours</DataTable.Title>
              <DataTable.Title numeric>Days</DataTable.Title>
            </DataTable.Header>
            {attendance.map((record) => (
              <DataTable.Row key={record.staff_id}>
                <DataTable.Cell>{record.staff_name}</DataTable.Cell>
                <DataTable.Cell numeric>{record.total_hours.toFixed(1)}</DataTable.Cell>
                <DataTable.Cell numeric>{record.days_worked}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Pending Leave Requests" />
        <Card.Content>
          {leaveRequests.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>No pending leave requests</Text>
          ) : (
            leaveRequests.map((request) => (
              <View key={request.id} style={styles.leaveRequest}>
                <View style={styles.leaveHeader}>
                  <Text variant="titleMedium">{request.staff_member.name}</Text>
                  <Chip style={{ backgroundColor: getLeaveTypeColor(request.leave_type) }} textStyle={{ color: '#fff', fontSize: 11 }} accessibilityLabel={`Leave type: ${request.leave_type}`}>
                    {request.leave_type.toUpperCase()}
                  </Chip>
                </View>
                <Text variant="bodyMedium" style={styles.leaveDates}>
                  {format(new Date(request.start_date), 'dd/MM/yyyy')} - {format(new Date(request.end_date), 'dd/MM/yyyy')}
                </Text>
                {request.reason && (
                  <Text variant="bodySmall" style={styles.leaveReason}>{request.reason}</Text>
                )}
                <View style={styles.leaveActions}>
                  <Button mode="contained" onPress={() => handleLeaveRequest(request.id, 'approved')} style={styles.approveButton} accessibilityLabel={`Approve leave for ${request.staff_member.name}`}>
                    Approve
                  </Button>
                  <Button mode="outlined" onPress={() => handleLeaveRequest(request.id, 'rejected')} style={styles.rejectButton} accessibilityLabel={`Reject leave for ${request.staff_member.name}`}>
                    Reject
                  </Button>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
    </ScreenContainer>
  );
}

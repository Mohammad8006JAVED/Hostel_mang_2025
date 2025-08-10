import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Calendar,
  Filter,
  Download,
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { getTheme } from '@/utils/theme';
import StatCard from '@/components/StatCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    weeklyTrend: 0,
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadUserData();
    loadReportData();
  }, [selectedPeriod]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadReportData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get students
      const studentsResponse = await fetch('/api/users?role=student');
      const studentsData = await studentsResponse.json();
      
      // Get today's attendance
      const attendanceResponse = await fetch(`/api/attendance?date=${today}`);
      const attendanceData = await attendanceResponse.json();
      
      // Get recent attendance for trend analysis
      const recentAttendanceResponse = await fetch('/api/attendance');
      const recentAttendanceData = await recentAttendanceResponse.json();
      
      if (studentsResponse.ok && attendanceResponse.ok && recentAttendanceResponse.ok) {
        const totalStudents = studentsData.users.length;
        const presentToday = attendanceData.attendance.filter(a => a.status === 'present').length;
        const absentToday = totalStudents - presentToday;
        const averageAttendance = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
        
        // Calculate weekly trend (simplified)
        const weeklyTrend = Math.floor(Math.random() * 10) - 5; // Mock trend data
        
        setReportData({
          totalStudents,
          averageAttendance,
          presentToday,
          absentToday,
          weeklyTrend,
        });
        
        // Group attendance by date for history
        const attendanceByDate = {};
        recentAttendanceData.attendance.forEach(record => {
          const date = record.date;
          if (!attendanceByDate[date]) {
            attendanceByDate[date] = { present: 0, absent: 0, total: 0 };
          }
          if (record.status === 'present') {
            attendanceByDate[date].present++;
          } else {
            attendanceByDate[date].absent++;
          }
          attendanceByDate[date].total++;
        });
        
        const history = Object.entries(attendanceByDate)
          .map(([date, data]) => ({
            date,
            ...data,
            percentage: Math.round((data.present / totalStudents) * 100),
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7);
        
        setAttendanceHistory(history);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => exportToPDF() },
        { text: 'Excel', onPress: () => exportToExcel() },
      ]
    );
  };

  const exportToPDF = () => {
    Alert.alert('Export', 'PDF report would be generated and shared.');
  };

  const exportToExcel = () => {
    Alert.alert('Export', 'Excel report would be generated and shared.');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!fontsLoaded || loading) {
    return null;
  }

  const styles = createStyles(theme);

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'semester', label: 'Semester' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Attendance Reports</Text>
            <Text style={styles.subtitle}>Analytics and insights</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
            <Download size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.activePeriodButtonText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>

          <View style={styles.metricsGrid}>
            <StatCard
              icon={Users}
              number={reportData.totalStudents.toString()}
              label="Total Students"
              color={theme.info}
              theme={theme}
            />

            <StatCard
              icon={BarChart3}
              number={`${reportData.averageAttendance}%`}
              label="Avg Attendance"
              color={theme.success}
              theme={theme}
            />

            <StatCard
              icon={TrendingUp}
              number={`${Math.abs(reportData.weeklyTrend)}%`}
              label={reportData.weeklyTrend >= 0 ? 'Weekly Growth' : 'Weekly Decline'}
              color={reportData.weeklyTrend >= 0 ? theme.success : theme.error}
              theme={theme}
            />

            <StatCard
              icon={Calendar}
              number={reportData.presentToday.toString()}
              label="Present Today"
              color="#7C3AED"
              theme={theme}
            />
          </View>
        </View>

        {/* Attendance Trend */}
        <View style={styles.trendSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance Trend</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color={theme.textSecondary} />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trendChart}>
            {attendanceHistory.map((day, index) => (
              <View key={day.date} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${day.percentage}%`,
                      backgroundColor:
                        day.percentage >= 80
                          ? theme.success
                          : day.percentage >= 60
                          ? theme.warning
                          : theme.error,
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{formatDate(day.date)}</Text>
                <Text style={styles.chartPercentage}>{day.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>

          <View style={styles.breakdownList}>
            {attendanceHistory.map((day) => (
              <View key={day.date} style={styles.breakdownItem}>
                <View style={styles.breakdownDate}>
                  <Calendar size={16} color={theme.textSecondary} />
                  <Text style={styles.breakdownDateText}>{formatDate(day.date)}</Text>
                </View>

                <View style={styles.breakdownStats}>
                  <View style={styles.breakdownStat}>
                    <Text style={styles.breakdownStatNumber}>{day.present}</Text>
                    <Text style={styles.breakdownStatLabel}>Present</Text>
                  </View>
                  <View style={styles.breakdownStat}>
                    <Text style={styles.breakdownStatNumber}>{day.absent}</Text>
                    <Text style={styles.breakdownStatLabel}>Absent</Text>
                  </View>
                  <View style={styles.breakdownStat}>
                    <Text style={[styles.breakdownStatNumber, { color: theme.primary }]}>
                      {day.percentage}%
                    </Text>
                    <Text style={styles.breakdownStatLabel}>Rate</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
              <FileText size={20} color={theme.textPrimary} />
              <Text style={styles.actionButtonText}>Generate Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Building2 size={20} color={theme.textPrimary} />
              <Text style={styles.actionButtonText}>Hostel Summary</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.textSecondary,
    },
    exportButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 32,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    activePeriodButton: {
      backgroundColor: theme.primary,
    },
    periodButtonText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textSecondary,
    },
    activePeriodButtonText: {
      color: '#FFFFFF',
    },
    metricsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
      marginBottom: 16,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    trendSection: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.elevated,
    },
    filterButtonText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.textSecondary,
    },
    trendChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      height: 200,
    },
    chartBar: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
    },
    bar: {
      width: 20,
      backgroundColor: theme.primary,
      borderRadius: 4,
      marginBottom: 8,
      minHeight: 4,
    },
    chartLabel: {
      fontSize: 10,
      fontFamily: 'Inter_400Regular',
      color: theme.textTertiary,
      marginBottom: 2,
    },
    chartPercentage: {
      fontSize: 10,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textSecondary,
    },
    breakdownSection: {
      marginBottom: 32,
    },
    breakdownList: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      overflow: 'hidden',
    },
    breakdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    breakdownDate: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    breakdownDateText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
    },
    breakdownStats: {
      flexDirection: 'row',
      gap: 16,
    },
    breakdownStat: {
      alignItems: 'center',
    },
    breakdownStatNumber: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
    },
    breakdownStatLabel: {
      fontSize: 10,
      fontFamily: 'Inter_400Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    actionsSection: {
      marginBottom: 24,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      gap: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
      textAlign: 'center',
    },
  });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  QrCode,
  BarChart3,
  CheckCircle,
  UserCheck,
  Building2,
  UserX,
  AlertCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { getTheme } from "@/utils/theme";
import StatCard from "@/components/StatCard";
import GradientButton from "@/components/GradientButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's attendance
      const attendanceResponse = await fetch(`/api/attendance?date=${today}`);
      const attendanceData = await attendanceResponse.json();
      
      // Get all students
      const usersResponse = await fetch('/api/users?role=student');
      const usersData = await usersResponse.json();
      
      if (attendanceResponse.ok && usersResponse.ok) {
        const totalStudents = usersData.users.length;
        const presentToday = attendanceData.attendance.filter(a => a.status === 'present').length;
        const absentToday = totalStudents - presentToday;
        const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
        
        setStats({
          totalStudents,
          presentToday,
          absentToday,
          attendanceRate,
        });
        
        // Set recent activity (last 5 attendance records)
        setRecentActivity(attendanceData.attendance.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAttendance = () => {
    router.push("/(tabs)/attendance");
  };

  const navigateToReports = () => {
    router.push("/(tabs)/reports");
  };

  const navigateToLeaveRequests = () => {
    router.push("/(tabs)/leave-requests");
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (!fontsLoaded || loading) {
    return null;
  }

  const styles = createStyles(theme);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <View style={styles.userMeta}>
              <View style={styles.metaItem}>
                <Building2 size={16} color={theme.textSecondary} />
                <Text style={styles.metaText}>{user?.hostel_name || 'Hostel'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={16} color={theme.textSecondary} />
                <Text style={styles.metaText}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>

          <View style={styles.statsGrid}>
            <StatCard
              icon={Users}
              number={stats.totalStudents.toString()}
              label="Total Students"
              color={theme.info}
              theme={theme}
            />

            <StatCard
              icon={UserCheck}
              number={stats.presentToday.toString()}
              label="Present Today"
              color={theme.success}
              theme={theme}
            />

            <StatCard
              icon={UserX}
              number={stats.absentToday.toString()}
              label="Absent Today"
              color={theme.error}
              theme={theme}
            />

            <StatCard
              icon={CheckCircle}
              number={`${stats.attendanceRate}%`}
              label="Attendance Rate"
              color="#7C3AED"
              theme={theme}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.primaryAction}>
            <GradientButton
              title="Mark Attendance"
              onPress={navigateToAttendance}
              icon={<QrCode size={24} color="#FFFFFF" />}
              theme={theme}
            />
          </View>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={navigateToReports}>
              <View style={styles.secondaryButtonIcon}>
                <BarChart3 size={20} color={theme.textPrimary} />
              </View>
              <Text style={styles.secondaryButtonText}>View Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={navigateToLeaveRequests}>
              <View style={styles.secondaryButtonIcon}>
                <Calendar size={20} color={theme.textPrimary} />
              </View>
              <Text style={styles.secondaryButtonText}>Leave Requests</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            <View style={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <CheckCircle 
                      size={16} 
                      color={activity.status === 'present' ? theme.success : theme.error} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityName}>{activity.user_name}</Text>
                    <Text style={styles.activityTime}>
                      {activity.status === 'present' ? 'Marked present' : 'Marked absent'} • {formatTime(activity.marked_at)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.activityStatus,
                    { color: activity.status === 'present' ? theme.success : theme.error }
                  ]}>
                    {activity.status}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
      marginBottom: 32,
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: theme.textSecondary,
      marginBottom: 4,
    },
    userName: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: theme.textPrimary,
      marginBottom: 16,
    },
    userMeta: {
      gap: 8,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: theme.textSecondary,
    },
    logoutButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    logoutText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: theme.error,
    },
    statsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: theme.textPrimary,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    actionsSection: {
      marginBottom: 32,
    },
    primaryAction: {
      marginBottom: 16,
    },
    secondaryActions: {
      flexDirection: "row",
      gap: 12,
    },
    secondaryButton: {
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
    secondaryButtonIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.elevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
      textAlign: 'center',
    },
    activitySection: {
      marginBottom: 24,
    },
    activityList: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    activityIcon: {
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: theme.textPrimary,
    },
    activityTime: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: theme.textSecondary,
      marginTop: 2,
    },
    activityStatus: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      textTransform: 'capitalize',
    },
  });
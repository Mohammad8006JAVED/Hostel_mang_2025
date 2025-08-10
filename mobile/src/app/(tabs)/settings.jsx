import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Settings as SettingsIcon,
  Download,
  Share,
  Moon,
  Smartphone,
  Building2,
  Users,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { 
  useFonts, 
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { getTheme } from '@/utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadUserData();
  }, []);

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

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Profile settings would open here.');
  };

  const handleSecurityPress = () => {
    Alert.alert('Security', 'Security settings would open here.');
  };

  const handleHelpPress = () => {
    Alert.alert('Help & Support', 'Help documentation and support contact would be available here.');
  };

  const handleLogoutPress = () => {
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

  const handleExportPress = () => {
    Alert.alert('Export Data', 'Data export functionality would be implemented here.');
  };

  const handleSharePress = () => {
    Alert.alert('Share App', 'App sharing functionality would be implemented here.');
  };

  const handleRoomManagement = () => {
    Alert.alert('Room Management', 'Room allocation and management features would be available here.');
  };

  const handleUserManagement = () => {
    Alert.alert('User Management', 'User management features would be available here.');
  };

  if (!fontsLoaded) {
    return null;
  }

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <SettingsIcon size={24} color={theme.textPrimary} />
          </View>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <User size={32} color={theme.textSecondary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.hostel_name}
            </Text>
            {user?.room_no && (
              <Text style={styles.userDetails}>Room {user.room_no}</Text>
            )}
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleProfilePress}>
            <View style={styles.settingIcon}>
              <User size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Profile Settings</Text>
              <Text style={styles.settingSubtitle}>Manage your account information</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSecurityPress}>
            <View style={styles.settingIcon}>
              <Shield size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security</Text>
              <Text style={styles.settingSubtitle}>Password and privacy settings</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Admin/Staff Features */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleRoomManagement}>
              <View style={styles.settingIcon}>
                <Building2 size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Room Management</Text>
                <Text style={styles.settingSubtitle}>Manage room allocations</Text>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleUserManagement}>
              <View style={styles.settingIcon}>
                <Users size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>User Management</Text>
                <Text style={styles.settingSubtitle}>Manage students and staff</Text>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Get notified about attendance and leave requests</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Moon size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingSubtitle}>Follows system setting</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={darkModeEnabled ? '#FFFFFF' : '#FFFFFF'}
              disabled={true}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Smartphone size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>App Preferences</Text>
              <Text style={styles.settingSubtitle}>Customize app behavior</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleExportPress}>
            <View style={styles.settingIcon}>
              <Download size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Export Data</Text>
              <Text style={styles.settingSubtitle}>Download attendance and leave data</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSharePress}>
            <View style={styles.settingIcon}>
              <Share size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Share App</Text>
              <Text style={styles.settingSubtitle}>Invite others to use the app</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleHelpPress}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingSubtitle}>FAQs and contact support</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Hostel Manager</Text>
          <Text style={styles.appInfoSubtitle}>Attendance Management System</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
          <LogOut size={20} color={theme.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
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
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: theme.textPrimary,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textSecondary,
    marginBottom: 2,
  },
  userDetails: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: theme.textTertiary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
  },
  appInfo: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  appInfoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: theme.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.error + '20',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: theme.error,
  },
});
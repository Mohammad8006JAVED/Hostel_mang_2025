import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Animated,
  useColorScheme,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { 
  QrCode, 
  Camera, 
  Users, 
  Calendar,
  Flashlight,
  FlashlightOff,
  CheckCircle,
  X,
  UserCheck,
  UserX,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  useFonts, 
  Inter_400Regular,
  Inter_600SemiBold
} from '@expo-google-fonts/inter';
import { getTheme } from '@/utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  
  const [user, setUser] = useState(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false);
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  
  const scanAnimation = useRef(new Animated.Value(0)).current;
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadUserData();
    loadStudentsAndAttendance();
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

  const loadStudentsAndAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get students
      const studentsResponse = await fetch('/api/users?role=student');
      const studentsData = await studentsResponse.json();
      
      // Get today's attendance
      const attendanceResponse = await fetch(`/api/attendance?date=${today}`);
      const attendanceData = await attendanceResponse.json();
      
      if (studentsResponse.ok && attendanceResponse.ok) {
        setStudents(studentsData.users);
        
        // Create attendance map
        const attendanceMap = {};
        attendanceData.attendance.forEach(record => {
          attendanceMap[record.user_id] = record.status;
        });
        setTodayAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = () => {
    setScanning(true);
    
    // Animate scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Simulate QR scan success after 3 seconds
    setTimeout(() => {
      setScanning(false);
      scanAnimation.setValue(0);
      
      // Simulate successful scan
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      if (randomStudent) {
        handleAttendanceMarked(randomStudent, 'present');
      }
    }, 3000);
  };

  const handleAttendanceMarked = (student, status) => {
    Alert.alert(
      'Attendance Marked',
      `${student.name} has been marked as ${status}`,
      [{ text: 'OK' }]
    );
    
    // Update local state
    setTodayAttendance(prev => ({
      ...prev,
      [student.id]: status
    }));
  };

  const markAttendance = async (studentId, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          date: today,
          status: status,
          markedBy: user?.id,
        }),
      });

      if (response.ok) {
        const student = students.find(s => s.id === studentId);
        handleAttendanceMarked(student, status);
      } else {
        Alert.alert('Error', 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const toggleFlashlight = () => {
    setFlashlightOn(!flashlightOn);
  };

  const toggleMode = () => {
    setShowManualMode(!showManualMode);
  };

  if (!fontsLoaded || loading) {
    return null;
  }

  const styles = createStyles(theme);

  const presentCount = Object.values(todayAttendance).filter(status => status === 'present').length;
  const absentCount = students.length - presentCount;

  if (showManualMode) {
    return (
      <View style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Manual Attendance</Text>
            <Text style={styles.subtitle}>Mark attendance for each student</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.modeButton}
            onPress={toggleMode}
          >
            <QrCode size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <UserCheck size={20} color={theme.success} />
            <Text style={styles.statNumber}>{presentCount}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <UserX size={20} color={theme.error} />
            <Text style={styles.statNumber}>{absentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        {/* Students List */}
        <ScrollView 
          style={styles.studentsList}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {students.map((student) => {
            const status = todayAttendance[student.id];
            return (
              <View key={student.id} style={styles.studentItem}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentDetails}>
                    {student.student_id} • Room {student.room_no}
                  </Text>
                </View>
                
                <View style={styles.attendanceControls}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.presentButton,
                      status === 'present' && styles.activeButton
                    ]}
                    onPress={() => markAttendance(student.id, 'present')}
                  >
                    <CheckCircle 
                      size={16} 
                      color={status === 'present' ? '#FFFFFF' : theme.success} 
                    />
                    <Text style={[
                      styles.attendanceButtonText,
                      status === 'present' && styles.activeButtonText
                    ]}>
                      Present
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.absentButton,
                      status === 'absent' && styles.activeButton
                    ]}
                    onPress={() => markAttendance(student.id, 'absent')}
                  >
                    <X 
                      size={16} 
                      color={status === 'absent' ? '#FFFFFF' : theme.error} 
                    />
                    <Text style={[
                      styles.attendanceButtonText,
                      status === 'absent' && styles.activeButtonText
                    ]}>
                      Absent
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Scan QR Code</Text>
          <Text style={styles.subtitle}>Point camera at student's QR code</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.modeButton}
          onPress={toggleMode}
        >
          <Users size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Scan line animation */}
          {scanning && (
            <Animated.View 
              style={[
                styles.scanLine,
                {
                  transform: [{
                    translateY: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 250],
                    }),
                  }],
                }
              ]}
            />
          )}
          
          {/* Center icon */}
          <View style={styles.centerIcon}>
            <QrCode size={80} color={theme.textTertiary} />
          </View>
        </View>
        
        {/* Instructions */}
        <Text style={styles.instruction}>
          {scanning ? 'Scanning...' : 'Align QR code within the frame'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleFlashlight}
        >
          {flashlightOn ? (
            <Flashlight size={24} color={theme.primary} />
          ) : (
            <FlashlightOff size={24} color={theme.textSecondary} />
          )}
          <Text style={[styles.controlText, { color: flashlightOn ? theme.primary : theme.textSecondary }]}>
            Flash
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={startScanning}
          disabled={scanning}
        >
          <LinearGradient
            colors={scanning ? [theme.textTertiary, theme.textTertiary] : [theme.primary, theme.primaryLight]}
            style={styles.scanButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Camera size={28} color="#FFF" />
            <Text style={styles.scanButtonText}>
              {scanning ? 'Scanning...' : 'Scan QR Code'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Calendar size={24} color={theme.textSecondary} />
          <Text style={styles.controlText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: insets.bottom + 16 }} />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
    marginTop: 4,
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: theme.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.success,
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  centerIcon: {
    opacity: 0.3,
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  scanButton: {
    flex: 1,
    marginHorizontal: 24,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
  },
  // Manual mode styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  studentItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textPrimary,
  },
  studentDetails: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
    marginTop: 4,
  },
  attendanceControls: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  presentButton: {
    borderColor: theme.success,
    backgroundColor: theme.success + '10',
  },
  absentButton: {
    borderColor: theme.error,
    backgroundColor: theme.error + '10',
  },
  activeButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  attendanceButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textPrimary,
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});
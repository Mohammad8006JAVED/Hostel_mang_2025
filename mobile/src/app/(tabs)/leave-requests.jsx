import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  FileText,
  User,
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
import GradientButton from '@/components/GradientButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeaveRequestsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  const [user, setUser] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // New request form
  const [newRequest, setNewRequest] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'personal',
  });

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadUserData();
    loadLeaveRequests();
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

  const loadLeaveRequests = async () => {
    try {
      const response = await fetch('/api/leave-requests');
      const data = await response.json();

      if (response.ok) {
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          startDate: newRequest.startDate,
          endDate: newRequest.endDate,
          reason: newRequest.reason,
          leaveType: newRequest.leaveType,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Leave request submitted successfully');
        setShowNewRequestModal(false);
        setNewRequest({
          startDate: '',
          endDate: '',
          reason: '',
          leaveType: 'personal',
        });
        loadLeaveRequests();
      } else {
        Alert.alert('Error', 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'approved',
          approvedBy: user?.id,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Leave request approved');
        loadLeaveRequests();
      } else {
        Alert.alert('Error', 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'rejected',
          approvedBy: user?.id,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Leave request rejected');
        loadLeaveRequests();
      } else {
        Alert.alert('Error', 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.success;
      case 'rejected':
        return theme.error;
      case 'pending':
        return theme.warning;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return X;
      case 'pending':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'my' && user?.role === 'student') {
      return request.user_id === user.id;
    }
    return request.status === selectedTab;
  });

  if (!fontsLoaded || loading) {
    return null;
  }

  const styles = createStyles(theme);

  const tabs = [
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  // Add "My Requests" tab for students
  if (user?.role === 'student') {
    tabs.splice(1, 0, { key: 'my', label: 'My Requests' });
  }

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
            <Text style={styles.title}>Leave Requests</Text>
            <Text style={styles.subtitle}>Manage student leave applications</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewRequestModal(true)}
          >
            <Plus size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                selectedTab === tab.key && styles.activeTabButton,
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === tab.key && styles.activeTabButtonText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Leave Requests List */}
        <View style={styles.requestsList}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color={theme.textTertiary} />
              <Text style={styles.emptyStateTitle}>No leave requests</Text>
              <Text style={styles.emptyStateSubtitle}>
                {selectedTab === 'my'
                  ? 'You haven\'t submitted any leave requests yet'
                  : 'No leave requests found for this filter'}
              </Text>
            </View>
          ) : (
            filteredRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              const statusColor = getStatusColor(request.status);

              return (
                <View key={request.id} style={styles.requestItem}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestUser}>
                      <View style={styles.userAvatar}>
                        <User size={16} color={theme.textSecondary} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{request.user_name}</Text>
                        <Text style={styles.userDetails}>
                          {request.student_id} • Room {request.room_no}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <StatusIcon size={12} color={statusColor} />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {request.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestDetails}>
                    <View style={styles.requestDates}>
                      <Calendar size={14} color={theme.textSecondary} />
                      <Text style={styles.requestDatesText}>
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </Text>
                    </View>

                    <Text style={styles.requestReason}>{request.reason}</Text>

                    <View style={styles.requestMeta}>
                      <Text style={styles.requestType}>{request.leave_type}</Text>
                      <Text style={styles.requestDate}>
                        {formatDate(request.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons for Admin/Staff */}
                  {(user?.role === 'admin' || user?.role === 'staff') &&
                    request.status === 'pending' && (
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle size={16} color={theme.success} />
                          <Text style={[styles.actionButtonText, { color: theme.success }]}>
                            Approve
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectRequest(request.id)}
                        >
                          <X size={16} color={theme.error} />
                          <Text style={[styles.actionButtonText, { color: theme.error }]}>
                            Reject
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* New Request Modal */}
      <Modal
        visible={showNewRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Leave Request</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNewRequestModal(false)}
            >
              <X size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Start Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textTertiary}
                value={newRequest.startDate}
                onChangeText={(text) =>
                  setNewRequest((prev) => ({ ...prev, startDate: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>End Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textTertiary}
                value={newRequest.endDate}
                onChangeText={(text) =>
                  setNewRequest((prev) => ({ ...prev, endDate: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Leave Type</Text>
              <View style={styles.leaveTypeContainer}>
                {['personal', 'medical', 'emergency', 'family'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.leaveTypeButton,
                      newRequest.leaveType === type && styles.activeLeaveTypeButton,
                    ]}
                    onPress={() =>
                      setNewRequest((prev) => ({ ...prev, leaveType: type }))
                    }
                  >
                    <Text
                      style={[
                        styles.leaveTypeButtonText,
                        newRequest.leaveType === type && styles.activeLeaveTypeButtonText,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Please provide a detailed reason for your leave request..."
                placeholderTextColor={theme.textTertiary}
                value={newRequest.reason}
                onChangeText={(text) =>
                  setNewRequest((prev) => ({ ...prev, reason: text }))
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 20 }]}>
            <GradientButton
              title="Submit Request"
              onPress={handleCreateRequest}
              theme={theme}
            />
          </View>
        </View>
      </Modal>
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
    addButton: {
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
    tabContainer: {
      marginBottom: 24,
    },
    tabContent: {
      paddingRight: 20,
    },
    tabButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
      marginRight: 8,
    },
    activeTabButton: {
      backgroundColor: theme.primary,
    },
    tabButtonText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textSecondary,
    },
    activeTabButtonText: {
      color: '#FFFFFF',
    },
    requestsList: {
      gap: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
    requestItem: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    requestUser: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.elevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
    },
    userDetails: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'capitalize',
    },
    requestDetails: {
      gap: 8,
    },
    requestDates: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    requestDatesText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
    },
    requestReason: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.textSecondary,
      lineHeight: 20,
    },
    requestMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    requestType: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: theme.primary,
      textTransform: 'capitalize',
    },
    requestDate: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.textTertiary,
    },
    requestActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 6,
      borderWidth: 1,
    },
    approveButton: {
      borderColor: theme.success,
      backgroundColor: theme.success + '10',
    },
    rejectButton: {
      borderColor: theme.error,
      backgroundColor: theme.error + '10',
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: theme.textPrimary,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    modalFooter: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    formGroup: {
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    formInput: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
    },
    leaveTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    leaveTypeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    activeLeaveTypeButton: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    leaveTypeButtonText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: theme.textSecondary,
    },
    activeLeaveTypeButtonText: {
      color: '#FFFFFF',
    },
  });
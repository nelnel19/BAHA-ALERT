import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersResponse, reportsResponse, eventsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/auth/count`),
        axios.get(`${API_BASE_URL}/flood-reports/reportcount`),
        axios.get(`${API_BASE_URL}/schedules/count`)
      ]);
      
      setTotalUsers(usersResponse.data.totalUsers);
      setTotalReports(reportsResponse.data.count);
      setTotalEvents(eventsResponse.data.totalEvents);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Add any additional logout logic here (like clearing tokens, etc.)
            // Then navigate to Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} activeOpacity={0.8}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Feather name={icon} size={24} color={color} />
          </View>
          <View style={styles.statCardInfo}>
            <Text style={styles.statValue}>{loading ? '...' : value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>BahaAlert</Text>
            <Text style={styles.headerSubtitle}>Emergency Management Dashboard</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
              <Feather name="bell" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
              <Feather name="log-out" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Weather Info Bar */}
        <View style={styles.weatherBar}>
          <View style={styles.weatherInfo}>
            <Feather name="cloud-rain" size={18} color="#60a5fa" />
            <Text style={styles.weatherText}>Partly Cloudy • 28°C</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{getCurrentTime()}</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Registered Users"
              value={totalUsers.toLocaleString()}
              icon="users"
              color="#10b981"
              subtitle="Active community members"
            />
            <StatCard
              title="Flood Reports"
              value={totalReports.toLocaleString()}
              icon="alert-triangle"
              color="#f59e0b"
              subtitle="Total incidents reported"
            />
            <StatCard
              title="LGU Events"
              value={totalEvents.toLocaleString()}
              icon="calendar"
              color="#3b82f6"
              subtitle="Scheduled activities"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Calendar"
              icon="calendar"
              color="#3b82f6"
              onPress={() => navigation?.navigate('Calendar')}
            />
            <QuickActionCard
              title="Reports"
              icon="file-text"
              color="#10b981"
              onPress={() => navigation?.navigate('Reports')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  headerButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  weatherBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  dateText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardContent: {
    flex: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statCardInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 64) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});

export default DashboardScreen;
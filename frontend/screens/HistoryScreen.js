import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserReports = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) throw new Error('User not authenticated');

      const user = JSON.parse(userString);
      
      const response = await fetch(
        `${API_BASE_URL}/flood-reports/my-reports?${new URLSearchParams({
          reporterName: user.fullname || user.name,
          contactNumber: user.contactNumber || ''
        })}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch reports');
      }

      // Process image URLs to ensure they're complete
      const processedReports = data.reports.map(report => ({
        ...report,
        imageUrl: report.imageUrl.startsWith('http') 
          ? report.imageUrl 
          : `${API_BASE_URL}/${report.imageUrl.replace(/^\/+/g, '')}`
      }));

      setReports(processedReports);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserReports();
  };

  const getDangerLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'critical': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getDangerLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'droplet';
      case 'medium': return 'cloud-rain';
      case 'high': return 'cloud-lightning';
      case 'critical': return 'alert-triangle';
      default: return 'info';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderReportItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.reportCard, { marginTop: index === 0 ? 0 : 12 }]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.reportIdContainer}>
          <Icon name="file-text" size={16} color="#6B7280" />
          <Text style={styles.reportId}>#{item._id.substring(0, 8)}</Text>
        </View>
        <View style={[
          styles.dangerBadge, 
          { backgroundColor: getDangerLevelColor(item.dangerLevel) }
        ]}>
          <Icon 
            name={getDangerLevelIcon(item.dangerLevel)} 
            size={12} 
            color="white" 
          />
          <Text style={styles.dangerText}>{item.dangerLevel}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <Icon name="map-pin" size={16} color="#3B82F6" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <Text style={styles.descriptionText} numberOfLines={3}>
        {item.description}
      </Text>

      {item.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.reportImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Icon name="image" size={16} color="white" />
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={14} color="#6B7280" />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-horizontal" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="cloud-drizzle" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start reporting flood conditions in your area to help your community stay safe
      </Text>
      <TouchableOpacity 
        style={styles.createReportButton}
        onPress={() => navigation.navigate('Flood')}
      >
        <Icon name="plus" size={16} color="white" />
        <Text style={styles.createReportText}>Create First Report</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Reports</Text>
      <Text style={styles.headerSubtitle}>
        {reports.length} flood {reports.length === 1 ? 'report' : 'reports'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        <LinearGradient
          colors={['#1E40AF', '#3B82F6']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        <LinearGradient
          colors={['#1E40AF', '#3B82F6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>My Reports</Text>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Icon name="wifi-off" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserReports}>
            <Icon name="refresh-cw" size={16} color="white" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Reports</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate('Flood')}
          >
            <Icon name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {reports.length === 0 ? renderEmptyState() : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'System',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingVertical: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'System',
  },
  listContainer: {
    paddingBottom: 100,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
    fontFamily: 'System',
  },
  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dangerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    fontFamily: 'System',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'System',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  reportImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontFamily: 'System',
  },
  moreButton: {
    padding: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'System',
  },
  createReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createReportText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    fontFamily: 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
    fontFamily: 'System',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'System',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    fontFamily: 'System',
  },
});

export default HistoryScreen;
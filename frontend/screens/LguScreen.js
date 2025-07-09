import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../config';
import moment from 'moment';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const LguScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [weatherNews, setWeatherNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`);
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWeatherNews = async () => {
    try {
      setWeatherLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/news/weather`);
      setWeatherNews(response.data.articles);
    } catch (error) {
      console.error("Error fetching weather news:", error.message);
      setError("Failed to load weather updates. Please try again.");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchWeatherNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
    fetchWeatherNews();
  };

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('ScheduleDetail', { schedule: item })}
      activeOpacity={0.8}
    >
      <View style={styles.featuredImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🌊</Text>
          </View>
        )}
        <View style={styles.featuredGradient} />
        <View style={styles.featuredOverlay}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'Alert'}</Text>
          </View>
          <View style={styles.urgencyIndicator}>
            <View style={styles.urgencyDot} />
            <Text style={styles.urgencyText}>LIVE</Text>
          </View>
        </View>
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.featuredMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.featuredDate}>
              {moment(item.date).format('MMM D, YYYY')}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.featuredLocation}>{item.location}</Text>
          </View>
        </View>
        <Text style={styles.featuredDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderWeatherItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => item.url ? Linking.openURL(item.url) : null}
      activeOpacity={0.7}
    >
      <View style={styles.newsImageContainer}>
        {item.urlToImage ? (
          <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
        ) : (
          <View style={styles.newsPlaceholder}>
            <Text style={styles.newsPlaceholderText}>🌦️</Text>
          </View>
        )}
        <View style={styles.newsImageOverlay}>
          <View style={styles.newsCategoryBadge}>
            <Text style={styles.newsCategoryText}>Weather</Text>
          </View>
        </View>
      </View>
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsTime}>
            {item.publishedAt ? moment(item.publishedAt).fromNow() : ''}
          </Text>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceIcon}>📰</Text>
            <Text style={styles.newsSource}>{item.source?.name || 'Weather Update'}</Text>
          </View>
        </View>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.description || 'Tap to read more about this weather update'}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsDate}>
            {item.publishedAt ? moment(item.publishedAt).format('MMM D, YYYY') : ''}
          </Text>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMore}>Read more</Text>
            <Text style={styles.readMoreIcon}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading || weatherLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <View style={styles.loadingPulse} />
          </View>
          <Text style={styles.loadingText}>Loading weather updates...</Text>
          <Text style={styles.loadingSubtext}>Fetching latest flood and weather data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const featuredNews = schedules.slice(0, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🌊</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>LGU Updates</Text>
              <Text style={styles.headerSubtitle}>Events and News</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          {/* Weather Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>🌊</Text>
              </View>
              <Text style={styles.statNumber}>{schedules.length}</Text>
              <Text style={styles.statLabel}>Flood Alerts</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>🌧️</Text>
              </View>
              <Text style={styles.statNumber}>{weatherNews.length}</Text>
              <Text style={styles.statLabel}>Weather News</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📅</Text>
              </View>
              <Text style={styles.statNumber}>{moment().format('DD')}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Alerts Section */}
        {featuredNews.length > 0 && (
          <View style={styles.emergencySection}>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyTitleContainer}>
                <Text style={styles.emergencyIcon}>🚨</Text>
                <Text style={styles.emergencyTitle}>Emergency Alerts</Text>
              </View>
              <Text style={styles.emergencySubtitle}>Critical Updates</Text>
            </View>
            <FlatList
              data={featuredNews}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => `featured-${item._id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            />
          </View>
        )}

        {/* Weather News Section */}
        <View style={styles.newsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>🌦️</Text>
              <Text style={styles.sectionTitle}>Latest Weather News</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchWeatherNews}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Connection Error</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherNews}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : weatherNews.length > 0 ? (
            <FlatList
              data={weatherNews}
              renderItem={renderWeatherItem}
              keyExtractor={(item, index) => `weather-${index}`}
              scrollEnabled={false}
              contentContainerStyle={styles.newsContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🌤️</Text>
              <Text style={styles.emptyTitle}>No Weather Updates</Text>
              <Text style={styles.emptyText}>All clear! Check back later for weather updates</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>📍</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    position: 'relative',
    paddingBottom: 24,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#1e40af',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerIconText: {
    fontSize: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    marginTop: -8,
  },
  emergencySection: {
    marginBottom: 24,
  },
  emergencyHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  emergencyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  emergencyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 36,
    fontWeight: '500',
  },
  featuredContainer: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: screenWidth - 40,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  featuredImageContainer: {
    position: 'relative',
    height: 240,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
  },
  featuredContent: {
    padding: 24,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 28,
  },
  featuredMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featuredDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  featuredLocation: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  featuredDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  newsSection: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  refreshIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  newsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  newsImageContainer: {
    position: 'relative',
    height: 140,
  },
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newsPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsPlaceholderText: {
    fontSize: 40,
  },
  newsImageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  newsCategoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  newsCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  newsContent: {
    padding: 20,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  newsSource: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  newsDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 4,
  },
  readMoreIcon: {
    fontSize: 14,
    color: '#3b82f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingSpinner: {
    position: 'relative',
    marginBottom: 24,
  },
  loadingPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: -15,
    left: -15,
  },
  loadingText: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  fabIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
});

export default LguScreen;
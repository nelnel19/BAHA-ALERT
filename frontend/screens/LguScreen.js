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
} from 'react-native';
import { API_BASE_URL } from '../config';
import moment from 'moment';
import axios from 'axios';

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
      setError("Failed to load Philippine weather news. Please try again later.");
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
      activeOpacity={0.9}
    >
      <View style={styles.featuredImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📰</Text>
          </View>
        )}
        <View style={styles.featuredOverlay}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'News'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredDate}>
            {moment(item.date).format('MMM D, YYYY')}
          </Text>
          <Text style={styles.featuredLocation}>📍 {item.location}</Text>
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
      activeOpacity={0.8}
    >
      <View style={styles.newsImageContainer}>
        {item.urlToImage ? (
          <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
        ) : (
          <View style={styles.newsPlaceholder}>
            <Text style={styles.newsPlaceholderText}>🌦️</Text>
          </View>
        )}
      </View>
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <View style={styles.newsCategoryBadge}>
            <Text style={styles.newsCategoryText}>News</Text>
          </View>
          <Text style={styles.newsTime}>
            {item.publishedAt ? moment(item.publishedAt).fromNow() : ''}
          </Text>
        </View>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsLocation}>{item.source?.name || 'Unknown source'}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsDate}>
            {item.publishedAt ? moment(item.publishedAt).format('MMMM D, YYYY') : ''}
          </Text>
          <Text style={styles.readMore}>Read more →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading || weatherLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading latest updates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const featuredNews = schedules.slice(0, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>📰</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Local Updates</Text>
            <Text style={styles.headerSubtitle}>News, events and weather</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{schedules.length}</Text>
            <Text style={styles.statLabel}>Weather</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{weatherNews.length}</Text>
            <Text style={styles.statLabel}>News</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {moment().format('MMM D')}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
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
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Breaking News Section */}
        {featuredNews.length > 0 && (
          <View style={styles.breakingSection}>
            <View style={styles.breakingHeader}>
              <Text style={styles.breakingTitle}>News Updates</Text>
              <Text style={styles.breakingSubtitle}>Featured Story</Text>
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
        <View style={styles.latestSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌦️ Laters News</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={fetchWeatherNews}
            >
              <Text style={styles.viewAllText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>{error}</Text>
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
              <Text style={styles.emptyIcon}>🌦️</Text>
              <Text style={styles.emptyTitle}>No Weather Updates</Text>
              <Text style={styles.emptyText}>Check back later for weather news</Text>
            </View>
          )}
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  breakingSection: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  breakingHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  breakingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  breakingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  featuredCard: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  featuredOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 26,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featuredDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  featuredLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  latestSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  newsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImageContainer: {
    width: 100,
    height: 120,
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
    fontSize: 24,
  },
  newsContent: {
    flex: 1,
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsCategoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newsCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6',
  },
  newsTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  readMore: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default LguScreen;
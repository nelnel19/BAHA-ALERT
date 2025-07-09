import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator, 
  Animated,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
  InteractionManager
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import { API_BASE_URL } from '../config';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = 120;
const CARD_MARGIN = 16;
const CARD_WIDTH = screenWidth - (CARD_MARGIN * 2);

const ReportScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef({}).current;

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/flood-reports`);
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
        InteractionManager.runAfterInteractions(() => {
          data.reports.forEach((_, index) => {
            if (!cardAnimations[index]) {
              cardAnimations[index] = new Animated.Value(0);
            }
            Animated.timing(cardAnimations[index], {
              toValue: 1,
              duration: 300,
              delay: index * 50,
              useNativeDriver: true,
            }).start();
          });
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Connection Error', 'Unable to fetch reports. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const deleteReport = async (id) => {
    Alert.alert(
      'Delete Report',
      'This action cannot be undone. Are you sure you want to delete this report?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/flood-reports/${id}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              if (data.success) {
                fetchReports();
                Alert.alert('Success', 'Report deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete report. Please try again.');
            }
          } 
        },
      ]
    );
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const deleteSelectedReports = () => {
    Alert.alert(
      'Delete Multiple Reports',
      `Are you sure you want to delete ${selectedItems.size} report(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            const deletePromises = Array.from(selectedItems).map(id => 
              fetch(`${API_BASE_URL}/flood-reports/${id}`, { method: 'DELETE' })
            );
            
            try {
              await Promise.all(deletePromises);
              setSelectedItems(new Set());
              setIsSelectionMode(false);
              fetchReports();
              Alert.alert('Success', 'Selected reports deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Some reports could not be deleted');
            }
          }
        },
      ]
    );
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getDangerLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high':
        return { bg: '#FF3B30', shadow: '#FF3B3020' };
      case 'medium':
        return { bg: '#FF9500', shadow: '#FF950020' };
      case 'low':
        return { bg: '#34C759', shadow: '#34C75920' };
      default:
        return { bg: '#8E8E93', shadow: '#8E8E9320' };
    }
  };

  const getDangerLevelIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'error-outline';
      case 'low':
        return 'check-circle';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Format time (e.g., "2:30 PM")
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format date (e.g., "Jul 10, 2023")
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (diffInHours < 1) {
      return `Just now (${timeStr})`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago (${timeStr})`;
    } else if (diffInDays === 1) {
      return `Yesterday (${timeStr})`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago (${dateStr})`;
    } else {
      return dateStr;
    }
  };

  const renderItem = ({ item, index }) => {
    let imageUri = item.imageUrl;
    
    if (imageUri && !imageUri.startsWith('http')) {
      imageUri = imageUri.replace(/^\//, '');
      imageUri = `${API_BASE_URL}/${imageUri}`;
    }

    const dangerColors = getDangerLevelColor(item.dangerLevel);
    const isSelected = selectedItems.has(item._id);
    
    if (!cardAnimations[index]) {
      cardAnimations[index] = new Animated.Value(0);
    }

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: cardAnimations[index],
            transform: [
              {
                translateY: cardAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isSelected && styles.selectedCard,
            { shadowColor: dangerColors.shadow }
          ]}
          onLongPress={() => {
            setIsSelectionMode(true);
            toggleSelection(item._id);
          }}
          onPress={() => {
            if (isSelectionMode) {
              toggleSelection(item._id);
            }
          }}
          activeOpacity={0.95}
        >
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </View>
          )}

          <View style={[styles.priorityIndicator, { backgroundColor: dangerColors.bg }]} />

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
            </View>
          )}
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#007AFF" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
              <View style={[styles.dangerLevel, { backgroundColor: dangerColors.bg }]}>
                <MaterialIcons 
                  name={getDangerLevelIcon(item.dangerLevel)} 
                  size={12} 
                  color="white" 
                />
                <Text style={styles.dangerLevelText}>{item.dangerLevel}</Text>
              </View>
            </View>
            
            <Text style={styles.descriptionText} numberOfLines={3}>
              {item.description}
            </Text>
            
            <View style={styles.reporterContainer}>
              <View style={styles.reporterAvatar}>
                <Ionicons name="person" size={16} color="#007AFF" />
              </View>
              <View style={styles.reporterInfo}>
                <Text style={styles.reporterName}>{item.reporterName}</Text>
                <Text style={styles.reporterContact}>{item.contactNumber}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time" size={12} color="#8E8E93" />
                <Text style={styles.timeText}>{formatDate(item.reportedAt)}</Text>
              </View>
            </View>
          </View>
          
          {!isSelectionMode && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => deleteReport(item._id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <View style={styles.headerContent}>
        <Text style={styles.screenTitle}>Flood Reports</Text>
        <Text style={styles.screenSubtitle}>
          {reports.length} {reports.length === 1 ? 'report' : 'reports'} found
        </Text>
      </View>
      {isSelectionMode && (
        <View style={styles.selectionControls}>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => {
              setIsSelectionMode(false);
              setSelectedItems(new Set());
            }}
          >
            <Text style={styles.selectionButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.selectionButton, styles.deleteButton]}
            onPress={deleteSelectedReports}
            disabled={selectedItems.size === 0}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text style={styles.deleteButtonText}>
              Delete ({selectedItems.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading reports...</Text>
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {renderHeader()}
      
      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="water" size={64} color="#007AFF" />
          </View>
          <Text style={styles.emptyStateText}>No Reports Yet</Text>
          <Text style={styles.emptyStateSubtext}>
            When flood reports are submitted, they'll appear here
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.refreshButtonText}>Check for Updates</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <AnimatedFlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerContent: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  selectionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E5E7',
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  loadingIndicator: {
    flexDirection: 'row',
    marginTop: 12,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 8,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.15,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E9E9EB',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 6,
    flex: 1,
  },
  dangerLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  dangerLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3A3C',
    marginBottom: 16,
  },
  reporterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  reporterContact: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  actionButtons: {
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    backgroundColor: '#FAFAFA',
  },
  actionButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E9F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default ReportScreen;
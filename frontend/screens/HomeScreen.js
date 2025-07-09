import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoadingAlert, setIsLoadingAlert] = useState(true);
  const [alertError, setAlertError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUsername(parsed.name);
          setProfileImage(parsed.profileImage);
        }
      } catch (err) {
        console.log("Failed to load user:", err);
      }
    };

    getUser();
    fetchWeatherAlerts();

    return () => clearInterval(timer);
  }, []);

  const fetchWeatherAlerts = async () => {
    try {
      const apiKey = 'cc52e22304b978c2fb595a2b7e58cff6';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Manila,PH&lang=fil&units=metric&appid=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.weather && data.weather.length > 0) {
        const weatherCondition = data.weather[0].main;
        const description = data.weather[0].description;
        
        if (weatherCondition === 'Thunderstorm' || weatherCondition === 'Tropical Storm') {
          setAlertMessage(`Babala: May paparating na ${getTagalogTerm(weatherCondition)} sa ating bansa. ${getTagalogAdvice(weatherCondition)}`);
        } else {
          setAlertMessage("Walang aktibong bagyo sa bansa ngayon. Manatiling ligtas");
        }
      } else {
        setAlertMessage("Hindi makakuha ng impormasyon sa panahon. Subukan muli mamaya.");
      }
    } catch (err) {
      setAlertError("May problema sa pagkonekta. Subukan muli mamaya.");
      setAlertMessage("Hindi makakuha ng impormasyon sa panahon. Subukan muli mamaya.");
    } finally {
      setIsLoadingAlert(false);
    }
  };

  const getTagalogTerm = (weatherCondition) => {
    switch(weatherCondition) {
      case 'Thunderstorm': return 'kulog at kidlat';
      case 'Tropical Storm': return 'bagyo';
      case 'Heavy Rain': return 'malakas na ulan';
      default: return weatherCondition.toLowerCase();
    }
  };

  const getTagalogAdvice = (weatherCondition) => {
    switch(weatherCondition) {
      case 'Thunderstorm':
        return "Mangyaring manatili sa loob ng bahay at iwasan ang paggamit ng mga elektronikong aparato.";
      case 'Tropical Storm':
        return "Siguraduhing may sapat na emergency supplies at makinig sa mga opisyal na babala.";
      default:
        return "Manatiling updated sa latest weather bulletins.";
    }
  };

  const speakAlert = () => {
    if (alertMessage) {
      Speech.speak(alertMessage, {
        language: 'fil-PH',
        rate: 0.9,
        pitch: 1.0,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.replace("Login");
    } catch (err) {
      console.log("Logout failed:", err);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeString = () => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateString = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const openImageModal = () => {
    if (profileImage) {
      setIsImageModalVisible(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
  };

  if (isLoadingAlert) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4A90E2', '#7BB3F0']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (alertError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{alertError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherAlerts}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Profile Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <TouchableWithoutFeedback onPress={closeImageModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image 
                source={{ uri: profileImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeImageModal}
              >
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4A90E2', '#7BB3F0']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={openImageModal}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {username ? username.charAt(0).toUpperCase() : "G"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.usernameText}>{username || "Guest"}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => navigation.navigate("History")}
              style={styles.headerActionButton}
            >
              <Ionicons name="time" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Profile")}
              style={styles.headerActionButton}
            >
              <Ionicons name="settings" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{getTimeString()}</Text>
          <Text style={styles.dateText}>{getDateString()}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Weather Alert Card */}
        {alertMessage && (
          <View style={styles.alertCard}>
            <LinearGradient
              colors={alertMessage.includes('Babala') ? ['#FF6B6B', '#FF8E8E'] : ['#4ECDC4', '#6ED5CD']}
              style={styles.alertGradient}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertIconContainer}>
                  <Ionicons 
                    name={alertMessage.includes('Babala') ? "warning" : "shield-checkmark"} 
                    size={20} 
                    color="#ffffff" 
                  />
                </View>
                <Text style={styles.alertTitle}>Weather Alert</Text>
                <TouchableOpacity onPress={speakAlert} style={styles.speakButton}>
                  <Ionicons name="volume-high" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.alertText}>{alertMessage}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, styles.floodAction]}
            onPress={() => navigation.navigate("Flood")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="water" size={28} color="#ffffff" />
              </View>
              <Text style={styles.quickActionText}>Report Flood</Text>
              <Text style={styles.quickActionSubtext}>Emergency reporting</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, styles.weatherAction]}
            onPress={() => navigation.navigate("Weather")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90E2', '#7BB3F0']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="cloud" size={28} color="#ffffff" />
              </View>
              <Text style={styles.quickActionText}>Weather</Text>
              <Text style={styles.quickActionSubtext}>Current conditions</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, styles.lguAction]}
            onPress={() => navigation.navigate("Lgu")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9B59B6', '#B980D1']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="business" size={28} color="#ffffff" />
              </View>
              <Text style={styles.quickActionText}>LGU Updates</Text>
              <Text style={styles.quickActionSubtext}>Official announcements</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, styles.aiAction]}
            onPress={() => navigation.navigate("Ai")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2ECC71', '#58D68D']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-ellipses" size={28} color="#ffffff" />
              </View>
              <Text style={styles.quickActionText}>AI Assistant</Text>
              <Text style={styles.quickActionSubtext}>Get help & advice</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* More Options */}
        <Text style={styles.sectionTitle}>More Options</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => navigation.navigate("Game")}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#FFF3CD' }]}>
              <Ionicons name="game-controller" size={20} color="#F59E0B" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Mini Games</Text>
              <Text style={styles.optionSubtitle}>Educational weather games</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => navigation.navigate("History")}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="time" size={20} color="#6366F1" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Activity History</Text>
              <Text style={styles.optionSubtitle}>View your past reports & activities</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="settings" size={20} color="#3B82F6" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Settings & Profile</Text>
              <Text style={styles.optionSubtitle}>Manage your account preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyItem}>
            <Ionicons name="call" size={20} color="#FF6B6B" />
            <Text style={styles.emergencyText}>NDRRMC: 911</Text>
          </View>
          <View style={styles.emergencyItem}>
            <Ionicons name="call" size={20} color="#FF6B6B" />
            <Text style={styles.emergencyText}>Red Cross: 143</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "darkwhite",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInitial: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '400',
  },
  usernameText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timeSection: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '400',
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  alertCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  alertGradient: {
    padding: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(131, 38, 38, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  speakButton: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  alertText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    fontWeight: '400',
    opacity: 0.95,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  actionGradient: {
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionSubtext: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.9,
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 76,
  },
  emergencyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // New styles for image modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

export default HomeScreen;
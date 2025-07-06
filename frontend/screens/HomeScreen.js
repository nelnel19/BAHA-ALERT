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
  DrawerLayoutAndroid,
  Image
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoadingAlert, setIsLoadingAlert] = useState(true);
  const [alertError, setAlertError] = useState(null);
  const [activeDrawerItem, setActiveDrawerItem] = useState('Home');
  const drawerRef = React.useRef(null);

  useEffect(() => {
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
          setAlertMessage("Walang aktibong bagyo sa bansa ngayon. Manatiling handa!");
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
      drawerRef.current?.closeDrawer();
    } catch (err) {
      console.log("Logout failed:", err);
    }
  };

  const handleDrawerNavigation = (screenName, itemName) => {
    setActiveDrawerItem(itemName);
    navigation.navigate(screenName);
    drawerRef.current?.closeDrawer();
  };

  const drawerMenuItems = [
    {
      id: 'Home',
      title: 'Home',
      icon: 'home',
      screen: 'Home',
      color: '#3b82f6'
    },
    {
      id: 'Weather',
      title: 'Weather Updates',
      icon: 'cloud',
      screen: 'Weather',
      color: '#06b6d4'
    },
    {
      id: 'Lgu',
      title: 'LGU Updates',
      icon: 'business',
      screen: 'Lgu',
      color: '#8b5cf6'
    },
    {
      id: 'Ai',
      title: 'AI Assistant',
      icon: 'chatbubble-ellipses',
      screen: 'Ai',
      color: '#10b981'
    },
    {
      id: 'Game',
      title: 'Mini Game',
      icon: 'game-controller',
      screen: 'Game',
      color: '#f59e0b'
    },
    {
      id: 'Profile',
      title: 'Profile',
      icon: 'person',
      screen: 'Profile',
      color: '#ec4899'
    }
  ];

  const navigationView = () => (
    <View style={styles.drawerContainer}>
      {/* Drawer Header with Gradient Background */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerHeaderOverlay}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }}
                style={styles.drawerAvatarImage}
              />
            ) : (
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={28} color="#ffffff" />
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.drawerUsername}>{username || "Guest User"}</Text>
            <Text style={styles.drawerUserRole}>Weather Alert System</Text>
            <View style={styles.userStatusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation Menu */}
      <ScrollView style={styles.drawerMenuContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>NAVIGATION</Text>
          
          {drawerMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.drawerMenuItem,
                activeDrawerItem === item.id && styles.activeDrawerMenuItem
              ]}
              onPress={() => handleDrawerNavigation(item.screen, item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={activeDrawerItem === item.id ? '#ffffff' : item.color} 
                />
              </View>
              <Text style={[
                styles.drawerMenuText,
                activeDrawerItem === item.id && styles.activeDrawerMenuText
              ]}>
                {item.title}
              </Text>
              {activeDrawerItem === item.id && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>QUICK STATS</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="notifications" size={16} color="#f59e0b" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Active Alerts</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Reports Today</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Drawer Footer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => handleDrawerNavigation("Profile", "Settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color="#6b7280" />
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </View>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoadingAlert) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Kinukuha ang mga weather alerts...</Text>
      </View>
    );
  }

  if (alertError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{alertError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherAlerts}>
          <Text style={styles.retryButtonText}>Subukan Muli</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={320}
      drawerPosition="left"
      renderNavigationView={navigationView}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => drawerRef.current?.openDrawer()}
              style={styles.menuButton}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }}
                  style={styles.headerAvatarImage}
                />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {username ? username.charAt(0).toUpperCase() : "G"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{username || "Guest"}</Text>
              <Text style={styles.headerSubtitle}>Weather Alert System</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.navigate("Weather")}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContent}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🌦️</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Weather Updates</Text>
                  <Text style={styles.actionSubtitle}>Check current conditions</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: "#4f46e5" }]}
              onPress={() => navigation.navigate("Lgu")}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContent}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🏛️</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>LGU Updates</Text>
                  <Text style={styles.actionSubtitle}>Local government announcements</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: "#10b981" }]}
              onPress={() => navigation.navigate("Ai")}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContent}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🤖</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>AI Assistant</Text>
                  <Text style={styles.actionSubtitle}>Get help from our AI assistant</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: "#f59e0b" }]}
              onPress={() => navigation.navigate("Game")}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContent}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🎮</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Mini Game</Text>
                  <Text style={styles.actionSubtitle}>Take a break with a fun game</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Text style={styles.activityIcon}>🌤️</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Weather report generated</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Text style={styles.activityIcon}>🏛️</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>New LGU announcement posted</Text>
                  <Text style={styles.activityTime}>5 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Text style={styles.activityIcon}>✅</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Monthly report completed</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Refresh Button */}
          <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherAlerts}>
            <Ionicons name="refresh" size={20} color="#ff4d4d" />
            <Text style={styles.refreshButtonText}>I-refresh ang Alerto</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Floating Alert Button */}
        {alertMessage && (
          <TouchableOpacity 
            style={styles.floatingAlertButton}
            onPress={speakAlert}
            activeOpacity={0.8}
          >
            <Ionicons name="warning" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    color: "#ffffff",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#b30000',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  primaryActionButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  actionArrow: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#ff4d4d',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  floatingAlertButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  drawerHeader: {
    height: 200,
    backgroundColor: '#1e40af',
    position: 'relative',
    overflow: 'hidden',
  },
  drawerHeaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 24,
    paddingTop: StatusBar.currentHeight + 24,
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  drawerAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfoContainer: {
    flex: 1,
  },
  drawerUsername: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  drawerUserRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  drawerMenuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
    position: 'relative',
  },
  activeDrawerMenuItem: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerMenuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  activeDrawerMenuText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    position: 'absolute',
    right: 8,
  },
  statsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    flex: 1,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

export default HomeScreen;
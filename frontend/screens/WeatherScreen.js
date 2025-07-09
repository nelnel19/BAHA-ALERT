"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native"
import * as Location from "expo-location"
import axios from "axios"
import { useNavigation } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")
const API_KEY = "cc52e22304b978c2fb595a2b7e58cff6"

const PH_CITIES = [
  { name: "Angeles City", lat: 15.1455, lon: 120.5876 },
  { name: "Antipolo", lat: 14.5878, lon: 121.176 },
  { name: "Bacolod", lat: 10.6319, lon: 122.9951 },
  { name: "Bago City", lat: 10.5333, lon: 122.8333 },
  { name: "Baguio City", lat: 16.4023, lon: 120.596 },
  { name: "Bais City", lat: 9.5906, lon: 123.1219 },
  { name: "Balanga", lat: 14.6769, lon: 120.5363 },
  { name: "Bataan", lat: 14.6417, lon: 120.4736 },
  { name: "Batangas City", lat: 13.7565, lon: 121.0583 },
  { name: "Bayawan", lat: 9.3667, lon: 122.8 },
  { name: "Baybay", lat: 10.6792, lon: 124.8003 },
  { name: "Bayugan", lat: 8.7167, lon: 125.7333 },
  { name: "Bislig", lat: 8.2167, lon: 126.3167 },
  { name: "Bogo", lat: 11.05, lon: 124.0167 },
  { name: "Borongan", lat: 11.6333, lon: 125.4333 },
  { name: "Butuan", lat: 8.9472, lon: 125.5361 },
  { name: "Cabadbaran", lat: 9.1167, lon: 125.5333 },
  { name: "Cabanatuan", lat: 15.4858, lon: 120.9658 },
  { name: "Cabuyao", lat: 14.2781, lon: 121.1236 },
  { name: "Cadiz", lat: 10.95, lon: 123.3 },
  { name: "Cagayan de Oro", lat: 8.4542, lon: 124.6319 },
  { name: "Calamba", lat: 14.2117, lon: 121.1653 },
  { name: "Calapan", lat: 13.4119, lon: 121.1803 },
  { name: "Calbayog", lat: 12.0667, lon: 124.6 },
  { name: "Caloocan", lat: 14.6507, lon: 120.9672 },
  { name: "Candon", lat: 17.1889, lon: 120.4472 },
  { name: "Canlaon", lat: 10.3833, lon: 123.2 },
  { name: "Carcar", lat: 10.1, lon: 123.6333 },
  { name: "Catbalogan", lat: 11.775, lon: 124.8806 },
  { name: "Cauayan", lat: 16.9269, lon: 121.7706 },
  { name: "Cavite City", lat: 14.4791, lon: 120.8964 },
  { name: "Cebu City", lat: 10.3157, lon: 123.8854 },
  { name: "Cotabato City", lat: 7.2231, lon: 124.2453 },
  { name: "Dagupan", lat: 16.0433, lon: 120.3433 },
  { name: "Danao", lat: 10.5167, lon: 124.0167 },
  { name: "Dapitan", lat: 8.6581, lon: 123.4236 },
  { name: "Davao City", lat: 7.1907, lon: 125.4553 },
  { name: "Digos", lat: 6.75, lon: 125.3667 },
  { name: "Dipolog", lat: 8.5833, lon: 123.3417 },
  { name: "Dumaguete", lat: 9.3067, lon: 123.3067 },
  { name: "El Salvador", lat: 13.45, lon: 121.5167 },
  { name: "Escalante", lat: 10.8333, lon: 123.5 },
  { name: "Gapan", lat: 15.3081, lon: 120.9469 },
  { name: "General Santos", lat: 6.1164, lon: 125.1719 },
  { name: "Gingoog", lat: 8.8167, lon: 125.1 },
  { name: "Himamaylan", lat: 10.1, lon: 122.8667 },
  { name: "Ilagan", lat: 17.15, lon: 121.8833 },
  { name: "Iligan", lat: 8.2281, lon: 124.2456 },
  { name: "Iloilo City", lat: 10.7202, lon: 122.5621 },
  { name: "Iriga", lat: 13.4167, lon: 123.4167 },
  { name: "Isabela", lat: 6.7014, lon: 121.9742 },
  { name: "Kabankalan", lat: 9.9833, lon: 122.8167 },
  { name: "Kidapawan", lat: 7.0167, lon: 125.0833 },
  { name: "Koronadal", lat: 6.5, lon: 124.85 },
  { name: "La Carlota", lat: 10.4167, lon: 122.9167 },
  { name: "Lamitan", lat: 6.65, lon: 122.1333 },
  { name: "Laoag", lat: 18.1969, lon: 120.5936 },
  { name: "Lapu-Lapu", lat: 10.3103, lon: 123.9494 },
  { name: "Las Piñas", lat: 14.4378, lon: 120.9803 },
  { name: "Legazpi", lat: 13.1391, lon: 123.7436 },
  { name: "Ligao", lat: 13.2292, lon: 123.5331 },
  { name: "Lipa", lat: 13.9411, lon: 121.165 },
  { name: "Lucena", lat: 13.9372, lon: 121.6175 },
  { name: "Maasin", lat: 10.1333, lon: 124.85 },
  { name: "Mabalacat", lat: 15.2269, lon: 120.5706 },
  { name: "Makati", lat: 14.5547, lon: 121.0244 },
  { name: "Malabon", lat: 14.665, lon: 120.9569 },
  { name: "Malaybalay", lat: 8.1531, lon: 125.1261 },
  { name: "Malolos", lat: 14.8433, lon: 120.8114 },
  { name: "Mandaluyong", lat: 14.5794, lon: 121.0359 },
  { name: "Mandaue", lat: 10.3236, lon: 123.9222 },
  { name: "Manila", lat: 14.5995, lon: 120.9842 },
  { name: "Marawi", lat: 8.0, lon: 124.2833 },
  { name: "Marikina", lat: 14.6507, lon: 121.1029 },
  { name: "Masbate City", lat: 12.3667, lon: 123.6167 },
  { name: "Mati", lat: 6.95, lon: 126.2167 },
  { name: "Meycauayan", lat: 14.7347, lon: 120.9553 },
  { name: "Muñoz", lat: 15.7167, lon: 120.9 },
  { name: "Muntinlupa", lat: 14.3831, lon: 121.0394 },
  { name: "Naga (Camarines Sur)", lat: 13.6192, lon: 123.1814 },
  { name: "Naga (Cebu)", lat: 10.2083, lon: 123.7569 },
  { name: "Navotas", lat: 14.6564, lon: 120.9478 },
  { name: "Olongapo", lat: 14.8294, lon: 120.2828 },
  { name: "Ormoc", lat: 11.0058, lon: 124.6075 },
  { name: "Oroquieta", lat: 8.4833, lon: 123.8 },
  { name: "Ozamiz", lat: 8.15, lon: 123.8417 },
  { name: "Pagadian", lat: 7.8306, lon: 123.4353 },
  { name: "Palayan", lat: 15.5333, lon: 121.0833 },
  { name: "Panabo", lat: 7.3, lon: 125.6833 },
  { name: "Parañaque", lat: 14.4794, lon: 121.0197 },
  { name: "Pasay", lat: 14.5378, lon: 120.9947 },
  { name: "Pasig", lat: 14.5764, lon: 121.0851 },
  { name: "Passi", lat: 11.1083, lon: 122.6417 },
  { name: "Puerto Princesa", lat: 9.7392, lon: 118.7353 },
  { name: "Quezon City", lat: 14.676, lon: 121.0437 },
  { name: "Roxas", lat: 11.5833, lon: 122.75 },
  { name: "Sagay", lat: 10.95, lon: 123.4167 },
  { name: "San Carlos (Negros Occidental)", lat: 10.4833, lon: 123.4167 },
  { name: "San Carlos (Pangasinan)", lat: 15.9333, lon: 120.35 },
  { name: "San Fernando (La Union)", lat: 16.6158, lon: 120.3169 },
  { name: "San Fernando (Pampanga)", lat: 15.0333, lon: 120.6833 },
  { name: "San Jose", lat: 12.35, lon: 121.0667 },
  { name: "San Jose del Monte", lat: 14.8136, lon: 121.0453 },
  { name: "San Juan", lat: 14.6019, lon: 121.0355 },
  { name: "San Pablo", lat: 14.0683, lon: 121.3256 },
  { name: "San Pedro", lat: 14.3581, lon: 121.0506 },
  { name: "Santa Rosa", lat: 14.3119, lon: 121.1114 },
  { name: "Santiago", lat: 16.6875, lon: 121.5467 },
  { name: "Silay", lat: 10.7967, lon: 122.9706 },
  { name: "Sipalay", lat: 9.75, lon: 122.4 },
  { name: "Sorsogon City", lat: 12.9733, lon: 124.0069 },
  { name: "Surigao", lat: 9.7833, lon: 125.5 },
  { name: "Tabaco", lat: 13.3594, lon: 123.7331 },
  { name: "Tabuk", lat: 17.4189, lon: 121.4467 },
  { name: "Tacloban", lat: 11.2447, lon: 125.0047 },
  { name: "Tacurong", lat: 6.6833, lon: 124.6833 },
  { name: "Tagaytay", lat: 14.1053, lon: 120.9628 },
  { name: "Tagbilaran", lat: 9.6481, lon: 123.8531 },
  { name: "Taguig", lat: 14.5176, lon: 121.0509 },
  { name: "Tagum", lat: 7.4481, lon: 125.8072 },
  { name: "Talisay (Cebu)", lat: 10.245, lon: 123.8492 },
  { name: "Talisay (Negros Occidental)", lat: 10.7333, lon: 122.9667 },
  { name: "Tanauan", lat: 14.0864, lon: 121.1503 },
  { name: "Tandag", lat: 9.0667, lon: 126.2 },
  { name: "Tangub", lat: 8.0667, lon: 123.75 },
  { name: "Tanjay", lat: 9.5167, lon: 123.15 },
  { name: "Tarlac City", lat: 15.4781, lon: 120.5978 },
  { name: "Toledo", lat: 10.3792, lon: 123.6403 },
  { name: "Trece Martires", lat: 14.2825, lon: 120.8658 },
  { name: "Tuguegarao", lat: 17.6132, lon: 121.727 },
  { name: "Urdaneta", lat: 15.9761, lon: 120.5711 },
  { name: "Valencia", lat: 7.9067, lon: 125.0939 },
  { name: "Valenzuela", lat: 14.7, lon: 120.9833 },
  { name: "Victorias", lat: 10.9, lon: 123.0667 },
  { name: "Vigan", lat: 17.5747, lon: 120.3869 },
  { name: "Zamboanga City", lat: 6.9214, lon: 122.079 },
]

const WeatherIcon = ({ type, size = 24, color = "#666666" }) => {
  const getWeatherIcon = () => {
    switch (type) {
      case "clear":
      case "sunny":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.sunIcon, { width: size * 0.6, height: size * 0.6, borderColor: color }]} />
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.sunRay,
                  {
                    width: size * 0.15,
                    height: 2,
                    backgroundColor: color,
                    transform: [{ rotate: `${i * 45}deg` }],
                    top: size * 0.1,
                    left: size * 0.425,
                  },
                ]}
              />
            ))}
          </View>
        )
      case "cloudy":
      case "partly-cloudy":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.sunIcon, { width: size * 0.4, height: size * 0.4, borderColor: "#FFA500" }]} />
            <View
              style={[
                styles.cloudIcon,
                {
                  width: size * 0.6,
                  height: size * 0.35,
                  borderColor: color,
                  position: "absolute",
                  bottom: size * 0.1,
                  right: size * 0.1,
                },
              ]}
            />
          </View>
        )
      case "rain":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.cloudIcon, { width: size * 0.7, height: size * 0.4, borderColor: color }]} />
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.rainDrop,
                  {
                    width: 2,
                    height: size * 0.3,
                    backgroundColor: color,
                    left: size * 0.25 + i * size * 0.15,
                    top: size * 0.5,
                  },
                ]}
              />
            ))}
          </View>
        )
      case "location":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.locationPin, { width: size * 0.6, height: size * 0.8, borderColor: color }]} />
            <View
              style={[
                styles.locationDot,
                {
                  width: size * 0.2,
                  height: size * 0.2,
                  backgroundColor: color,
                  top: size * 0.15,
                  left: size * 0.4,
                },
              ]}
            />
          </View>
        )
      case "compass":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.compassCircle, { width: size * 0.8, height: size * 0.8, borderColor: color }]} />
            <View
              style={[
                styles.compassNeedle,
                {
                  width: 2,
                  height: size * 0.4,
                  backgroundColor: color,
                  top: size * 0.1,
                  left: size * 0.49,
                },
              ]}
            />
          </View>
        )
      case "loading":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.loadingSpinner, { width: size * 0.8, height: size * 0.8, borderColor: color }]} />
          </View>
        )
      case "refresh":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.refreshCircle, { width: size * 0.7, height: size * 0.7, borderColor: color }]} />
            <View
              style={[
                styles.refreshArrow,
                {
                  width: size * 0.15,
                  height: size * 0.15,
                  borderTopColor: color,
                  borderRightColor: color,
                  top: size * 0.2,
                  right: size * 0.15,
                },
              ]}
            />
          </View>
        )
      case "expand":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.expandArrow,
                {
                  width: size * 0.4,
                  height: 2,
                  backgroundColor: color,
                  top: size * 0.4,
                },
              ]}
            />
            <View
              style={[
                styles.expandArrow,
                {
                  width: 2,
                  height: size * 0.4,
                  backgroundColor: color,
                  left: size * 0.4,
                  top: size * 0.2,
                },
              ]}
            />
          </View>
        )
      case "collapse":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.expandArrow,
                {
                  width: size * 0.4,
                  height: 2,
                  backgroundColor: color,
                  top: size * 0.4,
                },
              ]}
            />
          </View>
        )
      case "search":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.searchCircle, { width: size * 0.6, height: size * 0.6, borderColor: color }]} />
            <View
              style={[
                styles.searchHandle,
                {
                  width: size * 0.25,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "45deg" }],
                  top: size * 0.65,
                  left: size * 0.65,
                },
              ]}
            />
          </View>
        )
      case "close":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.closeLine,
                {
                  width: size * 0.7,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "45deg" }],
                },
              ]}
            />
            <View
              style={[
                styles.closeLine,
                {
                  width: size * 0.7,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "-45deg" }],
                  position: "absolute",
                },
              ]}
            />
          </View>
        )
      case "map":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.mapIcon, { width: size * 0.8, height: size * 0.6, borderColor: color }]} />
            <View
              style={[
                styles.mapLine,
                {
                  width: size * 0.6,
                  height: 1,
                  backgroundColor: color,
                  top: size * 0.35,
                  left: size * 0.1,
                },
              ]}
            />
            <View
              style={[
                styles.mapLine,
                {
                  width: size * 0.6,
                  height: 1,
                  backgroundColor: color,
                  top: size * 0.5,
                  left: size * 0.1,
                },
              ]}
            />
          </View>
        )
      default:
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.sunIcon, { width: size * 0.6, height: size * 0.6, borderColor: color }]} />
          </View>
        )
    }
  }

  return <View style={{ width: size, height: size, position: "relative" }}>{getWeatherIcon()}</View>
}

const LoadingScreen = ({ progress }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start()

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const getLoadingStep = () => {
    if (progress >= 100) return "Preparing interface..."
    if (progress >= 75) return "Loading rain monitor data..."
    if (progress >= 50) return "Fetching current weather..."
    if (progress >= 25) return "Requesting location permission..."
    return "Initializing weather app..."
  }

  return (
    <View style={styles.loadingScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      <Animated.View
        style={[
          styles.loadingContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Weather Icons Circle */}
        <View style={styles.loadingIconsContainer}>
          <Animated.View
            style={[
              styles.rotatingIconsContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={[styles.iconPosition, { top: 0, left: "50%", marginLeft: -24 }]}>
              <WeatherIcon type="clear" size={48} color="#FCD34D" />
            </View>
            <View style={[styles.iconPosition, { top: "50%", right: 0, marginTop: -24 }]}>
              <WeatherIcon type="cloudy" size={48} color="#60A5FA" />
            </View>
            <View style={[styles.iconPosition, { bottom: 0, left: "50%", marginLeft: -24 }]}>
              <WeatherIcon type="rain" size={48} color="#6B7280" />
            </View>
            <View style={[styles.iconPosition, { top: "50%", left: 0, marginTop: -24 }]}>
              <WeatherIcon type="location" size={48} color="#EF4444" />
            </View>
          </Animated.View>

          {/* Center Loading Spinner */}
          <Animated.View
            style={[
              styles.centerSpinner,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <WeatherIcon type="loading" size={40} color="#FFFFFF" />
          </Animated.View>
        </View>

        {/* App Title */}
        <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
          <Text style={styles.appTitle}>Baha</Text>
          <Text style={styles.appTitleAccent}>Alert</Text>
        </Animated.View>

        <Text style={styles.loadingSubtitle}>Getting your weather data ready...</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>

        {/* Loading Steps */}
        <View style={styles.loadingStepsContainer}>
          <View style={styles.loadingStep}>
            <View
              style={[
                styles.stepIndicator,
                { backgroundColor: progress >= 25 ? "#10B981" : "#6B7280" },
              ]}
            />
            <Text
              style={[
                styles.stepText,
                { opacity: progress >= 25 ? 1 : 0.6 },
              ]}
            >
              Requesting location permission
            </Text>
          </View>

          <View style={styles.loadingStep}>
            <View
              style={[
                styles.stepIndicator,
                { backgroundColor: progress >= 50 ? "#10B981" : "#6B7280" },
              ]}
            />
            <Text
              style={[
                styles.stepText,
                { opacity: progress >= 50 ? 1 : 0.6 },
              ]}
            >
              Fetching current weather
            </Text>
          </View>

          <View style={styles.loadingStep}>
            <View
              style={[
                styles.stepIndicator,
                { backgroundColor: progress >= 75 ? "#10B981" : "#6B7280" },
              ]}
            />
            <Text
              style={[
                styles.stepText,
                { opacity: progress >= 75 ? 1 : 0.6 },
              ]}
            >
              Loading rain monitor data
            </Text>
          </View>

          <View style={styles.loadingStep}>
            <View
              style={[
                styles.stepIndicator,
                { backgroundColor: progress >= 100 ? "#10B981" : "#6B7280" },
              ]}
            />
            <Text
              style={[
                styles.stepText,
                { opacity: progress >= 100 ? 1 : 0.6 },
              ]}
            >
              Preparing interface
            </Text>
          </View>
        </View>

        {/* Current Step */}
        <Text style={styles.currentStepText}>{getLoadingStep()}</Text>
      </Animated.View>
    </View>
  )
}

const WeatherScreen = () => {
  const [location, setLocation] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [rainingCities, setRainingCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState(null)
  const [currentLocationCity, setCurrentLocationCity] = useState(null)
  const [rainListExpanded, setRainListExpanded] = useState(false)
  const navigation = useNavigation()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const loadingRotation = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const bounceAnim = useRef(new Animated.Value(30)).current

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
      )
      setWeatherData(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching weather:", error)
      return null
    }
  }

  const fetchCurrentLocationCity = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`,
      )
      if (response.data && response.data.length > 0) {
        const cityData = response.data[0]
        const currentCity = {
          name: cityData.name,
          lat: lat,
          lon: lon,
        }
        setCurrentLocationCity(currentCity)
        setSelectedCity(currentCity)
        return currentCity
      }
    } catch (error) {
      console.error("Error fetching current location city:", error)
      const fallbackCity = { name: "Current Location", lat: lat, lon: lon }
      setCurrentLocationCity(fallbackCity)
      setSelectedCity(fallbackCity)
      return fallbackCity
    }
  }

  const fetchRainInPH = async () => {
    const results = []
    for (const city of PH_CITIES) {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`,
        )
        const weather = res.data.weather[0].main.toLowerCase()
        if (weather.includes("rain") || res.data.rain) {
          results.push(city.name)
        }
      } catch (e) {
        console.log(`Failed to fetch ${city.name}`)
      }
    }
    setRainingCities(results)
  }

  const fetchWeatherForCity = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`,
      )
      setWeatherData(response.data)
      setSelectedCity(city)
      setShowLocationPicker(false)
    } catch (error) {
      console.error("Error fetching weather for city:", error)
    }
  }

  const refreshWeatherData = async () => {
    setRefreshing(true)
    try {
      if (selectedCity) {
        await fetchWeatherForCity(selectedCity)
      } else if (location) {
        await fetchWeather(location.latitude, location.longitude)
      }
      await fetchRainInPH()
      Alert.alert("Refreshed", "Weather data has been updated successfully!")
    } catch (error) {
      console.error("Error refreshing weather data:", error)
      Alert.alert("Error", "Failed to refresh weather data. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  const getFilteredCities = () => {
    if (!searchQuery) return PH_CITIES
    return PH_CITIES.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handleViewMap = () => {
    try {
      navigation.navigate("Map", {
        weatherData: weatherData,
        selectedCity: selectedCity,
        location: location,
      })
    } catch (error) {
      Alert.alert("Map View", "Map screen is not available yet. Would you like to view the location in your browser?", [
        {
          text: "Open in Browser",
          onPress: () => {
            const lat = weatherData?.coord?.lat || location?.latitude || 14.5995
            const lon = weatherData?.coord?.lon || location?.longitude || 120.9842
            const url = `https://www.google.com/maps/@${lat},${lon},12z`
            Alert.alert("Map Location", `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}\n\n${url}`)
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ])
    }
  }

  const getWeatherIconType = (weatherMain) => {
    const weather = weatherMain.toLowerCase()
    if (weather.includes("clear")) return "clear"
    if (weather.includes("cloud")) return "cloudy"
    if (weather.includes("rain")) return "rain"
    return "clear"
  }

  const getPredictionText = () => {
    if (!weatherData) return ""
    const weather = weatherData.weather[0].main.toLowerCase()
    if (weather.includes("rain") || weatherData.rain) {
      return "Slight rain chance in the next 6 hours"
    }
    if (weather.includes("cloud")) {
      return "Cloudy conditions expected to continue"
    }
    return "Clear weather conditions expected"
  }

  const getRainChance = () => {
    if (!weatherData) return "0"
    const weather = weatherData.weather[0].main.toLowerCase()
    if (weather.includes("rain") || weatherData.rain) {
      return "85"
    }
    if (weather.includes("cloud")) {
      return "25"
    }
    return "5"
  }

  const getWindDirection = () => {
    if (!weatherData || !weatherData.wind) return "N"
    const deg = weatherData.wind.deg || 0
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(deg / 45) % 8]
  }

  const getDisplayedRainCities = () => {
    if (rainListExpanded) {
      return rainingCities
    }
    return rainingCities.slice(0, 5)
  }

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.sequence([
      Animated.delay(200),
      Animated.spring(bounceAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start()
  }

  useEffect(() => {
    startLoadingAnimation()

    // Simulate loading progress with shorter delays
    const progressSteps = [
      { progress: 25, delay: 300 },
      { progress: 50, delay: 600 },
      { progress: 75, delay: 900 },
      { progress: 100, delay: 1200 },
    ]

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => {
        setLoadingProgress(progress)
      }, delay)
    })

    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access location was denied")
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      setLocation(loc.coords)

      await fetchCurrentLocationCity(loc.coords.latitude, loc.coords.longitude)
      await fetchWeather(loc.coords.latitude, loc.coords.longitude)
      await fetchRainInPH()

      // Wait for loading animation to complete
      setTimeout(() => {
        setLoading(false)
        startAnimations()
      }, 1500) // Reduced from 3000 to 1500
    })()
  }, [])

  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const refreshSpin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Show loading screen
  if (loading) {
    return <LoadingScreen progress={loadingProgress} />
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Action Buttons */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.locationButton} onPress={() => setShowLocationPicker(true)}>
              <WeatherIcon type="location" size={16} color="#2563EB" />
              <Text style={styles.locationButtonText}>
                {selectedCity ? selectedCity.name : currentLocationCity?.name || "Change Location"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
              <WeatherIcon type="map" size={16} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
              onPress={refreshWeatherData}
              disabled={refreshing}
            >
              <Animated.View style={refreshing ? { transform: [{ rotate: refreshSpin }] } : {}}>
                <WeatherIcon type="refresh" size={16} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.refreshButtonText}>{refreshing ? "Refreshing..." : "Refresh"}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {weatherData ? (
              <>
                {/* Main Weather Display */}
                <Animated.View style={[styles.mainWeatherCard, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.temperatureSection}>
                    {/* Large Temperature Circle */}
                    <View style={styles.temperatureCircle}>
                      <Text style={styles.highLowTemp}>
                        {Math.round(weatherData.main.temp_max)}° | {Math.round(weatherData.main.temp_min)}°
                      </Text>
                      <Text style={styles.mainTemperature}>{Math.round(weatherData.main.temp)}</Text>
                      <Text style={styles.temperatureUnit}>°C</Text>
                      <Text style={styles.feelsLike}>LIKE {Math.round(weatherData.main.feels_like)}°</Text>
                    </View>

                    {/* Weather Condition and Wind */}
                    <View style={styles.conditionSection}>
                      <View style={styles.weatherConditionContainer}>
                        <WeatherIcon type={getWeatherIconType(weatherData.weather[0].main)} size={60} color="#FFA500" />
                        <Text style={styles.weatherCondition}>
                          {weatherData.weather[0].description
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Text>
                      </View>

                      <View style={styles.windSection}>
                        <View style={styles.compassContainer}>
                          <WeatherIcon type="compass" size={50} color="#666666" />
                          <Text style={styles.windDirection}>{getWindDirection()}</Text>
                          <Text style={styles.windSpeed}>0</Text>
                        </View>
                        <Text style={styles.windLabel}>Gusts {weatherData.wind?.speed || 0} mph</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                {/* Additional Conditions */}
                <Animated.View style={[styles.conditionsCard, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.sectionTitle}>ADDITIONAL CONDITIONS</Text>
                  <View style={styles.conditionsGrid}>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Pressure</Text>
                      <Text style={styles.conditionValue}>{weatherData.main.pressure} in</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Visibility</Text>
                      <Text style={styles.conditionValue}>
                        {weatherData.visibility ? Math.round(weatherData.visibility / 1609) : 10} miles
                      </Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Clouds</Text>
                      <Text style={styles.conditionValue}>
                        {weatherData.weather[0].description
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Dew Point</Text>
                      <Text style={styles.conditionValue}>{Math.round(weatherData.main.temp - 5)} F</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Humidity</Text>
                      <Text style={styles.conditionValue}>{weatherData.main.humidity} %</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Rainfall</Text>
                      <Text style={styles.conditionValue}>{weatherData.rain?.["1h"] || 0} in</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>Snow Depth</Text>
                      <Text style={styles.conditionValue}>{weatherData.snow?.["1h"] || 0} in</Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Precipitation Forecast */}
                <Animated.View style={[styles.precipitationCard, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.sectionTitle}>PRECIPITATION</Text>
                  <Text style={styles.precipitationPercentage}>{getRainChance()}%</Text>
                  <Text style={styles.precipitationText}>{getPredictionText()}</Text>
                </Animated.View>

                {/* Rain Monitor */}
                <Animated.View style={[styles.rainCard, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.rainHeader}>
                    <Text style={styles.sectionTitle}>RAIN MONITOR - PHILIPPINES</Text>
                    {rainingCities.length > 5 && (
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => setRainListExpanded(!rainListExpanded)}
                      >
                        <WeatherIcon type={rainListExpanded ? "collapse" : "expand"} size={16} color="#666666" />
                        <Text style={styles.expandButtonText}>
                          {rainListExpanded ? "Show Less" : `Show All (${rainingCities.length})`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {rainingCities.length > 0 ? (
                    <View style={styles.rainContent}>
                      <View style={styles.rainSummaryContainer}>
                        <Text style={styles.rainCount}>{rainingCities.length}</Text>
                        <Text style={styles.rainSummaryText}>
                          {rainingCities.length === 1 ? "city experiencing" : "cities experiencing"} rain
                        </Text>
                      </View>

                      <View style={styles.rainList}>
                        {getDisplayedRainCities().map((city, idx) => (
                          <Animated.View
                            key={idx}
                            style={[
                              styles.rainItem,
                              {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }],
                              },
                            ]}
                          >
                            <View style={styles.rainItemLeft}>
                              <View style={styles.rainIndicator} />
                              <Text style={styles.rainCityName}>{city}</Text>
                            </View>
                            <WeatherIcon type="rain" size={16} color="#666666" />
                          </Animated.View>
                        ))}

                        {!rainListExpanded && rainingCities.length > 5 && (
                          <TouchableOpacity style={styles.showMoreButton} onPress={() => setRainListExpanded(true)}>
                            <Text style={styles.showMoreText}>+ {rainingCities.length - 5} more cities</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noRainContainer}>
                      <WeatherIcon type="clear" size={48} color="#666666" />
                      <Text style={styles.noRainTitle}>All Clear</Text>
                      <Text style={styles.noRainDescription}>
                        No rain reported across major Philippine cities at this time.
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </>
            ) : (
              <Text style={styles.errorText}>Unable to load weather data</Text>
            )}
          </ScrollView>
        </Animated.View>

        {/* Location Picker Modal */}
        <Modal visible={showLocationPicker} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select City</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowLocationPicker(false)}>
                  <WeatherIcon type="close" size={16} color="#666666" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <WeatherIcon type="search" size={16} color="#666666" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>

              {/* Current Location Option */}
              {currentLocationCity && (
                <View style={styles.currentLocationSection}>
                  <Text style={styles.currentLocationTitle}>Current Location</Text>
                  <TouchableOpacity
                    style={styles.currentLocationItem}
                    onPress={() => {
                      setSelectedCity(currentLocationCity)
                      fetchWeatherForCity(currentLocationCity)
                    }}
                  >
                    <WeatherIcon type="location" size={16} color="#2563EB" />
                    <View style={styles.currentLocationInfo}>
                      <Text style={styles.currentLocationName}>{currentLocationCity.name}</Text>
                      <Text style={styles.currentLocationCoords}>
                        {currentLocationCity.lat.toFixed(2)}, {currentLocationCity.lon.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <FlatList
                data={getFilteredCities()}
                keyExtractor={(item) => item.name}
                style={styles.cityList}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.cityItem} onPress={() => fetchWeatherForCity(item)}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityCoords}>
                      {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  
  // Loading Screen Styles
  loadingScreenContainer: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingIconsContainer: {
    width: 160,
    height: 160,
    marginBottom: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  rotatingIconsContainer: {
    width: 160,
    height: 160,
    position: "relative",
  },
  iconPosition: {
    position: "absolute",
  },
  centerSpinner: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "300",
    color: "#FFFFFF",
  },
  appTitleAccent: {
    fontSize: 36,
    fontWeight: "600",
    color: "#60A5FA",
    marginLeft: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 32,
    textAlign: "center",
  },
  progressContainer: {
    width: 280,
    alignItems: "center",
    marginBottom: 32,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#334155",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#60A5FA",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  loadingStepsContainer: {
    width: 280,
    marginBottom: 24,
  },
  loadingStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#E2E8F0",
    flex: 1,
  },
  currentStepText: {
    fontSize: 14,
    color: "#60A5FA",
    fontWeight: "500",
    textAlign: "center",
  },

  // Original styles continue here...
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  locationButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 6,
  },
  mapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  refreshButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  refreshButtonDisabled: {
    backgroundColor: "#6C757D",
  },
  locationButtonText: {
    color: "#495057",
    fontSize: 12,
    fontWeight: "600",
  },
  mapButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: "#E53E3E",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },
  mainWeatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    paddingVertical: 30,
    marginBottom: 20,
  },
  temperatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  temperatureCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: "#E53E3E",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  highLowTemp: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "400",
    position: "absolute",
    top: 25,
  },
  mainTemperature: {
    fontSize: 64,
    fontWeight: "300",
    color: "#E53E3E",
    lineHeight: 64,
  },
  temperatureUnit: {
    fontSize: 24,
    color: "#E53E3E",
    fontWeight: "300",
    position: "absolute",
    right: 35,
    top: 65,
  },
  feelsLike: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "400",
    position: "absolute",
    bottom: 25,
  },
  conditionSection: {
    flex: 1,
    paddingLeft: 30,
    justifyContent: "space-between",
    height: 180,
  },
  weatherConditionContainer: {
    alignItems: "center",
  },
  weatherCondition: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  windSection: {
    alignItems: "center",
  },
  compassContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  windDirection: {
    position: "absolute",
    fontSize: 12,
    color: "#666666",
    fontWeight: "600",
    top: 8,
  },
  windSpeed: {
    position: "absolute",
    fontSize: 18,
    color: "#666666",
    fontWeight: "600",
  },
  windLabel: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "400",
    marginTop: 8,
  },
  conditionsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  conditionsGrid: {
    gap: 12,
  },
  conditionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  conditionLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "400",
  },
  conditionValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  precipitationCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
    alignItems: "flex-end",
  },
  precipitationPercentage: {
    fontSize: 48,
    color: "#42A5F5",
    fontWeight: "300",
    marginVertical: 8,
  },
  precipitationText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "400",
    textAlign: "right",
  },
  rainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
  },
  rainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  expandButtonText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  rainContent: {
    marginTop: 16,
  },
  rainSummaryContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 16,
  },
  rainCount: {
    fontSize: 32,
    fontWeight: "300",
    color: "#0284C7",
    marginBottom: 4,
  },
  rainSummaryText: {
    fontSize: 14,
    color: "#0369A1",
    fontWeight: "500",
    textAlign: "center",
  },
  rainList: {
    gap: 8,
  },
  rainItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 6,
  },
  rainItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rainIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666666",
    marginRight: 12,
  },
  rainCityName: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "500",
  },
  showMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#E9ECEF",
    borderRadius: 6,
    marginTop: 8,
  },
  showMoreText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
  noRainContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noRainTitle: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  noRainDescription: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "400",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 40,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    paddingVertical: 8,
    fontWeight: "400",
  },
  currentLocationSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  currentLocationTitle: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  currentLocationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  currentLocationInfo: {
    flex: 1,
  },
  currentLocationName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  currentLocationCoords: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "400",
  },
  cityList: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  cityItem: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  cityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  cityCoords: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "400",
  },

  // Icon Styles
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  sunIcon: {
    borderRadius: 50,
    borderWidth: 2,
    position: "absolute",
  },
  sunRay: {
    position: "absolute",
    borderRadius: 1,
  },
  cloudIcon: {
    borderRadius: 20,
    borderWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  rainDrop: {
    position: "absolute",
    borderRadius: 1,
  },
  locationPin: {
    borderRadius: 50,
    borderWidth: 2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transform: [{ rotate: "45deg" }],
  },
  locationDot: {
    position: "absolute",
    borderRadius: 50,
  },
  compassCircle: {
    borderRadius: 50,
    borderWidth: 2,
  },
  compassNeedle: {
    position: "absolute",
    borderRadius: 1,
  },
  loadingSpinner: {
    borderRadius: 50,
    borderWidth: 3,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  refreshCircle: {
    borderRadius: 50,
    borderWidth: 2,
    borderTopColor: "transparent",
  },
  refreshArrow: {
    position: "absolute",
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    transform: [{ rotate: "45deg" }],
  },
  expandArrow: {
    position: "absolute",
    borderRadius: 1,
  },
  searchCircle: {
    borderRadius: 50,
    borderWidth: 2,
  },
  searchHandle: {
    position: "absolute",
    borderRadius: 1,
  },
  closeLine: {
    borderRadius: 1,
  },
  mapIcon: {
    borderRadius: 4,
    borderWidth: 2,
  },
  mapLine: {
    position: "absolute",
    borderRadius: 1,
  },
})

export default WeatherScreen
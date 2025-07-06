"use client"

import { useEffect, useState } from "react"
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native"
import * as Location from "expo-location"
import { WebView } from "react-native-webview"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

// Responsive sizing for Android
const isSmallScreen = height < 700
const isMediumScreen = height >= 700 && height < 900
const isLargeScreen = height >= 900

// Dynamic heights based on screen size
const getResponsiveHeight = () => {
  if (isSmallScreen) {
    return {
      statusBar: 24,
      selector: 70,
      padding: 8,
      optionButton: 60,
      fontSize: {
        small: 9,
        medium: 12,
        large: 16,
      },
    }
  } else if (isMediumScreen) {
    return {
      statusBar: 28,
      selector: 80,
      padding: 12,
      optionButton: 70,
      fontSize: {
        small: 10,
        medium: 14,
        large: 18,
      },
    }
  } else {
    return {
      statusBar: 32,
      selector: 90,
      padding: 16,
      optionButton: 80,
      fontSize: {
        small: 11,
        medium: 16,
        large: 20,
      },
    }
  }
}

const responsive = getResponsiveHeight()

const weatherOptions = [
  { label: "Rain", value: "rain", icon: "🌧️", color: "#64B5F6" },
  { label: "Wind", value: "wind", icon: "💨", color: "#81C784" },
  { label: "Clouds", value: "clouds", icon: "☁️", color: "#90A4AE" },
  { label: "Temperature", value: "temp", icon: "🌡️", color: "#FFB74D" },
  { label: "Waves", value: "waves", icon: "🌊", color: "#4FC3F7" },
  { label: "Pressure", value: "pressure", icon: "📊", color: "#A1C4FD" },
  { label: "Thunder", value: "thunder", icon: "⚡", color: "#9575CD" },
]

export default function MapScreen() {
  const [region, setRegion] = useState(null)
  const [overlay, setOverlay] = useState("rain")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          alert("Location permission denied.")
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        setRegion({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        })
      } catch (error) {
        console.error("Error getting location:", error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const selectedOption = weatherOptions.find((option) => option.value === overlay)

  if (isLoading || !region) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" translucent={false} />
        <LinearGradient colors={["#F8FAFF", "#E3F2FD", "#BBDEFB"]} style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
            <Text style={styles.loadingText}>Getting your location...</Text>
            <Text style={styles.loadingSubtext}>Preparing weather data</Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  const windyURL = `https://embed.windy.com/embed2.html?lat=${region.lat}&lon=${region.lon}&detailLat=${region.lat}&detailLon=${region.lon}&width=100%25&height=100%25&zoom=5&level=surface&overlay=${overlay}&menu=false&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" translucent={false} />

      {/* Weather Options Selector - Fixed Height */}
      <View style={styles.selectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {weatherOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                overlay === option.value && [styles.selectedOption, { backgroundColor: option.color }],
              ]}
              onPress={() => setOverlay(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text
                style={[styles.optionText, overlay === option.value && styles.selectedOptionText]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Container - Flexible Height */}
      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          <WebView
            source={{ uri: windyURL }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoader}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.webviewLoadingText}>Loading map...</Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
    padding: responsive.padding + 4,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    fontSize: responsive.fontSize.large,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: responsive.fontSize.medium,
    color: "#64B5F6",
    textAlign: "center",
  },
  selectorContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1F5FE",
    height: responsive.selector,
    paddingVertical: responsive.padding / 2,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: responsive.padding,
    alignItems: "center",
    minHeight: responsive.optionButton,
  },
  optionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isSmallScreen ? 8 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    minWidth: isSmallScreen ? 55 : 65,
    height: responsive.optionButton - 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    borderColor: "#2196F3",
    borderWidth: 2,
    transform: [{ scale: isSmallScreen ? 1.01 : 1.02 }],
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  optionIcon: {
    fontSize: isSmallScreen ? 14 : 16,
    marginBottom: 2,
  },
  optionText: {
    fontSize: responsive.fontSize.small,
    fontWeight: "500",
    color: "#616161",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    padding: responsive.padding,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E1F5FE",
    minHeight: 200, // Minimum height to prevent collapse
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 255, 0.95)",
  },
  webviewLoadingText: {
    marginTop: 12,
    fontSize: responsive.fontSize.medium,
    color: "#1565C0",
    fontWeight: "500",
  },
})

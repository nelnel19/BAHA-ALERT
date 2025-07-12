"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import axios from "axios"
import { API_BASE_URL } from "../config"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Animation values for flood waves
  const wave1 = useRef(new Animated.Value(0)).current
  const wave2 = useRef(new Animated.Value(0)).current
  const wave3 = useRef(new Animated.Value(0)).current
  const wave4 = useRef(new Animated.Value(0)).current
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const logoFloat = useRef(new Animated.Value(0)).current
  const logoGlow = useRef(new Animated.Value(0)).current
  const cardSlide = useRef(new Animated.Value(80)).current
  const floatingBubbles = useRef([...Array(12)].map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Logo entrance animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 60,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start()

    // Logo floating animation (water-like gentle movement)
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Logo glow animation (water reflection effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Floating bubbles animation
    floatingBubbles.forEach((bubble, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 600),
          Animated.timing(bubble, {
            toValue: 1,
            duration: 5000 + index * 800,
            useNativeDriver: true,
          }),
          Animated.timing(bubble, {
            toValue: 0,
            duration: 5000 + index * 800,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    })

    // Flood wave animations
    const createWaveAnimation = (animatedValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      )
    }

    // Start wave animations with different speeds
    createWaveAnimation(wave1, 4000).start()
    createWaveAnimation(wave2, 5200, 800).start()
    createWaveAnimation(wave3, 6400, 1600).start()
    createWaveAnimation(wave4, 4800, 2400).start()
  }, [])

  const login = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in all fields.")
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Alert.alert("Error", "Please enter a valid email address.")
    }

    setIsLoading(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password,
      })

      await AsyncStorage.setItem("user", JSON.stringify(res.data.user))
      Alert.alert("Success", `Welcome ${res.data.user.name}`)
      
      // Check user role and navigate accordingly
      if (res.data.user.role === 'admin') {
        navigation.replace("Dashboard") // Navigate to Reports screen for admin users
      } else {
        navigation.replace("Home") // Navigate to Home screen for regular users
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || "Something went wrong"
      Alert.alert("Login Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Wave transformations
  const wave1Transform = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 2.5],
  })

  const wave2Transform = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 1.2, -width * 1.2],
  })

  const wave3Transform = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.8, width * 1.8],
  })

  const wave4Transform = wave4.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.6, -width * 0.8],
  })

  // Logo animations
  const logoFloatY = logoFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })

  const logoGlowOpacity = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />

      <LinearGradient colors={["#FAFBFC", "#F1F5F9", "#E2E8F0"]} style={styles.background}>
        {/* Animated Flood Waves */}
        <View style={styles.waveContainer}>
          <Animated.View style={[styles.wave, styles.wave1, { transform: [{ translateX: wave1Transform }] }]} />
          <Animated.View style={[styles.wave, styles.wave2, { transform: [{ translateX: wave2Transform }] }]} />
          <Animated.View style={[styles.wave, styles.wave3, { transform: [{ translateX: wave3Transform }] }]} />
          <Animated.View style={[styles.wave, styles.wave4, { transform: [{ translateX: wave4Transform }] }]} />
        </View>

        {/* Enhanced Floating Bubbles */}
        {floatingBubbles.map((bubble, index) => {
          const translateY = bubble.interpolate({
            inputRange: [0, 1],
            outputRange: [height + 40, -40],
          })
          const translateX = bubble.interpolate({
            inputRange: [0, 1],
            outputRange: [Math.random() * width, Math.random() * width],
          })
          const opacity = bubble.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 0.6, 0.6, 0],
          })
          const scale = bubble.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 1.2, 0.3],
          })

          return (
            <Animated.View
              key={index}
              style={[
                styles.floatingBubble,
                {
                  transform: [{ translateX }, { translateY }, { scale }],
                  opacity,
                  width: 8 + (index % 4) * 6,
                  height: 8 + (index % 4) * 6,
                  backgroundColor:
                    index % 3 === 0
                      ? "rgba(59, 130, 246, 0.2)"
                      : index % 3 === 1
                        ? "rgba(14, 165, 233, 0.15)"
                        : "rgba(6, 182, 212, 0.1)",
                },
              ]}
            />
          )
        })}

        <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Main Card */}
            <Animated.View style={[styles.mainCard, { transform: [{ translateY: cardSlide }] }]}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Animated.View
                  style={[
                    styles.logoContainer,
                    {
                      transform: [{ scale: logoScale }, { translateY: logoFloatY }],
                      opacity: logoOpacity,
                    },
                  ]}
                >
                  {/* Logo Glow Effect */}
                  <Animated.View style={[styles.logoGlow, { opacity: logoGlowOpacity }]} />
                  <Image source={require("../assets/flood.png")} style={styles.logo} resizeMode="contain" />
                </Animated.View>
                <Text style={styles.logoText}>Welcome</Text>
                <Text style={styles.logoSubtext}>Sign in to your account</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={login}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.buttonGradient}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.linkContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Forgot Password", "Password reset functionality will be implemented soon.")
                    }}
                    style={styles.forgotButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.forgotText}>Forgot your password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                  style={styles.linkButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.linkText}>
                    Don't have an account? <Text style={styles.linkTextBold}>Create one</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  waveContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    height: height * 0.1,
    width: width * 3.5,
    borderRadius: width * 1.75,
  },
  wave1: {
    backgroundColor: "rgba(59, 130, 246, 0.06)",
    top: height * 0.05,
  },
  wave2: {
    backgroundColor: "rgba(14, 165, 233, 0.05)",
    top: height * 0.08,
  },
  wave3: {
    backgroundColor: "rgba(6, 182, 212, 0.04)",
    top: height * 0.11,
  },
  wave4: {
    backgroundColor: "rgba(59, 130, 246, 0.03)",
    top: height * 0.14,
  },
  floatingBubble: {
    position: "absolute",
    borderRadius: 50,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "center",
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  logoSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  logoContainer: {
    marginBottom: 32,
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 120,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  logo: {
    width: 200,
    height: 200,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "700" : "bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "400" : "normal",
    color: "#64748B",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  formSection: {
    padding: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "400" : "normal",
    color: "#1E293B",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButton: {
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonDisabled: {
    shadowOpacity: 0.05,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  linkContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  forgotButton: {
    paddingVertical: 12,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: "#3B82F6",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontWeight: Platform.OS === "ios" ? "400" : "normal",
    color: "#64748B",
    letterSpacing: 0.2,
  },
  linkTextBold: {
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: "#3B82F6",
  },
}
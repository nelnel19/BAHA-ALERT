"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  Appearance,
} from "react-native"
import axios from "axios"
import { API_BASE_URL } from "../config"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

const AiScreen = () => {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const typingAnim = useRef(new Animated.Value(0)).current
  const promptsAnim = useRef(new Animated.Value(0)).current

  // Sample recommendation prompts
  const promptRecommendations = [
    "What should I prepare for incoming typhoons?",
    "How to stay safe during floods?",
    "What are the signs of rising flood waters?",
    "Emergency supplies checklist for disasters",
    "How to create a family evacuation plan?",
  ]

  useEffect(() => {
    // Load dark mode preference from storage
    const loadDarkModePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('darkMode')
        if (savedMode !== null) {
          setDarkMode(savedMode === 'true')
        } else {
          // If no preference saved, use system preference
          const colorScheme = Appearance.getColorScheme()
          setDarkMode(colorScheme === 'dark')
        }
      } catch (error) {
        console.error('Failed to load dark mode preference', error)
      }
    }

    loadDarkModePreference()
    
    setResponse(
      "Hello anak! I'm Lola Remedios, your helpful AI assistant. How can I help you today? Remember, I'm especially knowledgeable about weather and flood safety tips. Just ask!",
    )

    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Animate prompts after a delay
    setTimeout(() => {
      Animated.timing(promptsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }, 400)
  }, [])

  // Save dark mode preference when it changes
  useEffect(() => {
    const saveDarkModePreference = async () => {
      try {
        await AsyncStorage.setItem('darkMode', darkMode.toString())
      } catch (error) {
        console.error('Failed to save dark mode preference', error)
      }
    }

    saveDarkModePreference()
  }, [darkMode])

  // Typing animation
  useEffect(() => {
    if (isLoading) {
      const typing = Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      )
      typing.start()
      return () => typing.stop()
    }
  }, [isLoading])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert("Empty Message", "Please enter a message before sending.")
      return
    }

    setIsLoading(true)
    setError("")

    // Reset and animate response
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start()

    const timeout = setTimeout(() => {
      if (isLoading) {
        setError("Lola is taking longer than usual to respond...")
        setIsLoading(false)
      }
    }, 10000) // 10 seconds timeout

    try {
      const res = await axios.post(`${API_BASE_URL}/ai/ai`, {
        message,
      })

      clearTimeout(timeout)
      setResponse(res.data.response)
      setMessage("")

      // Animate new response
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    } catch (err) {
      clearTimeout(timeout)
      if (err.response) {
        setError(`Ay naku! Error ${err.response.status}: ${err.response.data.error || 'Something went wrong'}`)
      } else if (err.request) {
        setError("Lola can't hear you right now. Please check your connection.")
      } else {
        setError("Something went wrong with the request setup.")
      }
      console.error("AI API Error:", err)

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptPress = (prompt) => {
    setMessage(prompt)

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const TypingIndicator = () => (
    <Animated.View style={[styles(darkMode).typingContainer, { opacity: typingAnim }]}>
      <View style={styles(darkMode).typingDots}>
        <Animated.View
          style={[
            styles(darkMode).typingDot,
            {
              transform: [
                {
                  scale: typingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles(darkMode).typingDot,
            {
              transform: [
                {
                  scale: typingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.2, 0.8],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles(darkMode).typingDot,
            {
              transform: [
                {
                  scale: typingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
      <Text style={styles(darkMode).typingText}>Lola is thinking...</Text>
    </Animated.View>
  )

  return (
    <KeyboardAvoidingView 
      style={styles(darkMode).container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header with dark mode toggle */}
      <Animated.View
        style={[
          styles(darkMode).header,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles(darkMode).headerContent}>
          <Animated.View
            style={[
              styles(darkMode).headerIcon,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles(darkMode).iconGradient}>
              <Text style={styles(darkMode).iconText}>LR</Text>
            </View>
            <View style={styles(darkMode).statusIndicator} />
          </Animated.View>
          <View style={styles(darkMode).headerTextContainer}>
            <Text style={styles(darkMode).headerTitle}>Lola Remedios</Text>
            <Text style={styles(darkMode).headerSubtitle}>Your caring AI grandmother</Text>
          </View>
          <TouchableOpacity 
            onPress={toggleDarkMode} 
            style={styles(darkMode).darkModeToggle}
          >
            <Text style={styles(darkMode).darkModeIcon}>
              {darkMode ? '🌞' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        style={styles(darkMode).responseContainer}
        contentContainerStyle={styles(darkMode).responseContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <TypingIndicator />}

        {error ? (
          <Animated.View style={[styles(darkMode).errorContainer, { opacity: fadeAnim }]}>
            <View style={styles(darkMode).errorIcon}>
              <Text style={styles(darkMode).errorIconText}>!</Text>
            </View>
            <Text style={styles(darkMode).errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {response && !isLoading ? (
          <Animated.View
            style={[
              styles(darkMode).responseBox,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles(darkMode).responseHeader}>
              <View style={styles(darkMode).aiIcon}>
                <Text style={styles(darkMode).aiIconText}>LR</Text>
              </View>
              <Text style={styles(darkMode).responseLabel}>Lola Remedios</Text>
              <View style={styles(darkMode).onlineStatus} />
            </View>
            <Text style={styles(darkMode).responseText}>{response}</Text>
          </Animated.View>
        ) : !isLoading && !error ? (
          <Animated.View
            style={[
              styles(darkMode).placeholderContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles(darkMode).placeholderIcon}>
              <View style={styles(darkMode).placeholderGradient}>
                <Text style={styles(darkMode).placeholderEmoji}>👵🏻</Text>
              </View>
            </View>
            <Text style={styles(darkMode).placeholderTitle}>Lola is ready to help</Text>
            <Text style={styles(darkMode).placeholderText}>
              Ask your caring AI grandmother about weather safety, flood preparation, and emergency tips
            </Text>
          </Animated.View>
        ) : null}

        {/* Prompt Recommendations */}
        {!isLoading && !message && (
          <Animated.View
            style={[
              styles(darkMode).promptsContainer,
              {
                opacity: promptsAnim,
                transform: [
                  {
                    translateY: promptsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles(darkMode).promptsTitle}>💡 Try asking Lola about:</Text>
            <View style={styles(darkMode).promptsList}>
              {promptRecommendations.map((prompt, index) => (
                <Animated.View
                  key={index}
                  style={{
                    transform: [{ scale: scaleAnim }],
                    opacity: promptsAnim,
                  }}
                >
                  <TouchableOpacity
                    style={styles(darkMode).promptButton}
                    onPress={() => handlePromptPress(prompt)}
                    activeOpacity={0.8}
                  >
                    <View style={styles(darkMode).promptGradient}>
                      <Text style={styles(darkMode).promptText}>{prompt}</Text>
                      <Text style={styles(darkMode).promptArrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Input Area */}
      <Animated.View
        style={[
          styles(darkMode).inputContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles(darkMode).inputWrapper}>
          <TextInput
            style={styles(darkMode).input}
            placeholder="Ask Lola Remedios anything..."
            placeholderTextColor={darkMode ? "#9CA3AF" : "#9E9E9E"}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles(darkMode).sendButton, (!message.trim() || isLoading) && styles(darkMode).sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || isLoading}
            activeOpacity={0.8}
          >
            <View style={styles(darkMode).sendGradient}>
              <Text style={styles(darkMode).sendIconText}>{isLoading ? "..." : "→"}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles(darkMode).inputFooter}>
          <Text style={styles(darkMode).characterCount}>{message.length}/500</Text>
          <Text style={styles(darkMode).poweredBy}>Powered by AI ✨</Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = (darkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? "#111827" : "#F8FAFC",
  },

  // Enhanced Header Styles
  header: {
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? "#374151" : "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: darkMode ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerIcon: {
    position: "relative",
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: darkMode ? "#7C3AED" : "#667EEA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: darkMode ? "#7C3AED" : "#667EEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: darkMode ? "#1F2937" : "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: darkMode ? "#F9FAFB" : "#1E293B",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: darkMode ? "#9CA3AF" : "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  darkModeToggle: {
    padding: 8,
    marginLeft: 12,
  },
  darkModeIcon: {
    fontSize: 24,
  },

  // Content Styles
  responseContainer: {
    flex: 1,
  },
  responseContent: {
    padding: 20,
    flexGrow: 1,
  },

  // Enhanced Typing Indicator
  typingContainer: {
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: darkMode ? 0.1 : 0.06,
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: darkMode ? "#8B5CF6" : "#667EEA",
    marginHorizontal: 3,
  },
  typingText: {
    fontSize: 14,
    color: darkMode ? "#D1D5DB" : "#64748B",
    fontWeight: "500",
  },

  // Enhanced Error Styles
  errorContainer: {
    backgroundColor: darkMode ? "#2B1E2F" : "#FEF2F2",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: darkMode ? "#F87171" : "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: darkMode ? "#F87171" : "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  errorIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: darkMode ? "#FCA5A5" : "#DC2626",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },

  // Enhanced Response Styles
  responseBox: {
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: darkMode ? 0.15 : 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: darkMode ? "#374151" : "#F1F5F9",
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: darkMode ? "#7C3AED" : "#667EEA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  aiIconText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: darkMode ? "#9CA3AF" : "#64748B",
    flex: 1,
  },
  onlineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  responseText: {
    fontSize: 16,
    lineHeight: 26,
    color: darkMode ? "#E5E7EB" : "#1E293B",
    fontWeight: "400",
  },

  // Enhanced Placeholder Styles
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  placeholderIcon: {
    marginBottom: 24,
  },
  placeholderGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: darkMode ? "#1F2937" : "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: darkMode ? "#374151" : "#E2E8F0",
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: darkMode ? "#F9FAFB" : "#1E293B",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: darkMode ? "#9CA3AF" : "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },

  // Enhanced Prompt Recommendations
  promptsContainer: {
    marginTop: 24,
  },
  promptsTitle: {
    fontSize: 16,
    color: darkMode ? "#D1D5DB" : "#475569",
    marginBottom: 16,
    fontWeight: "600",
  },
  promptsList: {
    flexDirection: "column",
  },
  promptButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  promptGradient: {
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: darkMode ? "#374151" : "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: darkMode ? 0.1 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  promptText: {
    color: darkMode ? "#E5E7EB" : "#475569",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  promptArrow: {
    color: darkMode ? "#8B5CF6" : "#667EEA",
    fontSize: 16,
    fontWeight: "600",
  },

  // Enhanced Input Styles
  inputContainer: {
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: darkMode ? "#374151" : "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: darkMode ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: darkMode ? "#111827" : "#F8FAFC",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: darkMode ? "#374151" : "#E2E8F0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: darkMode ? "#F9FAFB" : "#1E293B",
    maxHeight: 100,
    paddingVertical: 8,
    fontWeight: "400",
  },
  sendButton: {
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkMode ? "#7C3AED" : "#667EEA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: darkMode ? "#7C3AED" : "#667EEA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendIconText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: darkMode ? "#9CA3AF" : "#94A3B8",
    fontWeight: "400",
  },
  poweredBy: {
    fontSize: 12,
    color: darkMode ? "#9CA3AF" : "#94A3B8",
    fontWeight: "500",
  },
})

export default AiScreen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

export default function AlertScreen() {
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const fetchWeatherAlerts = async () => {
    try {
      // Replace with your actual OpenWeather API key and Philippines location ID
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
          setAlertMessage("Walang aktibong babala sa bagyo ngayon. Manatiling ligtas!");
        }
      } else {
        setAlertMessage("Hindi makakuha ng impormasyon sa panahon. Subukan muli mamaya.");
      }
    } catch (err) {
      setError("May problema sa pagkonekta. Subukan muli mamaya.");
      setAlertMessage("Hindi makakuha ng impormasyon sa panahon. Subukan muli mamaya.");
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Kinukuha ang mga weather alerts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherAlerts}>
          <Text style={styles.retryButtonText}>Subukan Muli</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.alertText}>
        ⚠️ {alertMessage}
      </Text>

      <TouchableOpacity style={styles.speakerButton} onPress={speakAlert}>
        <Ionicons name="volume-high" size={32} color="#fff" />
        <Text style={styles.speakerLabel}>Pakinggan ang Babala</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherAlerts}>
        <Ionicons name="refresh" size={24} color="#ff4d4d" />
        <Text style={styles.refreshButtonText}>I-refresh ang Alerto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffe9e9',
  },
  center: {
    alignItems: 'center',
  },
  alertText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#b30000',
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  speakerLabel: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
  },
  refreshButtonText: {
    color: '#ff4d4d',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
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
});
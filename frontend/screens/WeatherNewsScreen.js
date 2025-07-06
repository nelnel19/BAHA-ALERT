import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Linking } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../config";
import moment from "moment";

const WeatherNewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/news/weather`);
      setNews(response.data.articles);
    } catch (error) {
      console.error("Error fetching weather news:", error.message);
      setError("Failed to load Philippine weather news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => item.url ? Linking.openURL(item.url) : null}
    >
      {item.urlToImage && (
        <Image source={{ uri: item.urlToImage }} style={styles.image} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>
          {item.description || "No description available"}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.source}>{item.source?.name || "Unknown source"}</Text>
          <Text style={styles.date}>
            {item.publishedAt ? moment(item.publishedAt).fromNow() : ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Philippine weather news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={fetchNews} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Philippine Weather News</Text>
      <FlatList
        data={news}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderNewsItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No Philippine weather news available at the moment.</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchNews}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#1e88e5',
    color: 'white',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    padding: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  source: {
    fontSize: 12,
    color: "#888",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1e88e5",
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
  },
});

export default WeatherNewsScreen;
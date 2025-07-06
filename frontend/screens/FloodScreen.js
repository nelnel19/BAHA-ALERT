import React, { useState } from 'react';
import { View, Button, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../config'; // adjust path as needed

export default function FloodScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeFlood = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      const fileName = image.split('/').pop();
      const fileType = fileName.split('.').pop();

      formData.append('image', {
        uri: image,
        name: fileName,
        type: `image/${fileType}`,
      });

      const res = await axios.post(`${API_BASE_URL}/flood-analyze/flood-analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(res.data);
    } catch (err) {
      console.error('Error analyzing flood:', err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {image && <Button title="Analyze Flood" onPress={analyzeFlood} />}
      {loading && <ActivityIndicator size="large" />}
      {result && (
        <View style={styles.result}>
          <Text>Danger Level: {result.dangerLevel}</Text>
          <Text>Safe to Pass: {result.safeToPass ? "Yes" : "No"}</Text>
          <Text>Description: {result.description}</Text>
          <Image source={{ uri: result.imageUrl }} style={styles.image} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  image: { width: '100%', height: 200, marginVertical: 10 },
  result: { marginTop: 20, padding: 10, backgroundColor: "#eef" }
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const UpdateProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setName(parsedUser.name);
        setAge(String(parsedUser.age));
        setProfileImage(parsedUser.profileImage || null);
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleEdit = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    if (showPasswordFields) {
      if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        Alert.alert("Validation Error", "Please fill in all password fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Validation Error", "New passwords don't match");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);

    if (showPasswordFields) {
      formData.append("password", newPassword);
    }

    if (profileImage && !profileImage.startsWith("http")) {
      const uriParts = profileImage.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("profileImage", {
        uri: profileImage,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      const res = await axios.put(`${API_BASE_URL}/auth/edit/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      Alert.alert("Success", "Profile updated successfully");
      
      if (showPasswordFields) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordFields(false);
      }
      
      navigation.navigate("Profile");
    } catch (err) {
      console.error("Edit error:", err);
      Alert.alert("Error", err.response?.data?.msg || "Could not update profile. Please try again.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/auth/delete/${user.id}`);
              await AsyncStorage.removeItem("user");
              await AsyncStorage.removeItem("token");
              Alert.alert("Account Deleted", "Your account has been deleted successfully.");
              navigation.replace("Login");
            } catch (err) {
              console.error("Delete error:", err);
              Alert.alert("Error", "Could not delete user. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2E5A87']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
        <View style={styles.loadingContent}>
          <Icon name="cloud-rain" size={48} color="#fff" />
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Weather-themed Header */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Profile</Text>
          <View style={styles.headerRight}>
            <Icon name="cloud" size={24} color="#fff" opacity={0.7} />
          </View>
        </View>
        
        {/* Weather decorative elements */}
        <View style={styles.weatherDecorations}>
          <Animatable.View 
            animation="bounce" 
            iterationCount="infinite" 
            direction="alternate"
            duration={2000}
            style={[styles.cloudDecor, styles.cloud1]}
          >
            <Icon name="cloud" size={20} color="#fff" opacity={0.3} />
          </Animatable.View>
          <Animatable.View 
            animation="bounce" 
            iterationCount="infinite" 
            direction="alternate"
            duration={2500}
            style={[styles.cloudDecor, styles.cloud2]}
          >
            <Icon name="cloud" size={16} color="#fff" opacity={0.2} />
          </Animatable.View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Avatar Card */}
        <Animatable.View animation="zoomIn" duration={800} style={styles.avatarCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.avatarPlaceholder}
              >
                <Icon name="user" size={40} color="#fff" />
              </LinearGradient>
            )}
            <View style={styles.cameraIconContainer}>
              <LinearGradient
                colors={['#FF6B6B', '#FF5252']}
                style={styles.cameraIcon}
              >
                <Icon name="camera" size={16} color="#fff" />
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Tap to change photo</Text>
        </Animatable.View>

        {/* Profile Information Card */}
        <Animatable.View animation="slideInUp" duration={800} delay={200} style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="user" size={20} color="#4A90E2" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Icon name="user" size={18} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="calendar" size={18} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </Animatable.View>

        {/* Security Card */}
        <Animatable.View animation="slideInUp" duration={800} delay={400} style={styles.securityCard}>
          <View style={styles.cardHeader}>
            <Icon name="shield" size={20} color="#4A90E2" />
            <Text style={styles.cardTitle}>Security Settings</Text>
          </View>

          {!showPasswordFields ? (
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => setShowPasswordFields(true)}
              activeOpacity={0.8}
            >
              <Icon name="lock" size={18} color="#4A90E2" />
              <Text style={styles.changePasswordText}>Change Password</Text>
              <Icon name="chevron-right" size={18} color="#4A90E2" />
            </TouchableOpacity>
          ) : (
            <View style={styles.passwordFields}>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="key" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="check-circle" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={styles.cancelPasswordButton}
                onPress={() => {
                  setShowPasswordFields(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelPasswordText}>Cancel Password Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View animation="slideInUp" duration={800} delay={600} style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.saveButtonGradient}
            >
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Icon name="trash-2" size={18} color="#FF6B6B" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SF Pro Text',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'SF Pro Display',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloudDecor: {
    position: 'absolute',
  },
  cloud1: {
    top: 80,
    right: 60,
  },
  cloud2: {
    top: 120,
    left: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cameraIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'SF Pro Text',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  securityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
    fontFamily: 'SF Pro Display',
  },
  inputGroup: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'SF Pro Text',
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E1F2FF',
  },
  changePasswordText: {
    flex: 1,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 12,
    fontFamily: 'SF Pro Text',
  },
  passwordFields: {
    gap: 16,
  },
  cancelPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelPasswordText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontFamily: 'SF Pro Text',
  },
  actionButtons: {
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display',
  },
});

export default UpdateProfileScreen;
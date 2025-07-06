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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";

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
      
      // Clear password fields after successful update
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Text style={styles.title}>Update Profile</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.formContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={50} color="#fff" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Icon name="photo-camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="event" size={20} color="#4A90E2" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {!showPasswordFields ? (
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setShowPasswordFields(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
            <Icon name="lock" size={20} color="#4A90E2" style={styles.buttonIcon} />
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#999"
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
              <Text style={styles.cancelPasswordButtonText}>Cancel Password Change</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
          <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
          <Icon name="delete" size={20} color="#ff4444" style={styles.buttonIcon} />
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  header: {
    width: "100%",
    paddingVertical: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 30,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4A90E2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
    fontSize: 16,
  },
  changePasswordButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  changePasswordButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelPasswordButton: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  cancelPasswordButtonText: {
    color: "#ff4444",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default UpdateProfileScreen;
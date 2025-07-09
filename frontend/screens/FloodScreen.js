import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Design System Constants
const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',
  secondary: '#06B6D4',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(15, 23, 42, 0.1)',
};

const TYPOGRAPHY = {
  heading: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.text.primary,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: COLORS.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: COLORS.text.secondary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.tertiary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default function FloodScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setReporterName(user.fullname || user.name);
        setContactNumber(user.contactNumber || '');
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'We need access to your photo library to select flood images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeFlood = async () => {
    if (!image) return;

    setLoading(true);

    const fileName = image.split('/').pop();
    const fileType = fileName.split('.').pop();

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: fileName,
      type: `image/${fileType}`,
    });

    try {
      const res = await axios.post(`${API_BASE_URL}/flood-analyze/flood-analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Analysis Failed', 'Unable to analyze the flood image. Please try again.');
    }

    setLoading(false);
  };

  const submitFloodReport = async () => {
    if (!image || !result || !location.trim() || !description.trim() || !reporterName.trim() || !contactNumber.trim()) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before submitting your report.');
      return;
    }

    setReporting(true);

    const cleanedContactNumber = contactNumber.replace(/\D/g, '');

    const fileName = image.split('/').pop();
    const fileType = fileName.split('.').pop();

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: fileName,
      type: `image/${fileType}`,
    });

    formData.append('location', location);
    formData.append('description', description);
    formData.append('dangerLevel', result.dangerLevel || 'Moderate');
    formData.append('reporterName', reporterName);
    formData.append('contactNumber', cleanedContactNumber);

    try {
      await axios.post(`${API_BASE_URL}/flood-reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (!user.contactNumber) {
          user.contactNumber = cleanedContactNumber;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
      }

      Alert.alert('Report Submitted', 'Your flood report has been successfully submitted to authorities.');
      setImage(null);
      setResult(null);
      setLocation('');
      setDescription('');
    } catch (error) {
      console.error(error);
      Alert.alert('Submission Failed', 'Failed to submit your flood report. Please try again.');
    }

    setReporting(false);
  };

  const getDangerLevelConfig = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return { color: COLORS.success, icon: 'shield-check', bgColor: '#ECFDF5' };
      case 'moderate':
        return { color: COLORS.warning, icon: 'shield-alert', bgColor: '#FFFBEB' };
      case 'high':
        return { color: COLORS.error, icon: 'shield-x', bgColor: '#FEF2F2' };
      case 'extreme':
        return { color: '#7C3AED', icon: 'shield-off', bgColor: '#F3E8FF' };
      default:
        return { color: COLORS.primary, icon: 'shield', bgColor: '#EFF6FF' };
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#1E40AF', '#2563EB', '#3B82F6']}
      style={styles.header}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Ionicons name="water" size={24} color={COLORS.text.inverse} />
            </View>
            <Text style={styles.headerTitle}>Report a Flood Incident</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Take or Upload a Photo of a flood incident and report it quickly. Analyze it with the help of AI-powered analysis
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderImageSection = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Feather name="camera" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.sectionTitle}>Upload Flood Image</Text>
      </View>

      <TouchableOpacity
        style={styles.imageUploadContainer}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.uploadedImage} />
            <View style={styles.imageOverlay}>
              <Feather name="edit-2" size={20} color={COLORS.text.inverse} />
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View style={styles.uploadIconContainer}>
              <Feather name="upload" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadTitle}>Select Flood Image</Text>
            <Text style={styles.uploadSubtitle}>
              Tap to choose from your gallery
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {image && (
        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={16} color={COLORS.primary} />
          <Text style={styles.changeImageText}>Change Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAnalysisSection = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialIcons name="analytics" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.sectionTitle}>AI Analysis</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.analyzeButton,
          (!image || loading) && styles.analyzeButtonDisabled,
        ]}
        onPress={analyzeFlood}
        disabled={loading || !image}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            !image || loading
              ? ['#CBD5E1', '#94A3B8']
              : [COLORS.primary, COLORS.primaryLight]
          }
          style={styles.analyzeButtonGradient}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.text.inverse} />
              <Text style={styles.analyzeButtonText}>Analyzing Image...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Feather name="zap" size={18} color={COLORS.text.inverse} />
              <Text style={styles.analyzeButtonText}>Analyze Flood Level</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Feather name="activity" size={20} color={COLORS.primary} />
            <Text style={styles.resultTitle}>Analysis Results</Text>
          </View>

          <View style={styles.resultContent}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Danger Level</Text>
              <View style={styles.dangerLevelBadge}>
                <View
                  style={[
                    styles.dangerLevelBadgeContent,
                    { backgroundColor: getDangerLevelConfig(result.dangerLevel).bgColor },
                  ]}
                >
                  <Feather
                    name={getDangerLevelConfig(result.dangerLevel).icon}
                    size={16}
                    color={getDangerLevelConfig(result.dangerLevel).color}
                  />
                  <Text
                    style={[
                      styles.dangerLevelText,
                      { color: getDangerLevelConfig(result.dangerLevel).color },
                    ]}
                  >
                    {result.dangerLevel}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Safe to Pass</Text>
              <View style={styles.safetyBadge}>
                <View
                  style={[
                    styles.safetyBadgeContent,
                    {
                      backgroundColor: result.safeToPass
                        ? '#ECFDF5'
                        : '#FEF2F2',
                    },
                  ]}
                >
                  <Feather
                    name={result.safeToPass ? 'check-circle' : 'x-circle'}
                    size={16}
                    color={result.safeToPass ? COLORS.success : COLORS.error}
                  />
                  <Text
                    style={[
                      styles.safetyText,
                      {
                        color: result.safeToPass ? COLORS.success : COLORS.error,
                      },
                    ]}
                  >
                    {result.safeToPass ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.resultDescription}>
              <Text style={styles.resultLabel}>AI Assessment</Text>
              <Text style={styles.descriptionText}>{result.description}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderReportForm = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Feather name="file-text" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.sectionTitle}>Report Details</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Feather name="user" size={14} color={COLORS.text.secondary} /> Reporter Name
          </Text>
          <TextInput
            value={reporterName}
            onChangeText={setReporterName}
            placeholder="Enter your full name"
            style={styles.textInput}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Feather name="phone" size={14} color={COLORS.text.secondary} /> Contact Number
          </Text>
          <TextInput
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="e.g., 09123456789"
            keyboardType="phone-pad"
            style={styles.textInput}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Feather name="map-pin" size={14} color={COLORS.text.secondary} /> Location
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Barangay San Miguel, Manila"
            style={styles.textInput}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Feather name="message-square" size={14} color={COLORS.text.secondary} /> Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the flood situation in detail..."
            multiline
            numberOfLines={4}
            style={[styles.textInput, styles.textAreaInput]}
            placeholderTextColor={COLORS.text.tertiary}
            textAlignVertical="top"
          />
        </View>
      </View>
    </View>
  );

  const renderSubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, (!result || reporting) && styles.submitButtonDisabled]}
      onPress={submitFloodReport}
      disabled={reporting || !result}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          reporting || !result
            ? ['#CBD5E1', '#94A3B8']
            : [COLORS.primary, COLORS.primaryLight]
        }
        style={styles.submitButtonGradient}
      >
        {reporting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.text.inverse} />
            <Text style={styles.submitButtonText}>Submitting Report...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Feather name="send" size={18} color={COLORS.text.inverse} />
            <Text style={styles.submitButtonText}>Submit Flood Report</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      {renderHeader()}
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderImageSection()}
        {renderAnalysisSection()}
        {renderReportForm()}
        {renderSubmitButton()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text.inverse,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 56,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheading,
  },
  imageUploadContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  imagePreview: {
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    height: 200,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  uploadTitle: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  uploadSubtitle: {
    ...TYPOGRAPHY.caption,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.borderLight,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  changeImageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  analyzeButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  resultTitle: {
    ...TYPOGRAPHY.subheading,
    fontSize: 16,
  },
  resultContent: {
    gap: SPACING.md,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontWeight: '500',
  },
  dangerLevelBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dangerLevelBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  dangerLevelText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  safetyBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  safetyBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  safetyText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  resultDescription: {
    marginTop: SPACING.sm,
  },
  descriptionText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  formContainer: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  textAreaInput: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: SPACING.md,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
  },
});
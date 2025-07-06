import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios
      .get(`${API_BASE_URL}/schedules`)
      .then((res) => {
        setEvents(res.data);
        const marks = {};
        res.data.forEach((event) => {
          const localDate = new Date(event.date);
          const dateOnly = localDate.toLocaleDateString('en-CA');
          marks[dateOnly] = {
            marked: true,
            dotColor: '#4A90E2',
            selected: true,
            selectedColor: '#4A90E2',
          };
        });
        setMarkedDates(marks);
      })
      .catch((err) => console.error('Failed to fetch events:', err));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !category || !location) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date.toISOString());
      formData.append('category', category);
      formData.append('location', location);

      if (image) {
        formData.append('image', {
          uri: image,
          type: mime.getType(image),
          name: image.split('/').pop(),
        });
      }

      await axios.post(`${API_BASE_URL}/schedules`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Event created successfully!');
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create event.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/schedules/${id}`);
            Alert.alert('Success', 'Event deleted successfully');
            fetchEvents();
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete event');
          }
        },
      },
    ]);
  };

  const handleConfirmDate = (selectedDate) => {
    setPickerVisible(false);
    if (selectedDate) setDate(selectedDate);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation('');
    setDate(new Date());
    setImage(null);
    setModalVisible(false);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'pump_truck':
        return '🚛';
      case 'relief_goods':
        return '📦';
      case 'road_closure':
        return '🚧';
      default:
        return '📅';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'pump_truck':
        return '#4A90E2';
      case 'relief_goods':
        return '#7ED321';
      case 'road_closure':
        return '#F5A623';
      default:
        return '#9B9B9B';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Calendar</Text>
        <Text style={styles.headerSubtitle}>Manage your schedule</Text>
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar 
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#6B7280',
                selectedDayBackgroundColor: '#4A90E2',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#4A90E2',
                dayTextColor: '#374151',
                textDisabledColor: '#D1D5DB',
                dotColor: '#4A90E2',
                selectedDotColor: '#ffffff',
                arrowColor: '#4A90E2',
                monthTextColor: '#374151',
                indicatorColor: '#4A90E2',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
          </View>

          {/* Events Section */}
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No events scheduled</Text>
                <Text style={styles.emptyStateSubtext}>Create your first event to get started</Text>
              </View>
            ) : (
              events.map((event) => (
                <View key={event._id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(event.category) }]} />
                      <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event._id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {event.imageUrl && (
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ uri: event.imageUrl }} 
                        style={styles.eventImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Date:</Text>
                      <Text style={styles.eventDetailText}>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Location:</Text>
                      <Text style={styles.eventDetailText}>{event.location}</Text>
                    </View>
                    
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Category:</Text>
                      <Text style={[styles.eventDetailText, { color: getCategoryColor(event.category) }]}>
                        {event.category.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    
                    {event.description && (
                      <View style={styles.eventDescription}>
                        <Text style={styles.eventDescriptionText}>{event.description}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Create Event Button */}
      <TouchableOpacity 
        style={styles.createButton} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>+ Create New Event</Text>
      </TouchableOpacity>

      {/* Modal for creating event */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Event</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Event Title</Text>
                  <TextInput
                    placeholder="Enter event title"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    placeholder="Enter event description"
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.input, styles.textArea]}
                    multiline={true}
                    numberOfLines={3}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    placeholder="pump_truck | relief_goods | road_closure"
                    value={category}
                    onChangeText={setCategory}
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    placeholder="Enter event location"
                    value={location}
                    onChangeText={setLocation}
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Event Image (Optional)</Text>
                  <TouchableOpacity 
                    style={styles.imageUploadButton} 
                    onPress={pickImage}
                  >
                    {image ? (
                      <Image source={{ uri: image }} style={styles.imagePreview} />
                    ) : (
                      <Text style={styles.imageUploadText}>Select Image</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date & Time</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton} 
                    onPress={() => setPickerVisible(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isPickerVisible}
                    mode="datetime"
                    onConfirm={handleConfirmDate}
                    onCancel={() => setPickerVisible(false)}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateEvent}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Event</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for the create button
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventsSection: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 80,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  eventDescription: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  eventDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalForm: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  imageUploadButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  imageUploadText: {
    color: '#6B7280',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
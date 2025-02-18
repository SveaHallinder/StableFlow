import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { supabase } from '~/src/lib/supabase';
import { useAuth } from '~/src/providers/AuthProvider';
import { cld, uploadImage } from '~/src/lib/cloudinary';
import * as ImageManipulator from 'expo-image-manipulator';

export default function NewPost() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    setIsPosting(true);
    try {
      // Komprimera och ladda upp bild
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const uploadedImage = await uploadImage(manipResult.uri);
      const imageUrl = uploadedImage.secure_url;

      // Skapa post i databasen
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user?.id,
          image_url: imageUrl,
          caption,
        });

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView style={styles.scrollView}>
        {/* Image Picker */}
        <TouchableOpacity 
          onPress={pickImage}
          style={styles.imagePicker}
        >
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={32} color="#9CA3AF" />
              <Text style={styles.placeholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Skriv en bildtext..."
            multiline
            numberOfLines={4}
            maxLength={2200}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={isPosting}
          style={[styles.postButton, isPosting && styles.postButtonDisabled]}
        >
          <Text style={styles.postButtonText}>
            {isPosting ? 'Postar...' : 'Posta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  imagePicker: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 192,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    marginTop: 8,
  },
  captionContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 96,
  },
  captionInput: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#4B5563',
    fontWeight: '500',
  },
  postButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  postButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  postButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
});

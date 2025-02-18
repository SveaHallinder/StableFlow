import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
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
    <View className="flex-1 bg-white pt-5">

      <ScrollView className="flex-1">
        {/* Image Picker */}
        <TouchableOpacity 
          onPress={pickImage}
          className="mx-4 mt-6 h-48 bg-gray-50 rounded-xl items-center justify-center border-2 border-dashed border-gray-200"
        >
          {image ? (
            <Image 
              source={{ uri: image }} 
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Feather name="image" size={32} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Input */}
        <View className="mx-4 mt-6 mb-24">
          <TextInput
            className="bg-gray-50 p-4 rounded-xl text-base"
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
      <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 gap-4 flex-row space-x-3">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-gray-200"
        >
          <Text className="text-center text-gray-700 font-medium">Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={isPosting}
          className={`flex-1 py-3 rounded-lg ${isPosting ? 'bg-blue-300' : 'bg-blue-500'}`}
        >
          <Text className="text-center text-white font-medium">
            {isPosting ? 'Postar...' : 'Posta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

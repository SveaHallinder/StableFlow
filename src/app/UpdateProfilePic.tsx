import * as ImageManipulator from 'expo-image-manipulator';
import { cld, uploadImage } from '../lib/cloudinary';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { thumbnail } from '@cloudinary/url-gen/actions/resize';

export const updateAvatar = async (uri: string, userId: string, setAvatarUrl: (url: string) => void) => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    const uploadedImage = await uploadImage(manipulatedImage.uri);
    const avatarUrl = uploadedImage.secure_url;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) throw new Error('Failed to update profile avatar in database');

    setAvatarUrl(avatarUrl);
    Alert.alert('Avatar updated successfully!');
  } catch (err) {
    console.error('Error updating avatar:', err);
    Alert.alert('Error updating avatar');
  }
};

export const pickImage = async (userId: string, setAvatarUrl: (url: string) => void) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    await updateAvatar(result.assets[0].uri, userId, setAvatarUrl);
  }
};

export default {} // Lägg till en default export för att undvika varningen

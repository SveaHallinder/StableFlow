import { Text, View, Image, Alert, TouchableOpacity, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { supabase } from '~/src/lib/supabase';
import { useAuth } from '~/src/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { cld, uploadImage } from '~/src/lib/cloudinary';
import * as ImageManipulator from 'expo-image-manipulator';
import EditProfile from '~/src/app/EditProfile';
import { thumbnail } from '@cloudinary/url-gen/actions/resize';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [horse, setHorse] = useState('');
  const [ridingDays, setRidingDays] = useState('');
  const [initials, setInitials] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, []);

  const getProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error) {
      Alert.alert('Failed to fetch profile');
      return;
    }

    setUserId(data.id);
    setUsername(data.username);
    setHorse(data.horse || '');
    setRidingDays(data.ridingDays || '');
    setInitials(data.initials || '');
    setAvatarUrl(data.avatar_url);
  };

  
  const updateAvatar = async (uri: string) => {
    try {
  
      // Förminska bilden lokalt
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Ändra storlek (bredare bilder kan skalas ned)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Komprimera
      );
  
  
      // Ladda upp den komprimerade bilden till Cloudinary
      const uploadedImage = await uploadImage(manipulatedImage.uri);
      const avatarUrl = uploadedImage.secure_url;
  
      // Optimera bilden med Cloudinarys thumbnail-funktion
      let remoteCldImageUrl;
      if (avatarUrl) {
        const remoteCldImage = cld.image(avatarUrl);
        remoteCldImage.resize(thumbnail().width(300).height(300));
        remoteCldImageUrl = remoteCldImage.toURL();
      }
  
      // Uppdatera avatar-URL i Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: remoteCldImageUrl || avatarUrl })
        .eq('id', user?.id);
  
      if (error) {
        console.error('Supabase update error:', error);
        throw new Error('Failed to update profile avatar in database');
      }
      const handleSave = async () => {

        const updatedData = {
          id: userId,
          avatar_url: avatarUrl,
        };
    
        try {
          // Uppdatera profilen via Supabase
          const { error } = await supabase
            .from("profiles")
            .update(updatedData)
            .eq("id", userId);
    
          if (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Could not update profile");
            return;
          }
    
          getProfile();
        } catch (error) {
          console.error("Unexpected error:", error);
          Alert.alert("Error", "An unexpected error occurred");
        }
      };
  
      handleSave();
      // Uppdatera lokal state
      setAvatarUrl(remoteCldImageUrl || avatarUrl);
      setImage(null);
  
      Alert.alert('Avatar updated successfully!');
    } catch (err) {
      console.error('Error updating avatar:', err);
      Alert.alert('Error updating avatar');
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      updateAvatar(result.assets[0].uri);
    }
  };


  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-end px-4 pt-2">
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          className="p-2"
        >
          <Feather name="more-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="items-center">
        {/* Profile Image */}
        <View className="relative">
          {image || avatarUrl ? (
            <Image
              source={{ uri: (image || avatarUrl) ?? undefined }}
              className="w-32 h-32 rounded-full"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-gray-100" />
          )}
          <TouchableOpacity 
            onPress={pickImage}
            className="absolute bottom-1.5 right-1.5 bg-blue-500 w-9 h-9 rounded-full items-center justify-center border-[3px] border-white shadow-sm"
          >
            <Feather name="edit-2" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Username */}
        <Text className="text-2xl mt-4 mb-8">
          {username || 'Svea'}
        </Text>

        {/* Stats */}
        <View className="flex-row justify-around w-full px-8 mb-8">
          <View className="items-center">
            <Text className="text-lg">{initials || 'SH'}</Text>
            <Text className="text-sm text-gray-400 mt-1">Initialer</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg">{horse || 'Kanel'}</Text>
            <Text className="text-sm text-gray-400 mt-1">Häst</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg">{ridingDays || 'Mån, Fre, Lör'}</Text>
            <Text className="text-sm text-gray-400 mt-1">Riddag</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full px-6">
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 py-2.5 rounded-lg bg-blue-500">
              <Text className="text-center text-base font-medium text-white">Meddelande</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-2.5 rounded-lg border border-gray-200">
              <Text className="text-center text-base font-medium text-gray-700">Dela profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setIsEditing(false)} 
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={e => e.stopPropagation()} 
            className="bg-white rounded-t-3xl"
          >
            <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
            
            <View className="px-6 pb-10 space-y-4">
              <TouchableOpacity 
                onPress={() => {
                  setIsEditing(false);
                  router.push({
                    pathname: '/EditProfile',
                    params: {
                      username,
                      horse,
                      ridingDays,
                      initials,
                      userId
                    }
                  });
                }} 
                className="flex-row items-center py-3"
              >
                <Feather name="edit-2" size={22} color="#000" />
                <Text className="text-lg ml-4">Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center py-3">
                <Feather name="settings" size={22} color="#000" />
                <Text className="text-lg ml-4">Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => supabase.auth.signOut()}
                className="flex-row items-center py-3"
              >
                <Feather name="log-out" size={22} color="#FF3B30" />
                <Text className="text-lg ml-4 text-red-500">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

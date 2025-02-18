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
import { StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          style={styles.editButton}
        >
          <Feather name="more-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {image || avatarUrl ? (
            <Image
              source={{ uri: (image || avatarUrl) ?? undefined }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          <TouchableOpacity 
            onPress={pickImage}
            style={styles.editImageButton}
          >
            <Feather name="edit-2" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Username */}
        <Text style={styles.username}>
          {username || 'Svea'}
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {initials || 'SH'}
            </Text>
            <Text style={styles.statLabel}>Initialer</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {horse || 'Kanel'}
            </Text>
            <Text style={styles.statLabel}>Häst</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {ridingDays || 'Mån, Fre, Lör'}
            </Text>
            <Text style={styles.statLabel}>Riddag</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageButtonText}>Meddelande</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Dela profil</Text>
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
          style={styles.modalBackground}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={e => e.stopPropagation()} 
            style={styles.modalContainer}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalContent}>
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
                style={styles.modalOption}
              >
                <Feather name="edit-2" size={22} color="#000" />
                <Text style={styles.modalOptionText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOption}>
                <Feather name="settings" size={22} color="#000" />
                <Text style={styles.modalOptionText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => supabase.auth.signOut()}
                style={styles.modalOption}
              >
                <Feather name="log-out" size={22} color="#FF3B30" />
                <Text style={styles.modalOptionText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  editButton: {
    padding: 8,
  },
  content: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  imagePlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#E5E7EB',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  username: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  actionButtons: {
    width: '100%',
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  messageButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  messageButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
  shareButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareButtonText: {
    textAlign: 'center',
    color: '#4B5563',
    fontWeight: '500',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 18,
    marginLeft: 16,
  },
});

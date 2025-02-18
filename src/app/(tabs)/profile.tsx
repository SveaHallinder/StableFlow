import { useFocusEffect } from '@react-navigation/native';
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
import React from 'react';

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

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        getProfile();
      }
    }, [user])
  );
  

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
    paddingTop: 0,
    marginTop: 0,
  },
  editButton: {
    padding: 8,
  },
  content: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginTop: -10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 64,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
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
    fontSize: 18,
    fontWeight: 500,
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
    fontSize: 16,
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
    backgroundColor: '#000',
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

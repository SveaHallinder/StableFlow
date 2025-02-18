import React, { useState, useEffect } from "react";
import { Image } from 'react-native';
import { pickImage } from "./UpdateProfilePic";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EditProfile() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [username, setUsername] = useState(params.username as string);
  const [horse, setHorse] = useState(params.horse as string);
  const [ridingDays, setRidingDays] = useState(params.ridingDays as string);
  const [initials, setInitials] = useState(params.initials as string);
  const userId = params.userId as string;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();
      if (data) setAvatarUrl(data.avatar_url);
    };
    fetchProfile();
  }, []);  

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username, horse, ridingDays, initials })
        .eq("id", userId);
      if (error) throw error;
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not update profile");
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Redigera Profil</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
          <TouchableOpacity onPress={async () => await pickImage(userId, setAvatarUrl)} style={styles.changePicButton}>
            <Text style={styles.changePicText}>Ändra profilbild</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* Input fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Användarnamn</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Häst</Text>
            <TextInput style={styles.input} value={horse} onChangeText={setHorse} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Riddag</Text>
            <TextInput style={styles.input} value={ridingDays} onChangeText={setRidingDays} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Initialer</Text>
            <TextInput style={styles.input} value={initials} onChangeText={setInitials} />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Spara</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    backgroundColor: '#ffffff',
  },
  cancelText: {
    color: '#1f2937',
    fontWeight: '500',
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
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
  changePicButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePicText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    width: 350,
    alignSelf: 'center',
  },
  formContainer: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    bottom: 0,
    marginBottom: 50,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

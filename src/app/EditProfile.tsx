import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
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

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          horse,
          ridingDays,
          initials,
        })
        .eq("id", userId);

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile");
    }
  };

  return (
    <View className="flex-1 bg-white pt-20">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-medium">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-blue-500 font-medium">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="space-y-6 gap-4">
          <View>
            <Text className="text-sm text-gray-500 mb-2">Username</Text>
            <TextInput
              className="bg-gray-50 pt-2 pb-4 pl-4 pr-4 rounded-xl text-base"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
            />
          </View>

          <View>
            <Text className="text-sm text-gray-500 mb-2">Horse</Text>
            <TextInput
              className="bg-gray-50 pt-2 pb-4 pl-4 pr-4 rounded-xl text-base"
              value={horse}
              onChangeText={setHorse}
              placeholder="Enter your horse's name"
            />
          </View>

          <View>
            <Text className="text-sm text-gray-500 mb-2">Riding Days</Text>
            <TextInput
              className="bg-gray-50 pt-2 pb-4 pl-4 pr-4 rounded-xl text-base"
              value={ridingDays}
              onChangeText={setRidingDays}
              placeholder="Enter your riding days"
            />
          </View>

          <View>
            <Text className="text-sm text-gray-500 mb-2">Initials</Text>
            <TextInput
              className="bg-gray-50 pt-2 pb-4 pl-4 pr-4 rounded-xl text-base"
              value={initials}
              onChangeText={setInitials}
              placeholder="Enter your initials"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

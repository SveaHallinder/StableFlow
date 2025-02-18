import { View, Image, Text } from 'react-native';

export function PostHeader({ user }: { user: { avatar_url: string; username?: string } }) {
  return (
    <View className="p-2 mt-4 mx-4 flex-row items-center gap-2">
      <Image
        source={{ uri: user.avatar_url }}
        className="w-12 aspect-square rounded-full"
      />
      <Text className="font-medium">{user.username || 'New user'}</Text>
    </View>
  );
} 
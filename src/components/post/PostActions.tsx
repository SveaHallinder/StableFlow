import { View, TouchableOpacity, Text } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLikePress: () => void;
  onCommentPress: () => void;
}

export function PostActions({ isLiked, likeCount, commentCount, onLikePress, onCommentPress }: PostActionsProps) {
  return (
    <View className="flex-row items-center ml-3 p-4 gap-4">
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={onLikePress}>
          <AntDesign name={isLiked ? "heart" : "hearto"} size={24} color={isLiked ? "red" : "black"} />
        </TouchableOpacity>
        <Text>{likeCount}</Text>
      </View>
      
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={onCommentPress}>
          <Feather name="message-circle" size={24} />
        </TouchableOpacity>
        <Text>{commentCount}</Text>
      </View>
    </View>
  );
} 
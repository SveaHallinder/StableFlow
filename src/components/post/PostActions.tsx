import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={onLikePress} style={styles.button}>
          <AntDesign name={isLiked ? "heart" : "hearto"} size={24} color={isLiked ? "#FF3B30" : "#6B7280"} />
        </TouchableOpacity>
        <Text style={styles.count}>{likeCount}</Text>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={onCommentPress} style={styles.button}>
          <Feather name="message-circle" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.count}>{commentCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  button: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 16,
  },
}); 
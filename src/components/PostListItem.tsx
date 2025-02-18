import {
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import PostContent from './PostContent';
import CommentModal from './CommentModal';
import { useAuth } from '../providers/AuthProvider';
import { useLikes } from '../hooks/useLikes';
import { useComments } from '../hooks/useComments';
import { useDoubleTapAnimation } from '../hooks/useDoubleTapAnimation';
import { PostHeader } from './post/PostHeader';
import { PostCaption } from './post/PostCaption';
import { AnimatedHeart } from './post/AnimatedHeart';
import { PostActions } from './post/PostActions';

interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  likes: Like[];
  my_likes: Like[];
  user: {
    avatar_url: string;
    username: string;
  };
  caption: string;
  media_type: string;
  image: string;
  image_url: string;
}

export default function PostListItem({ post }: { post: Post & { likes: { created_at: string }[] } }): JSX.Element {
  const { user } = useAuth();
  const { isLiked, likeCount, handleLike } = useLikes(post, user?.id || '');
  const { commentCount, setCommentCount, isCommentModalVisible, toggleCommentModal } = useComments(post.id);
  const { handleDoubleTap, animatedHeartStyle } = useDoubleTapAnimation();

  return (
    <View className="bg-white rounded-lg my-2">
      <PostHeader user={post.user} />
      <PostCaption caption={post.caption} />
      
      <TouchableWithoutFeedback onPress={() => handleDoubleTap(handleLike)}>
        <View>
          <PostContent post={post} />
          <AnimatedHeart style={animatedHeartStyle} />
        </View>
      </TouchableWithoutFeedback>

      <PostActions
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={commentCount}
        onLikePress={handleLike}
        onCommentPress={toggleCommentModal}
      />
      
      <CommentModal
        postId={post.id}
        visible={isCommentModalVisible}
        onClose={toggleCommentModal}
        updateCommentCount={setCommentCount}
      />
    </View>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Like, Post } from '../lib/types';
import { sendLikeNotification } from '../app/utils/notifications';

export function useLikes(post: Post, userId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeRecord, setLikeRecord] = useState<Like | null>(null);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  useEffect(() => {
    if (post.my_likes && post.my_likes.length > 0) {
      setLikeRecord(post.my_likes[0]);
      setIsLiked(true);
    }
  }, [post.my_likes]);

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev: number) => Math.max(prev - 1, 0));
      await deleteLike();
    } else {
      setIsLiked(true);
      setLikeCount((prev: number) => prev + 1);
      await saveLike();
    }
    return isLiked;
  };

  const deleteLike = async () => {
    if (likeRecord) {
      await supabase.from('likes').delete().eq('id', likeRecord.id);
      setLikeRecord(null);
    }
  };

  const saveLike = async () => {
    const { data } = await supabase
      .from('likes')
      .insert({ post_id: post.id, user_id: userId })
      .select()
      .single();
    
    setLikeRecord(data);
    await sendLikeNotification({ id: post.id });
  };

  return { isLiked, likeCount, handleLike };
} 
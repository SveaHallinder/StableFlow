import { useState } from 'react';

export function useComments(postId: string) {
  const [commentCount, setCommentCount] = useState(0);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const toggleCommentModal = () => {
    setIsCommentModalVisible(!isCommentModalVisible);
  };

  return {
    commentCount,
    setCommentCount,
    isCommentModalVisible,
    toggleCommentModal
  };
} 
import { useState, useEffect, useRef } from 'react';
import * as ReactNative from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface Comment {
  id: number;
  content: string;
  user_id: string;
  post_id: number;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export default function CommentModal({ visible, onClose, postId, updateCommentCount }: { visible: boolean; onClose: () => void; postId: string; updateCommentCount: (updater: (prev: number) => number) => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const { user } = useAuth();
  const flatListRef = useRef<FlatList | null>(null);

  useEffect(() => {
    if (!postId) {
      console.log('No postId provided');
      return;
    }

    console.log("Fetching comments for postId:", postId);
    fetchComments();

    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload: { new: Comment }) => {
          console.log('Real-time payload:', payload.new);
          setComments((prev) => {
            if (!prev.some((c) => c.id === payload.new.id)) {
              return [...prev, payload.new as Comment];
            }
            return prev;
          });
        }
      )
      .subscribe();  

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [postId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
  
    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      const updatedComments = data.map((comment: Comment) => ({
        ...comment,
        user: comment.user ?? { username: 'Unknown User' }
      }));
      setComments(updatedComments);
    }
  };   
  
const handleSend = async () => {
  if (!newComment.trim()) return;

  if (editingComment) {
    // Uppdatera kommentaren
    const { error } = await supabase
      .from('comments')
      .update({ 
        content: newComment.trim(),
        post_id: Number(postId)  // Konvertera till nummer
      })
      .eq('id', Number(editingComment.id))  // Konvertera till nummer
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error updating comment:', error);
      return;
    }

    // Uppdatera UI direkt
    setComments(prev => prev.map(comment => 
      comment.id === editingComment.id 
        ? { ...comment, content: newComment.trim() }
        : comment
    ));
    
    setEditingComment(null);
    setNewComment('');
    setModalVisible(false);
  } else {
    // Insert new comment
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: user?.id, content: newComment }])
      .select('id, content, user_id, post_id');

    if (error) {
      console.error('Error sending comment:', error);
    } else {
      const newCommentWithUser = await fetchUserProfile(data[0]);
      setComments((prev) => [...prev, newCommentWithUser]);
      updateCommentCount((prev) => prev + 1);
    }
  }

  setNewComment('');
};

const fetchUserProfile = async (comment: Comment) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', comment.user_id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return {
      ...comment,
      user: { username: 'Unknown User' }
    };
  }

  return {
    ...comment,
    user: data, // Attach user profile to comment
  };
};

  const handleDelete = async (commentId: number) => {
    if (!commentId) {
      console.error('Comment ID is null or undefined.');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        return;
      }

      // Uppdatera comments och count först
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      updateCommentCount((prev: number) => Math.max(prev - 1, 0));
      
      // Stäng menymodalen först
      setModalVisible(false);
      setSelectedComment(null);
      
      // Vänta lite innan vi visar bekräftelsemodalen
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Visa bekräftelsemodalen
      setDeleteConfirmationVisible(true);
      
      // Stäng bekräftelsemodalen efter 2 sekunder
      setTimeout(() => {
        setDeleteConfirmationVisible(false);
      }, 2000);
    } catch (error) {
      console.error('Error in delete operation:', error);
    }
  };  
  

  const openMenu = (comments: Comment) => {
    setSelectedComment(comments);
    setModalVisible(true);
  };

  useEffect(() => {
    if (editingComment) {
      console.log('Current editing comment:', {
        id: editingComment.id,
        content: editingComment.content,
        post_id: editingComment.post_id,
        user_id: editingComment.user_id
      });
    }
  }, [editingComment]);

  return (
    <Modal
      isVisible={visible}
      swipeDirection="down"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      style={styles.modal}
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <View style={styles.handle} />
          <Text style={styles.headerText}>Comments</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={styles.avatarContainer}>
                {item.user?.avatar_url ? (
                  <Image
                    source={{ uri: item.user.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.placeholderAvatar} />
                )}
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentUser}>
                  {item.user?.username || 'Unknown User'}
                </Text>
                <Text style={styles.commentText}>{item.content}</Text>
              </View>
              {item.user_id === user?.id && (
                <TouchableOpacity onPress={() => openMenu(item)}>
                  <Feather name="more-horizontal" size={20} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          )}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputContainer} className="mb-10">
          <TextInput
            style={styles.input}
            placeholder={editingComment ? "Edit your comment..." : "Add a comment..."}
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              editingComment && styles.editButton
            ]} 
            onPress={handleSend}
          >
            <Feather 
              name={editingComment ? "check" : "send"} 
              color="white" 
              size={20} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal 
        isVisible={modalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={200}
        backdropOpacity={0.5}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View style={styles.editModalContent}>
          <View style={styles.modalHandle} />
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => {
              if (selectedComment) {
                setEditingComment(selectedComment);
                setNewComment(selectedComment.content);
                setModalVisible(false);
              }
            }}
          >
            <Feather name="edit-2" size={20} color="#007AFF" />
            <Text style={styles.modalButtonText}>Edit Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalButton, styles.deleteButton]}
            onPress={() => {
              if (selectedComment) handleDelete(selectedComment.id);
            }}
          >
            <Feather name="trash-2" size={20} color="#FF3B30" />
            <Text style={[styles.modalButtonText, styles.deleteText]}>Delete Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      
      <Modal 
        isVisible={deleteConfirmationVisible} 
        onBackdropPress={() => setDeleteConfirmationVisible(false)}
        animationIn="zoomInUp"
        animationOut="zoomOutDown"
        animationInTiming={400}
        animationOutTiming={300}
        backdropTransitionOutTiming={0}
        useNativeDriver={true}
        backdropOpacity={0.4}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={styles.confirmationModal}>
          <Feather name="check-circle" size={24} color="#4BB543" style={styles.confirmationIcon} />
          <Text style={styles.confirmationText}>Comment deleted successfully</Text>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '75%',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingTop: 15,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#DCDCDC',
    borderRadius: 2.5,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCDCDC',
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  commentText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#F5F5F5',
    paddingHorizontal: 20,
    height: 40,
    color: '#000',
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#007bff',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  modalButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FFF1F0',
  },
  deleteText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#fff',
    marginTop: 8,
    justifyContent: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmationModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 250,
  },
  confirmationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  confirmationIcon: {
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 10,
  },
});

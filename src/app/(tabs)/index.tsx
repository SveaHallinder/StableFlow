import { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import PostListItem from '~/src/components/PostListItem';
import { supabase } from '~/src/lib/supabase';
import { useAuth } from '~/src/providers/AuthProvider';

export default function FeedScreen() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        let { data, error } = await supabase
          .from('posts')
          .select('*, user:profiles(*), my_likes:likes(*), likes(count)')
          .eq('my_likes.user_id', user?.id)
          .order('created_at', { ascending: false });
    
        if (error) {
          Alert.alert('Something went wrong');
        }
        setPosts(data || []);
        setLoading(false);
      };

    return (
        <FlatList
            data={posts}
            renderItem={({ item }) => <PostListItem post={item} /> }
            contentContainerStyle={{ gap: 8 , backgroundColor: 'white' }}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchPosts}
            refreshing={loading}
        />
    );
}

function order(arg0: string, arg1: { ascending: boolean; }) {
    throw new Error('Function not implemented.');
}

import { View, Image, Text, StyleSheet } from 'react-native';

export function PostHeader({ user }: { user: { avatar_url: string; username?: string } }) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: user.avatar_url }}
        style={styles.avatar}
      />
      <Text style={styles.username}>
        {user.username || 'Ny användare'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 24,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 
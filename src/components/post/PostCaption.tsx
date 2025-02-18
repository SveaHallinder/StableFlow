import { Text, StyleSheet } from 'react-native';

export function PostCaption({ caption }: { caption: string }) {
  return <Text style={styles.caption}>{caption}</Text>;
}

const styles = StyleSheet.create({
  caption: {
    padding: 4,
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 12,
  },
}); 
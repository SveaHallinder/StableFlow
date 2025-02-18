import { Text } from 'react-native';

export function PostCaption({ caption }: { caption: string }) {
  return <Text className="px-4 py-2 m-2">{caption}</Text>;
} 
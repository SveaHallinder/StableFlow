import { View, ActivityIndicator } from 'react-native';
import { theme } from '../../styles/theme';

export function LoadingState() {
  return (
    <View className="flex items-center justify-center p-4">
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
} 
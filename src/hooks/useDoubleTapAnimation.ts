import { useRef } from 'react';
import { Animated } from 'react-native';

export function useDoubleTapAnimation() {
  const scale = useRef(new Animated.Value(0)).current;
  const animatedHeartStyle = { transform: [{ scale }] };

  const handleDoubleTap = async (onLike: () => Promise<boolean>) => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 0, useNativeDriver: true })
    ]).start();
    
    await onLike();
  };

  return { handleDoubleTap, animatedHeartStyle };
} 
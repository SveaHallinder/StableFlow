import { Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export function AnimatedHeart({ style }: { style: any }) {
  return (
    <Animated.View style={[{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -50 }, { translateY: -50 }]
    }, style]}>
      <AntDesign name="heart" size={80} color="white" />
    </Animated.View>
  );
} 
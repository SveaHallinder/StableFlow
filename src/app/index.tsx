import { Link, Redirect } from 'expo-router';
import { View, Text } from 'react-native';

export default function Home() {
    return (
        <View>
          <Redirect href="/(auth)" />
        </View>
    );
}
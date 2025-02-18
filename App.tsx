import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AuthProvider from './src/providers/AuthProvider';
import { Slot } from 'expo-router';  // Lägg till detta om du använder expo-router

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Slot />  {/* Detta gör att dina sidor kan visas */}
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

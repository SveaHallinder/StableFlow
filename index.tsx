import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  const ctx = (require as any).context('./src/app', true, /\.tsx?$/);
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
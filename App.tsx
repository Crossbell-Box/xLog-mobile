import { App } from './pages';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default () => {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

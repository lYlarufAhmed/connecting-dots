import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Game Hub',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="connect-four" 
          options={{ 
            title: 'Connect Four',
            headerShown: true 
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider as PaperProvider } from 'react-native-paper';


import store, { persistor } from './(redux)/store'; // Import the store and persistor

function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerShown: false, 
          }}
        >
          <Stack.Screen name="index" options={{ title: "Loading" }} />
          <Stack.Screen name="auth/login" options={{ title: "Login" }} />
          <Stack.Screen name="auth/register" options={{ title: "Register" }} />
        </Stack>
      </PaperProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayout />
      </PersistGate>
    </ReduxProvider>
  );
}

export default App;

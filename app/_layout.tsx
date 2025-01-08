import React from 'react';
import { View, Text } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { DarkTheme } from '@react-navigation/native';

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
    <RootLayout />
  );
}

export default App;

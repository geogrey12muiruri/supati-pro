import React from 'react';
import { View, Text } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import queryClient from "./(services)/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';

function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <RootLayout />
  );
}

export default App;

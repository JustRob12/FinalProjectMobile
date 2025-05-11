import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  const checkToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token check - Raw token value:', token);
      if (token !== userToken) {
        console.log('Token state changing from:', userToken ? 'has token' : 'no token', 'to:', token ? 'has token' : 'no token');
        setUserToken(token);
      }
    } catch (e) {
      console.error('Token check error:', e);
    }
  }, [userToken]);

  // Listen for token changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('AppState changed to:', nextAppState);
      if (nextAppState === 'active') {
        checkToken();
      }
    });

    // Set up an interval to check token every second for debugging
    const intervalId = setInterval(checkToken, 1000);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [checkToken]);

  // Initial token check
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await checkToken();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [checkToken]);

  // Debug token changes
  useEffect(() => {
    console.log('Token state updated:', userToken ? 'Has token' : 'No token');
  }, [userToken]);

  if (isLoading) {
    console.log('App is loading...');
    return null;
  }

  console.log('Rendering navigator with token state:', userToken ? 'Has token' : 'No token');

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {userToken ? (
          <Stack.Group>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ 
                gestureEnabled: false,
                animation: 'none'
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ animation: 'none' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ animation: 'none' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

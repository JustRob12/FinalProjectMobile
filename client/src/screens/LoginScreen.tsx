import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Input, Button, Text, Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import api from '../config/api';
import { AuthResponse } from '../types/auth';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '947230923909-XXXXX.apps.googleusercontent.com',  // Replace XXXXX with the actual client ID
    scopes: ['profile', 'email'],
    responseType: "id_token",
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          const user = result.user;
          // Send the user info to your backend
          try {
            const response = await api.post<AuthResponse>('/api/auth/google', {
              email: user.email,
              googleId: user.uid,
              name: user.displayName,
            });

            // Store token and user data
            await AsyncStorage.multiSet([
              ['userToken', response.data.token],
              ['userData', JSON.stringify(response.data.user)]
            ]);

            console.log('Google Sign-In successful');
          } catch (error: any) {
            console.error('Backend error:', error);
            Alert.alert('Error', 'Failed to authenticate with backend');
          }
        })
        .catch((error) => {
          console.error('Firebase error:', error);
          Alert.alert('Error', 'Failed to sign in with Google');
        });
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting login process...');
      
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });

      console.log('Login successful, response:', {
        token: response.data.token ? 'present' : 'missing',
        user: response.data.user
      });
      
      // Clear any existing tokens first
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      
      // Store new token and user data
      await AsyncStorage.multiSet([
        ['userToken', response.data.token],
        ['userData', JSON.stringify(response.data.user)]
      ]);
      
      // Verify storage
      const [storedToken, storedUser] = await AsyncStorage.multiGet(['userToken', 'userData']);
      console.log('Storage verification:', {
        token: storedToken[1] ? 'present' : 'missing',
        user: storedUser[1] ? 'present' : 'missing'
      });
      
      // Force a token check
      const finalToken = await AsyncStorage.getItem('userToken');
      console.log('Final token check:', finalToken ? 'present' : 'missing');
      
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || error.message || 'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text h3 style={styles.title}>Welcome Back</Text>
          
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={{ type: 'material', name: 'email' }}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={{ type: 'material', name: 'lock' }}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
          />

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <Divider style={styles.divider} />
          </View>

          <Button
            title="Sign in with Google"
            onPress={() => promptAsync()}
            loading={loading}
            icon={{
              name: 'google',
              type: 'font-awesome',
              color: 'white',
            }}
            containerStyle={styles.googleButtonContainer}
            buttonStyle={styles.googleButton}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#2089dc',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 25,
    height: 50,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#2089dc',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  googleButtonContainer: {
    marginTop: 10,
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    borderRadius: 25,
    height: 50,
  },
});

export default LoginScreen; 
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../config/api';
import { AuthResponse } from '../types/auth';

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
});

export default LoginScreen; 
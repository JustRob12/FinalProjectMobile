import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      // Clear all auth data
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      console.log('Auth data cleared successfully');
      // No need to navigate - the app will automatically show login screen
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h3 style={styles.welcomeText}>
          Welcome, {userData?.username || 'User'}!
        </Text>
        <Text style={styles.emailText}>{userData?.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>
          You are now logged in to your account.
        </Text>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={styles.logoutButton}
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeText: {
    color: '#2089dc',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 25,
    height: 50,
  },
});

export default DashboardScreen; 
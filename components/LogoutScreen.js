// /components/LogoutScreen.js
import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while logging out.');
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Are you sure you want to log out?</Text>
      <Button title="Logout" onPress={handleLogout} color="#007BFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  message: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LogoutScreen;

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    // Add your logout logic here (e.g., clearing tokens, redirecting)
    navigation.navigate('HomeTabs'); // Navigate back to HomeTabs after logout
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You have been logged out.</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate('HomeTabs')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default LogoutScreen;

// /screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OrdersScreen from './OrdersScreen';
import CategoryScreen from './CategoryScreen';
import { auth } from '../firebase/firebaseConfig';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const handleLogout = () => {
    auth.signOut().then(() => navigation.navigate('Login'));
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee', borderTopWidth: 1 },
      }}
    >
   
      <Tab.Screen name="Categories" component={CategoryScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen
        name="Logout"
        component={() => (
          <View style={styles.logoutContainer}>
            <Button title="Logout" onPress={handleLogout} color="#FF6347" />
          </View>
        )}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;

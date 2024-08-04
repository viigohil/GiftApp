import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import OrdersScreen from './OrdersScreen';
import CategoryScreen from './CategoryScreen';
import LogoutScreen from '../components/LogoutScreen'; // Ensure the path is correct

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeTabs = () => (
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
  </Tab.Navigator>
);

const HomeScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false, // Hide headers for all screens in this stack
    }}
  >
    <Stack.Screen name="HomeTabs" component={HomeTabs} />
    <Stack.Screen name="Logout" component={LogoutScreen} />
  </Stack.Navigator>
);

export default HomeScreen;

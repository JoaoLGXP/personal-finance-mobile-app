// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import { FinancialProvider } from './src/context/FinancialContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <FinancialProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#3B82F6" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Gastos') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
              } else if (route.name === 'Sugestões') {
                iconName = focused ? 'bulb' : 'bulb-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#3B82F6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Painel Financeiro' }}
          />
          <Tab.Screen 
            name="Gastos" 
            component={ExpensesScreen}
            options={{ title: 'Meus Gastos' }}
          />
          <Tab.Screen 
            name="Sugestões" 
            component={SuggestionsScreen}
            options={{ title: 'Dicas Financeiras' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </FinancialProvider>
  );
}
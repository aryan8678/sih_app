import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';
import LiveDetectionScreen from './screens/LiveDetectionScreen'; // Import the new screen

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'AI Animal Classifier 🐄' }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: 'Classification Result' }}
        />
        <Stack.Screen
          name="LiveDetection"
          component={LiveDetectionScreen}
          options={{ title: 'Live Detection' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
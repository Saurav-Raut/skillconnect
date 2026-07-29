import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { BiometricScanScreen } from '../screens/BiometricScanScreen';
import { LiveTrackingScreen } from '../screens/LiveTrackingScreen';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="BiometricScan" component={BiometricScanScreen} />
      <Stack.Screen name="Tracking" component={LiveTrackingScreen} />
    </Stack.Navigator>
  );
};

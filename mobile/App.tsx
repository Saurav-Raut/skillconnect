import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Fraunces_700Bold, Fraunces_800ExtraBold } from '@expo-google-fonts/fraunces';
import {
  PublicSans_400Regular,
  PublicSans_600SemiBold,
  PublicSans_700Bold
} from '@expo-google-fonts/public-sans';
import { fetchMe } from '@skillconnect/shared';
import { store, AppDispatch, RootState } from './src/redux/store';
import { initializeSecureStorage } from './src/api/setupStorage';
import { AuthStack } from './src/navigation/AuthStack';
import { MainStack } from './src/navigation/MainStack';
import { OfflineBanner } from './src/components/OfflineBanner';
import { registerForPushNotificationsAsync } from './src/api/notifications';
import { Colors } from './src/theme/colors';

const RootNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, userInfo } = useSelector((state: RootState) => state.user);
  const [initializing, setInitializing] = useState(true);

  const [fontsLoaded] = useFonts({
    Fraunces: Fraunces_700Bold,
    FrauncesBold: Fraunces_800ExtraBold,
    PublicSans: PublicSans_400Regular,
    PublicSansSemiBold: PublicSans_600SemiBold,
    PublicSansBold: PublicSans_700Bold,
  });

  useEffect(() => {
    const setup = async () => {
      const storedToken = await initializeSecureStorage();
      if (storedToken) {
        dispatch(fetchMe());
      }
      await registerForPushNotificationsAsync();
      setInitializing(false);
    };
    setup();
  }, [dispatch]);

  if (initializing || !fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isAuthenticated = Boolean(token || userInfo);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgMain} />
      <OfflineBanner />
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

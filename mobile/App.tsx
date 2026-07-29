import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store, AppDispatch, RootState } from './src/redux/store';
import { initializeSecureStorage } from './src/api/setupStorage';
import { AuthStack } from './src/navigation/AuthStack';
import { MainStack } from './src/navigation/MainStack';
import { Colors } from './src/theme/colors';

const RootNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, userInfo } = useSelector((state: RootState) => state.user);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const setup = async () => {
      await initializeSecureStorage();
      setInitializing(false);
    };
    setup();
  }, [dispatch]);

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isAuthenticated = Boolean(token || userInfo);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
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

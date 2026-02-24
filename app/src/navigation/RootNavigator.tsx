import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useAuth} from '../context/auth';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import Spinner from '../components/ui/Spinner';
import {colors} from '../lib/theme';

const navTheme = {
  dark: true,
  colors: {
    primary: colors.accentMint,
    background: colors.bgPrimary,
    card: colors.bgElevated,
    text: colors.textPrimary,
    border: colors.borderSubtle,
    notification: colors.accentMint,
  },
  fonts: {
    regular: {fontFamily: 'System', fontWeight: '400' as const},
    medium: {fontFamily: 'System', fontWeight: '500' as const},
    bold: {fontFamily: 'System', fontWeight: '700' as const},
    heavy: {fontFamily: 'System', fontWeight: '900' as const},
  },
};

export default function RootNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return <Spinner fullScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

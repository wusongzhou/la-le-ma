import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import SarasaFont from '../assets/fonts/sarasa.ttf';
import { setupSmartReminders, requestNotificationPermissions } from '@/services/notification';
import { getReminderSettings } from '@/services/reminderSettings';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// 初始化通知设置
async function initializeNotifications() {
  try {
    const settings = await getReminderSettings();
    if (settings.enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await setupSmartReminders();
        console.log('智能提醒已初始化');
      }
    }
  } catch (error) {
    console.error('初始化通知失败:', error);
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sarasa: SarasaFont,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // 初始化通知
      initializeNotifications();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="reminder-settings" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

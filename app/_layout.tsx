import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/AppContext';
import { CheckInModal } from '../src/CheckInModal';
import { SuccessOverlay } from '../src/SuccessOverlay';
import { Onboarding } from '../src/Onboarding';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function AppContent() {
  const { state, loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F3EF', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  if (!state.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <CheckInModal />
      <SuccessOverlay />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

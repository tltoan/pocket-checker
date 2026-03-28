import { useRef, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const C = {
  bg: '#F5F3EF',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  secondary: '#9E9E9E',
  tertiary: '#CACACA',
};

const TAB_WIDTH = 80;

const TABS = [
  { name: 'index', label: 'STATUS', iconActive: 'stats-chart' as const, iconInactive: 'stats-chart-outline' as const },
  { name: 'items', label: 'ITEMS', iconActive: 'checkbox' as const, iconInactive: 'checkbox-outline' as const },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: state.index,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const indicatorX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_WIDTH + 6],
  });

  return (
    <View style={s.barOuter}>
      <View style={s.bar}>
        {/* Animated pill indicator */}
        <Animated.View
          style={[
            s.indicator,
            { transform: [{ translateX: indicatorX }] },
          ]}
        />

        {TABS.map((tab, i) => {
          const focused = state.index === i;
          return (
            <TouchableOpacity
              key={tab.name}
              style={s.tabItem}
              onPress={() => navigation.navigate(tab.name === 'index' ? 'index' : tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={focused ? tab.iconActive : tab.iconInactive}
                size={20}
                color={focused ? C.text : C.tertiary}
              />
              <Text style={[s.label, focused && s.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: C.bg,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: C.text,
        },
        headerRight: () => (
          <TouchableOpacity
            style={{ paddingRight: 16 }}
            onPress={() => router.push('/settings')}
            activeOpacity={0.6}
          >
            <Ionicons name="settings-outline" size={22} color={C.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ headerTitle: 'Pocket Checker' }}
      />
      <Tabs.Screen
        name="items"
        options={{ headerTitle: 'Pocket Checker' }}
      />
      <Tabs.Screen
        name="rules"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  barOuter: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    left: 12,
    width: TAB_WIDTH,
    height: 52,
    borderRadius: 22,
    backgroundColor: '#E6E3DD',
  },
  tabItem: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    zIndex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.tertiary,
  },
  labelActive: {
    color: C.text,
  },
});

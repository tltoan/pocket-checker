import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState as RNAppState } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import * as TaskManager from 'expo-task-manager';
import {
  AppState,
  LocationState,
  CheckIn,
  defaultState,
  loadState,
  saveState,
  haversineDistance,
  uid,
} from './store';

// --- Constants ---
const BACKGROUND_LOCATION_TASK = 'pocket-check-background-location';

// --- Notification handler (must be top-level) ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- Background location task (must be top-level) ---
// This stores the latest background location so the app can read it on wake
let backgroundLocationCallback: ((coords: { lat: number; lng: number }) => void) | null = null;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  if (locations && locations.length > 0) {
    const { latitude: lat, longitude: lng } = locations[0].coords;
    backgroundLocationCallback?.({ lat, lng });
  }
});

// --- Context ---
interface AppContextType {
  state: AppState;
  location: LocationState | null;
  locationPermission: 'granted' | 'denied' | 'pending';
  notifPermission: 'granted' | 'denied' | 'pending';
  checkInOpen: boolean;
  checkedItems: Set<string>;
  showSuccess: boolean;
  stationaryMinutes: number;
  isLocationArmed: boolean;
  loading: boolean;
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
  toggleItemActive: (id: string) => void;
  switchProfile: (id: string) => void;
  openCheckIn: () => void;
  closeCheckIn: () => void;
  toggleCheckItem: (id: string) => void;
  completeCheckIn: () => void;
  setReminderMinutes: (val: number) => void;
  clearHistory: () => void;
  requestNotifPermission: () => void;
  toggleMonitoring: () => void;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [notifPermission, setNotifPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [, setTick] = useState(0);

  const lastNotifTime = useRef<number>(0);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const locationRef = useRef(location);
  locationRef.current = location;

  // Fixed 100m geofence radius
  const GEOFENCE_RADIUS = 100;

  // Armed location: a place you've dwelled long enough that qualifies for a departure alert
  const armedLocation = useRef<{ lat: number; lng: number; name: string } | null>(null);

  // ─── Load persisted state ───
  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setLoading(false);
    });
  }, []);

  // ─── Persist on change ───
  useEffect(() => {
    if (!loading) saveState(state);
  }, [state, loading]);

  // ─── Timer tick every 60s (drives stationaryMinutes recalc) ───
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  // ─── Process a location update (shared by foreground + background) ───
  const processLocation = useCallback((lat: number, lng: number) => {
    const now = Date.now();

    setLocation((prev) => {
      if (prev && haversineDistance(prev.lat, prev.lng, lat, lng) < GEOFENCE_RADIUS) {
        // Same location — update coords, keep arrivedAt
        return { ...prev, lat, lng };
      }
      // New location — reset dwell timer
      return { lat, lng, arrivedAt: now, name: 'Current Location' };
    });
  }, []);

  // ─── Location permissions + tracking ───
  useEffect(() => {
    let mounted = true;

    (async () => {
      // Request foreground first (required before background)
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (fgStatus !== 'granted') {
        setLocationPermission('denied');
        return;
      }
      setLocationPermission('granted');

      // Start foreground watcher (works while app is open)
      locationSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000,
          distanceInterval: 20,
        },
        (pos) => {
          processLocation(pos.coords.latitude, pos.coords.longitude);
        }
      );

      // Try to enable background location (works when app is backgrounded)
      try {
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus === 'granted') {
          const isRunning = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
          if (!isRunning) {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 120000,
              distanceInterval: 30,
              showsBackgroundLocationIndicator: true,
              foregroundService: {
                notificationTitle: 'Pocket Checker',
                notificationBody: 'Monitoring your location',
              },
            });
          }
        }
      } catch {
        // Background location not available (e.g., Expo Go) — foreground still works
      }
    })();

    return () => {
      mounted = false;
      locationSub.current?.remove();
    };
  }, [processLocation]);

  // Wire up background location callback
  useEffect(() => {
    backgroundLocationCallback = ({ lat, lng }) => {
      processLocation(lat, lng);
    };
    return () => {
      backgroundLocationCallback = null;
    };
  }, [processLocation]);

  // ─── Reverse geocode ───
  useEffect(() => {
    if (!location || location.name !== 'Current Location') return;

    Location.reverseGeocodeAsync({ latitude: location.lat, longitude: location.lng })
      .then((results) => {
        if (results.length > 0) {
          const r = results[0];
          const name = r.subregion || r.city || r.district || r.name || 'Unknown Location';
          setLocation((prev) => (prev ? { ...prev, name } : prev));
        }
      })
      .catch(() => {});
  }, [location?.lat?.toFixed(2), location?.lng?.toFixed(2)]);

  // ─── Arm-then-depart notification trigger ───
  useEffect(() => {
    if (!location) return;
    if (!state.onboardingComplete) return;
    if (!state.monitoringActive) return;

    const profile = state.profiles.find((p) => p.id === state.currentProfile);
    if (!profile || profile.items.filter((i) => i.active !== false).length === 0) return;

    const elapsed = (Date.now() - location.arrivedAt) / 60000;

    // Step 1: If dwelled long enough, arm this location
    if (elapsed >= state.reminderMinutes && !armedLocation.current) {
      armedLocation.current = { lat: location.lat, lng: location.lng, name: location.name };
      return;
    }

    // Step 2: If armed and we've moved away, fire the alert
    if (armedLocation.current) {
      const dist = haversineDistance(
        armedLocation.current.lat,
        armedLocation.current.lng,
        location.lat,
        location.lng,
      );

      if (dist >= GEOFENCE_RADIUS) {
        // Rate limit
        const now = Date.now();
        if (now - lastNotifTime.current < 5 * 60 * 1000) return;
        lastNotifTime.current = now;

        const leavingName = armedLocation.current.name || 'your location';
        armedLocation.current = null;

        // Auto-open check-in modal
        setCheckedItems(new Set());
        setCheckInOpen(true);

        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Check your pockets!',
            body: `You're leaving ${leavingName} — got everything?`,
            sound: true,
          },
          trigger: null,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  }, [location, state.monitoringActive, state.reminderMinutes, state.currentProfile, state.onboardingComplete]);

  // ─── Check notification permission on mount ───
  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotifPermission(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'pending');
    });
  }, []);

  const requestNotifPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifPermission(status === 'granted' ? 'granted' : 'denied');
  }, []);

  // ─── Listen for notification taps → open check-in ───
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      setCheckedItems(new Set());
      setCheckInOpen(true);
    });
    return () => sub.remove();
  }, []);

  // ─── Re-evaluate notification on app foreground return ───
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // Force a tick to re-evaluate dwell time
        setTick((t) => t + 1);
      }
    });
    return () => sub.remove();
  }, []);

  // ─── Actions ───
  const currentProfile = state.profiles.find((p) => p.id === state.currentProfile) || state.profiles[0];

  const addItem = useCallback((name: string) => {
    setState((s) => {
      const profile = s.profiles.find((p) => p.id === s.currentProfile);
      if (!name.trim() || !profile || profile.items.length >= 10) return s;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return {
        ...s,
        profiles: s.profiles.map((p) =>
          p.id === s.currentProfile
            ? { ...p, items: [...p.items, { id: uid(), name: name.trim(), createdAt: Date.now(), active: true }] }
            : p
        ),
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.currentProfile ? { ...p, items: p.items.filter((i) => i.id !== itemId) } : p
      ),
    }));
  }, []);

  const toggleItemActive = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.currentProfile
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId
                  ? { ...i, active: !i.active, activatedAt: !i.active ? Date.now() : undefined }
                  : i
              ),
            }
          : p
      ),
    }));
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((s) => ({ ...s, currentProfile: profileId }));
  }, []);

  const openCheckIn = useCallback(() => {
    setCheckedItems(new Set());
    setCheckInOpen(true);
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        Notifications.requestPermissionsAsync().then(({ status: s }) => {
          setNotifPermission(s === 'granted' ? 'granted' : 'denied');
        });
      }
    });
  }, []);

  const closeCheckIn = useCallback(() => setCheckInOpen(false), []);

  const toggleCheckItem = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const completeCheckIn = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const loc = locationRef.current;
    const durationMinutes = loc ? Math.round((Date.now() - loc.arrivedAt) / 60000) : 0;
    const profile = stateRef.current.profiles.find((p) => p.id === stateRef.current.currentProfile);
    const checkIn: CheckIn = {
      id: uid(),
      timestamp: Date.now(),
      profile: profile?.name || 'Unknown',
      location: loc?.name || 'Unknown',
      itemsVerified: Array.from(checkedItems),
      durationMinutes,
    };
    setState((s) => ({
      ...s,
      checkIns: [checkIn, ...s.checkIns].slice(0, 10),
    }));
    setCheckInOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1800);
  }, [checkedItems]);

  const setReminderMinutes = useCallback((val: number) => {
    setState((s) => ({ ...s, reminderMinutes: Math.max(5, Math.min(120, val)) }));
  }, []);

  const clearHistory = useCallback(() => {
    setState((s) => ({ ...s, checkIns: [] }));
  }, []);

  const toggleMonitoring = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((s) => ({ ...s, monitoringActive: !s.monitoringActive }));
  }, []);

  const completeOnboarding = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setState((s) => ({ ...s, onboardingComplete: true }));
  }, []);

  const stationaryMinutes = location ? Math.round((Date.now() - location.arrivedAt) / 60000) : 0;

  return (
    <AppContext.Provider
      value={{
        state,
        location,
        locationPermission,
        notifPermission,
        checkInOpen,
        checkedItems,
        showSuccess,
        stationaryMinutes,
        isLocationArmed: armedLocation.current !== null,
        loading,
        addItem,
        removeItem,
        toggleItemActive,
        switchProfile,
        openCheckIn,
        closeCheckIn,
        toggleCheckItem,
        completeCheckIn,
        setReminderMinutes,
        clearHistory,
        requestNotifPermission,
        toggleMonitoring,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---
export interface Item {
  id: string;
  name: string;
  createdAt: number;
  active: boolean;
  activatedAt?: number;
}

export interface Profile {
  id: string;
  name: string;
  items: Item[];
}

export interface CheckIn {
  id: string;
  timestamp: number;
  profile: string;
  location: string;
  itemsVerified: string[];
  durationMinutes: number;
}

export interface LocationState {
  lat: number;
  lng: number;
  arrivedAt: number;
  name: string;
}

export interface AppState {
  profiles: Profile[];
  currentProfile: string;
  checkIns: CheckIn[];
  reminderMinutes: number;
  monitoringActive: boolean;
  onboardingComplete: boolean;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

const STORAGE_KEY = 'pocket-checker-data';

export const defaultState: AppState = {
  profiles: [
    { id: 'work', name: 'Work', items: [] },
    { id: 'personal', name: 'Personal', items: [] },
    { id: 'travel', name: 'Travel', items: [] },
  ],
  currentProfile: 'work',
  checkIns: [],
  reminderMinutes: 30,
  monitoringActive: true,
  onboardingComplete: false,
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return { ...defaultState };
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

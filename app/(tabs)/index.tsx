import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/AppContext';
import { formatDuration } from '../../src/store';

const C = {
  bg: '#F5F3EF',
  surface: '#FFFFFF',
  surfaceAlt: '#FAF8F5',
  text: '#1A1A1A',
  secondary: '#9E9E9E',
  tertiary: '#CACACA',
  separator: '#E8E5E0',
  armed: '#1B6B2A',
  armedLight: '#E8F5E9',
  idle: '#BDBDBD',
  alert: '#E53935',
};

const ITEM_EMOJIS: Record<string, string> = {
  keys: '\u{1F511}', key: '\u{1F511}',
  phone: '\u{1F4F1}',
  wallet: '\u{1F4B3}', card: '\u{1F4B3}',
  watch: '\u231A',
  earbuds: '\u{1F3A7}', airpods: '\u{1F3A7}', headphones: '\u{1F3A7}',
  sunglasses: '\u{1F576}', glasses: '\u{1F576}',
  laptop: '\u{1F4BB}',
  bag: '\u{1F392}', backpack: '\u{1F392}',
  charger: '\u{1F50C}', cable: '\u{1F50C}',
  medicine: '\u{1F48A}',
  water: '\u{1F4A7}', bottle: '\u{1F4A7}',
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(ITEM_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '\u{1F4E6}';
}

export default function StatusDashboard() {
  const {
    state,
    location,
    locationPermission,
    stationaryMinutes,
    loading,
  } = useApp();

  const currentProfile = state.profiles.find((p) => p.id === state.currentProfile) || state.profiles[0];
  const itemCount = currentProfile.items.filter((i) => i.active !== false).length;

  const activeItems = currentProfile.items.filter((i) => i.active !== false);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.text} />
      </View>
    );
  }

  const locationName = location?.name || 'Unknown';
  const isArmed = state.monitoringActive;
  const dwellDisplay = stationaryMinutes > 0 ? formatDuration(stationaryMinutes) : '0 min';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Location Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>CURRENT LOCATION</Text>
            <Text style={styles.heroTitle}>
              {location && locationPermission === 'granted' ? locationName : 'No Signal'}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isArmed ? C.armed : C.idle }]} />
              <Text style={[styles.statusText, { color: isArmed ? C.armed : C.idle }]}>
                {isArmed
                  ? stationaryMinutes > 0
                    ? `Dwelling \u00B7 ${formatDuration(stationaryMinutes)}`
                    : 'Tracking Active'
                  : 'Paused'}
              </Text>
            </View>
          </View>
          <Text style={styles.mapEmoji}>{'\u{1F5FA}'}</Text>
        </View>

        {/* Tracked items */}
        {activeItems.length > 0 && (
          <View style={styles.heroItems}>
            <View style={styles.heroDivider} />
            <View style={styles.heroItemsRow}>
              {activeItems.map((item) => (
                <Text key={item.id} style={styles.heroItemChip}>
                  {getEmoji(item.name)}
                </Text>
              ))}
              <Text style={styles.heroItemCount}>
                {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} tracked
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>CHECKS</Text>
          <Text style={styles.statValue}>{String(state.checkIns.length).padStart(2, '0')}</Text>
          <Text style={styles.statHint}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>DWELL TIME</Text>
          <Text style={styles.statValue}>{dwellDisplay}</Text>
          <Text style={styles.statHint}>Threshold: {state.reminderMinutes} min</Text>
        </View>
      </View>


      {/* Recent Logs */}
      <Text style={[styles.sectionLabel, { marginTop: 24, marginBottom: 12 }]}>RECENT LOGS</Text>
      {state.checkIns.length > 0 ? (
        state.checkIns.slice(0, 4).map((c) => {
          const profile = state.profiles.find(p => p.name === c.profile);
          const firstItem = profile?.items[0];
          const emoji = firstItem ? getEmoji(firstItem.name) : '\u{1F4CB}';
          return (
            <View style={styles.logCard} key={c.id}>
              <View style={styles.logIconBg}>
                <Text style={styles.logEmoji}>{emoji}</Text>
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logTitle}>{c.profile} check successful</Text>
                <Text style={styles.logLocation}>{c.location.toUpperCase()}</Text>
              </View>
              <Text style={styles.logTime}>
                {new Date(c.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </View>
          );
        })
      ) : (
        <View style={styles.logCard}>
          <View style={[styles.logIconBg, { backgroundColor: C.bg }]}>
            <Ionicons name="radio-outline" size={18} color={C.tertiary} />
          </View>
          <View style={styles.logContent}>
            <Text style={[styles.logTitle, { color: C.tertiary }]}>No logs recorded</Text>
          </View>
        </View>
      )}

      {/* Permission Warning */}
      {locationPermission === 'denied' && (
        <TouchableOpacity
          style={styles.warningBanner}
          onPress={() => Linking.openSettings()}
          activeOpacity={0.6}
        >
          <Ionicons name="warning" size={16} color={C.alert} />
          <Text style={styles.warningText}>Location disabled — tap to open Settings</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
    letterSpacing: 1.5,
  },
  heroCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: C.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapEmoji: {
    fontSize: 48,
    marginLeft: 12,
  },
  heroItems: {
    marginTop: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: C.separator,
    marginBottom: 14,
  },
  heroItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  heroItemChip: {
    fontSize: 22,
  },
  heroItemCount: {
    fontSize: 13,
    color: C.secondary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.secondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  statHint: {
    fontSize: 13,
    color: C.secondary,
  },
  logCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logEmoji: {
    fontSize: 22,
  },
  logContent: {
    flex: 1,
    gap: 2,
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
  },
  logLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: C.secondary,
    letterSpacing: 1,
  },
  logTime: {
    fontSize: 13,
    color: C.secondary,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 10,
  },
  warningText: {
    fontSize: 14,
    color: C.alert,
    fontWeight: '500',
  },
});

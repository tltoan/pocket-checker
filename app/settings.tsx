import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../src/AppContext';

const C = {
  bg: '#F5F3EF',
  surface: '#FFFFFF',
  surfaceAlt: '#FAF8F5',
  text: '#1A1A1A',
  secondary: '#9E9E9E',
  tertiary: '#CACACA',
  separator: '#E8E5E0',
  armed: '#4CAF50',
  idle: '#BDBDBD',
  alert: '#E53935',
  tint: '#3C3C3C',
  shadow: 'rgba(0,0,0,0.06)',
};

export default function SettingsScreen() {
  const {
    state,
    locationPermission,
    notifPermission,
    setReminderMinutes,
    clearHistory,
    requestNotifPermission,
    toggleMonitoring,
  } = useApp();

  const router = useRouter();

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'Remove all check-in records?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monitoring Toggle */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Active Monitoring</Text>
              <Text style={styles.rowHint}>
                {state.monitoringActive ? 'Tracking your location' : 'Monitoring paused'}
              </Text>
            </View>
            <Switch
              value={state.monitoringActive}
              onValueChange={toggleMonitoring}
              trackColor={{ false: C.idle, true: C.armed }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Dwell Time */}
        <Text style={styles.sectionLabel}>TIMING</Text>
        <View style={styles.card}>
          <Text style={styles.rowHint}>
            How long you need to be somewhere before we remind you to check your pockets.
          </Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setReminderMinutes(state.reminderMinutes - 5)}
              activeOpacity={0.6}
            >
              <Ionicons name="remove" size={20} color={C.tint} />
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperNumber}>{state.reminderMinutes}</Text>
              <Text style={styles.stepperUnit}>min</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setReminderMinutes(state.reminderMinutes + 5)}
              activeOpacity={0.6}
            >
              <Ionicons name="add" size={20} color={C.tint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Permissions */}
        <Text style={styles.sectionLabel}>PERMISSIONS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={locationPermission !== 'granted' ? () => Linking.openSettings() : undefined}
            activeOpacity={locationPermission !== 'granted' ? 0.6 : 1}
          >
            <Text style={styles.rowLabel}>Location</Text>
            {locationPermission === 'granted' ? (
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: C.armed }]} />
                <Text style={styles.statusText}>Granted</Text>
              </View>
            ) : (
              <Text style={styles.enableText}>Enable</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={
              notifPermission === 'pending'
                ? requestNotifPermission
                : notifPermission === 'denied'
                ? () => Linking.openSettings()
                : undefined
            }
            activeOpacity={notifPermission !== 'granted' ? 0.6 : 1}
          >
            <Text style={styles.rowLabel}>Notifications</Text>
            {notifPermission === 'granted' ? (
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: C.armed }]} />
                <Text style={styles.statusText}>Granted</Text>
              </View>
            ) : (
              <Text style={styles.enableText}>Enable</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleClearHistory} activeOpacity={0.6}>
            <Text style={[styles.rowLabel, { color: C.alert }]}>Clear Check-in History</Text>
            <Ionicons name="trash-outline" size={18} color={C.alert} />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://pocketchecker.app/privacy.html')}
            activeOpacity={0.6}
          >
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={C.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://pocketchecker.app/terms.html')}
            activeOpacity={0.6}
          >
            <Text style={styles.rowLabel}>Terms of Use</Text>
            <Ionicons name="open-outline" size={16} color={C.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('mailto:support@pocketchecker.app')}
            activeOpacity={0.6}
          >
            <Text style={styles.rowLabel}>Contact Support</Text>
            <Ionicons name="mail-outline" size={16} color={C.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Pocket Checker v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: C.text,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 24,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: C.text,
  },
  rowHint: {
    fontSize: 13,
    color: C.secondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginVertical: 14,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    alignItems: 'center',
  },
  stepperNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: C.text,
  },
  stepperUnit: {
    fontSize: 15,
    fontWeight: '400',
    color: C.secondary,
    marginTop: -4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 15,
    color: C.secondary,
  },
  enableText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.armed,
  },
  versionText: {
    fontSize: 13,
    color: C.tertiary,
    textAlign: 'center',
    marginTop: 32,
  },
});

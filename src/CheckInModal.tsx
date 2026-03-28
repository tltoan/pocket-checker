import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

const C = {
  alert: '#E53935',
  alertDark: 'rgba(40,0,0,0.85)',
  white: '#FFFFFF',
  armed: '#4CAF50',
};

const ITEM_EMOJIS: Record<string, string> = {
  keys: '\u{1F511}', key: '\u{1F511}',
  phone: '\u{1F4F1}',
  wallet: '\u{1F45B}', card: '\u{1F4B3}',
  watch: '\u231A',
  earbuds: '\u{1F3A7}', airpods: '\u{1F3A7}', headphones: '\u{1F3A7}',
  sunglasses: '\u{1F576}', glasses: '\u{1F576}',
  laptop: '\u{1F4BB}',
  bag: '\u{1F392}', backpack: '\u{1F392}',
  charger: '\u{1F50C}', cable: '\u{1F50C}',
  medicine: '\u{1F48A}',
  water: '\u{1F4A7}', bottle: '\u{1F4A7}',
  umbrella: '\u2602',
  ring: '\u{1F48D}',
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(ITEM_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '\u{1F4E6}';
}

const SLIDER_WIDTH = Dimensions.get('window').width - 64;
const THUMB_SIZE = 56;
const SLIDE_THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - 8;

export function CheckInModal() {
  const {
    state,
    checkInOpen,
    checkedItems,
    location,
    closeCheckIn,
    toggleCheckItem,
    completeCheckIn,
  } = useApp();

  const currentProfile =
    state.profiles.find((p) => p.id === state.currentProfile) || state.profiles[0];

  const [slideOffset, setSlideOffset] = useState(0);
  const items = currentProfile.items.filter((i) => i.active !== false);
  const allChecked = items.length > 0 && checkedItems.size >= items.length;
  const allCheckedRef = useRef(allChecked);
  allCheckedRef.current = allChecked;
  const completeRef = useRef(completeCheckIn);
  completeRef.current = completeCheckIn;

  useEffect(() => {
    setSlideOffset(0);
  }, [checkInOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => allCheckedRef.current,
      onMoveShouldSetPanResponder: () => allCheckedRef.current,
      onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (!allCheckedRef.current) return;
        const x = Math.max(0, Math.min(gs.dx, SLIDE_THRESHOLD));
        setSlideOffset(x);
      },
      onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (!allCheckedRef.current) {
          setSlideOffset(0);
          return;
        }
        if (gs.dx >= SLIDE_THRESHOLD) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          completeRef.current();
          setSlideOffset(0);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setSlideOffset(0);
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={checkInOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={closeCheckIn}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>REMINDER</Text>
            <Text style={styles.headerTitle}>Pocket Checker</Text>
          </View>
          <TouchableOpacity
            style={styles.alertBadge}
            onPress={closeCheckIn}
            activeOpacity={0.6}
          >
            <Ionicons name="warning" size={20} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>CHECK{'\n'}POCKETS</Text>

        {/* Item Grid */}
        <ScrollView style={styles.itemsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {items.slice(0, 4).map((item) => {
              const checked = checkedItems.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, checked && styles.itemCardChecked]}
                  onPress={() => toggleCheckItem(item.id)}
                  activeOpacity={0.7}
                >
                  {checked && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={C.white} />
                    </View>
                  )}
                  <Text style={styles.itemEmoji}>{getEmoji(item.name)}</Text>
                  <Text style={styles.itemLabel}>{item.name.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {items.length > 4 && (
            <View style={styles.extraRow}>
              {items.slice(4).map((item) => {
                const checked = checkedItems.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.extraChip, checked && styles.extraChipChecked]}
                    onPress={() => toggleCheckItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.extraEmoji}>{getEmoji(item.name)}</Text>
                    <Text style={styles.extraLabel}>{item.name.toUpperCase()}</Text>
                    {checked && <Ionicons name="checkmark-circle" size={16} color={C.armed} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Slide to Confirm */}
        <View style={styles.sliderContainer}>
          <View style={[styles.sliderTrack, !allChecked && styles.sliderTrackLocked]}>
            {allChecked && (
              <View style={[styles.sliderFill, { width: slideOffset + THUMB_SIZE }]} />
            )}
            <View
              style={[
                styles.sliderThumb,
                { transform: [{ translateX: slideOffset }] },
                !allChecked && styles.sliderThumbLocked,
              ]}
              {...panResponder.panHandlers}
            >
              <Ionicons
                name={allChecked ? 'chevron-forward' : 'lock-closed'}
                size={allChecked ? 22 : 18}
                color={allChecked ? C.alert : 'rgba(255,255,255,0.4)'}
              />
            </View>
            <Text style={styles.sliderLabel}>
              {allChecked
                ? 'SLIDE TO CONFIRM'
                : `VERIFY ALL ITEMS (${checkedItems.size}/${items.length})`}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.footerDot, { backgroundColor: C.armed }]} />
          <Text style={styles.footerText}>
            Location: {location?.name || 'Unknown'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.alert,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: C.white,
  },
  alertBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 64,
    fontWeight: '900',
    color: C.white,
    lineHeight: 64,
    marginBottom: 24,
  },
  itemsScroll: {
    flex: 1,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    width: '48%',
    aspectRatio: 0.9,
    borderRadius: 20,
    backgroundColor: C.alertDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'relative',
    marginBottom: 12,
  },
  itemCardChecked: {
    backgroundColor: 'rgba(76,175,80,0.35)',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.armed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 48,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
    letterSpacing: 1,
  },
  extraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  extraChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: C.alertDark,
  },
  extraChipChecked: {
    backgroundColor: 'rgba(76,175,80,0.35)',
  },
  extraEmoji: {
    fontSize: 20,
  },
  extraLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
    letterSpacing: 0.5,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderTrack: {
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderTrackLocked: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  sliderThumbLocked: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sliderFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sliderThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 4,
    zIndex: 2,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
});

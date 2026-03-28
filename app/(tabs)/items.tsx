import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/AppContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  tint: '#3C3C3C',
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

export default function InventoryScreen() {
  const { state, loading, addItem, removeItem, toggleItemActive } = useApp();
  const [newItem, setNewItem] = useState('');
  const inputRef = useRef<TextInput>(null);

  const currentProfile = state.profiles.find((p) => p.id === state.currentProfile) || state.profiles[0];

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    toggleItemActive(id);
  }, [toggleItemActive]);

  const handleAdd = () => {
    const name = newItem.trim();
    if (!name) return;
    addItem(name.toUpperCase());
    setNewItem('');
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.text} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerArea}>
        <Text style={styles.sectionLabel}>MY ITEMS</Text>
        <Text style={styles.title}>Inventory</Text>
      </View>

      {/* Item List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {currentProfile.items.length > 0 ? (
          [
            ...currentProfile.items
              .filter((i) => i.active !== false)
              .sort((a, b) => (a.activatedAt || 0) - (b.activatedAt || 0)),
            ...currentProfile.items.filter((i) => i.active === false),
          ].map((item, index) => (
            <Swipeable
              key={item.id}
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    removeItem(item.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              overshootRight={false}
            >
              <TouchableOpacity
                style={[styles.itemCard, !item.active && styles.itemCardInactive]}
                onPress={() => handleToggle(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={[styles.itemEmoji, !item.active && styles.itemInactive]}>{getEmoji(item.name)}</Text>
                <Text style={[styles.itemName, !item.active && styles.itemNameInactive]}>{item.name}</Text>
                <View style={[styles.checkCircle, !item.active && styles.checkCircleInactive]}>
                  {item.active && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            </Swipeable>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{'\u{1F4E6}'}</Text>
            <Text style={styles.emptyText}>No items configured</Text>
            <Text style={styles.emptySubtext}>Add your essentials below</Text>
          </View>
        )}

        {/* Append New Asset */}
        {currentProfile.items.length < 10 && (
          <View style={styles.appendCard}>
            <Ionicons name="add" size={20} color={C.secondary} />
            <TextInput
              ref={inputRef}
              style={styles.appendInput}
              placeholder="Append New Asset"
              placeholderTextColor={C.secondary}
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              maxLength={30}
              autoCapitalize="words"
            />
            {newItem.trim().length > 0 && (
              <TouchableOpacity
                style={styles.appendAddBtn}
                onPress={handleAdd}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.footerRow}>
              <View style={[styles.footerDot, { backgroundColor: C.armed }]} />
              <Text style={styles.footerLabel}>Tracking active</Text>
            </View>
            <Text style={styles.footerVersion}>v1.0</Text>
          </View>
          <View style={styles.footerIcon}>
            <Ionicons name="download-outline" size={18} color={C.tint} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.armed,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deleteAction: {
    backgroundColor: '#E53935',
    borderRadius: 20,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 8,
  },
  itemCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemIndex: {
    fontSize: 16,
    fontWeight: '400',
    color: C.tertiary,
    width: 28,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  itemCardInactive: {
    opacity: 0.5,
  },
  itemInactive: {
    opacity: 0.4,
  },
  itemNameInactive: {
    textDecorationLine: 'line-through',
    color: C.secondary,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.armed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: C.tertiary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: C.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: C.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 20,
  },
  footerLeft: {
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.armed,
    letterSpacing: 1,
  },
  footerVersion: {
    fontSize: 11,
    color: C.secondary,
    letterSpacing: 1,
    marginLeft: 14,
  },
  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.separator,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  appendInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: C.text,
  },
  appendAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.armed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

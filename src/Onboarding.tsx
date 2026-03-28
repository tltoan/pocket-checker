import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

const C = {
  bg: '#F5F3EF',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  secondary: '#9E9E9E',
  tertiary: '#CACACA',
  separator: '#E8E5E0',
  armed: '#4CAF50',
  tint: '#3C3C3C',
};

const QUICK_ITEMS = [
  { name: 'Keys', emoji: '\u{1F511}' },
  { name: 'Phone', emoji: '\u{1F4F1}' },
  { name: 'Wallet', emoji: '\u{1F4B3}' },
  { name: 'Watch', emoji: '\u231A' },
  { name: 'Earbuds', emoji: '\u{1F3A7}' },
  { name: 'Sunglasses', emoji: '\u{1F576}' },
];

export function Onboarding() {
  const { addItem, completeOnboarding, requestNotifPermission } = useApp();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleItem = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleActivate = async () => {
    for (const name of selected) {
      addItem(name.toUpperCase());
    }
    await requestNotifPermission();
    completeOnboarding();
  };

  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>{'\u{1F4CB}'}</Text>
            <Text style={styles.heroTitle}>Pocket{'\n'}Checker</Text>
            <Text style={styles.heroSubtitle}>
              Never forget your stuff again.{'\n'}
              We remind you before you leave.
            </Text>
          </View>

          <View style={styles.featureCards}>
            <View style={[styles.featureCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.featureEmoji}>{'\u{1F4CD}'}</Text>
              <Text style={styles.featureText}>Location-aware{'\n'}reminders</Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.featureEmoji}>{'\u{1F514}'}</Text>
              <Text style={styles.featureText}>Full-screen{'\n'}alerts</Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.featureEmoji}>{'\u2705'}</Text>
              <Text style={styles.featureText}>Custom{'\n'}checklist</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep(1)}
            activeOpacity={0.6}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
        <Text style={styles.stepTitle}>What do you{'\n'}always carry?</Text>
        <Text style={styles.stepSubtitle}>Tap to select your essentials</Text>

        <View style={styles.grid}>
          {QUICK_ITEMS.map((item) => {
            const isSelected = selected.has(item.name);
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                onPress={() => toggleItem(item.name)}
                activeOpacity={0.6}
              >
                {isSelected && (
                  <View style={styles.gridCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
                <Text style={[styles.gridLabel, isSelected && styles.gridLabelSelected]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.size > 0 && (
          <Text style={styles.selectedCount}>
            {selected.size} item{selected.size !== 1 ? 's' : ''} selected
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, selected.size === 0 && styles.primaryBtnDim]}
          onPress={handleActivate}
          activeOpacity={0.6}
        >
          <Text style={[styles.primaryBtnText, selected.size === 0 && { color: C.secondary }]}>
            {selected.size > 0 ? 'Activate' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep(0)} activeOpacity={0.6}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '700',
    color: C.text,
    lineHeight: 48,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: C.secondary,
    lineHeight: 26,
  },
  featureCards: {
    flexDirection: 'row',
    gap: 10,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    aspectRatio: 0.85,
    justifyContent: 'flex-end',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.text,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  primaryBtnDim: {
    backgroundColor: C.separator,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: C.text,
    lineHeight: 38,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: C.secondary,
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 72) / 3,
    aspectRatio: 0.85,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridItemSelected: {
    backgroundColor: '#E8F5E9',
    shadowOpacity: 0.1,
  },
  gridEmoji: {
    fontSize: 32,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: C.secondary,
  },
  gridLabelSelected: {
    color: C.text,
    fontWeight: '600',
  },
  gridCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.armed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCount: {
    fontSize: 15,
    fontWeight: '500',
    color: C.armed,
    marginTop: 20,
    textAlign: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: C.secondary,
    paddingVertical: 8,
  },
});

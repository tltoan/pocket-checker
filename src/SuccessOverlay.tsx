import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

const C = {
  bg: '#F5F3EF',
  armed: '#4CAF50',
  text: '#1A1A1A',
  secondary: '#9E9E9E',
};

export function SuccessOverlay() {
  const { showSuccess } = useApp();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSuccess) {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuccess]);

  if (!showSuccess) return null;

  return (
    <Modal transparent animationType="fade" visible={showSuccess}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.ring, { transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.title}>All Verified</Text>
        <Text style={styles.subtitle}>Safe to depart</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.armed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: C.armed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: C.secondary,
  },
});

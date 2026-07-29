import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Colors, Spacing, Radius } from '../theme/colors';
import { CustomButton } from './CustomButton';

// Global simulation flag for testing offline state
let simulatedOffline = false;
type Listener = (offline: boolean) => void;
const listeners: Set<Listener> = new Set();

export const setSimulatedOffline = (offline: boolean) => {
  simulatedOffline = offline;
  listeners.forEach((cb) => cb(offline));
};

export const getIsOffline = () => simulatedOffline;

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Listen to real network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      if (!simulatedOffline) {
        setIsOffline(offline);
      }
    });

    // Listen to simulated toggles
    const simListener = (off: boolean) => setIsOffline(off);
    listeners.add(simListener);

    return () => {
      unsubscribe();
      listeners.delete(simListener);
    };
  }, []);

  if (!isOffline) {
    // Small dev toggle button in corner for easy testing of offline banner
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.9}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.bannerText}>
          ⚠️ You're Offline. No network connection. Tap for info.
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>📡</Text>
            <Text style={styles.modalTitle}>No Network Connection</Text>
            <Text style={styles.modalText}>
              Your mobile app is currently disconnected from the SkillConnect real-time servers.
              {'\n\n'}
              • Rapido live matching and GPS tracking are paused.
              {'\n'}
              • Escrow funding and payments require an active internet connection.
              {'\n\n'}
              Any pending actions will sync automatically once your connection is restored.
            </Text>
            <CustomButton
              title="Got It"
              onPress={() => setShowModal(false)}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  bannerText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
});

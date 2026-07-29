import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  calculateDistanceKm,
  formatDistanceDisplay,
  calculateEtaMinutes
} from '@skillconnect/shared';
import { RootState } from '../redux/store';
import { CustomButton } from '../components/CustomButton';
import { Colors, Spacing, Radius } from '../theme/colors';

// Try importing react-native-maps safely
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default || Maps;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch {
  // Fallback if maps module not loaded
}

export const LiveTrackingScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params || {};
  const { userInfo } = useSelector((state: RootState) => state.user);
  const isWorker = userInfo?.role === 'worker';

  // Live simulation coordinates
  const [hhCoords] = useState([72.88, 19.08]);
  const [workerCoords, setWorkerCoords] = useState([72.884, 19.084]);
  const [sosActive, setSosActive] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'arriving' | 'checked_in' | 'completed'>('arriving');

  // Simulate worker movement closer to household
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkerCoords((prev) => {
        const dx = (hhCoords[0] - prev[0]) * 0.15;
        const dy = (hhCoords[1] - prev[1]) * 0.15;
        if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
          return prev;
        }
        return [prev[0] + dx, prev[1] + dy];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [hhCoords]);

  const distKm = calculateDistanceKm(hhCoords, workerCoords) || 0.4;
  const etaMins = calculateEtaMinutes(distKm);

  const handleSOS = () => {
    setSosActive(true);
    Alert.alert(
      '🚨 SOS ALERT TRIGGERED',
      'Emergency notification broadcasted to nearby security units and trusted contacts.',
      [{ text: 'Dismiss Alert', onPress: () => setSosActive(false) }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live GPS Booking Tracker</Text>
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Text style={styles.sosText}>🚨 SOS</Text>
        </TouchableOpacity>
      </View>

      {sosActive ? (
        <View style={styles.sosBanner}>
          <Text style={styles.sosBannerText}>
            🚨 SOS EMERGENCY UNIT NOTIFIED — STAY CALM, HELP IS DISPATCHED 🚨
          </Text>
        </View>
      ) : null}

      <View style={styles.mapBox}>
        {MapView && Marker ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 19.082,
              longitude: 72.882,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015
            }}
          >
            <Marker
              coordinate={{ latitude: hhCoords[1], longitude: hhCoords[0] }}
              title="Household Location"
              pinColor={Colors.primary}
            />
            <Marker
              coordinate={{ latitude: workerCoords[1], longitude: workerCoords[0] }}
              title="Worker Location (Live GPS)"
              pinColor={Colors.secondary}
            />
            {Polyline && (
              <Polyline
                coordinates={[
                  { latitude: hhCoords[1], longitude: hhCoords[0] },
                  { latitude: workerCoords[1], longitude: workerCoords[0] }
                ]}
                strokeColor={Colors.primary}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.simBox}>
            <View style={styles.simRouteLine} />

            <View style={styles.simHhPin}>
              <Text style={styles.pinIcon}>🏠</Text>
              <Text style={styles.pinLabel}>Household</Text>
            </View>

            <View style={styles.simWorkerPin}>
              <Text style={styles.pinIcon}>🛠</Text>
              <Text style={styles.workerLabel}>Worker Live</Text>
            </View>

            <View style={styles.etaOverlay}>
              <Text style={styles.etaTitle}>
                {distKm < 0.1 ? '⚡ Worker Arrived at Location' : `ETA: ~${etaMins} mins (${formatDistanceDisplay(distKm)})`}
              </Text>
              <Text style={styles.etaSub}>Live GPS streaming via Socket.io location room</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footerSheet}>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.bookingIdText}>Booking #{bookingId?.slice(-6) || '7B29AC'}</Text>
            <Text style={styles.statusLabel}>
              Status: {bookingStatus.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatDistanceDisplay(distKm)} Away</Text>
          </View>
        </View>

        {!isWorker ? (
          <View style={styles.actionButtons}>
            <CustomButton
              title="📸 Verify Arrival Check-In (Biometric)"
              onPress={() => {
                setBookingStatus('checked_in');
                navigation.navigate('BiometricScan', { mode: 'check_in', bookingId });
              }}
              style={{ marginBottom: 8 }}
            />
            <CustomButton
              title="🏁 Verify Check-Out & Release Escrow"
              variant="outline"
              onPress={() => {
                setBookingStatus('completed');
                navigation.navigate('BiometricScan', { mode: 'check_out', bookingId });
              }}
            />
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <Text style={styles.workerHint}>
              When you arrive, ask the household to scan your face via their app to start the escrow timer.
            </Text>
            <CustomButton
              title="📡 Broadcasting Live GPS Coordinates"
              variant="outline"
              onPress={() => Alert.alert('GPS Status', 'Your location is broadcasting cleanly to the household tracking room.')}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingRight: Spacing.sm,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  sosBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  sosText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  sosBanner: {
    backgroundColor: '#DC2626',
    padding: Spacing.sm,
    alignItems: 'center',
  },
  sosBannerText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  mapBox: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  simBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  simRouteLine: {
    position: 'absolute',
    width: 180,
    height: 3,
    backgroundColor: '#3B82F6',
    transform: [{ rotate: '25deg' }],
  },
  simHhPin: {
    position: 'absolute',
    top: 100,
    left: 80,
    alignItems: 'center',
  },
  simWorkerPin: {
    position: 'absolute',
    bottom: 120,
    right: 80,
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: 32,
  },
  pinLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  workerLabel: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  etaOverlay: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
  },
  etaTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  etaSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  footerSheet: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bookingIdText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  actionButtons: {
    gap: 4,
  },
  workerHint: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
});

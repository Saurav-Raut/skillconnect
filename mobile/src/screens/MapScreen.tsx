import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  SKILL_CATEGORIES,
  calculateDistanceKm,
  formatDistanceDisplay,
  calculateEtaMinutes,
  createBooking,
  acceptBooking,
  fetchWorkers
} from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { CustomButton } from '../components/CustomButton';
import { RapidoIncomingModal } from '../components/RapidoIncomingModal';
import { Colors, Spacing, Radius } from '../theme/colors';

// Try importing react-native-maps safely
let MapView: any = null;
let Marker: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default || Maps;
  Marker = Maps.Marker;
} catch (err) {
  // Fallback to Radar canvas if react-native-maps module fails
}

const MOCK_WORKERS = [
  {
    _id: 'w1',
    name: 'Rajesh Kumar',
    skillCategory: 'Electrician',
    hourlyRate: 350,
    rating: 4.8,
    coords: [72.8805, 19.0805],
    distanceKm: 0.8
  },
  {
    _id: 'w2',
    name: 'Sunil Sharma',
    skillCategory: 'Plumber',
    hourlyRate: 300,
    rating: 4.6,
    coords: [72.885, 19.088],
    distanceKm: 1.5
  },
  {
    _id: 'w3',
    name: 'Amit Verma',
    skillCategory: 'Electrician',
    hourlyRate: 400,
    rating: 4.9,
    coords: [72.875, 19.075],
    distanceKm: 2.1
  }
];

export const MapScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { workersList } = useSelector((state: RootState) => state.worker);
  const isWorker = userInfo?.role === 'worker';

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchWorkers({}));
    }, [dispatch])
  );

  const [selectedSkill, setSelectedSkill] = useState<string>('Electrician');
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Incoming Job Modal state for Workers
  const [incomingModalVisible, setIncomingModalVisible] = useState(false);
  const [incomingJob, setIncomingJob] = useState<any | null>(null);

  const rawWorkers = (workersList && workersList.length > 0) ? workersList : MOCK_WORKERS;
  const normalizedWorkers = rawWorkers.map((w: any, idx: number) => ({
    _id: w._id || `worker_${idx}`,
    name: w.name || (w.user && w.user.name) || 'Skilled Partner',
    skillCategory: w.skillCategory || w.skill || 'Electrician',
    hourlyRate: w.hourlyRate || w.ratePerHour || w.rate || 350,
    rating: w.rating || w.ratingAvg || 4.8,
    distanceKm: w.distanceKm || 1.2,
    coords: w.coords || (w.location && w.location.coordinates) || [72.8805, 19.0805],
    raw: w
  }));
  const filteredWorkers = normalizedWorkers.filter((w: any) =>
    String(w.skillCategory).toLowerCase() === String(selectedSkill).toLowerCase()
  );

  const handleBookWorker = async (worker: any) => {
    try {
      const payload = {
        workerId: worker._id,
        skillCategory: worker.skillCategory,
        hourlyRate: worker.hourlyRate,
        hours: 2,
        scheduledDate: new Date().toISOString(),
        locationCoords: [72.88, 19.08]
      };
      const res: any = await dispatch(createBooking(payload)).unwrap();
      Alert.alert('Rapido Match Confirmed', `Booking sent to ${worker.name}. Redirecting to live tracking...`, [
        {
          text: 'Open Live Tracking',
          onPress: () => navigation.navigate('Tracking', { bookingId: res.data?._id || 'booking_demo_123' })
        }
      ]);
    } catch (err: any) {
      Alert.alert('Booking Failed', typeof err === 'string' ? err : 'Could not create booking');
    }
  };

  const handleSimulateIncomingJob = () => {
    setIncomingJob({
      _id: 'job_' + Date.now(),
      skillCategory: userInfo?.skills?.[0] || 'Electrician',
      hourlyRate: 350,
      hours: 3,
      totalPrice: 1050,
      distanceKm: 1.2,
      locationName: 'Dadar West, Mumbai'
    });
    setIncomingModalVisible(true);
  };

  const handleAcceptJob = async (jobId: string) => {
    setIncomingModalVisible(false);
    try {
      await dispatch(acceptBooking(jobId)).unwrap();
      Alert.alert('Job Accepted!', 'You are now assigned to this household.', [
        { text: 'Start GPS Tracking', onPress: () => navigation.navigate('Tracking', { bookingId: jobId }) }
      ]);
    } catch {
      // For demo fallback if mock ID doesn't exist on server
      Alert.alert('Job Accepted (Demo)', 'Navigating to live GPS tracking screen.', [
        { text: 'Start GPS Tracking', onPress: () => navigation.navigate('Tracking', { bookingId: jobId }) }
      ]);
    }
  };

  const handleRejectJob = () => {
    setIncomingModalVisible(false);
    setIncomingJob(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isWorker ? 'Worker Rapido Radar' : 'Find Nearby Workers'}
        </Text>
        {isWorker ? (
          <TouchableOpacity
            style={[styles.statusToggle, isOnline ? styles.toggleOnline : styles.toggleOffline]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <Text style={styles.toggleText}>{isOnline ? '● ONLINE' : '○ OFFLINE'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!isWorker ? (
        <View style={styles.skillBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillScroll}>
            {SKILL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.skillChip, selectedSkill === cat && styles.skillChipActive]}
                onPress={() => {
                  setSelectedSkill(cat);
                  setSelectedWorker(null);
                }}
              >
                <Text style={[styles.skillText, selectedSkill === cat && styles.skillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.mapContainer}>
        {MapView && Marker ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 19.08,
              longitude: 72.88,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03
            }}
          >
            <Marker
              coordinate={{ latitude: 19.08, longitude: 72.88 }}
              title="You are here"
              pinColor={Colors.primary}
            />
            {!isWorker &&
              filteredWorkers.map((w) => (
                <Marker
                  key={w._id}
                  coordinate={{ latitude: w.coords[1], longitude: w.coords[0] }}
                  title={w.name}
                  description={`₹${w.hourlyRate}/hr • ★${w.rating}`}
                  pinColor={Colors.secondary}
                  onPress={() => setSelectedWorker(w)}
                />
              ))}
          </MapView>
        ) : (
          <View style={styles.radarCanvas}>
            <View style={styles.radarCircle3} />
            <View style={styles.radarCircle2} />
            <View style={styles.radarCircle1} />

            <View style={styles.userPin}>
              <Text style={styles.pinIcon}>📍</Text>
              <Text style={styles.pinLabel}>You</Text>
            </View>

            {!isWorker &&
              filteredWorkers.map((w, i) => {
                const offsets = [
                  { top: 40, left: 60 },
                  { top: 180, right: 40 },
                  { bottom: 50, left: 100 }
                ];
                const pos = offsets[i % offsets.length];
                return (
                  <TouchableOpacity
                    key={w._id}
                    style={[styles.workerPin, pos]}
                    onPress={() => setSelectedWorker(w)}
                  >
                    <Text style={styles.workerPinIcon}>🛠</Text>
                    <Text style={styles.workerPinText}>{w.name.split(' ')[0]}</Text>
                    <Text style={styles.workerDistText}>{formatDistanceDisplay(w.distanceKm)}</Text>
                  </TouchableOpacity>
                );
              })}

            {isWorker ? (
              <View style={styles.workerStatusOverlay}>
                <Text style={styles.workerStatusTitle}>
                  {isOnline ? 'Broadcasting Location...' : 'You are Offline'}
                </Text>
                <Text style={styles.workerStatusSub}>
                  {isOnline
                    ? 'Listening for nearby Rapido match requests via Socket.io.'
                    : 'Toggle ONLINE above to receive incoming bookings.'}
                </Text>
                {isOnline ? (
                  <CustomButton
                    title="⚡ Simulate Incoming Job Request"
                    onPress={handleSimulateIncomingJob}
                    style={{ marginTop: Spacing.md, width: 260 }}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        )}

        {selectedWorker && !isWorker ? (
          <View style={styles.workerSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.workerName}>{selectedWorker.name}</Text>
                <Text style={styles.workerMeta}>
                  {selectedWorker.skillCategory} • ★ {selectedWorker.rating}
                </Text>
              </View>
              <Text style={styles.workerRate}>₹{selectedWorker.hourlyRate}/hr</Text>
            </View>

            <View style={styles.distRow}>
              <Text style={styles.distText}>
                Distance: {formatDistanceDisplay(selectedWorker.distanceKm)} (
                {calculateEtaMinutes(selectedWorker.distanceKm)} mins away)
              </Text>
            </View>

            <CustomButton
              title="⚡ Book via Rapido Instant Match"
              onPress={() => handleBookWorker(selectedWorker)}
              style={{ width: '100%' }}
            />
          </View>
        ) : null}
      </View>

      <RapidoIncomingModal
        visible={incomingModalVisible}
        job={incomingJob}
        onAccept={handleAcceptJob}
        onReject={handleRejectJob}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statusToggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  toggleOnline: {
    backgroundColor: '#D1FAE5',
  },
  toggleOffline: {
    backgroundColor: '#FEE2E2',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  skillBar: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  skillScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  skillText: {
    fontSize: 13,
    color: Colors.text,
  },
  skillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  radarCanvas: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#334155',
  },
  radarCircle2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#334155',
  },
  radarCircle3: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userPin: {
    alignItems: 'center',
    zIndex: 10,
  },
  pinIcon: {
    fontSize: 28,
  },
  pinLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  workerPin: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 6,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  workerPinIcon: {
    fontSize: 20,
  },
  workerPinText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  workerDistText: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '800',
  },
  workerStatusOverlay: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  workerStatusTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  workerStatusSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  workerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  workerName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  workerMeta: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  workerRate: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  distRow: {
    marginBottom: Spacing.md,
  },
  distText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
});

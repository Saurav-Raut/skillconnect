import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerFaceVerification,
  verifyCheckIn,
  verifyCheckOut
} from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { CustomButton } from '../components/CustomButton';
import { Colors, Spacing, Radius } from '../theme/colors';

// Try importing expo-camera safely
let CameraView: any = null;
let useCameraPermissions: any = null;
try {
  const ExpoCamera = require('expo-camera');
  CameraView = ExpoCamera.CameraView;
  useCameraPermissions = ExpoCamera.useCameraPermissions;
} catch (err) {
  // Fallback if camera module is not loaded
}

export const BiometricScanScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const mode = route?.params?.mode || 'register';
  const bookingId = route?.params?.bookingId;

  const { loading: workerLoading } = useSelector((state: RootState) => state.worker);
  const { loading: bookingLoading } = useSelector((state: RootState) => state.booking);
  const loading = workerLoading || bookingLoading;

  const [permission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, null];
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [statusMsg, setStatusMsg] = useState<string>('Align face within the frame');
  const [demoBanner, setDemoBanner] = useState(false);

  const handleSimulatedBiometricScan = async () => {
    setStatusMsg('AI matching face embedding...');
    setDemoBanner(true);

    const mockFaceEncoding = [0.12, 0.45, -0.22, 0.88, 0.05];

    try {
      if (mode === 'register') {
        const res = await dispatch(registerFaceVerification(mockFaceEncoding)).unwrap();
        Alert.alert('Success', 'Face verification registered successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (mode === 'check_in') {
        if (!bookingId) {
          Alert.alert('Error', 'Missing booking ID for check-in');
          return;
        }
        await dispatch(verifyCheckIn({ bookingId, scannedFaceData: mockFaceEncoding })).unwrap();
        Alert.alert('Check-In Verified', 'Worker identity confirmed via Dual Face ID. Timer started!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (mode === 'check_out') {
        if (!bookingId) {
          Alert.alert('Error', 'Missing booking ID for check-out');
          return;
        }
        await dispatch(verifyCheckOut({ bookingId, scannedFaceData: mockFaceEncoding })).unwrap();
        Alert.alert('Job Completed', 'Final face verification matched. Escrow payment released to worker!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', typeof err === 'string' ? err : 'Face match failed');
      setStatusMsg('Verification failed. Try again.');
    }
  };

  const getHeaderTitle = () => {
    if (mode === 'register') return 'Register Worker Face ID';
    if (mode === 'check_in') return 'Verify Arrival Check-In';
    return 'Verify Departure Check-Out';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getHeaderTitle()}</Text>
      </View>

      <View style={styles.container}>
        {CameraView && permission?.granted ? (
          <View style={styles.cameraBox}>
            <CameraView style={styles.camera} facing={facing}>
              <View style={styles.overlay}>
                <View style={styles.frame} />
              </View>
            </CameraView>
          </View>
        ) : (
          <View style={styles.simulatedCamera}>
            <Text style={styles.simIcon}>📸</Text>
            <Text style={styles.simTitle}>Biometric Camera Scanner</Text>
            <Text style={styles.simSub}>
              {permission && !permission.granted
                ? 'Camera permission required to scan physical face.'
                : 'Native camera simulation active for automated verification.'}
            </Text>
            {permission && !permission.granted ? (
              <CustomButton
                title="Grant Camera Access"
                onPress={requestPermission}
                style={{ marginTop: Spacing.md, width: 220 }}
              />
            ) : null}
          </View>
        )}

        {demoBanner ? (
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>Simulating AI 128-d vector distance check...</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.statusText}>{statusMsg}</Text>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            <>
              <CustomButton
                title={mode === 'register' ? 'Scan & Register Face' : 'Verify Biometric Match'}
                onPress={handleSimulatedBiometricScan}
                style={{ width: '100%' }}
              />

              <TouchableOpacity
                style={styles.demoLink}
                onPress={handleSimulatedBiometricScan}
              >
                <Text style={styles.demoLinkText}>⚡ Use Instant Simulated Biometric Match</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.dark,
  },
  backBtn: {
    marginRight: Spacing.md,
  },
  backText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  cameraBox: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: Spacing.lg,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  frame: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
  },
  simulatedCamera: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: '#334155',
  },
  simIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  simTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  simSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  demoBox: {
    backgroundColor: '#1E3A8A',
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  demoText: {
    color: '#93C5FD',
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  statusText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  demoLink: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  demoLinkText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { formatDistanceDisplay, calculateEtaMinutes } from '@skillconnect/shared';
import { Colors, Spacing, Radius } from '../theme/colors';
import { CustomButton } from './CustomButton';

interface RapidoIncomingModalProps {
  visible: boolean;
  job: any | null;
  onAccept: (jobId: string) => void;
  onReject: (jobId: string) => void;
}

export const RapidoIncomingModal: React.FC<RapidoIncomingModalProps> = ({
  visible,
  job,
  onAccept,
  onReject,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!visible || !job) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject(job._id || 'timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, job]);

  if (!visible || !job) return null;

  const distanceKm = job.distanceKm || 2.4;
  const etaMins = calculateEtaMinutes(distanceKm);
  const distanceStr = formatDistanceDisplay(distanceKm);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => onReject(job._id)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏱ {timeLeft}s to accept</Text>
          </View>

          <Text style={styles.title}>⚡ Incoming Rapido Match!</Text>
          <Text style={styles.serviceText}>{job.skillCategory || 'Service Booking'}</Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Household Location:</Text>
              <Text style={styles.infoValue}>{job.locationName || 'Near Mumbai Central'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance & ETA:</Text>
              <Text style={styles.infoValue}>{distanceStr} (~{etaMins} mins)</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Pay:</Text>
              <Text style={styles.priceValue}>₹{job.totalPrice || job.hourlyRate * (job.hours || 1)}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <CustomButton
              title="Decline"
              variant="outline"
              onPress={() => onReject(job._id)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <CustomButton
              title="Accept Now"
              variant="primary"
              onPress={() => onAccept(job._id)}
              style={{ flex: 1.5, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  timerBadge: {
    alignSelf: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  timerText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  infoBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  priceValue: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
  },
});

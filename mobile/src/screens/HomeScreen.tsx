import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { Colors, Spacing, Radius } from '../theme/colors';

export const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { bookings } = useSelector((state: RootState) => state.booking);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const isWorker = userInfo?.role === 'worker';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userInfo?.name || 'User'} 👋</Text>
          <Text style={styles.roleLabel}>
            {isWorker ? 'Worker Partner Dashboard' : 'Household Booking Dashboard'}
          </Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Dual Face Verification Safety</Text>
          <Text style={styles.bannerText}>
            Every booking is protected by Escrow locking and AI biometric face check-in/out.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionGrid}>
          {isWorker ? (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.actionIcon}>⚡</Text>
              <Text style={styles.actionTitle}>Rapido Live Matching</Text>
              <Text style={styles.actionSub}>Accept incoming jobs</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionTitle}>Find Local Workers</Text>
              <Text style={styles.actionSub}>Search nearby skills</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Bookings')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>Active Bookings</Text>
            <Text style={styles.actionSub}>{bookings?.length || 0} booking(s)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  roleLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  banner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

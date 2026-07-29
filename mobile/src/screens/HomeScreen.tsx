import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookings, fetchMe } from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';

export const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { bookings } = useSelector((state: RootState) => state.booking);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMe());
      dispatch(fetchBookings());
    }, [dispatch])
  );

  const isWorker = userInfo?.role === 'worker';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeVerified}>
              <Text style={styles.badgeVerifiedText}>● Verified Partner</Text>
            </View>
            <View style={styles.badgeEscrow}>
              <Text style={styles.badgeEscrowText}>🔒 Escrow Protected</Text>
            </View>
          </View>
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
    backgroundColor: Colors.bgMain,
  },
  scroll: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  badgeVerified: {
    backgroundColor: 'rgba(47, 158, 104, 0.2)',
    borderColor: Colors.verified,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeVerifiedText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeEscrow: {
    backgroundColor: 'rgba(244, 169, 59, 0.2)',
    borderColor: Colors.warning,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeEscrowText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
  },
  roleLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  banner: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.heading,
    color: '#A5B4FC',
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 14,
    color: Colors.textMain,
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
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
    marginBottom: 4,
  },
  actionSub: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});

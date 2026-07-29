import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookings, fundEscrow } from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { CustomButton } from '../components/CustomButton';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';

export const BookingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading } = useSelector((state: RootState) => state.booking);
  const { userInfo } = useSelector((state: RootState) => state.user);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchBookings());
    }, [dispatch])
  );

  const onRefresh = () => {
    dispatch(fetchBookings());
  };

  const handleFundEscrow = (bookingId: string) => {
    dispatch(fundEscrow(bookingId));
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'escrow_funded':
      case 'checked_in':
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'disputed':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#FEF3C7', text: '#92400E' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >
        {(!bookings || bookings.length === 0) ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySub}>
              {userInfo?.role === 'worker'
                ? 'When households book your services, they will appear here.'
                : 'Book a skilled worker from the Home or Map screen to get started.'}
            </Text>
          </View>
        ) : (
          bookings.map((item: any) => {
            const badge = getStatusBadgeStyle(item.status);
            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.skillText}>{item.skillCategory || 'Service Booking'}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.priceText}>₹{item.totalPrice || item.hourlyRate * (item.hours || 1)}</Text>
                <Text style={styles.metaText}>
                  Date: {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'Today'}
                </Text>

                <View style={styles.cardActions}>
                  {userInfo?.role === 'household' && item.status === 'pending' ? (
                    <CustomButton
                      title="Fund Escrow"
                      onPress={() => handleFundEscrow(item._id)}
                      style={{ flex: 1, height: 44, marginVertical: 0 }}
                    />
                  ) : null}

                  {(item.status === 'escrow_funded' || item.status === 'checked_in') ? (
                    <CustomButton
                      title="Biometric Scan / Track"
                      variant="outline"
                      onPress={() => navigation.navigate('Tracking', { bookingId: item._id })}
                      style={{ flex: 1, height: 44, marginVertical: 0 }}
                    />
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
  },
  scroll: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  emptyBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textMain,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  skillText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A5B4FC',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
});

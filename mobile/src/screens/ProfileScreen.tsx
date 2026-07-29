import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { logout, fetchMe } from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { CustomButton } from '../components/CustomButton';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.user);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMe());
    }, [dispatch])
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{userInfo?.name || 'SkillConnect User'}</Text>
          <Text style={styles.email}>{userInfo?.email || ''}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {(userInfo?.role || 'household').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Status</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone Verification (OTP)</Text>
            <View style={[styles.statusBadge, userInfo?.isPhoneVerified ? styles.badgeSuccess : styles.badgePending]}>
              <Text style={[styles.statusText, userInfo?.isPhoneVerified ? styles.textSuccess : styles.textPending]}>
                {userInfo?.isPhoneVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          {userInfo?.role === 'worker' ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Dual Face ID Registration</Text>
              <View style={[styles.statusBadge, userInfo?.faceEncoding ? styles.badgeSuccess : styles.badgePending]}>
                <Text style={[styles.statusText, userInfo?.faceEncoding ? styles.textSuccess : styles.textPending]}>
                  {userInfo?.faceEncoding ? 'Registered' : 'Not Registered'}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {userInfo?.role === 'worker' ? (
          <CustomButton
            title="Register / Update Face ID"
            variant="outline"
            onPress={() => navigation.navigate('BiometricScan', { mode: 'register' })}
            style={{ marginBottom: Spacing.sm }}
          />
        ) : null}

        <CustomButton
          title="Sign Out"
          variant="danger"
          onPress={handleLogout}
        />
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
  headerTitle: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.heading,
    color: '#A5B4FC',
  },
  name: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  roleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSuccess: {
    color: '#065F46',
  },
  textPending: {
    color: '#92400E',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyPhoneOtp, resendPhoneOtp } from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Colors, Spacing, Radius } from '../theme/colors';

export const OTPScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, loading, error } = useSelector((state: RootState) => state.user);

  const [otp, setOtp] = useState('');
  const [demoBanner, setDemoBanner] = useState(false);

  const handleVerify = () => {
    if (!otp) return;
    dispatch(verifyPhoneOtp({ otp }));
  };

  const handleResend = () => {
    if (userInfo?.phone) {
      dispatch(resendPhoneOtp({ phone: userInfo.phone }));
      setDemoBanner(true);
    }
  };

  const handleAutoFillDemo = () => {
    setOtp('123456');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit verification code to {userInfo?.phone || 'your phone number'}.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {demoBanner ? (
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>Demo Mode: Use code 123456 to verify instantly.</Text>
          </View>
        ) : null}

        <CustomInput
          label="Verification Code"
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <CustomButton
          title="Verify Code"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length < 4}
        />

        <TouchableOpacity style={styles.demoBtn} onPress={handleAutoFillDemo}>
          <Text style={styles.demoBtnText}>Use Demo OTP (123456)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
          <Text style={styles.resendText}>Didn't receive code? Resend SMS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  demoBox: {
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  demoText: {
    color: '#B45309',
    fontWeight: '600',
    fontSize: 14,
  },
  demoBtn: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  demoBtnText: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 15,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});

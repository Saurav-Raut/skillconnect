import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, SKILL_CATEGORIES } from '@skillconnect/shared';
import { AppDispatch, RootState } from '../redux/store';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Colors, Spacing, Radius } from '../theme/colors';

export const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'household' | 'worker'>('household');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string>('Electrician');

  const handleRegister = () => {
    if (!name || !email || !password || !phone) return;
    dispatch(registerUser({
      name,
      email,
      password,
      role,
      phone,
      skills: role === 'worker' ? [skills] : []
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join SkillConnect's verified platform</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'household' && styles.roleBtnActive]}
              onPress={() => setRole('household')}
            >
              <Text style={[styles.roleText, role === 'household' && styles.roleTextActive]}>
                Household
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'worker' && styles.roleBtnActive]}
              onPress={() => setRole('worker')}
            >
              <Text style={[styles.roleText, role === 'worker' && styles.roleTextActive]}>
                Worker
              </Text>
            </TouchableOpacity>
          </View>

          <CustomInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />

          <CustomInput
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <CustomInput
            label="Phone Number"
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <CustomInput
            label="Password"
            placeholder="Choose a strong password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {role === 'worker' ? (
            <View style={styles.skillBox}>
              <Text style={styles.skillLabel}>Select Your Primary Skill:</Text>
              <View style={styles.skillGrid}>
                {SKILL_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.skillChip, skills === cat && styles.skillChipActive]}
                    onPress={() => setSkills(cat)}
                  >
                    <Text style={[styles.skillText, skills === cat && styles.skillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={!name || !email || !password || !phone}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
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
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  roleBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  roleBtnActive: {
    backgroundColor: Colors.white,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  roleTextActive: {
    color: Colors.primary,
  },
  skillBox: {
    marginBottom: Spacing.md,
  },
  skillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});

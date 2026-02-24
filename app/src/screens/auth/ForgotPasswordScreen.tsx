import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../lib/api';
import {colors, radii, fontSize, font, spacing} from '../../lib/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await api.forgotPassword(email);
    } catch {}
    setSent(true);
    setLoading(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <View style={s.logoIcon}>
              <Text style={s.logoLetter}>d</Text>
            </View>
            <Text style={s.logoText}>drift</Text>
          </View>

          <View style={s.iconBox}>
            <Ionicons name="key-outline" size={24} color={colors.accentCyan} />
          </View>

          <Text style={s.heading}>Reset password</Text>
          <Text style={s.subtitle}>
            {sent
              ? 'If an account exists, we sent a reset code.'
              : 'Enter your email to receive a reset code.'}
          </Text>

          {!sent ? (
            <>
              <Input
                label="Email"
                placeholder="you@college.edu"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={s.input}
              />
              <Button
                title="Send reset code"
                onPress={handleSubmit}
                loading={loading}
                size="lg"
                style={s.submitBtn}
              />
            </>
          ) : (
            <Button
              title="Enter reset code"
              onPress={() => navigation.navigate('ResetPassword', {email})}
              size="lg"
              style={s.submitBtn}
            />
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={s.backBtn}>
            <Text style={s.backText}>Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgPrimary},
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 40,
  },
  logo: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 40},
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {color: '#040404', fontSize: 15, fontWeight: font.black},
  logoText: {color: colors.textPrimary, fontSize: 16, fontWeight: font.bold},
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.accentCyanMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: fontSize['3xl'],
    fontWeight: font.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    marginTop: 8,
    marginBottom: 24,
  },
  input: {marginBottom: 16},
  submitBtn: {marginTop: 8},
  backBtn: {alignSelf: 'center', marginTop: 32},
  backText: {
    color: colors.accentMint,
    fontSize: fontSize.md,
    fontWeight: font.semibold,
  },
});

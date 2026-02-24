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
import api, {ApiError} from '../../lib/api';
import {useAuth} from '../../context/auth';
import {colors, radii, fontSize, font, spacing} from '../../lib/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen({route}: Props) {
  const {refreshUser} = useAuth();
  const emailParam = route.params.email;
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await api.verifyEmail({email, code});
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await api.resendVerification(email);
    } catch {}
    setResending(false);
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
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.accentMint} />
          </View>

          <Text style={s.heading}>Verify your email</Text>
          <Text style={s.subtitle}>We sent a 6-digit code to your email</Text>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={s.input}
          />
          <Input
            label="Verification code"
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            maxLength={6}
            keyboardType="number-pad"
            containerStyle={s.input}
            style={s.codeInput}
          />

          <Button
            title="Verify"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={s.submitBtn}
          />

          <TouchableOpacity
            onPress={handleResend}
            disabled={resending}
            style={s.resendBtn}>
            <Text style={s.resendText}>
              {resending ? 'Sending...' : 'Resend code'}
            </Text>
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
    backgroundColor: colors.accentMintMuted,
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
  errorBox: {
    backgroundColor: colors.redMuted,
    borderWidth: 1,
    borderColor: colors.redBorder,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {color: colors.red, fontSize: fontSize.md},
  input: {marginBottom: 16},
  codeInput: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: font.bold,
    letterSpacing: 8,
  },
  submitBtn: {marginTop: 8},
  resendBtn: {alignSelf: 'center', marginTop: 24},
  resendText: {
    color: colors.textTertiary,
    fontSize: fontSize.md,
    fontWeight: font.medium,
  },
});

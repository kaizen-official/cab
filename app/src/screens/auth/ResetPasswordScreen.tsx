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
import {colors, radii, fontSize, font, spacing} from '../../lib/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({route, navigation}: Props) {
  const emailParam = route.params.email;
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await api.resetPassword({email, code, newPassword});
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
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

          <Text style={s.heading}>Set new password</Text>
          <Text style={s.subtitle}>
            Enter the code from your email and your new password
          </Text>

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
            label="Reset code"
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            maxLength={6}
            keyboardType="number-pad"
            containerStyle={s.input}
            style={s.codeInput}
          />
          <Input
            label="New password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            containerStyle={s.input}
          />

          <Button
            title="Reset password"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={s.submitBtn}
          />

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
  backBtn: {alignSelf: 'center', marginTop: 32},
  backText: {
    color: colors.accentMint,
    fontSize: fontSize.md,
    fontWeight: font.semibold,
  },
});

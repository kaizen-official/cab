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
import {useAuth} from '../../context/auth';
import {ApiError} from '../../lib/api';
import {colors, radii, fontSize, font, spacing} from '../../lib/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({navigation}: Props) {
  const {register} = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await register({firstName, lastName, email, password});
      navigation.navigate('VerifyEmail', {email});
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

          <Text style={s.heading}>Create an account</Text>
          <Text style={s.subtitle}>
            Join thousands of students sharing rides
          </Text>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <View style={s.nameRow}>
            <Input
              label="First name"
              placeholder="John"
              value={firstName}
              onChangeText={setFirstName}
              containerStyle={s.nameInput}
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={lastName}
              onChangeText={setLastName}
              containerStyle={s.nameInput}
            />
          </View>
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
          <Input
            label="Password"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={s.input}
          />

          <Button
            title="Create account"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={s.submitBtn}
          />

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={s.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {flex: 1},
  input: {marginBottom: 16},
  submitBtn: {marginTop: 8},
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {color: colors.textTertiary, fontSize: fontSize.md},
  footerLink: {
    color: colors.accentMint,
    fontSize: fontSize.md,
    fontWeight: font.semibold,
  },
});

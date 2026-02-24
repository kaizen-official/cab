import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api, {UserProfile, ApiError} from '../../lib/api';
import {useAuth} from '../../context/auth';
import {colors, radii, fontSize, font, spacing, glass} from '../../lib/theme';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import type {ProfileStackParamList} from '../../navigation/MainTabs';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const genderOptions = [
  {value: '', label: 'Prefer not to say'},
  {value: 'MALE', label: 'Male'},
  {value: 'FEMALE', label: 'Female'},
  {value: 'OTHER', label: 'Other'},
];

export default function ProfileScreen({navigation}: Props) {
  const {refreshUser, logout} = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    bio: '',
  });
  const [college, setCollege] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await api.getMyProfile();
        setProfile(p);
        setForm({
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone || '',
          gender: p.gender || '',
          bio: p.bio || '',
        });
        setCollege(p.college || '');
      } catch {}
      setLoading(false);
    })();
  }, []);

  function update(field: string, value: string) {
    setForm(prev => ({...prev, [field]: value}));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await api.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        bio: form.bio || undefined,
      });
      setProfile(updated);
      setMessage('Profile updated');
      refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleCollegeSave() {
    setSavingCollege(true);
    setError('');
    setMessage('');
    try {
      const updated = await api.setCollege(college);
      setProfile(updated);
      setMessage('College updated');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update');
    } finally {
      setSavingCollege(false);
    }
  }

  if (loading) {
    return <Spinner fullScreen />;
  }
  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={s.headerRow}>
            <View>
              <Text style={s.heading}>Profile</Text>
              <Text style={s.subtitle}>Manage your account details</Text>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={s.bellBtn}>
                <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Sign out', 'Are you sure?', [
                    {text: 'Cancel'},
                    {text: 'Sign out', style: 'destructive', onPress: logout},
                  ])
                }
                style={s.logoutBtn}>
                <Text style={s.logoutText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!!message && (
            <View style={s.successBox}>
              <Text style={s.successText}>{message}</Text>
            </View>
          )}
          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Avatar card */}
          <View style={s.card}>
            <View style={s.avatarRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </Text>
              </View>
              <View style={s.avatarInfo}>
                <Text style={s.profileName}>
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text style={s.profileEmail}>{profile.email}</Text>
              </View>
              <View style={s.badges}>
                {profile.emailVerified && (
                  <Badge color="mint" label="Verified" />
                )}
                {profile.collegeVerified && (
                  <Badge color="cyan" label="College" />
                )}
              </View>
            </View>
          </View>

          {/* Personal info */}
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Ionicons name="person-outline" size={14} color={colors.accentMint} />
              <Text style={s.sectionLabel}>Personal info</Text>
            </View>
            <View style={s.row}>
              <Input
                label="First name"
                value={form.firstName}
                onChangeText={v => update('firstName', v)}
                containerStyle={s.halfInput}
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChangeText={v => update('lastName', v)}
                containerStyle={s.halfInput}
              />
            </View>
            <Input
              label="Phone"
              placeholder="+91 9876543210"
              value={form.phone}
              onChangeText={v => update('phone', v)}
              keyboardType="phone-pad"
              containerStyle={s.input}
            />
            <View style={s.input}>
              <Text style={s.inputLabel}>Gender</Text>
              <View style={s.genderRow}>
                {genderOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => update('gender', opt.value)}
                    style={[
                      s.genderChip,
                      form.gender === opt.value && s.genderChipActive,
                    ]}>
                    <Text
                      style={[
                        s.genderChipText,
                        form.gender === opt.value && s.genderChipTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={s.input}>
              <Text style={s.inputLabel}>Bio</Text>
              <TextInput
                placeholder="Tell others about yourself..."
                placeholderTextColor={colors.textTertiary}
                value={form.bio}
                onChangeText={v => update('bio', v)}
                multiline
                numberOfLines={3}
                style={s.textArea}
              />
            </View>
            <Button
              title="Save changes"
              onPress={handleSave}
              loading={saving}
            />
          </View>

          {/* College */}
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Ionicons name="school-outline" size={14} color={colors.accentCyan} />
              <Text style={s.sectionLabel}>College</Text>
            </View>
            <Input
              label="College name"
              placeholder="IIT Delhi"
              value={college}
              onChangeText={setCollege}
              containerStyle={s.input}
            />
            <Button
              title="Update college"
              variant="secondary"
              onPress={handleCollegeSave}
              loading={savingCollege}
            />
          </View>

          {/* Account */}
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
              <Text style={s.sectionLabel}>Account</Text>
            </View>
            <Text style={s.accountText}>
              Member since{' '}
              <Text style={s.accountDate}>
                {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: font.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: 4,
  },
  headerActions: {flexDirection: 'row', gap: 10, alignItems: 'center'},
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.redMuted,
    borderWidth: 1,
    borderColor: colors.redBorder,
  },
  logoutText: {
    color: colors.red,
    fontSize: fontSize.sm,
    fontWeight: font.semibold,
  },
  successBox: {
    backgroundColor: colors.accentMintMuted,
    borderWidth: 1,
    borderColor: 'rgba(173,255,166,0.2)',
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12,
  },
  successText: {color: colors.accentMint, fontSize: fontSize.md, fontWeight: font.medium},
  errorBox: {
    backgroundColor: colors.redMuted,
    borderWidth: 1,
    borderColor: colors.redBorder,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {color: colors.red, fontSize: fontSize.md},
  card: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 12,
  },
  avatarRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: font.black,
  },
  avatarInfo: {flex: 1},
  profileName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: font.bold,
  },
  profileEmail: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  badges: {flexDirection: 'column', gap: 4},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  row: {flexDirection: 'row', gap: 10, marginBottom: 10},
  halfInput: {flex: 1},
  input: {marginBottom: 10},
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  genderChipActive: {
    backgroundColor: colors.accentMintMuted,
    borderColor: 'rgba(173,255,166,0.3)',
  },
  genderChipText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
  },
  genderChipTextActive: {color: colors.accentMint},
  textArea: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    color: colors.textPrimary,
    fontSize: fontSize.base,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  accountText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  accountDate: {
    color: colors.textPrimary,
    fontWeight: font.semibold,
  },
});

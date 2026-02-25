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
  Image,
  Switch,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
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

const yearOptions = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni', 'Postgraduate', 'PhD',
];

const idStatusColor: Record<string, 'gray' | 'yellow' | 'mint' | 'red'> = {
  NOT_SUBMITTED: 'gray',
  PENDING: 'yellow',
  APPROVED: 'mint',
  REJECTED: 'red',
};

export default function ProfileScreen({navigation}: Props) {
  const {refreshUser, logout} = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    bio: '',
    whatsappNumber: '',
    program: '',
    academicYear: '',
    whatsappVisible: true,
  });
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);
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
          whatsappNumber: p.whatsappNumber || '',
          program: p.program || '',
          academicYear: p.academicYear || '',
          whatsappVisible: p.whatsappVisible ?? true,
        });
        setCollege(p.college || '');
        if (p.phone && p.whatsappNumber && p.phone === p.whatsappNumber) {
          setWhatsappSameAsPhone(true);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  function update(field: string, value: string | boolean) {
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
        whatsappNumber: (whatsappSameAsPhone ? form.phone : form.whatsappNumber) || undefined,
        program: form.program || undefined,
        academicYear: form.academicYear || undefined,
        whatsappVisible: form.whatsappVisible,
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

  async function pickAndUploadAvatar() {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const data = await api.uploadAvatar(
        asset.uri,
        asset.fileName || 'avatar.jpg',
        asset.type || 'image/jpeg',
      );
      setProfile(prev => prev ? {...prev, avatarUrl: data.avatarUrl} : prev);
      setMessage('Profile picture updated');
      refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function pickAndUploadStudentId() {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploadingId(true);
    setError('');
    try {
      const data = await api.uploadStudentId(
        asset.uri,
        asset.fileName || 'student-id.jpg',
        asset.type || 'image/jpeg',
      );
      setProfile(prev =>
        prev ? {...prev, studentIdUrl: data.studentIdUrl, studentIdStatus: data.studentIdStatus} : prev,
      );
      setMessage('Student ID uploaded for verification');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload');
    } finally {
      setUploadingId(false);
    }
  }

  if (loading) return <Spinner fullScreen />;
  if (!profile) return null;

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
              <TouchableOpacity onPress={pickAndUploadAvatar} activeOpacity={0.7} disabled={uploadingAvatar}>
                <View style={s.avatarWrapper}>
                  {profile.avatarUrl ? (
                    <Image source={{uri: profile.avatarUrl}} style={s.avatarImg} />
                  ) : (
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>
                        {profile.firstName[0]}{profile.lastName[0]}
                      </Text>
                    </View>
                  )}
                  <View style={s.cameraOverlay}>
                    {uploadingAvatar ? (
                      <Ionicons name="hourglass-outline" size={12} color="#fff" />
                    ) : (
                      <Ionicons name="camera" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <View style={s.avatarInfo}>
                <Text style={s.profileName}>
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text style={s.profileEmail}>{profile.email}</Text>
              </View>
              <View style={s.badges}>
                {profile.emailVerified && <Badge color="mint" label="Verified" />}
                {profile.collegeVerified && <Badge color="cyan" label="College" />}
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
              onChangeText={v => {
                update('phone', v);
                if (whatsappSameAsPhone) update('whatsappNumber', v);
              }}
              keyboardType="phone-pad"
              containerStyle={s.input}
            />
            <View style={s.input}>
              <View style={s.whatsappLabelRow}>
                <Text style={s.inputLabel}>WhatsApp number</Text>
                <TouchableOpacity
                  onPress={() => {
                    const next = !whatsappSameAsPhone;
                    setWhatsappSameAsPhone(next);
                    if (next) update('whatsappNumber', form.phone);
                  }}
                  style={s.checkboxRow}>
                  <View style={[s.checkbox, whatsappSameAsPhone && s.checkboxActive]}>
                    {whatsappSameAsPhone && (
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    )}
                  </View>
                  <Text style={s.checkboxLabel}>Same as phone</Text>
                </TouchableOpacity>
              </View>
              <Input
                placeholder="+91 9876543210"
                value={whatsappSameAsPhone ? form.phone : form.whatsappNumber}
                onChangeText={v => update('whatsappNumber', v)}
                editable={!whatsappSameAsPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={s.input}>
              <Text style={s.inputLabel}>Gender</Text>
              <View style={s.genderRow}>
                {genderOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => update('gender', opt.value)}
                    style={[s.genderChip, form.gender === opt.value && s.genderChipActive]}>
                    <Text style={[s.genderChipText, form.gender === opt.value && s.genderChipTextActive]}>
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
            <Button title="Save changes" onPress={handleSave} loading={saving} />
          </View>

          {/* College + academic */}
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
            <View style={s.row}>
              <Input
                label="Program"
                placeholder="B.Tech CS"
                value={form.program}
                onChangeText={v => update('program', v)}
                containerStyle={s.halfInput}
              />
              <View style={s.halfInput}>
                <Text style={s.inputLabel}>Academic year</Text>
                <View style={s.genderRow}>
                  {yearOptions.map(yr => (
                    <TouchableOpacity
                      key={yr}
                      onPress={() => update('academicYear', form.academicYear === yr ? '' : yr)}
                      style={[s.genderChip, form.academicYear === yr && s.genderChipActive]}>
                      <Text style={[s.genderChipText, form.academicYear === yr && s.genderChipTextActive]}>
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <Button
              title="Update college"
              variant="secondary"
              onPress={handleCollegeSave}
              loading={savingCollege}
            />
          </View>

          {/* Student ID */}
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.accentMint} />
              <Text style={s.sectionLabel}>Student ID Verification</Text>
              {profile.studentIdStatus && profile.studentIdStatus !== 'NOT_SUBMITTED' && (
                <View style={s.badgeML}>
                  <Badge color={idStatusColor[profile.studentIdStatus] || 'gray'} label={profile.studentIdStatus} />
                </View>
              )}
            </View>
            <Text style={s.idDesc}>
              Upload your student ID card to verify your identity and build trust with other riders.
            </Text>
            {profile.studentIdUrl && (
              <Image source={{uri: profile.studentIdUrl}} style={s.idPreview} resizeMode="contain" />
            )}
            <Button
              title={profile.studentIdUrl ? 'Re-upload Student ID' : 'Upload Student ID'}
              variant="secondary"
              onPress={pickAndUploadStudentId}
              loading={uploadingId}
            />
          </View>

          {/* Settings */}
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Ionicons name="settings-outline" size={14} color={colors.textTertiary} />
              <Text style={s.sectionLabel}>Settings</Text>
            </View>
            <View style={s.settingRow}>
              <View style={s.settingText}>
                <Text style={s.settingTitle}>WhatsApp visible to riders</Text>
                <Text style={s.settingSubtitle}>Let confirmed passengers see your WhatsApp number</Text>
              </View>
              <Switch
                value={form.whatsappVisible}
                onValueChange={v => update('whatsappVisible', v)}
                trackColor={{false: colors.bgSurface, true: colors.accentMintMuted}}
                thumbColor={form.whatsappVisible ? colors.accentMint : colors.textTertiary}
              />
            </View>
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
  avatarWrapper: {position: 'relative'},
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
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: font.black,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bgPrimary,
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
  whatsappLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accentMint,
    borderColor: colors.accentMint,
  },
  checkboxLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
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
  badgeML: {marginLeft: 'auto'},
  idDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: 10,
    lineHeight: 18,
  },
  idPreview: {
    width: '100%',
    height: 180,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingText: {flex: 1, marginRight: 12},
  settingTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: font.medium,
  },
  settingSubtitle: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
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

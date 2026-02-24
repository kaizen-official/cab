import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api, {ApiError} from '../../lib/api';
import {colors, radii, fontSize, font, spacing, glass} from '../../lib/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function OfferRideScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fromCity: '',
    fromAddress: '',
    toCity: '',
    toAddress: '',
    departureDate: '',
    departureHour: '',
    departureMinute: '',
    totalSeats: '3',
    pricePerSeat: '',
    vehicle: '',
    vehicleNumber: '',
    notes: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({...prev, [field]: value}));
  }

  async function handleSubmit() {
    if (!form.fromCity || !form.toCity || !form.fromAddress || !form.toAddress) {
      setError('Please fill in all route fields');
      return;
    }
    if (!form.departureDate || !form.departureHour) {
      setError('Please set departure date and time');
      return;
    }
    if (!form.pricePerSeat) {
      setError('Please set a price per seat');
      return;
    }

    setError('');
    setLoading(true);

    const dt = new Date(
      `${form.departureDate}T${(form.departureHour || '00').padStart(2, '0')}:${(form.departureMinute || '00').padStart(2, '0')}:00`,
    );

    try {
      await api.createRide({
        fromCity: form.fromCity,
        fromAddress: form.fromAddress,
        toCity: form.toCity,
        toAddress: form.toAddress,
        departureTime: dt.toISOString(),
        totalSeats: parseInt(form.totalSeats, 10),
        pricePerSeat: parseInt(form.pricePerSeat, 10),
        vehicle: form.vehicle || undefined,
        vehicleNumber: form.vehicleNumber || undefined,
        notes: form.notes || undefined,
      });
      Alert.alert('Success', 'Your ride has been published!');
      setForm({
        fromCity: '',
        fromAddress: '',
        toCity: '',
        toAddress: '',
        departureDate: '',
        departureHour: '',
        departureMinute: '',
        totalSeats: '3',
        pricePerSeat: '',
        vehicle: '',
        vehicleNumber: '',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled">
          <Text style={s.heading}>Offer a ride</Text>
          <Text style={s.subtitle}>Share your trip and split the cost</Text>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="navigate-outline" size={14} color={colors.accentMint} />
              <Text style={s.sectionLabel}>Route</Text>
            </View>
            <View style={s.row}>
              <Input
                label="From city"
                placeholder="Delhi"
                value={form.fromCity}
                onChangeText={v => update('fromCity', v)}
                containerStyle={s.halfInput}
              />
              <Input
                label="To city"
                placeholder="Jaipur"
                value={form.toCity}
                onChangeText={v => update('toCity', v)}
                containerStyle={s.halfInput}
              />
            </View>
            <Input
              label="Pickup address"
              placeholder="IIT Delhi Main Gate"
              value={form.fromAddress}
              onChangeText={v => update('fromAddress', v)}
              containerStyle={s.input}
            />
            <Input
              label="Drop address"
              placeholder="Jaipur Railway Station"
              value={form.toAddress}
              onChangeText={v => update('toAddress', v)}
              containerStyle={s.input}
            />
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="time-outline" size={14} color={colors.accentCyan} />
              <Text style={s.sectionLabel}>Details</Text>
            </View>
            <Input
              label="Departure date (YYYY-MM-DD)"
              placeholder="2026-03-15"
              value={form.departureDate}
              onChangeText={v => update('departureDate', v)}
              containerStyle={s.input}
            />
            <View style={s.row}>
              <Input
                label="Hour (0-23)"
                placeholder="14"
                value={form.departureHour}
                onChangeText={v => update('departureHour', v)}
                keyboardType="number-pad"
                maxLength={2}
                containerStyle={s.halfInput}
              />
              <Input
                label="Minute (0-59)"
                placeholder="30"
                value={form.departureMinute}
                onChangeText={v => update('departureMinute', v)}
                keyboardType="number-pad"
                maxLength={2}
                containerStyle={s.halfInput}
              />
            </View>
            <View style={s.row}>
              <Input
                label="Seats"
                value={form.totalSeats}
                onChangeText={v => update('totalSeats', v)}
                keyboardType="number-pad"
                containerStyle={s.halfInput}
              />
              <Input
                label="Price per seat (₹)"
                placeholder="150"
                value={form.pricePerSeat}
                onChangeText={v => update('pricePerSeat', v)}
                keyboardType="number-pad"
                containerStyle={s.halfInput}
              />
            </View>
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="car-outline" size={14} color={colors.textTertiary} />
              <Text style={s.sectionLabel}>Optional</Text>
            </View>
            <View style={s.row}>
              <Input
                label="Vehicle"
                placeholder="Swift Dzire"
                value={form.vehicle}
                onChangeText={v => update('vehicle', v)}
                containerStyle={s.halfInput}
              />
              <Input
                label="Vehicle number"
                placeholder="DL 01 AB 1234"
                value={form.vehicleNumber}
                onChangeText={v => update('vehicleNumber', v)}
                containerStyle={s.halfInput}
              />
            </View>
            <View style={s.input}>
              <Text style={s.inputLabel}>Notes</Text>
              <TextInput
                placeholder="AC cab, luggage space available..."
                placeholderTextColor={colors.textTertiary}
                value={form.notes}
                onChangeText={v => update('notes', v)}
                multiline
                numberOfLines={3}
                style={s.textArea}
              />
            </View>
          </View>

          <Button
            title="Publish ride"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={s.submitBtn}
          />
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
    marginBottom: 20,
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
  section: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  row: {flexDirection: 'row', gap: 10},
  halfInput: {flex: 1},
  input: {marginBottom: 0},
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
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
  submitBtn: {marginTop: 12},
});

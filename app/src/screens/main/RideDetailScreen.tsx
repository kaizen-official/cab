import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api, {RideDetail, ApiError} from '../../lib/api';
import {useAuth} from '../../context/auth';
import {colors, radii, fontSize, font, spacing, glass} from '../../lib/theme';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Props = NativeStackScreenProps<any, 'RideDetail'>;

const statusBadgeColor: Record<string, 'mint' | 'yellow' | 'cyan' | 'gray' | 'red'> = {
  ACTIVE: 'mint',
  FULL: 'yellow',
  DEPARTED: 'cyan',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  PENDING: 'yellow',
  CONFIRMED: 'mint',
  REJECTED: 'red',
};

function formatTime(dt: string) {
  return new Date(dt).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RideDetailScreen({route, navigation}: Props) {
  const {rideId} = route.params as {rideId: string};
  const {user} = useAuth();
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [bookingSeats, setBookingSeats] = useState('1');
  const [bookingMessage, setBookingMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRide = useCallback(async () => {
    try {
      const data = await api.getRide(rideId);
      setRide(data);
    } catch {
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [rideId, navigation]);

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  if (loading || !ride) {
    return <Spinner fullScreen />;
  }

  const isOwner = user?.id === ride.creator.id;
  const myBooking = ride.bookings.find(b => b.passenger.id === user?.id);
  const hasActiveBooking =
    myBooking &&
    (myBooking.status === 'PENDING' || myBooking.status === 'CONFIRMED');

  async function handleAction(action: string, actionId?: string) {
    if (!ride) {
      return;
    }
    setActionLoading(action);
    setError('');
    try {
      switch (action) {
        case 'book':
          await api.requestBooking({
            rideId: ride.id,
            seatsBooked: parseInt(bookingSeats, 10),
            message: bookingMessage || undefined,
          });
          break;
        case 'cancel-ride':
          await api.cancelRide(ride.id);
          break;
        case 'depart':
          await api.departRide(ride.id);
          break;
        case 'complete':
          await api.completeRide(ride.id);
          break;
        case 'confirm':
          await api.confirmBooking(actionId!);
          break;
        case 'reject':
          await api.rejectBooking(actionId!);
          break;
        case 'cancel-booking':
          await api.cancelBooking(actionId!);
          break;
      }
      await fetchRide();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed');
    } finally {
      setActionLoading('');
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <View style={s.backRow}>
            <Ionicons name="chevron-back" size={16} color={colors.textTertiary} />
            <Text style={s.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <View style={s.titleRow}>
          <View style={s.titleLeft}>
            <Text style={s.heading}>
              {ride.fromCity} → {ride.toCity}
            </Text>
            <Text style={s.departTime}>{formatTime(ride.departureTime)}</Text>
          </View>
          <Badge color={statusBadgeColor[ride.status] || 'gray'} label={ride.status} />
        </View>

        {!!error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Route card */}
        <View style={s.card}>
          <View style={s.routeRow}>
            <View style={[s.routeIcon, {backgroundColor: colors.accentMintMuted}]}>
              <Ionicons name="navigate" size={14} color={colors.accentMint} />
            </View>
            <View>
              <Text style={s.routeCity}>{ride.fromCity}</Text>
              <Text style={s.routeAddr}>{ride.fromAddress}</Text>
            </View>
          </View>
          <View style={s.routeDash} />
          <View style={s.routeRow}>
            <View style={[s.routeIcon, {backgroundColor: colors.accentCyanMuted}]}>
              <Ionicons name="location" size={14} color={colors.accentCyan} />
            </View>
            <View>
              <Text style={s.routeCity}>{ride.toCity}</Text>
              <Text style={s.routeAddr}>{ride.toAddress}</Text>
            </View>
          </View>

          <View style={s.detailGrid}>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Departure</Text>
              <Text style={s.detailValue}>{formatTime(ride.departureTime)}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Seats</Text>
              <Text style={s.detailValue}>
                {ride.availableSeats}/{ride.totalSeats}
              </Text>
            </View>
            {ride.vehicle && (
              <View style={s.detailItem}>
                <Text style={s.detailLabel}>Vehicle</Text>
                <Text style={s.detailValue}>{ride.vehicle}</Text>
              </View>
            )}
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Price</Text>
              <Text style={[s.detailValue, {color: colors.accentMint}]}>
                ₹{ride.pricePerSeat}/seat
              </Text>
            </View>
          </View>

          {ride.notes && (
            <View style={s.notesBox}>
              <View style={s.notesHeader}>
                <Ionicons name="document-text-outline" size={12} color={colors.textTertiary} />
                <Text style={s.notesLabel}>Notes</Text>
              </View>
              <Text style={s.notesText}>{ride.notes}</Text>
            </View>
          )}
        </View>

        {/* Passengers */}
        {ride.bookings.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Passengers</Text>
            {ride.bookings.map(b => (
              <View key={b.id} style={s.passengerRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {b.passenger.firstName[0]}
                    {b.passenger.lastName[0]}
                  </Text>
                </View>
                <View style={s.passengerInfo}>
                  <Text style={s.passengerName}>
                    {b.passenger.firstName} {b.passenger.lastName}
                  </Text>
                  <Text style={s.passengerMeta}>
                    {b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''}
                    {b.passenger.college ? ` · ${b.passenger.college}` : ''}
                  </Text>
                </View>
                <View style={s.passengerActions}>
                  <Badge
                    color={statusBadgeColor[b.status] || 'gray'}
                    label={b.status}
                  />
                  {isOwner && b.status === 'PENDING' && (
                    <View style={s.actionBtns}>
                      <Button
                        title="Accept"
                        size="sm"
                        loading={actionLoading === 'confirm'}
                        onPress={() => handleAction('confirm', b.id)}
                      />
                      <Button
                        title="Reject"
                        variant="ghost"
                        size="sm"
                        loading={actionLoading === 'reject'}
                        onPress={() => handleAction('reject', b.id)}
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Driver card */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Driver</Text>
          <View style={s.driverRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {ride.creator.firstName[0]}
                {ride.creator.lastName[0]}
              </Text>
            </View>
            <View>
              <Text style={s.driverName}>
                {ride.creator.firstName} {ride.creator.lastName}
              </Text>
              <Text style={s.driverCollege}>
                {ride.creator.college || 'No college'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {isOwner ? (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Manage ride</Text>
            {(ride.status === 'ACTIVE' || ride.status === 'FULL') && (
              <Button
                title="Mark as departed"
                variant="secondary"
                onPress={() => handleAction('depart')}
                loading={actionLoading === 'depart'}
                style={s.actionBtn}
              />
            )}
            {ride.status === 'ACTIVE' && (
              <Button
                title="Cancel ride"
                variant="danger"
                onPress={() =>
                  Alert.alert('Cancel ride', 'Are you sure?', [
                    {text: 'No'},
                    {text: 'Yes', onPress: () => handleAction('cancel-ride')},
                  ])
                }
                loading={actionLoading === 'cancel-ride'}
                style={s.actionBtn}
              />
            )}
            {ride.status === 'DEPARTED' && (
              <Button
                title="Mark as completed"
                onPress={() => handleAction('complete')}
                loading={actionLoading === 'complete'}
                style={s.actionBtn}
              />
            )}
            {(ride.status === 'COMPLETED' || ride.status === 'CANCELLED') && (
              <Text style={s.finishedText}>
                This ride is {ride.status.toLowerCase()}.
              </Text>
            )}
          </View>
        ) : ride.status === 'ACTIVE' && !hasActiveBooking ? (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Book this ride</Text>
            <Input
              label="Seats"
              value={bookingSeats}
              onChangeText={setBookingSeats}
              keyboardType="number-pad"
              containerStyle={s.bookInput}
            />
            <View style={s.bookInput}>
              <Text style={s.inputLabel}>Message (optional)</Text>
              <TextInput
                placeholder="Hi, I'd like to join..."
                placeholderTextColor={colors.textTertiary}
                value={bookingMessage}
                onChangeText={setBookingMessage}
                multiline
                style={s.textArea}
              />
            </View>
            <Text style={s.totalText}>
              Total:{' '}
              <Text style={s.totalAmount}>
                ₹{ride.pricePerSeat * parseInt(bookingSeats || '1', 10)}
              </Text>
            </Text>
            <Button
              title="Request booking"
              size="lg"
              onPress={() => handleAction('book')}
              loading={actionLoading === 'book'}
              style={s.actionBtn}
            />
          </View>
        ) : hasActiveBooking ? (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Your booking</Text>
            <View style={s.bookingInfoRow}>
              <Text style={s.bookingSeatsText}>
                {myBooking!.seatsBooked} seat{myBooking!.seatsBooked > 1 ? 's' : ''}
              </Text>
              <Badge
                color={statusBadgeColor[myBooking!.status] || 'gray'}
                label={myBooking!.status}
              />
            </View>
            {(myBooking!.status === 'PENDING' ||
              myBooking!.status === 'CONFIRMED') && (
              <Button
                title="Cancel booking"
                variant="danger"
                onPress={() => handleAction('cancel-booking', myBooking!.id)}
                loading={actionLoading === 'cancel-booking'}
                style={s.actionBtn}
              />
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgPrimary},
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  backBtn: {marginBottom: 12},
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleLeft: {flex: 1},
  heading: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: font.black,
    letterSpacing: -0.5,
  },
  departTime: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: font.medium,
    marginTop: 4,
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
  card: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: font.bold,
    marginBottom: 12,
  },
  routeRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  routeIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  routeCity: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: font.bold,
  },
  routeAddr: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  routeDash: {
    width: 2,
    height: 24,
    backgroundColor: colors.borderSubtle,
    marginLeft: 15,
    marginVertical: 4,
    borderStyle: 'dashed',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  detailItem: {},
  detailLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: font.semibold,
    marginTop: 2,
  },
  notesBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  notesLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 8,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: font.bold,
  },
  passengerInfo: {flex: 1},
  passengerName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: font.semibold,
  },
  passengerMeta: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  passengerActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  actionBtns: {flexDirection: 'row', gap: 6},
  sectionLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  driverRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  driverName: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: font.bold,
  },
  driverCollege: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  actionBtn: {marginTop: 8},
  finishedText: {
    color: colors.textTertiary,
    fontSize: fontSize.md,
  },
  bookInput: {marginBottom: 10},
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  totalText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: 4,
  },
  totalAmount: {
    color: colors.accentMint,
    fontWeight: font.black,
    fontSize: fontSize.lg,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingSeatsText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: font.medium,
  },
});

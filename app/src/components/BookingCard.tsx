import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radii, fontSize, font, spacing, glass} from '../lib/theme';
import Badge from './ui/Badge';
import Button from './ui/Button';
import type {Booking} from '../lib/api';

type Props = {
  booking: Booking;
  onPress: () => void;
  onCancel?: () => void;
  cancelLoading?: boolean;
};

const statusBadgeColor: Record<string, 'mint' | 'yellow' | 'cyan' | 'gray' | 'red'> = {
  PENDING: 'yellow',
  CONFIRMED: 'mint',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  REJECTED: 'red',
};

function formatTime(dt: string) {
  return new Date(dt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingCard({
  booking,
  onPress,
  onCancel,
  cancelLoading,
}: Props) {
  const canCancel =
    onCancel &&
    (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

  return (
    <View style={s.card}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View style={s.routeRow}>
          <View style={[s.dot, {backgroundColor: colors.accentMint}]} />
          <Text style={s.cityText}>{booking.ride.fromCity}</Text>
          <Text style={s.toText}>to</Text>
          <View style={[s.dot, {backgroundColor: colors.accentCyan}]} />
          <Text style={s.cityText}>{booking.ride.toCity}</Text>
        </View>
        <View style={s.metaRow}>
        <View style={s.metaItem}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={s.meta}>{formatTime(booking.ride.departureTime)}</Text>
        </View>
          <Text style={s.meta}>
            {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}
          </Text>
          <Text style={s.price}>
            ₹{booking.ride.pricePerSeat * booking.seatsBooked}
          </Text>
        </View>
        <Text style={s.driverText}>
          Driver: {booking.ride.creator.firstName} {booking.ride.creator.lastName}
        </Text>
      </TouchableOpacity>
      <View style={s.actions}>
        <Badge
          color={statusBadgeColor[booking.status] || 'gray'}
          label={booking.status}
        />
        {canCancel && (
          <Button
            title="Cancel"
            variant="ghost"
            size="sm"
            loading={cancelLoading}
            onPress={onCancel!}
          />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {width: 8, height: 8, borderRadius: 4},
  cityText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: font.bold,
  },
  toText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
  },
  price: {
    color: colors.accentMint,
    fontSize: fontSize.base,
    fontWeight: font.black,
  },
  driverText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});

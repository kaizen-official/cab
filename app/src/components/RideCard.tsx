import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radii, fontSize, font, spacing, glass} from '../lib/theme';
import Badge from './ui/Badge';
import type {Ride} from '../lib/api';

type Props = {
  ride: Ride;
  onPress: () => void;
};

const statusBadgeColor: Record<string, 'mint' | 'yellow' | 'cyan' | 'gray' | 'red'> = {
  ACTIVE: 'mint',
  FULL: 'yellow',
  DEPARTED: 'cyan',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

function formatTime(dt: string) {
  const d = new Date(dt);
  return (
    d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}) +
    ', ' +
    d.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})
  );
}

export default function RideCard({ride, onPress}: Props) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8} onPress={onPress}>
      <View style={s.top}>
        <View style={s.routeCol}>
          <View style={s.cityRow}>
            <View style={[s.dot, {backgroundColor: colors.accentMint}]} />
            <Text style={s.cityText}>{ride.fromCity}</Text>
          </View>
          <View style={s.cityRow}>
            <View style={[s.dot, {backgroundColor: colors.accentCyan}]} />
            <Text style={s.cityText}>{ride.toCity}</Text>
          </View>
        </View>
        <View style={s.priceCol}>
          <Text style={s.price}>₹{ride.pricePerSeat}</Text>
          <Text style={s.perSeat}>per seat</Text>
        </View>
      </View>
      <View style={s.bottom}>
        <View style={s.metaItem}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={s.meta}>{formatTime(ride.departureTime)}</Text>
        </View>
        <View style={s.metaItem}>
          <Ionicons name="person-outline" size={12} color={colors.textTertiary} />
          <Text style={s.meta}>{ride.creator.firstName}</Text>
        </View>
        <View style={s.right}>
          <Badge color={statusBadgeColor[ride.status] || 'gray'} label={ride.status} />
          <Text style={s.seats}>{ride.availableSeats} left</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeCol: {flex: 1, gap: 6},
  cityRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dot: {width: 8, height: 8, borderRadius: 4},
  cityText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: font.semibold,
  },
  priceCol: {alignItems: 'flex-end'},
  price: {
    color: colors.accentMint,
    fontSize: fontSize['2xl'],
    fontWeight: font.black,
    letterSpacing: -0.5,
  },
  perSeat: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  seats: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.semibold,
  },
});

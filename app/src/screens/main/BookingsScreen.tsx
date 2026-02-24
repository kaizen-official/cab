import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api, {Booking, PaginatedResponse} from '../../lib/api';
import {colors, radii, fontSize, font, spacing, glass} from '../../lib/theme';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Empty from '../../components/ui/Empty';
import Button from '../../components/ui/Button';
import type {BookingsStackParamList} from '../../navigation/MainTabs';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingsList'>;

const statusOptions = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'];
const statusLabels: Record<string, string> = {
  '': 'All',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Done',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
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

export default function BookingsScreen({navigation}: Props) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchBookings = useCallback(
    async (p = 1, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await api.getMyBookings({
          status: status || undefined,
          page: p,
          limit: 10,
        });
        setResult(data);
        setPage(p);
      } catch {}
      setLoading(false);
      setRefreshing(false);
    },
    [status],
  );

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  async function cancelBooking(id: string) {
    setActionLoading(id);
    try {
      await api.cancelBooking(id);
      await fetchBookings(page);
    } catch {}
    setActionLoading('');
  }

  const renderBooking = ({item}: {item: Booking}) => (
    <View style={s.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RideDetail', {rideId: item.ride.id})}
        style={s.cardContent}>
        <View style={s.routeRow}>
          <View style={[s.dot, {backgroundColor: colors.accentMint}]} />
          <Text style={s.cityText}>{item.ride.fromCity}</Text>
          <Text style={s.toText}>to</Text>
          <View style={[s.dot, {backgroundColor: colors.accentCyan}]} />
          <Text style={s.cityText}>{item.ride.toCity}</Text>
        </View>
        <View style={s.metaRow}>
          <View style={s.metaItem}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={s.meta}>{formatTime(item.ride.departureTime)}</Text>
        </View>
          <Text style={s.meta}>
            {item.seatsBooked} seat{item.seatsBooked > 1 ? 's' : ''}
          </Text>
          <Text style={s.price}>
            ₹{item.ride.pricePerSeat * item.seatsBooked}
          </Text>
        </View>
        <Text style={s.driverText}>
          Driver: {item.ride.creator.firstName} {item.ride.creator.lastName}
        </Text>
      </TouchableOpacity>
      <View style={s.cardActions}>
        <Badge
          color={statusBadgeColor[item.status] || 'gray'}
          label={item.status}
        />
        {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
          <Button
            title="Cancel"
            variant="ghost"
            size="sm"
            loading={actionLoading === item.id}
            onPress={() => cancelBooking(item.id)}
          />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.heading}>My bookings</Text>
        <Text style={s.subtitle}>Rides you've joined or requested</Text>
      </View>

      <View style={s.filterRow}>
        {statusOptions.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => setStatus(opt)}
            style={[s.chip, status === opt && s.chipActive]}>
            <Text style={[s.chipText, status === opt && s.chipTextActive]}>
              {statusLabels[opt]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <Spinner />
      ) : !result || result.items.length === 0 ? (
        <Empty
          title="No bookings yet"
          message="Search for rides and request a booking."
        />
      ) : (
        <FlatList
          data={result.items}
          renderItem={renderBooking}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBookings(1, true)}
              tintColor={colors.accentMint}
            />
          }
          ListFooterComponent={
            result.pagination.totalPages > 1 ? (
              <View style={s.paginationRow}>
                <Button
                  title="← Prev"
                  variant="ghost"
                  size="sm"
                  disabled={!result.pagination.hasPrev}
                  onPress={() => fetchBookings(page - 1)}
                />
                <Text style={s.pageText}>
                  {page} / {result.pagination.totalPages}
                </Text>
                <Button
                  title="Next →"
                  variant="ghost"
                  size="sm"
                  disabled={!result.pagination.hasNext}
                  onPress={() => fetchBookings(page + 1)}
                />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgPrimary},
  header: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 8},
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: colors.accentMintMuted,
    borderColor: 'rgba(173,255,166,0.3)',
  },
  chipText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.semibold,
  },
  chipTextActive: {color: colors.accentMint},
  list: {paddingHorizontal: spacing.lg, paddingBottom: 100},
  card: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 10,
  },
  cardContent: {},
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  pageText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
  },
});

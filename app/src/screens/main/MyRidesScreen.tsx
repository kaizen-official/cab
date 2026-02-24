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
import api, {Ride, PaginatedResponse} from '../../lib/api';
import {colors, radii, fontSize, font, spacing, glass} from '../../lib/theme';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Empty from '../../components/ui/Empty';
import Button from '../../components/ui/Button';
import type {RidesStackParamList} from '../../navigation/MainTabs';

type Props = NativeStackScreenProps<RidesStackParamList, 'MyRidesList'>;

const statusOptions = ['', 'ACTIVE', 'FULL', 'DEPARTED', 'COMPLETED', 'CANCELLED'];
const statusLabels: Record<string, string> = {
  '': 'All',
  ACTIVE: 'Active',
  FULL: 'Full',
  DEPARTED: 'Departed',
  COMPLETED: 'Done',
  CANCELLED: 'Cancelled',
};
const statusBadgeColor: Record<string, 'mint' | 'yellow' | 'cyan' | 'gray' | 'red'> = {
  ACTIVE: 'mint',
  FULL: 'yellow',
  DEPARTED: 'cyan',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

function formatTime(dt: string) {
  return new Date(dt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyRidesScreen({navigation}: Props) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Ride> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = useCallback(
    async (p = 1, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await api.getMyRides({
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
    fetchRides(1);
  }, [fetchRides]);

  const renderRide = ({item}: {item: Ride}) => (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('RideDetail', {rideId: item.id})}>
      <View style={s.cardMain}>
        <View style={s.cardInfo}>
          <Text style={s.routeText} numberOfLines={1}>
            {item.fromCity} → {item.toCity}
          </Text>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
              <Text style={s.meta}>{formatTime(item.departureTime)}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="people-outline" size={12} color={colors.textTertiary} />
              <Text style={s.meta}>
                {item.availableSeats}/{item.totalSeats}
              </Text>
            </View>
          </View>
        </View>
        <View style={s.cardRight}>
          <Text style={s.price}>₹{item.pricePerSeat}</Text>
          <Badge color={statusBadgeColor[item.status] || 'gray'} label={item.status} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.heading}>My rides</Text>
        <Text style={s.subtitle}>Rides you've created</Text>
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
          title="No rides yet"
          message="Create your first ride to start sharing."
        />
      ) : (
        <FlatList
          data={result.items}
          renderItem={renderRide}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRides(1, true)}
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
                  onPress={() => fetchRides(page - 1)}
                />
                <Text style={s.pageText}>
                  {page} / {result.pagination.totalPages}
                </Text>
                <Button
                  title="Next →"
                  variant="ghost"
                  size="sm"
                  disabled={!result.pagination.hasNext}
                  onPress={() => fetchRides(page + 1)}
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
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardInfo: {flex: 1},
  routeText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: font.bold,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
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
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  price: {
    color: colors.accentMint,
    fontSize: fontSize.lg,
    fontWeight: font.black,
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

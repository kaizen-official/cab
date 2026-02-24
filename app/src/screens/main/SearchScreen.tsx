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
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Empty from '../../components/ui/Empty';
import Button from '../../components/ui/Button';
import type {SearchStackParamList} from '../../navigation/MainTabs';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchList'>;

const statusBadgeColor: Record<string, 'mint' | 'yellow' | 'cyan' | 'gray' | 'red'> = {
  ACTIVE: 'mint',
  FULL: 'yellow',
  DEPARTED: 'cyan',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

const sortOptions = [
  {value: 'departure_asc', label: 'Soonest'},
  {value: 'departure_desc', label: 'Latest'},
  {value: 'price_asc', label: 'Cheapest'},
  {value: 'price_desc', label: 'Priciest'},
  {value: 'newest', label: 'Newest'},
];

function formatTime(dt: string) {
  const d = new Date(dt);
  return (
    d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}) +
    ', ' +
    d.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})
  );
}

export default function SearchScreen({navigation}: Props) {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [sortBy, setSortBy] = useState('departure_asc');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Ride> | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const search = useCallback(
    async (p = 1, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await api.searchRides({
          fromCity: fromCity || undefined,
          toCity: toCity || undefined,
          sortBy,
          page: String(p),
          limit: '12',
        });
        setResult(data);
        setPage(p);
      } catch {}
      setLoading(false);
      setRefreshing(false);
    },
    [fromCity, toCity, sortBy],
  );

  useEffect(() => {
    search(1);
  }, [search]);

  const renderRide = ({item}: {item: Ride}) => (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('RideDetail', {rideId: item.id})}>
      <View style={s.cardTop}>
        <View style={s.routeCol}>
          <View style={s.cityRow}>
            <View style={[s.dot, {backgroundColor: colors.accentMint}]} />
            <Text style={s.cityText}>{item.fromCity}</Text>
          </View>
          <View style={s.cityRow}>
            <View style={[s.dot, {backgroundColor: colors.accentCyan}]} />
            <Text style={s.cityText}>{item.toCity}</Text>
          </View>
        </View>
        <View style={s.priceCol}>
          <Text style={s.price}>₹{item.pricePerSeat}</Text>
          <Text style={s.perSeat}>per seat</Text>
        </View>
      </View>
      <View style={s.cardBottom}>
        <View style={s.metaItem}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={s.meta}>{formatTime(item.departureTime)}</Text>
        </View>
        <View style={s.metaItem}>
          <Ionicons name="person-outline" size={12} color={colors.textTertiary} />
          <Text style={s.meta}>{item.creator.firstName}</Text>
        </View>
        <View style={s.cardRight}>
          <Badge color={statusBadgeColor[item.status] || 'gray'} label={item.status} />
          <Text style={s.seatsLeft}>{item.availableSeats} left</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const sortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Sort';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.heading}>Search rides</Text>
        <Text style={s.subtitle}>Find students heading your way</Text>
      </View>

      {showFilters && (
        <View style={s.filterBox}>
          <Input
            placeholder="From city"
            value={fromCity}
            onChangeText={setFromCity}
            containerStyle={s.filterInput}
          />
          <Input
            placeholder="To city"
            value={toCity}
            onChangeText={setToCity}
            containerStyle={s.filterInput}
          />
          <View style={s.sortRow}>
            {sortOptions.map(o => (
              <TouchableOpacity
                key={o.value}
                onPress={() => setSortBy(o.value)}
                style={[s.sortChip, sortBy === o.value && s.sortChipActive]}>
                <Text
                  style={[
                    s.sortChipText,
                    sortBy === o.value && s.sortChipTextActive,
                  ]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Search" onPress={() => search(1)} size="sm" />
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowFilters(!showFilters)}
        style={s.toggleBtn}>
        <Text style={s.toggleText}>
          {showFilters ? 'Hide filters' : 'Show filters'}
        </Text>
      </TouchableOpacity>

      {loading && !refreshing ? (
        <Spinner />
      ) : !result || result.items.length === 0 ? (
        <Empty
          title="No rides found"
          message="Try adjusting your filters or check back later."
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
              onRefresh={() => search(1, true)}
              tintColor={colors.accentMint}
            />
          }
          ListHeaderComponent={
            <Text style={s.countText}>
              {result.pagination.total} ride
              {result.pagination.total !== 1 ? 's' : ''} found
            </Text>
          }
          ListFooterComponent={
            result.pagination.totalPages > 1 ? (
              <View style={s.paginationRow}>
                <Button
                  title="← Prev"
                  variant="ghost"
                  size="sm"
                  disabled={!result.pagination.hasPrev}
                  onPress={() => search(page - 1)}
                />
                <Text style={s.pageText}>
                  {page} / {result.pagination.totalPages}
                </Text>
                <Button
                  title="Next →"
                  variant="ghost"
                  size="sm"
                  disabled={!result.pagination.hasNext}
                  onPress={() => search(page + 1)}
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
  filterBox: {
    ...glass,
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: 10,
  },
  filterInput: {},
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sortChipActive: {
    backgroundColor: colors.accentMintMuted,
    borderColor: 'rgba(173,255,166,0.3)',
  },
  sortChipText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.semibold,
  },
  sortChipTextActive: {
    color: colors.accentMint,
  },
  toggleBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.medium,
  },
  list: {paddingHorizontal: spacing.lg, paddingBottom: 100},
  countText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.medium,
    marginBottom: 8,
  },
  card: {
    ...glass,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: 10,
  },
  cardTop: {
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
  cardBottom: {
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
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  seatsLeft: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.semibold,
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

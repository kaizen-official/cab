import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api, {Notification, PaginatedResponse} from '../../lib/api';
import {colors, radii, fontSize, font, spacing, glass} from '../../lib/theme';
import Spinner from '../../components/ui/Spinner';
import Empty from '../../components/ui/Empty';
import Button from '../../components/ui/Button';

const typeIcon: Record<string, string> = {
  BOOKING_REQUEST: 'ticket-outline',
  BOOKING_CONFIRMED: 'checkmark-circle-outline',
  BOOKING_REJECTED: 'information-circle-outline',
  BOOKING_CANCELLED: 'information-circle-outline',
  RIDE_CANCELLED: 'car-outline',
  RIDE_REMINDER: 'notifications-outline',
  REVIEW_RECEIVED: 'star-outline',
  SYSTEM: 'information-circle-outline',
};

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsScreen({navigation}: any) {
  const [result, setResult] = useState<
    (PaginatedResponse<Notification> & {unreadCount: number}) | null
  >(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(
    async (p = 1, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await api.getNotifications({page: p});
        setResult(data);
        setPage(p);
      } catch {}
      setLoading(false);
      setRefreshing(false);
    },
    [],
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  async function markRead(id: string) {
    try {
      await api.markNotificationRead(id);
      await fetchNotifications(page);
    } catch {}
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications(page);
    } catch {}
    setMarkingAll(false);
  }

  const renderNotification = ({item}: {item: Notification}) => (
    <TouchableOpacity
      style={[s.notifCard, !item.read && s.notifUnread]}
      activeOpacity={0.8}
      onPress={() => !item.read && markRead(item.id)}>
      <View
        style={[
          s.notifIcon,
          {backgroundColor: item.read ? 'rgba(255,255,255,0.03)' : colors.accentMintMuted},
        ]}>
        <Ionicons
          name={typeIcon[item.type] || 'notifications-outline'}
          size={16}
          color={item.read ? colors.textTertiary : colors.accentMint}
        />
      </View>
      <View style={s.notifBody}>
        <Text style={s.notifTitle}>{item.title}</Text>
        <Text style={s.notifText} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={s.notifTime}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={s.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <View style={s.backRow}>
            <Ionicons name="chevron-back" size={16} color={colors.textTertiary} />
            <Text style={s.backText}>Back</Text>
          </View>
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <View>
            <Text style={s.heading}>Notifications</Text>
            <Text style={s.subtitle}>
              {result?.unreadCount
                ? `${result.unreadCount} unread`
                : 'All caught up'}
            </Text>
          </View>
          {result && result.unreadCount > 0 && (
            <Button
              title="✓ Mark all"
              variant="ghost"
              size="sm"
              loading={markingAll}
              onPress={markAllRead}
            />
          )}
        </View>
      </View>

      {loading && !refreshing ? (
        <Spinner />
      ) : !result || result.items.length === 0 ? (
        <Empty title="No notifications" message="You're all caught up." />
      ) : (
        <FlatList
          data={result.items}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(1, true)}
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
                  onPress={() => fetchNotifications(page - 1)}
                />
                <Text style={s.pageText}>
                  {page} / {result.pagination.totalPages}
                </Text>
                <Button
                  title="Next →"
                  variant="ghost"
                  size="sm"
                  disabled={!result.pagination.hasNext}
                  onPress={() => fetchNotifications(page + 1)}
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
  header: {paddingHorizontal: spacing.lg, paddingTop: spacing.md},
  backBtn: {marginBottom: 8},
  backText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: font.medium,
  },
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  list: {paddingHorizontal: spacing.lg, paddingBottom: 100},
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    marginBottom: 6,
  },
  notifUnread: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  notifBody: {flex: 1},
  notifTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: font.bold,
  },
  notifText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: font.medium,
    marginTop: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentMint,
    marginTop: 8,
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

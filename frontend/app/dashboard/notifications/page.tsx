"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import api, { type Notification, type PaginatedResponse } from "../../lib/api";
import Button from "../../components/ui/button";
import Spinner from "../../components/ui/spinner";
import Empty from "../../components/ui/empty";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Car,
  Star,
  Info,
} from "lucide-react";

const typeIcons: Record<string, typeof Bell> = {
  BOOKING_REQUEST: Ticket,
  BOOKING_CONFIRMED: Check,
  BOOKING_REJECTED: Info,
  BOOKING_CANCELLED: Info,
  RIDE_CANCELLED: Car,
  RIDE_REMINDER: Bell,
  REVIEW_RECEIVED: Star,
  SYSTEM: Info,
};

export default function NotificationsPage() {
  const [result, setResult] = useState<
    (PaginatedResponse<Notification> & { unreadCount: number }) | null
  >(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await api.getNotifications({ page: p });
      setResult(data);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  async function markRead(id: string) {
    try {
      await api.markNotificationRead(id);
      await fetchNotifications(page);
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications(page);
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  }

  function timeAgo(dt: string) {
    const diff = Date.now() - new Date(dt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-black text-text-primary tracking-[-0.03em]">
            Notifications
          </h1>
          <p className="text-[13px] text-text-secondary mt-1">
            {result?.unreadCount
              ? `${result.unreadCount} unread`
              : "All caught up"}
          </p>
        </div>
        {result && result.unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            loading={markingAll}
            onClick={markAllRead}
          >
            <Check size={14} /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : !result || result.items.length === 0 ? (
        <Empty title="No notifications" description="You're all caught up." />
      ) : (
        <>
          <div className="space-y-1.5">
            {result.items.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    n.read
                      ? "opacity-50"
                      : "bg-white/2 hover:bg-white/4 border border-border-subtle"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.read ? "bg-white/3" : "bg-accent-mint/10"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={n.read ? "text-text-tertiary" : "text-accent-mint"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text-primary font-bold">
                      {n.title}
                    </div>
                    <div className="text-[12px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {n.body}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1.5 font-medium">
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-mint shrink-0 mt-2 glow-mint" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="ghost"
                size="sm"
                disabled={!result.pagination.hasPrev}
                onClick={() => fetchNotifications(page - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-[12px] text-text-tertiary font-medium">
                Page {page} of {result.pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!result.pagination.hasNext}
                onClick={() => fetchNotifications(page + 1)}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

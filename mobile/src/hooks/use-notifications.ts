import { useCallback, useEffect, useRef, useState } from "react";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/service/notification.service";

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const raw = await listNotifications(50, false);
      const res: any = (raw as any)?.data ?? raw;
      if (!mounted.current) return;
      setItems(Array.isArray(res?.items) ? res.items : []);
      setUnread(typeof res?.unread === 'number' ? res.unread : 0);
    } catch (err: any) {
      if (mounted.current) setError(err?.message ?? "Failed to load notifications");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[notifications] markRead failed", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
      setUnread(0);
    } catch (err) {
      console.error("[notifications] markAllRead failed", err);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchNotifications();
    return () => {
      mounted.current = false;
    };
  }, [fetchNotifications]);

  return {
    items,
    unread,
    loading,
    refreshing,
    error,
    refresh,
    markRead,
    markAllRead,
    reload: fetchNotifications,
  };
}

export function useUnreadCount() {
  const [unread, setUnread] = useState(0);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const raw = await listNotifications(1, false);
      const res = (raw as any)?.data ?? raw;
      if (mounted.current) setUnread(typeof res?.unread === 'number' ? res.unread : 0);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  return { unread, refresh };
}






import * as React from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { notificationsApi, type NotificationDto } from "@/apis/notifications.api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtimeSocket } from "@/providers/RealtimeProvider";

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationCenter() {
  const socket = useRealtimeSocket();
  const [isOpen, setIsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshUnreadCount = React.useCallback(async () => {
    try {
      setUnreadCount(await notificationsApi.getUnreadCount());
    } catch {
      // The notification panel remains available when the count endpoint is temporarily offline.
    }
  }, []);

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await notificationsApi.list();
      setNotifications(result.data);
    } catch {
      toast.error("Unable to load notifications. Try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  React.useEffect(() => {
    if (!socket) return;
    const refreshFromRealtime = () => {
      void refreshUnreadCount();
      if (isOpen) void loadNotifications();
    };
    socket.on("connect", refreshFromRealtime);
    socket.on("notifications:changed", refreshFromRealtime);
    return () => {
      socket.off("connect", refreshFromRealtime);
      socket.off("notifications:changed", refreshFromRealtime);
    };
  }, [socket, isOpen, loadNotifications, refreshUnreadCount]);

  const openPanel = (open: boolean) => {
    setIsOpen(open);
    if (open) void loadNotifications();
  };

  const markRead = async (notification: NotificationDto) => {
    try {
      if (!notification.isRead) await notificationsApi.markRead(notification.id);
      await Promise.all([refreshUnreadCount(), loadNotifications()]);
    } catch {
      toast.error("Unable to update this notification.");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.remove(notificationId);
      await Promise.all([refreshUnreadCount(), loadNotifications()]);
    } catch {
      toast.error("Unable to delete this notification.");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      await Promise.all([refreshUnreadCount(), loadNotifications()]);
    } catch {
      toast.error("Unable to mark notifications as read.");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={openPanel}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="md"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-lg text-neutral-600 hover:bg-neutral-100"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-rose-600 px-1 text-[10px] font-semibold leading-4 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Notifications</h2>
            <p className="text-xs text-neutral-500">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => void markAllRead()}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-[min(28rem,70vh)] overflow-y-auto p-1">
          {isLoading ? (
            <p className="px-3 py-8 text-center text-sm text-neutral-500">Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-neutral-500">You’re all caught up.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start gap-2 rounded-lg px-2 py-2 ${notification.isRead ? "hover:bg-neutral-50" : "bg-blue-50/70 hover:bg-blue-50"}`}
              >
                <DropdownMenuItem
                  onSelect={() => void markRead(notification)}
                  className="min-w-0 flex-1 items-start whitespace-normal p-1.5 focus:bg-transparent"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-transparent" : "bg-blue-600"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-5 text-neutral-800">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {relativeTime(notification.createdAt)}
                    </span>
                  </span>
                </DropdownMenuItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete notification: ${notification.message}`}
                  className="h-7 w-7 shrink-0 text-neutral-400 opacity-0 hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
                  onClick={() => void deleteNotification(notification.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

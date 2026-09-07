"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Check,
  CheckCheck,
  HeartHandshake,
  KeyRound,
  Clock,
  Sparkles,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { api, Notification } from "@/lib/api";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "claim":
      return <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case "pickup":
      return <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    case "expiry":
      return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case "system":
      return <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    default:
      return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  }
};

const getNotificationBadgeColor = (type: Notification["type"]) => {
  switch (type) {
    case "claim":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300";
    case "pickup":
      return "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-300";
    case "expiry":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300";
    case "system":
      return "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-300";
    default:
      return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300";
  }
};

const formatTimeAgo = (dateString: string) => {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "claims" | "pickups">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch {
      // Fallback handled in api
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read;
    if (activeTab === "claims") return n.type === "claim";
    if (activeTab === "pickups") return n.type === "pickup";
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 rounded-full text-foreground/80 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-label="Notifications"
        title="Notifications"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
          transition={{ repeat: Infinity, repeatDelay: 6, duration: 0.6 }}
        >
          <Bell className="w-5 h-5" />
        </motion.div>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">Notifications</span>
                {unreadCount > 0 ? (
                  <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                ) : null}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-2 border-b border-border/40 bg-muted/10 text-xs font-medium">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "unread", label: `Unread (${unreadCount})` },
                  { key: "claims", label: "Claims" },
                  { key: "pickups", label: "Pickups" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-1 px-2 rounded-lg text-center transition ${
                    activeTab === tab.key
                      ? "bg-background text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-emerald-600/70" />
                  </div>
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're all caught up with your food rescue activity!
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group relative p-3.5 flex items-start gap-3 transition hover:bg-muted/40 ${
                      !notif.is_read ? "bg-emerald-500/5 dark:bg-emerald-500/10" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getNotificationBadgeColor(
                        notif.type
                      )}`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground/80 font-medium">
                          {formatTimeAgo(notif.created_at)}
                        </span>

                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="absolute top-3 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-xs rounded-md p-0.5">
                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="p-1 rounded text-muted-foreground hover:text-emerald-600 hover:bg-muted transition"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-muted transition"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-border/50 bg-muted/20 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1 w-full py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-white/5 transition"
              >
                <span>View Full Activity Feed & Notification Center</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

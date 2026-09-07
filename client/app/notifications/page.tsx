"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Notification } from "@/lib/api";
import {
  Bell,
  Check,
  CheckCheck,
  HeartHandshake,
  KeyRound,
  Clock,
  Sparkles,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  Inbox,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "claim":
      return <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case "pickup":
      return <KeyRound className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    case "expiry":
      return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    case "system":
      return <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    default:
      return <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  }
};

const getBadgeStyle = (type: Notification["type"]) => {
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

const formatTimeDetailed = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to dismiss all notifications?")) {
      notifications.forEach((n) => api.deleteNotification(n.id));
      setNotifications([]);
    }
  };

  // Simulation Triggers
  const triggerSimulation = async (type: Notification["type"]) => {
    setIsSimulating(true);
    let sample: Omit<Notification, "id" | "created_at" | "is_read">;

    if (type === "claim") {
      sample = {
        title: "New Claim Received! 🍞",
        message: 'Hope Shelter claimed "20x Whole Wheat Loaves". Pickup ready today.',
        type: "claim",
        link: "/donor-dashboard",
      };
    } else if (type === "pickup") {
      sample = {
        title: "Pickup Pass Verification #9104 🔐",
        message: "PIN verified successfully! 10kg Apples collected by Green Community Center.",
        type: "pickup",
        link: "/recipient-dashboard",
      };
    } else if (type === "expiry") {
      sample = {
        title: "Urgent Pickup Required ⏰",
        message: 'Prepared Meals listing expires in 90 minutes! Claim now to prevent waste.',
        type: "expiry",
        link: "/donations/browse",
      };
    } else {
      sample = {
        title: "Community Hero Milestone! 🌟",
        message: "Congratulations! You helped rescue over 100 meals this month.",
        type: "system",
        link: "/impact",
      };
    }

    const created = await api.addNotification(sample);
    setNotifications((prev) => [created, ...prev]);
    setTimeout(() => setIsSimulating(false), 300);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (showUnreadOnly && notif.is_read) return false;
      if (selectedCategory !== "all" && notif.type !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(query);
        const matchesMsg = notif.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg) return false;
      }
      return true;
    });
  }, [notifications, showUnreadOnly, selectedCategory, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const claimsCount = notifications.filter((n) => n.type === "claim").length;
  const pickupsCount = notifications.filter((n) => n.type === "pickup").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header / Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/20 via-background to-teal-900/10 border border-emerald-900/20 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
                <Bell className="w-3.5 h-3.5" />
                Live Notification Center & Activity Feed
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-xl">
                Real-time updates on food rescue claims, scheduled handovers, pickup verification PINs, and milestone badges.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-3.5 text-center min-w-[90px]">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {unreadCount}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Unread
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-3.5 text-center min-w-[90px]">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {claimsCount}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Claims
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-3.5 text-center min-w-[90px]">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {notifications.length}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Simulation Actions */}
          <div className="mt-6 pt-6 border-t border-emerald-900/15 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Simulate Live Event:
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerSimulation("claim")}
              disabled={isSimulating}
              className="text-xs h-7 rounded-lg border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
            >
              + New Claim Event
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerSimulation("pickup")}
              disabled={isSimulating}
              className="text-xs h-7 rounded-lg border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-teal-700 dark:text-teal-300"
            >
              + Pickup PIN Verified
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerSimulation("expiry")}
              disabled={isSimulating}
              className="text-xs h-7 rounded-lg border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300"
            >
              + Urgent Expiry Alert
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerSimulation("system")}
              disabled={isSimulating}
              className="text-xs h-7 rounded-lg border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300"
            >
              + Milestone Badge
            </Button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notifications and events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs rounded-xl flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="text-xs rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadNotifications}
              className="text-xs rounded-xl text-muted-foreground p-2"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          {[
            { id: "all", label: "All Activity", count: notifications.length },
            { id: "claim", label: "Claims", count: claimsCount },
            { id: "pickup", label: "Pickups & PINs", count: pickupsCount },
            { id: "expiry", label: "Urgent Expiry", count: notifications.filter((n) => n.type === "expiry").length },
            { id: "system", label: "Milestones & Badges", count: notifications.filter((n) => n.type === "system").length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}

          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`ml-auto px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
              showUnreadOnly
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-dashed border-border/80 p-12 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold">No notifications found</h3>
                <p className="text-muted-foreground text-xs mt-1 max-w-md mx-auto">
                  {searchQuery || selectedCategory !== "all" || showUnreadOnly
                    ? "Try adjusting your filters or search keywords."
                    : "You're completely up to date! New activity updates will appear here automatically."}
                </p>
                {(searchQuery || selectedCategory !== "all" || showUnreadOnly) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setShowUnreadOnly(false);
                    }}
                    className="mt-4 text-xs rounded-xl"
                  >
                    Reset Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative rounded-2xl border transition-all p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    !notif.is_read
                      ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 shadow-xs"
                      : "bg-card border-border/70 hover:border-border"
                  }`}
                >
                  {/* Left content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${getBadgeStyle(
                        notif.type
                      )}`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            New
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto sm:ml-0 font-normal">
                          {formatTimeDetailed(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {notif.link && (
                      <Link href={notif.link}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs h-8 rounded-xl flex items-center gap-1 bg-emerald-50 text-emerald-800 dark:bg-white/10 dark:text-white hover:bg-emerald-100"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}

                    {!notif.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs h-8 px-2.5 rounded-xl text-muted-foreground hover:text-emerald-600"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notif.id)}
                      className="text-xs h-8 px-2.5 rounded-xl text-muted-foreground hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

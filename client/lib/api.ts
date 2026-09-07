export type Role = 'donor' | 'recipient';

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
  phone?: string;
  address?: string;
  created_at: string;
};

export type Donation = {
  id: string;
  donor_id: string;
  food_name: string;
  description: string | null;
  category: string;
  quantity: string;
  pickup_location: string;
  pickup_deadline: string;
  image_url: string | null;
  created_at: string;
};

export type Claim = {
  id: string;
  donation_id: string;
  recipient_id: string;
  created_at: string;
  donations?: Donation;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const tokenStorage = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem('foodbridge_token')),
  set: (token: string) => localStorage.setItem('foodbridge_token', token),
  clear: () => localStorage.removeItem('foodbridge_token')
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers);

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.');
  }

  return data as T;
};

export type Notification = {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'claim' | 'pickup' | 'expiry' | 'system' | 'info';
  link?: string | null;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_init_1',
    title: 'Donation Claimed! 🎉',
    message: 'Community Kitchen claimed your 15x Fresh Artisan Bread donation.',
    type: 'claim',
    link: '/donor-dashboard',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
  },
  {
    id: 'notif_init_2',
    title: 'Pickup PIN Ready 🔐',
    message: 'Your 4-digit pickup handover PIN is #4829 for Organic Apples.',
    type: 'pickup',
    link: '/claims/my-claims',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'notif_init_3',
    title: 'Urgent Pickup Alert ⏰',
    message: 'Sandwiches & Salads pickup deadline is approaching in 2 hours!',
    type: 'expiry',
    link: '/donations/browse',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'notif_init_4',
    title: 'Milestone Unlocked! 🏆',
    message: 'You unlocked the "Zero Waste Hero" badge for rescuing over 50kg of food!',
    type: 'system',
    link: '/impact',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

const getStoredNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  const stored = localStorage.getItem('foodbridge_notifications');
  if (!stored) {
    localStorage.setItem('foodbridge_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

const setStoredNotifications = (notifications: Notification[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foodbridge_notifications', JSON.stringify(notifications));
  }
};

export const api = {
  register: (payload: { name: string; email: string; password: string; role: Role }) =>
    request<{ session: { access_token: string } | null; profile: Profile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ session: { access_token: string }; profile?: Profile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => request<{ profile: Profile }>('/api/auth/me'),
  updateProfile: (payload: { name?: string; phone?: string; address?: string }) =>
    request<{ success: boolean; profile: Profile }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  changePassword: (payload: { newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createDonation: async (payload: FormData) => {
    const res = await request<{ success?: boolean; data?: Donation } & Donation>('/api/donations', {
      method: 'POST',
      body: payload
    });
    return (res.data ?? res) as Donation;
  },
  browseDonations: async () => {
    const res = await request<{ success?: boolean; data?: Donation[] } | Donation[]>('/api/donations/browse');
    return (Array.isArray(res) ? res : res.data ?? []) as Donation[];
  },
  getDonation: async (id: string) => {
    const res = await request<{ success?: boolean; data?: Donation } & Donation>(`/api/donations/${id}`);
    return (res.data ?? res) as Donation;
  },
  myDonations: async () => {
    const res = await request<{ success?: boolean; data?: Donation[] } | Donation[]>('/api/donations/my-donations');
    return (Array.isArray(res) ? res : res.data ?? []) as Donation[];
  },
  updateDonation: async (id: string, payload: FormData) => {
    const res = await request<{ success?: boolean; data?: Donation } & Donation>(`/api/donations/${id}`, {
      method: 'PATCH',
      body: payload
    });
    return (res.data ?? res) as Donation;
  },
  deleteDonation: (id: string) => request<void>(`/api/donations/${id}`, { method: 'DELETE' }),
  saveDonation: (id: string) => {
    const saved = JSON.parse(localStorage.getItem('savedDonations') || '[]') as string[];
    if (!saved.includes(id)) {
      saved.push(id);
      localStorage.setItem('savedDonations', JSON.stringify(saved));
    }
    return Promise.resolve();
  },
  unsaveDonation: (id: string) => {
    const saved = JSON.parse(localStorage.getItem('savedDonations') || '[]') as string[];
    const filtered = saved.filter(donationId => donationId !== id);
    localStorage.setItem('savedDonations', JSON.stringify(filtered));
    return Promise.resolve();
  },
  getSavedDonations: () => {
    return JSON.parse(localStorage.getItem('savedDonations') || '[]') as string[];
  },
  isSaved: (id: string) => {
    const saved = JSON.parse(localStorage.getItem('savedDonations') || '[]') as string[];
    return saved.includes(id);
  },
  claimDonation: (id: string) => request<{ id: string; donation_id: string; recipient_id: string }>(`/api/claims/donations/${id}/claim`, {
    method: 'POST'
  }),
  myClaims: () => request<{ success: boolean; data: Claim[] }>('/api/claims/my-claims'),
  cancelClaim: (id: string) => request<void>(`/api/claims/${id}`, { method: 'DELETE' }),

  // Notification API endpoints with client fallback
  getNotifications: async (options?: { unreadOnly?: boolean; page?: number; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams();
      if (options?.unreadOnly) queryParams.set('unread', 'true');
      if (options?.page) queryParams.set('page', String(options.page));
      if (options?.limit) queryParams.set('limit', String(options.limit));
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const res = await request<{ success: boolean; data: Notification[]; pagination?: any }>(
        `/api/notifications${queryString}`
      );
      return res;
    } catch {
      let list = getStoredNotifications();
      if (options?.unreadOnly) {
        list = list.filter(n => !n.is_read);
      }
      return { success: true, data: list };
    }
  },

  getUnreadNotificationCount: async () => {
    try {
      const res = await request<{ success: boolean; count: number }>('/api/notifications/unread-count');
      return res.count;
    } catch {
      const list = getStoredNotifications();
      return list.filter(n => !n.is_read).length;
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      const res = await request<{ success: boolean; data: Notification }>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      return res.data;
    } catch {
      const list = getStoredNotifications();
      const updated = list.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n);
      setStoredNotifications(updated);
      return updated.find(n => n.id === id)!;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await request<{ success: boolean }>('/api/notifications/read-all', {
        method: 'PATCH',
      });
    } catch {
      const list = getStoredNotifications();
      const updated = list.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }));
      setStoredNotifications(updated);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await request<void>(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch {
      const list = getStoredNotifications();
      setStoredNotifications(list.filter(n => n.id !== id));
    }
  },

  addNotification: async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'> & { is_read?: boolean }) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      is_read: notification.is_read ?? false,
      created_at: new Date().toISOString(),
    };
    const list = getStoredNotifications();
    list.unshift(newNotif);
    setStoredNotifications(list);
    return newNotif;
  },
};
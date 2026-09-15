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

export type Review = {
  id: string;
  author_id: string;
  author_name: string;
  author_role: 'donor' | 'recipient';
  target_user_id: string;
  target_name: string;
  donation_id?: string | null;
  donation_title?: string | null;
  rating: number;
  tags: string[];
  comment: string;
  created_at: string;
};

export type RatingSummary = {
  averageRating: number;
  totalReviews: number;
  trustScore: number;
  distribution: Record<number, number>;
  topTags: { name: string; count: number }[];
};

export type CreateReviewPayload = {
  target_user_id?: string;
  target_name?: string;
  author_role?: 'donor' | 'recipient';
  donation_id?: string;
  donation_title?: string;
  rating: number;
  tags: string[];
  comment: string;
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_seed_1',
    author_id: 'user_rec_1',
    author_name: 'Hope Community Shelter',
    author_role: 'recipient',
    target_user_id: 'user_donor_1',
    target_name: 'Green Harvest Bakery',
    donation_id: 'don_1',
    donation_title: 'Fresh Artisan Sourdough & Pastries',
    rating: 5,
    tags: ['Fresh Food', 'Punctual Pickup', 'Well Packaged', 'Friendly Communication'],
    comment: 'Green Harvest Bakery provided immaculate fresh bread that nourished over 40 families today. Pickup was swift and seamless!',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rev_seed_2',
    author_id: 'user_rec_2',
    author_name: 'Downtown Food Rescue',
    author_role: 'recipient',
    target_user_id: 'user_donor_2',
    target_name: 'City Fresh Produce Market',
    donation_id: 'don_2',
    donation_title: 'Organic Apples & Citrus Crates',
    rating: 5,
    tags: ['Fresh Food', 'Generous Portion', 'Punctual Pickup'],
    comment: 'The produce was vibrant, high-quality, and packed safely in reusable crates. Truly grateful for the partnership.',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'rev_seed_3',
    author_id: 'user_donor_1',
    author_name: 'Green Harvest Bakery',
    author_role: 'donor',
    target_user_id: 'user_rec_1',
    target_name: 'Hope Community Shelter',
    donation_id: 'don_1',
    donation_title: 'Fresh Artisan Sourdough & Pastries',
    rating: 5,
    tags: ['Punctual Pickup', 'Respectful Handling', 'Friendly Communication'],
    comment: 'The shelter pickup team arrived right on schedule with insulated transport bags and complete verification.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'rev_seed_4',
    author_id: 'user_rec_3',
    author_name: 'St. Jude Youth Kitchen',
    author_role: 'recipient',
    target_user_id: 'user_donor_3',
    target_name: 'Sunrise Catering Co.',
    donation_id: 'don_3',
    donation_title: 'Catering Trays: Roasted Veggies & Quinoa',
    rating: 4,
    tags: ['Fresh Food', 'Well Packaged', 'Generous Portion'],
    comment: 'Delicious hot food trays securely sealed and labeled with dietary notes. Our kids loved the meals!',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'rev_seed_5',
    author_id: 'user_rec_4',
    author_name: 'Riverside Community Pantry',
    author_role: 'recipient',
    target_user_id: 'user_donor_1',
    target_name: 'Green Harvest Bakery',
    donation_id: 'don_4',
    donation_title: 'Morning Bagels & Croissants',
    rating: 5,
    tags: ['Fresh Food', 'Punctual Pickup', 'Generous Portion'],
    comment: 'Always reliable, consistent, and deeply caring donors. 10/10 recommend collaborating with them.',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
];

export type VehicleType = 'bike' | 'car' | 'van' | 'walk';
export type MissionUrgency = 'critical' | 'urgent' | 'flexible';
export type MissionStatus = 'available' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export type RescueMission = {
  id: string;
  title: string;
  donor_id: string;
  donor_name: string;
  pickup_address: string;
  recipient_id: string;
  recipient_name: string;
  dropoff_address: string;
  food_category: string;
  weight_kg: number;
  vehicle_required: VehicleType;
  urgency: MissionUrgency;
  requires_refrigeration: boolean;
  notes: string;
  status: MissionStatus;
  volunteer_id: string | null;
  volunteer_name: string | null;
  verification_code: string;
  pickup_window: string;
  distance_km: number;
  est_duration_mins: number;
  created_at: string;
  completed_at?: string | null;
};

export type CourierLeaderboardItem = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  vehicle_type: VehicleType;
  rating: number;
  completed_missions: number;
  total_kg_rescued: number;
  co2_saved_kg: number;
  badge: string;
  status: 'active' | 'available' | 'on_mission';
};

export type RescueStats = {
  totalMissions: number;
  availableCount: number;
  activeCount: number;
  deliveredCount: number;
  totalKgRescued: number;
  co2SavedKg: number;
  estimatedMealsProvided: number;
  activeCouriersCount: number;
};

export type CreateMissionPayload = {
  title: string;
  donor_name?: string;
  pickup_address: string;
  recipient_name?: string;
  dropoff_address: string;
  food_category?: string;
  weight_kg: number;
  vehicle_required: VehicleType;
  urgency: MissionUrgency;
  requires_refrigeration?: boolean;
  notes?: string;
  pickup_window?: string;
  distance_km?: number;
};

export const INITIAL_COURIERS: CourierLeaderboardItem[] = [
  {
    id: 'vol_alex_1',
    name: 'Alex Rivera',
    avatar: '🚴',
    role: 'Lead Cargo Cyclist',
    vehicle_type: 'bike',
    rating: 4.95,
    completed_missions: 38,
    total_kg_rescued: 412.5,
    co2_saved_kg: 98.4,
    badge: 'Eco-Champion 🌟',
    status: 'active',
  },
  {
    id: 'vol_sam_2',
    name: 'Samantha Chen',
    avatar: '🚗',
    role: 'Rapid Responder Driver',
    vehicle_type: 'car',
    rating: 4.98,
    completed_missions: 54,
    total_kg_rescued: 780.0,
    co2_saved_kg: 172.0,
    badge: 'Master Courier 🛡️',
    status: 'on_mission',
  },
  {
    id: 'vol_david_3',
    name: 'David Kalu',
    avatar: '🚐',
    role: 'Heavy Cargo Van Volunteer',
    vehicle_type: 'van',
    rating: 4.91,
    completed_missions: 29,
    total_kg_rescued: 1240.0,
    co2_saved_kg: 285.6,
    badge: 'Heavy Lifter 🏋️',
    status: 'available',
  },
  {
    id: 'vol_elena_4',
    name: 'Elena Rostova',
    avatar: '🚶',
    role: 'Neighborhood Walking Courier',
    vehicle_type: 'walk',
    rating: 5.0,
    completed_missions: 19,
    total_kg_rescued: 145.0,
    co2_saved_kg: 34.8,
    badge: 'Local Hero ❤️',
    status: 'available',
  },
];

export const INITIAL_MISSIONS: RescueMission[] = [
  {
    id: 'mission_1',
    title: 'Surplus Bakery & Warm Pastries',
    donor_id: 'user_donor_1',
    donor_name: 'Green Harvest Bakery',
    pickup_address: '142 Baker Street, Sector 4',
    recipient_id: 'user_rec_1',
    recipient_name: 'Hope Community Shelter',
    dropoff_address: '88 Peace Avenue, Downtown',
    food_category: 'Bakery & Bread',
    weight_kg: 18.5,
    vehicle_required: 'bike',
    urgency: 'critical',
    requires_refrigeration: false,
    notes: 'Bakery bags are packed and ready by the back kitchen door. Ring buzzer #2.',
    status: 'available',
    volunteer_id: null,
    volunteer_name: null,
    verification_code: '8392',
    pickup_window: 'Within 2 hours',
    distance_km: 2.4,
    est_duration_mins: 12,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_2',
    title: 'Chilled Dairy Crates & Fresh Greens',
    donor_id: 'user_donor_2',
    donor_name: 'City Fresh Produce Market',
    pickup_address: '500 Market Square, Dock 3',
    recipient_id: 'user_rec_2',
    recipient_name: 'Downtown Youth Center Pantry',
    dropoff_address: '320 Elm Boulevard, Central',
    food_category: 'Produce & Dairy',
    weight_kg: 42.0,
    vehicle_required: 'car',
    urgency: 'urgent',
    requires_refrigeration: true,
    notes: 'Insulated cooler boxes ready at loading dock 3. Ask for Marco.',
    status: 'assigned',
    volunteer_id: 'vol_alex_1',
    volunteer_name: 'Alex Rivera (Eco-Courier)',
    verification_code: '4910',
    pickup_window: 'Today by 5:00 PM',
    distance_km: 4.8,
    est_duration_mins: 22,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_3',
    title: 'Prepared Hot Catering Trays (Roasted Veggies & Rice)',
    donor_id: 'user_donor_3',
    donor_name: 'Sunrise Catering Co.',
    pickup_address: '77 Banquet Hall Road',
    recipient_id: 'user_rec_3',
    recipient_name: 'St. Jude Community Kitchen',
    dropoff_address: '15 Mission Way, West District',
    food_category: 'Prepared Meals',
    weight_kg: 26.0,
    vehicle_required: 'car',
    urgency: 'critical',
    requires_refrigeration: false,
    notes: 'Food warmers packed in thermal insulated bags. Please transport promptly.',
    status: 'in_transit',
    volunteer_id: 'vol_sam_2',
    volunteer_name: 'Samantha Chen',
    verification_code: '6125',
    pickup_window: 'Immediate Rescue',
    distance_km: 3.1,
    est_duration_mins: 15,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_4',
    title: 'Pantry Staples & Canned Legumes Crates',
    donor_id: 'user_donor_4',
    donor_name: 'Metro Grocery Hub',
    pickup_address: '900 Logistics Way, Bay 12',
    recipient_id: 'user_rec_4',
    recipient_name: 'Eastside Food Bank',
    dropoff_address: '404 Solidarity Road',
    food_category: 'Pantry & Canned Goods',
    weight_kg: 75.0,
    vehicle_required: 'van',
    urgency: 'flexible',
    requires_refrigeration: false,
    notes: 'Heavy crates. Hand truck / dolly recommended. Loading bay has ramp.',
    status: 'available',
    volunteer_id: null,
    volunteer_name: null,
    verification_code: '2094',
    pickup_window: 'Anytime before 8:00 PM',
    distance_km: 6.5,
    est_duration_mins: 28,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_5',
    title: 'Organic Apples & Seasonal Citrus Baskets',
    donor_id: 'user_donor_2',
    donor_name: 'City Fresh Produce Market',
    pickup_address: '500 Market Square, Dock 3',
    recipient_id: 'user_rec_1',
    recipient_name: 'Hope Community Shelter',
    dropoff_address: '88 Peace Avenue, Downtown',
    food_category: 'Fresh Fruits',
    weight_kg: 15.0,
    vehicle_required: 'bike',
    urgency: 'urgent',
    requires_refrigeration: false,
    notes: 'Pre-boxed in 3 light crates. Fits on cargo bike or backpack + panniers.',
    status: 'delivered',
    volunteer_id: 'vol_alex_1',
    volunteer_name: 'Alex Rivera (Eco-Courier)',
    verification_code: '7721',
    pickup_window: 'Delivered at 1:30 PM',
    distance_km: 2.2,
    est_duration_mins: 10,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
];

const getStoredMissions = (): RescueMission[] => {
  if (typeof window === 'undefined') return INITIAL_MISSIONS;
  const stored = localStorage.getItem('foodbridge_rescue_missions');
  if (!stored) {
    localStorage.setItem('foodbridge_rescue_missions', JSON.stringify(INITIAL_MISSIONS));
    return INITIAL_MISSIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_MISSIONS;
  }
};

const setStoredMissions = (missions: RescueMission[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foodbridge_rescue_missions', JSON.stringify(missions));
  }
};

const getStoredReviews = (): Review[] => {
  if (typeof window === 'undefined') return INITIAL_REVIEWS;
  const stored = localStorage.getItem('foodbridge_reviews');
  if (!stored) {
    localStorage.setItem('foodbridge_reviews', JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_REVIEWS;
  }
};

const setStoredReviews = (reviews: Review[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foodbridge_reviews', JSON.stringify(reviews));
  }
};

const computeClientSummary = (reviews: Review[]): RatingSummary => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      trustScore: 100,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      topTags: [],
    };
  }

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const tagCounts: Record<string, number> = {};
  let totalRating = 0;

  reviews.forEach((r) => {
    const star = Math.min(Math.max(Math.round(r.rating), 1), 5);
    distribution[star] = (distribution[star] || 0) + 1;
    totalRating += r.rating;

    if (Array.isArray(r.tags)) {
      r.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const avg = totalRating / reviews.length;
  const trustScore = Math.min(100, Math.round((avg / 5) * 100));

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    averageRating: Number(avg.toFixed(1)),
    totalReviews: reviews.length,
    trustScore,
    distribution,
    topTags: sortedTags,
  };
};

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

  // Review & Ratings API with client fallback
  createReview: async (payload: CreateReviewPayload) => {
    try {
      const res = await request<{ success: boolean; data: Review; message: string }>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data) {
        const list = getStoredReviews();
        list.unshift(res.data);
        setStoredReviews(list);
      }
      return res.data;
    } catch {
      const newReview: Review = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        author_id: 'current_user',
        author_name: 'You (Verified Member)',
        author_role: payload.author_role || 'donor',
        target_user_id: payload.target_user_id || 'community',
        target_name: payload.target_name || 'Community Partner',
        donation_id: payload.donation_id || null,
        donation_title: payload.donation_title || 'Food Donation',
        rating: Math.round(payload.rating),
        tags: payload.tags || [],
        comment: payload.comment || '',
        created_at: new Date().toISOString(),
      };
      const list = getStoredReviews();
      list.unshift(newReview);
      setStoredReviews(list);
      return newReview;
    }
  },

  getCommunityReviews: async (options?: { minRating?: number; tag?: string; page?: number; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams();
      if (options?.minRating) queryParams.set('minRating', String(options.minRating));
      if (options?.tag) queryParams.set('tag', options.tag);
      if (options?.page) queryParams.set('page', String(options.page));
      if (options?.limit) queryParams.set('limit', String(options.limit));
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const res = await request<{ success: boolean; data: Review[]; pagination?: any }>(
        `/api/reviews/community${queryString}`
      );
      return res;
    } catch {
      let list = getStoredReviews();
      if (options?.minRating && options.minRating > 0) {
        list = list.filter((r) => r.rating >= options.minRating!);
      }
      if (options?.tag) {
        list = list.filter((r) => r.tags && r.tags.includes(options.tag!));
      }
      return { success: true, data: list };
    }
  },

  getUserReviews: async (userId: string) => {
    try {
      const res = await request<{ success: boolean; data: Review[] }>(`/api/reviews/user/${userId}`);
      return res;
    } catch {
      const list = getStoredReviews().filter(
        (r) => r.target_user_id === userId || userId === 'all'
      );
      return { success: true, data: list };
    }
  },

  getUserRatingSummary: async (userId: string): Promise<RatingSummary> => {
    try {
      const res = await request<{ success: boolean; data: RatingSummary }>(`/api/reviews/summary/${userId}`);
      return res.data;
    } catch {
      const list = getStoredReviews().filter(
        (r) => r.target_user_id === userId || userId === 'all'
      );
      return computeClientSummary(list);
    }
  },

  getGlobalRatingSummary: async (): Promise<RatingSummary> => {
    try {
      const res = await request<{ success: boolean; data: RatingSummary }>('/api/reviews/global-summary');
      return res.data;
    } catch {
      const list = getStoredReviews();
      return computeClientSummary(list);
    }
  },

  // Rescue Missions & Courier Logistics API
  getRescueMissions: async (options?: {
    status?: string;
    urgency?: string;
    vehicle_required?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (options?.status) queryParams.set('status', options.status);
      if (options?.urgency) queryParams.set('urgency', options.urgency);
      if (options?.vehicle_required) queryParams.set('vehicle_required', options.vehicle_required);
      if (options?.search) queryParams.set('search', options.search);
      if (options?.page) queryParams.set('page', String(options.page));
      if (options?.limit) queryParams.set('limit', String(options.limit));
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const res = await request<{ success: boolean; data: RescueMission[]; pagination?: any }>(
        `/api/rescues${queryString}`
      );
      return res;
    } catch {
      let list = getStoredMissions();
      if (options?.status && options.status !== 'all') {
        list = list.filter((m) => m.status === options.status);
      }
      if (options?.urgency && options.urgency !== 'all') {
        list = list.filter((m) => m.urgency === options.urgency);
      }
      if (options?.vehicle_required && options.vehicle_required !== 'all') {
        list = list.filter((m) => m.vehicle_required === options.vehicle_required);
      }
      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.donor_name.toLowerCase().includes(q) ||
            m.recipient_name.toLowerCase().includes(q) ||
            m.food_category.toLowerCase().includes(q)
        );
      }
      return { success: true, data: list };
    }
  },

  getRescueStats: async (): Promise<RescueStats> => {
    try {
      const res = await request<{ success: boolean; data: RescueStats }>('/api/rescues/stats');
      return res.data;
    } catch {
      const missions = getStoredMissions();
      const delivered = missions.filter((m) => m.status === 'delivered');
      const active = missions.filter((m) => ['assigned', 'picked_up', 'in_transit'].includes(m.status));
      const available = missions.filter((m) => m.status === 'available');
      const totalKg = missions
        .filter((m) => m.status === 'delivered' || m.status === 'in_transit' || m.status === 'picked_up')
        .reduce((sum, m) => sum + (m.weight_kg || 0), 0);

      return {
        totalMissions: missions.length,
        availableCount: available.length,
        activeCount: active.length,
        deliveredCount: delivered.length,
        totalKgRescued: Number(totalKg.toFixed(1)),
        co2SavedKg: Number((totalKg * 2.5).toFixed(1)),
        estimatedMealsProvided: Math.round(totalKg * 2.2),
        activeCouriersCount: 8,
      };
    }
  },

  getCouriersLeaderboard: async (): Promise<CourierLeaderboardItem[]> => {
    try {
      const res = await request<{ success: boolean; data: CourierLeaderboardItem[] }>('/api/rescues/leaderboard');
      return res.data;
    } catch {
      return INITIAL_COURIERS;
    }
  },

  createRescueMission: async (payload: CreateMissionPayload) => {
    try {
      const res = await request<{ success: boolean; data: RescueMission }>('/api/rescues', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data) {
        const list = getStoredMissions();
        list.unshift(res.data);
        setStoredMissions(list);
      }
      return res.data;
    } catch {
      const newMission: RescueMission = {
        id: `mission_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: payload.title,
        donor_id: 'current_user',
        donor_name: payload.donor_name || 'Community Donor Partner',
        pickup_address: payload.pickup_address,
        recipient_id: 'rec_shelter',
        recipient_name: payload.recipient_name || 'Downtown Hope Kitchen',
        dropoff_address: payload.dropoff_address,
        food_category: payload.food_category || 'Surplus Food Boxes',
        weight_kg: Number(payload.weight_kg) || 12,
        vehicle_required: payload.vehicle_required || 'bike',
        urgency: payload.urgency || 'urgent',
        requires_refrigeration: Boolean(payload.requires_refrigeration),
        notes: payload.notes || '',
        status: 'available',
        volunteer_id: null,
        volunteer_name: null,
        verification_code: Math.floor(1000 + Math.random() * 9000).toString(),
        pickup_window: payload.pickup_window || 'Next 2-3 hours',
        distance_km: Number(payload.distance_km) || 3.2,
        est_duration_mins: Math.round((Number(payload.distance_km) || 3.2) * 5),
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      const list = getStoredMissions();
      list.unshift(newMission);
      setStoredMissions(list);
      return newMission;
    }
  },

  claimRescueMission: async (missionId: string, volunteerName: string = 'Alex (You)') => {
    try {
      const res = await request<{ success: boolean; data: RescueMission }>(`/api/rescues/${missionId}/claim`, {
        method: 'POST',
        body: JSON.stringify({ volunteer_name: volunteerName }),
      });
      if (res.data) {
        const list = getStoredMissions().map((m) => (m.id === missionId ? res.data : m));
        setStoredMissions(list);
      }
      return res.data;
    } catch {
      const list = getStoredMissions();
      const mission = list.find((m) => m.id === missionId);
      if (mission) {
        mission.status = 'assigned';
        mission.volunteer_id = 'current_user';
        mission.volunteer_name = volunteerName;
        setStoredMissions([...list]);
        return mission;
      }
      throw new Error('Mission not found');
    }
  },

  updateRescueStatus: async (
    missionId: string,
    status: MissionStatus,
    notes?: string,
    verificationCode?: string
  ) => {
    try {
      const res = await request<{ success: boolean; data: RescueMission }>(`/api/rescues/${missionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes, verification_code: verificationCode }),
      });
      if (res.data) {
        const list = getStoredMissions().map((m) => (m.id === missionId ? res.data : m));
        setStoredMissions(list);
      }
      return res.data;
    } catch {
      const list = getStoredMissions();
      const mission = list.find((m) => m.id === missionId);
      if (mission) {
        if (status === 'delivered' && verificationCode && mission.verification_code) {
          if (verificationCode.trim() !== mission.verification_code.trim()) {
            throw new Error('Invalid PIN code');
          }
        }
        mission.status = status;
        if (notes) mission.notes = notes;
        if (status === 'delivered') mission.completed_at = new Date().toISOString();
        setStoredMissions([...list]);
        return mission;
      }
      throw new Error('Mission not found');
    }
  },
};
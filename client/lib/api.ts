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
  cancelClaim: (id: string) => request<void>(`/api/claims/${id}`, { method: 'DELETE' })
};
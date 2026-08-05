export type Role = 'donor' | 'recipient';

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
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
    request<{ session: { access_token: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => request<{ profile: Profile }>('/api/auth/me'),
  createDonation: (payload: FormData) => request<Donation>('/api/donations', { method: 'POST', body: payload }),
  browseDonations: () => request<Donation[]>('/api/donations/browse'),
  getDonation: (id: string) => request<Donation>(`/api/donations/${id}`),
  myDonations: () => request<Donation[]>('/api/donations/my-donations'),
  updateDonation: (id: string, payload: Partial<Donation>) =>
    request<Donation>(`/api/donations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteDonation: (id: string) => request<void>(`/api/donations/${id}`, { method: 'DELETE' }),
  claimDonation: (id: string) => request<{ id: string; donation_id: string; recipient_id: string }>(`/api/claims/donations/${id}/claim`, {
    method: 'POST'
  })
};
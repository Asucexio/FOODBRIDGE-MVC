'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Role, tokenStorage } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('donor');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const data = await api.register({
        name: String(form.get('name')),
        email: String(form.get('email')),
        password: String(form.get('password')),
        role
      });
      if (data.session?.access_token) tokenStorage.set(data.session.access_token);
      router.push(role === 'donor' ? '/donor-dashboard' : '/donations/browse');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed.');
    }
  };

  return (
    <main className="container">
      <h1>Register</h1>
      <p className="meta">Recipients must be approved by an admin in Supabase before browsing or claiming donations.</p>
      {message && <p className="notice error">{message}</p>}
      <form className="card form" onSubmit={onSubmit}>
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required minLength={6} /></label>
        <label>Role<select value={role} onChange={(e) => setRole(e.target.value as Role)}><option value="donor">Donor</option><option value="recipient">Recipient</option></select></label>
        <button className="button" type="submit">Create Account</button>
      </form>
    </main>
  );
}
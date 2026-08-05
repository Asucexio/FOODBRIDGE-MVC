'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, tokenStorage } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      const data = await api.login({ email, password });
      tokenStorage.set(data.session.access_token);
      router.push('/donor-dashboard');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  return (
    <main className="container">
      <h1>Login</h1>
      {message && <p className="notice error">{message}</p>}
      <form className="card form" onSubmit={onSubmit}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="button" type="submit">Login</button>
      </form>
    </main>
  );
}
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function CreateDonationPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      const formData = new FormData(event.currentTarget);
      const donation = await api.createDonation(formData);
      router.push(`/donations/${donation.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create donation.');
    }
  };

  return (
    <main className="container">
      <h1>Create Donation</h1>
      {message && <p className="notice error">{message}</p>}
      <form className="card form" onSubmit={onSubmit}>
        <label>Food name<input name="food_name" required /></label>
        <label>Description<textarea name="description" rows={4} /></label>
        <label>Category<input name="category" required /></label>
        <label>Quantity<input name="quantity" required /></label>
        <label>Pickup location<input name="pickup_location" required /></label>
        <label>Pickup deadline<input name="pickup_deadline" type="datetime-local" required /></label>
        <label>Image<input name="image" type="file" accept="image/*" /></label>
        <button className="button" type="submit">Post Donation</button>
      </form>
    </main>
  );
}
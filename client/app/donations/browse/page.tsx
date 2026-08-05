'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, Donation } from '../../../lib/api';

export default function BrowseDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState('Loading available donations...');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.browseDonations();
        setDonations(data);
        setMessage(data.length ? '' : 'No available donations right now.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load donations.');
      }
    };
    load();
  }, []);

  return (
    <main className="container">
      <h1>Browse Donations</h1>
      <p className="meta">Only approved recipients can view and claim available donations.</p>
      {message && <p className={`notice ${message.includes('Unable') || message.includes('pending') ? 'error' : ''}`}>{message}</p>}
      <section className="grid">
        {donations.map((donation) => (
          <article className="card" key={donation.id}>
            {donation.image_url && <img className="image" src={donation.image_url} alt={donation.food_name} />}
            <h2>{donation.food_name}</h2>
            <p>{donation.description}</p>
            <p className="meta">{donation.quantity} • {donation.category}</p>
            <Link className="button" href={`/donations/${donation.id}`}>View Details</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

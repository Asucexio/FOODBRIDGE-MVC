'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, Donation } from '../../../lib/api';

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState('Loading donations...');

  const load = async () => {
    try {
      const data = await api.myDonations();
      setDonations(data);
      setMessage(data.length ? '' : 'No donations yet.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load donations.');
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await api.deleteDonation(id);
    await load();
  };

  return (
    <main className="container">
      <div className="actions"><h1>My Donations</h1><Link className="button" href="/donations/create">New Donation</Link></div>
      {message && <p className={`notice ${message.includes('Unable') ? 'error' : ''}`}>{message}</p>}
      <section className="grid">
        {donations.map((donation) => (
          <article className="card" key={donation.id}>
            {donation.image_url && <img className="image" src={donation.image_url} alt={donation.food_name} />}
            <h2>{donation.food_name}</h2>
            <p>{donation.description}</p>
            <p className="meta">{donation.quantity} • {donation.category}</p>
            <div className="actions">
              <Link className="button secondary" href={`/donations/${donation.id}`}>Details</Link>
              <button className="button danger" onClick={() => remove(donation.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
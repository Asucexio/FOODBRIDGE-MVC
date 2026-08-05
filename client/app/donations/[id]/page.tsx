'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, Donation } from '../../../lib/api';

export default function DonationDetailsPage() {
  const params = useParams<{ id: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [message, setMessage] = useState('Loading donation...');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDonation(params.id);
        setDonation(data);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load donation.');
      }
    };
    load();
  }, [params.id]);

  const claim = async () => {
    try {
      await api.claimDonation(params.id);
      setMessage('Donation claimed successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to claim donation.');
    }
  };

  return (
    <main className="container">
      <Link href="/donations/browse">← Back to browse</Link>
      {message && <p className={`notice ${message.includes('Unable') || message.includes('already') ? 'error' : ''}`}>{message}</p>}
      {donation && (
        <article className="card">
          {donation.image_url && <img className="image" src={donation.image_url} alt={donation.food_name} />}
          <h1>{donation.food_name}</h1>
          <p>{donation.description}</p>
          <p><strong>Category:</strong> {donation.category}</p>
          <p><strong>Quantity:</strong> {donation.quantity}</p>
          <p><strong>Pickup location:</strong> {donation.pickup_location}</p>
          <p><strong>Pickup deadline:</strong> {new Date(donation.pickup_deadline).toLocaleString()}</p>
          <button className="button" onClick={claim}>Claim Donation</button>
        </article>
      )}
    </main>
  );
}
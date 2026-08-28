'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, Donation } from '../../../lib/api';

const formatDeadline = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState('Loading donations...');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.myDonations();
      setDonations(data);
      setMessage(data.length ? '' : 'No donations yet. Create your first listing to share surplus food.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load donations.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (donation: Donation) => {
    const confirmed = window.confirm(
      `Delete “${donation.food_name}”? This cannot be undone and recipients will no longer see it.`
    );
    if (!confirmed) return;

    setDeletingId(donation.id);
    setMessage('');

    try {
      await api.deleteDonation(donation.id);
      setDonations((current) => current.filter((item) => item.id !== donation.id));
      setMessage('Donation deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete donation.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container">
      <div className="actions" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>My Donations</h1>
          <p className="meta" style={{ margin: '0.35rem 0 0' }}>
            Review, edit, or remove the food listings you have shared.
          </p>
        </div>
        <Link className="button" href="/donations/create">
          New Donation
        </Link>
      </div>

      {message && (
        <p className={`notice ${message.includes('Unable') ? 'error' : ''}`}>{message}</p>
      )}

      <section className="grid">
        {donations.map((donation) => (
          <article className="card donation-card" key={donation.id}>
            {donation.image_url ? (
              <img className="image donation-image" src={donation.image_url} alt={donation.food_name} />
            ) : (
              <div className="donation-image image-placeholder" aria-hidden="true">
                FoodBridge
              </div>
            )}
            <div className="donation-card-body">
              <div className="donation-card-head">
                <span className="pill">{donation.category}</span>
              </div>
              <h2>{donation.food_name}</h2>
              <p>{donation.description || 'No description provided yet.'}</p>
              <p className="meta">
                {donation.quantity} · Pickup by {formatDeadline(donation.pickup_deadline)}
              </p>
              <div className="actions">
                <Link className="button secondary" href={`/donations/${donation.id}`}>
                  Details
                </Link>
                <Link className="button" href={`/donations/${donation.id}/edit`}>
                  Edit
                </Link>
                <button
                  className="button danger"
                  type="button"
                  disabled={deletingId === donation.id}
                  onClick={() => remove(donation)}
                >
                  {deletingId === donation.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

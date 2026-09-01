'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api, Donation } from '../../../lib/api';

const formatDeadline = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));

const getDeadlineLabel = (date: string) => {
  const deadlineTime = new Date(date).getTime();
  const hoursRemaining = Math.ceil((deadlineTime - Date.now()) / (1000 * 60 * 60));

  if (Number.isNaN(hoursRemaining)) return 'Deadline pending';
  if (hoursRemaining <= 0) return 'Pickup due now';
  if (hoursRemaining < 24) return `${hoursRemaining}h left`;

  const daysRemaining = Math.ceil(hoursRemaining / 24);
  return `${daysRemaining}d left`;
};

const isExpiringSoon = (date: string) => {
  const hoursRemaining = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60);
  return !Number.isNaN(hoursRemaining) && hoursRemaining <= 24;
};

export default function SavedDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState('Loading saved donations...');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const allDonations = await api.browseDonations();
        const savedIds = api.getSavedDonations();
        const savedDonations = allDonations.filter(d => savedIds.includes(d.id));
        
        setDonations(savedDonations);
        setMessage(savedDonations.length ? '' : 'You haven\'t saved any donations yet.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load saved donations.');
      }
    };
    load();
  }, []);

  const filteredDonations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return donations.filter((donation) => {
      const searchableText = [
        donation.food_name,
        donation.description,
        donation.quantity,
        donation.pickup_location,
        donation.category
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return !normalizedSearch || searchableText.includes(normalizedSearch);
    });
  }, [donations, searchTerm]);

  const handleRemove = (id: string) => {
    api.unsaveDonation(id);
    setDonations(donations.filter(d => d.id !== id));
    if (donations.length === 1) {
      setMessage('You haven\'t saved any donations yet.');
    }
  };

  return (
    <main className="container recipient-page">
      <section className="recipient-hero card">
        <div>
          <span className="eyebrow">Your Collection</span>
          <h1>Saved donations</h1>
          <p>
            View and manage your saved donations. Find the perfect donation for your community's needs.
          </p>
        </div>
        <div className="recipient-stats" aria-label="Saved donations overview">
          <div>
            <strong>{donations.length}</strong>
            <span>saved</span>
          </div>
          <div>
            <strong>{filteredDonations.length}</strong>
            <span>matching search</span>
          </div>
        </div>
      </section>

      <section className="browse-toolbar card" aria-label="Search saved donations">
        <label>
          Search saved donations
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search food, location, quantity..."
            type="search"
          />
        </label>
        {searchTerm.trim() && (
          <button 
            type="button" 
            className="text-button" 
            onClick={() => setSearchTerm('')}
          >
            Clear search
          </button>
        )}
      </section>

      {message && <p className={`notice ${message.includes('Unable') ? 'error' : ''}`}>{message}</p>}

      <section className="grid donation-grid">
        {filteredDonations.map((donation) => (
          <article className="card donation-card" key={donation.id}>
            {donation.image_url ? (
              <img className="image donation-image" src={donation.image_url} alt={donation.food_name} />
            ) : (
              <div className="donation-image image-placeholder" aria-hidden="true">FoodBridge</div>
            )}
            <div className="donation-card-body">
              <div className="donation-card-head">
                <span className="pill">{donation.category}</span>
                <span className={`deadline-pill ${isExpiringSoon(donation.pickup_deadline) ? 'urgent' : ''}`}>
                  {getDeadlineLabel(donation.pickup_deadline)}
                </span>
              </div>
              <h2>{donation.food_name}</h2>
              <p>{donation.description || 'No description provided yet.'}</p>
              <dl className="donation-details">
                <div>
                  <dt>Quantity</dt>
                  <dd>{donation.quantity}</dd>
                </div>
                <div>
                  <dt>Pickup</dt>
                  <dd>{donation.pickup_location}</dd>
                </div>
                <div>
                  <dt>Deadline</dt>
                  <dd>{formatDeadline(donation.pickup_deadline)}</dd>
                </div>
              </dl>
              <div className="donation-card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <Link className="button" href={`/donations/${donation.id}`}>View Details</Link>
                <button 
                  className="button secondary" 
                  onClick={() => handleRemove(donation.id)}
                  title="Remove from saved"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

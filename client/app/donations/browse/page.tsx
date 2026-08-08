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

export default function BrowseDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState('Loading available donations...');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const categories = useMemo(
    () => Array.from(new Set(donations.map((donation) => donation.category))).sort(),
    [donations]
  );

  const filteredDonations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return donations.filter((donation) => {
      const matchesCategory = selectedCategory === 'all' || donation.category === selectedCategory;
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

      return matchesCategory && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [donations, searchTerm, selectedCategory]);

  const expiringSoonCount = donations.filter((donation) => {
    const hoursRemaining = (new Date(donation.pickup_deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining <= 24;
  }).length;

  const showEmptyFilteredState = !message && donations.length > 0 && filteredDonations.length === 0;

  return (
    <main className="container recipient-page">
      <section className="recipient-hero card">
        <div>
          <span className="eyebrow">Recipient dashboard</span>
          <h1>Find food donations ready for pickup</h1>
          <p>
            Search local listings, review pickup windows, and claim the donation that best matches your community needs.
          </p>
        </div>
        <div className="recipient-stats" aria-label="Donation overview">
          <div>
            <strong>{donations.length}</strong>
            <span>available</span>
          </div>
          <div>
            <strong>{categories.length}</strong>
            <span>categories</span>
          </div>
          <div>
            <strong>{expiringSoonCount}</strong>
            <span>urgent pickups</span>
          </div>
        </div>
      </section>

      <section className="browse-toolbar card" aria-label="Filter donations">
        <label>
          Search donations
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search food, location, quantity..."
            type="search"
          />
        </label>
        <label>
          Category
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
      </section>

      {message && <p className={`notice ${message.includes('Unable') || message.includes('pending') ? 'error' : ''}`}>{message}</p>}
      {showEmptyFilteredState && <p className="notice">No donations match your current search. Try another keyword or category.</p>}

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
                <span className="deadline-pill">{getDeadlineLabel(donation.pickup_deadline)}</span>
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
              <Link className="button" href={`/donations/${donation.id}`}>View Details</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
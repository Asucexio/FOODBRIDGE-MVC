'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Donation } from '../../../../lib/api';

const toLocalInputValue = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function EditDonationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [message, setMessage] = useState('Loading donation...');
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDonation(params.id);
        setDonation(data);
        setImagePreview(data.image_url);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load donation.');
      }
    };
    load();
  }, [params.id]);

  const deadlineValue = useMemo(
    () => (donation ? toLocalInputValue(donation.pickup_deadline) : ''),
    [donation]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!donation) return;

    setSaving(true);
    setMessage('');

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const nextDeadline = String(formData.get('pickup_deadline') || '');

      // Skip re-validating an unchanged deadline (may already be in the past).
      if (nextDeadline && nextDeadline === deadlineValue) {
        formData.delete('pickup_deadline');
      }

      const image = formData.get('image');
      if (!(image instanceof File) || image.size === 0) {
        formData.delete('image');
      }

      const updated = await api.updateDonation(donation.id, formData);
      router.push(`/donations/${updated.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update donation.');
      setSaving(false);
    }
  };

  return (
    <main className="container">
      <div className="actions" style={{ marginBottom: '1rem' }}>
        <Link href="/donations/my-donations">← Back to my donations</Link>
      </div>

      <h1>Edit Donation</h1>
      <p className="meta">Update listing details so recipients see accurate pickup info.</p>

      {message && (
        <p className={`notice ${message.includes('Unable') || message.includes('must') ? 'error' : ''}`}>
          {message}
        </p>
      )}

      {donation && (
        <form className="card form" onSubmit={onSubmit}>
          {imagePreview && (
            <div className="edit-image-preview">
              <img className="image" src={imagePreview} alt={donation.food_name} />
              <span className="meta">Current image — upload a new file to replace it.</span>
            </div>
          )}

          <label>
            Food name
            <input name="food_name" defaultValue={donation.food_name} required maxLength={100} />
          </label>
          <label>
            Description
            <textarea name="description" rows={4} defaultValue={donation.description || ''} maxLength={500} />
          </label>
          <label>
            Category
            <input name="category" defaultValue={donation.category} required maxLength={50} />
          </label>
          <label>
            Quantity
            <input name="quantity" defaultValue={donation.quantity} required maxLength={50} />
          </label>
          <label>
            Pickup location
            <input name="pickup_location" defaultValue={donation.pickup_location} required maxLength={200} />
          </label>
          <label>
            Pickup deadline
            <input name="pickup_deadline" type="datetime-local" defaultValue={deadlineValue} required />
          </label>
          <label>
            Replace image
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  setImagePreview(donation.image_url);
                  return;
                }
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </label>

          <div className="actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <Link className="button secondary" href={`/donations/${donation.id}`}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}

import Link from 'next/link';

export default function DonorDashboardPage() {
  return (
    <main className="container">
      <h1>Donor Dashboard</h1>
      <p className="meta">Post surplus food immediately after registering as a donor.</p>
      <section className="grid">
        <article className="card">
          <h2>Create Donation</h2>
          <p>Add food details, pickup location, deadline, and an optional image.</p>
          <Link className="button" href="/donations/create">Create Donation</Link>
        </article>
        <article className="card">
          <h2>My Donations</h2>
          <p>View, edit, or delete the donations you have posted.</p>
          <Link className="button secondary" href="/donations/my-donations">View My Donations</Link>
        </article>
      </section>
    </main>
  );
}
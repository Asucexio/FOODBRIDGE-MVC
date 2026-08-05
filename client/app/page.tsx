import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="meta">Surplus food, shared faster</p>
          <h1>FoodBridge</h1>
          <p>Connect donors with approved community recipients so good food reaches people instead of going to waste.</p>
        </div>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <Link className="button" href="/register">Get Started</Link>
          <Link className="button secondary" href="/login">Login</Link>
        </div>
        <div className="badge-row">
          <span className="badge"><span className="dot" />Listings reviewed for food safety</span>
          <span className="badge"><span className="dot" />Recipients verified before approval</span>
          <span className="badge"><span className="dot" />Pickup coordinated same day</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="meta">How it works</span>
          <h2>From surplus to pickup in three steps</h2>
          <p>A simple, transparent process for donors and recipients alike.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <h3>Post a listing</h3>
            <p>Donors add surplus food with quantity, pickup window, and any allergen notes.</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <h3>Get matched</h3>
            <p>Approved recipients nearby are notified and can claim what they need.</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <h3>Hand it off</h3>
            <p>Coordinate a pickup time and confirm once the donation is collected.</p>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <span className="meta">Built for three roles</span>
          <h2>Everyone has a clear next step</h2>
        </div>
        <div className="grid">
          <article className="card">
            <div className="role-icon">D</div>
            <h2>Donors</h2>
            <p>Register, post surplus food, and manage your donation listings.</p>
          </article>
          <article className="card">
            <div className="role-icon">R</div>
            <h2>Recipients</h2>
            <p>Register, wait for manual admin approval, then browse and claim available food.</p>
          </article>
          <article className="card">
            <div className="role-icon">A</div>
            <h2>Admins</h2>
            <p>Approve recipients manually in the Supabase dashboard by updating their profile.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="cta-banner">
          <h2>Ready to reduce food waste in your community?</h2>
          <p>It takes a few minutes to register as a donor or recipient and start your first match.</p>
          <div className="actions">
            <Link className="button" href="/register">Get Started</Link>
            <Link className="button secondary" href="/donations/browse">Browse Donations</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <strong>FoodBridge</strong>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/donor-dashboard">Donor Dashboard</Link>
          <Link href="/donations/browse">Browse</Link>
        </nav>
        <span>&copy; {new Date().getFullYear()} FoodBridge</span>
      </footer>
    </main>
  );
}
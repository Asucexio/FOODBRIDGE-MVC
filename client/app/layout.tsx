import type { Metadata } from 'next';
import Link from 'next/link';
// @ts-ignore
import './global.css';


export const metadata: Metadata = {
  title: 'FoodBridge',
  description: 'Connect surplus food donors with approved recipients.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <strong>FoodBridge</strong>
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/donor-dashboard">Donor Dashboard</Link>
          <Link href="/donations/browse">Browse</Link>
          <Link href="/register" className="nav-cta">Register</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
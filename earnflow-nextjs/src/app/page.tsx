import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Earn Points by Watching Ads</h1>
          <p className="hero-subtitle">
            Watch videos, complete surveys, and withdraw real rewards.
          </p>
          <div>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link href="/login" className="btn">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="how-it-works-grid">
            <div className="card how-it-works-card">
              <h3>1. Sign Up</h3>
              <p>Create your free account in just a few seconds to get started.</p>
            </div>
            <div className="card how-it-works-card">
              <h3>2. Watch & Earn</h3>
              <p>Watch sponsored videos or complete simple surveys to earn points.</p>
            </div>
            <div className="card how-it-works-card">
              <h3>3. Withdraw Rewards</h3>
              <p>Exchange your points for real cash or gift cards.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
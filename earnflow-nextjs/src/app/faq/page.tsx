'use client';

import { useSession } from '@/lib/appwrite-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FaqPage() {
  const { loading } = useSession();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!loading) {
      const checkSession = async () => {
        try {
          const res = await fetch('/api/auth/session');
          if (!res.ok) {
            router.push('/login');
          }
        } catch (error) {
          router.push('/login');
        }
      };
      checkSession();
    }
  }, [loading, router]);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="card">
          <p>Loading FAQ page...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/earn">Earn</Link>
          <Link href="/withdraw">Withdraw</Link>
          <Link href="/faq" className="active">
            FAQ
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <h1 className="page-title">Frequently Asked Questions</h1>

        <div className="card faq-accordion">
          <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`}>
            <button className="faq-question" onClick={() => toggleAccordion(0)}>
              <span>How do I earn points?</span>
              <span>{activeIndex === 0 ? '-' : '+'}</span>
            </button>
            <div className="faq-answer" style={{ maxHeight: activeIndex === 0 ? '300px' : '0' }}>
              <p>You can earn points by watching video ads or completing surveys from the "Earn" page. New opportunities are added regularly.</p>
            </div>
          </div>
          <div className={`faq-item ${activeIndex === 1 ? 'active' : ''}`}>
            <button className="faq-question" onClick={() => toggleAccordion(1)}>
              <span>What is the minimum withdrawal amount?</span>
              <span>{activeIndex === 1 ? '-' : '+'}</span>
            </button>
            <div className="faq-answer" style={{ maxHeight: activeIndex === 1 ? '300px' : '0' }}>
              <p>The minimum withdrawal amount is 5,000 points, which is equivalent to $5.00.</p>
            </div>
          </div>
          <div className={`faq-item ${activeIndex === 2 ? 'active' : ''}`}>
            <button className="faq-question" onClick={() => toggleAccordion(2)}>
              <span>How long does it take to receive my reward?</span>
              <span>{activeIndex === 2 ? '-' : '+'}</span>
            </button>
            <div className="faq-answer" style={{ maxHeight: activeIndex === 2 ? '300px' : '0' }}>
              <p>Withdrawals are typically processed within 24-48 hours. You will receive a confirmation email once your payment is sent.</p>
            </div>
          </div>
        </div>

        <div className="card rules-section">
          <h2>Platform Rules</h2>
          <ul>
            <li>Only one account is allowed per user.</li>
            <li>The use of VPNs, proxies, or any method to hide your real identity is strictly forbidden.</li>
            <li>Automated bots or software to watch ads or complete surveys are not allowed.</li>
            <li>Violation of these rules will result in a permanent account ban.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

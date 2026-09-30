'use client';
import Link from 'next/link';
import {Leaf, MapPin, ClipboardList, HelpCircle} from 'lucide-react';

export default function Landing() {
  return (
    <main className="landing">
      <div className="landing-card">
        <div className="landing-brand">
          <span className="brand-icon"><Leaf size={26} /></span>
          <span className="landing-name">Heartfood <span className="ct">CT</span></span>
        </div>
        <p className="landing-tag">Find a food trip that fits your day, including the way back.</p>

        <Link href="/plan?quick=1" className="landing-cta-primary">
          <MapPin size={20} /> Find food near me
        </Link>
        <Link href="/plan" className="landing-cta-secondary">
          <ClipboardList size={18} /> Enter my details
        </Link>
        <Link href="/how-it-works" className="landing-link">
          <HelpCircle size={15} /> How Heartfood works
        </Link>
      </div>
    </main>
  );
}

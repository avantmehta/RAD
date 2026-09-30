'use client';
import Link from 'next/link';
import {MapPin, ClipboardList, HelpCircle} from 'lucide-react';
import BrandIcon from '@/components/brand-icon';
import HartfordSkyline from '@/components/hartford-skyline';

export default function Landing() {
  return (
    <main className="landing">
      <HartfordSkyline />
      <div className="landing-card">
        <div className="landing-brand">
          <span className="landing-icon"><BrandIcon size={54} /></span>
          <span className="landing-name"><span className="hf-heart">Heart</span><span className="hf-food">food</span></span>
        </div>
        <p className="landing-tag">Ask naturally. Get there reliably.</p>

        <Link href="/plan?quick=1" className="landing-cta-primary">
          <MapPin size={20} /> Find food near me
        </Link>
        <Link href="/plan" className="landing-cta-secondary">
          <ClipboardList size={18} /> Select preferences
        </Link>
        <Link href="/how-it-works" className="landing-link">
          <HelpCircle size={15} /> How Heartfood works
        </Link>
      </div>
    </main>
  );
}

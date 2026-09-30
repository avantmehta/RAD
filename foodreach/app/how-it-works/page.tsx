import Link from 'next/link';
import {MapPin, ClipboardList, ListChecks, ShieldCheck, ArrowLeft} from 'lucide-react';
import BrandHeader from '@/components/brand-header';

export default function HowItWorks(){
 return <><header className="topbar"><BrandHeader/></header>
 <main className="howto-shell">
  <Link href="/" className="howto-back"><ArrowLeft size={16}/> Back</Link>
  <div className="eyebrow">WHY HEARTFOOD</div>
  <h1>Nearby isn&apos;t always reachable.</h1>
  <p className="howto-lede">A pantry ten minutes away by car can be an hour away by bus &mdash; or closed by the time you&apos;d arrive. Heartfood plans the whole round trip, not just the distance.</p>

  <section className="howto-steps">
   <div className="howto-step">
    <span className="step"><MapPin size={18}/></span>
    <div>
     <h2>1. Tell us where you are</h2>
     <p>Tap <strong>Find food near me</strong> and we use your phone&apos;s location automatically &mdash; or tap <strong>Enter my details</strong> to pick a starting point, how you&apos;ll travel (bus, walking, or car), and when you need to leave and be back.</p>
    </div>
   </div>
   <div className="howto-step">
    <span className="step"><ListChecks size={18}/></span>
    <div>
     <h2>2. We check what&apos;s actually reachable</h2>
     <p>Heartfood checks real CTtransit bus schedules and walking distances &mdash; not just which pantry is closest on a map &mdash; and rules out anything you couldn&apos;t realistically get to and back from in time.</p>
    </div>
   </div>
   <div className="howto-step">
    <span className="step"><ShieldCheck size={18}/></span>
    <div>
     <h2>3. We're upfront about what we don't know</h2>
     <p>Published hours sometimes conflict between sources, or go unconfirmed. We show that directly instead of guessing &mdash; always call ahead before you travel.</p>
    </div>
   </div>
   <div className="howto-step">
    <span className="step"><ClipboardList size={18}/></span>
    <div>
     <h2>4. Get a plan you can use</h2>
     <p>Save or print your trip, get walking/transit directions, and see a map of your destination &mdash; no account needed, nothing stored on our servers.</p>
    </div>
   </div>
  </section>

  <div className="howto-ctas">
   <Link href="/plan?quick=1" className="landing-cta-primary"><MapPin size={20}/> Find food near me</Link>
   <Link href="/plan" className="landing-cta-secondary"><ClipboardList size={18}/> Enter my details</Link>
  </div>
 </main>
 </>
}

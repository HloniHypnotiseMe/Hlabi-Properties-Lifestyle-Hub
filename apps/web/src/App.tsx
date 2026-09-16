import { useState } from 'react';
import { ArrowRight, Home, KeyRound, Store, TrendingUp, UserRound, GraduationCap, ShieldCheck } from 'lucide-react';
import HomeownerPortal from './portal/HomeownerPortal';

const journeys = [
  { icon: Home, title: 'I own a home', text: 'Maintain, renew and plan the next five years of your property.', cta: 'Explore Home Renewal' },
  { icon: KeyRound, title: 'I want to buy', text: 'Find property guidance, services and people to help you move with confidence.', cta: 'Start buying' },
  { icon: Store, title: 'I want to sell', text: 'Prepare your home, reach buyers and manage the journey from one place.', cta: 'Start selling' },
  { icon: TrendingUp, title: 'I’m an investor', text: 'Organise opportunities, property services and long-term ownership support.', cta: 'Explore investing' },
  { icon: UserRound, title: 'I’m an agent', text: 'Give your business an AI-powered team, reputation tools and a complete operating hub.', cta: 'Explore Agent OS' },
  { icon: Store, title: 'I’m a supplier', text: 'Connect with verified property work, quote requests and repeat opportunities.', cta: 'Join supplier network' },
  { icon: GraduationCap, title: 'I want to become an agent', text: 'Learn, practise, qualify and build a career through the Hlabi Academy pathway.', cta: 'Explore Academy' },
];

export default function App() {
  const [portalOpen, setPortalOpen] = useState(false);

  if (portalOpen) {
    return <HomeownerPortal userId="demo-homeowner" onSignOut={() => setPortalOpen(false)} />;
  }

  return (
    <main>
      <nav className="nav shell">
        <div className="brand"><span className="brand-mark">H</span><span>HLABI <small>PROPERTIES</small></span></div>
        <div className="nav-links"><a href="#hub">Lifestyle Hub</a><a href="#renewal">Home Renewal</a><a href="#agents">Agents</a><a href="#academy">Academy</a></div>
        <button className="nav-button" onClick={() => setPortalOpen(true)}>Sign in</button>
      </nav>

      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">THE HLABI LIFESTYLE HUB</p>
            <h1>Your property.<br /><em>Your plans.<br />Your people.</em></h1>
            <p className="hero-copy">More than an estate agent. A connected property ecosystem for homeowners, buyers, sellers, investors, agents and trusted suppliers.</p>
            <div className="hero-actions"><button className="primary" onClick={() => setPortalOpen(true)}>Enter the Lifestyle Hub <ArrowRight size={18} /></button><button className="secondary">I’m looking for a home</button></div>
            <div className="trust"><ShieldCheck size={18} /> Built around verified people, practical property services and long-term ownership.</div>
          </div>
          <div className="hero-card" id="renewal">
            <div className="card-label">FEATURED</div>
            <h2>Home Renewal Plan™</h2>
            <p>Turn maintenance from an afterthought into a five-year property plan.</p>
            <div className="renewal-line"><span>Inspect</span><span>Renew</span><span>Maintain</span><span>Repeat</span></div>
            <button className="card-link" onClick={() => setPortalOpen(true)}>Discover the plan <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="hub shell" id="hub">
        <div className="section-head"><div><p className="eyebrow">ONE HUB, MANY JOURNEYS</p><h2>Where are you in your property journey?</h2></div><p>Choose your starting point. The Hub connects the services, people and tools around it.</p></div>
        <div className="journey-grid">{journeys.map(({ icon: Icon, title, text, cta }) => <article className="journey" key={title}><Icon size={24} /><h3>{title}</h3><p>{text}</p><button onClick={() => title === 'I own a home' && setPortalOpen(true)}>{cta} <ArrowRight size={15} /></button></article>)}</div>
      </section>

      <section className="renewal-band">
        <div className="shell two-col"><div><p className="eyebrow">FOR HOMEOWNERS</p><h2>Own the next five years.</h2><p>Start with a digital home audit, identify what needs attention, connect with suitable suppliers and create a practical renewal plan.</p><button className="light-button" onClick={() => setPortalOpen(true)}>Start a home audit <ArrowRight size={17} /></button></div><div className="steps"><div><b>01</b><span>Assess your home</span></div><div><b>02</b><span>Plan maintenance & upgrades</span></div><div><b>03</b><span>Connect verified suppliers</span></div><div><b>04</b><span>Track the property journey</span></div></div></div>
      </section>

      <section className="ecosystem shell" id="agents">
        <p className="eyebrow">THE ECOSYSTEM</p><h2>Property is connected. Your tools should be too.</h2>
        <div className="ecosystem-grid"><div><h3>AI staff for agents</h3><p>Listing creation, lead follow-up, marketing, client communications and reputation management in one operating layer.</p></div><div><h3>Trusted supplier network</h3><p>Qualified opportunities and repeat property work for contractors, trades and building-material partners.</p></div><div><h3>Hlabi Academy</h3><p>A practical learning and simulation pathway for people entering the property profession.</p></div><div><h3>Franchise Accelerator</h3><p>A pathway for independent agents to operate as Hlabi remote branches with technology and ecosystem support.</p></div></div>
      </section>

      <footer className="footer"><div className="shell footer-grid"><div><div className="brand"><span className="brand-mark">H</span><span>HLABI <small>PROPERTIES</small></span></div><p>Your property. Your plans. Your people. One hub.</p></div><div><b>Explore</b><a href="#hub">Lifestyle Hub</a><a href="#renewal">Home Renewal</a><a href="#agents">Agent OS</a><a href="#academy">Academy</a></div><div><b>For partners</b><a href="#">Suppliers</a><a href="#">Underwriters</a><a href="#">Franchise</a><a href="#">Partners</a></div></div><div className="shell legal">© {new Date().getFullYear()} Hlabi Properties. Lifestyle Hub platform. Product, insurance and franchise features are subject to applicable agreements, approvals and regulatory requirements.</div></footer>
    </main>
  );
}

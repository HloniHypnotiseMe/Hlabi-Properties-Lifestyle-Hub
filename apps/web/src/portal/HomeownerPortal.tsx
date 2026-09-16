import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, Home, ShieldCheck, Wrench } from 'lucide-react';
import type { HomeownerDashboardData } from '../domain/property';
import { demoHomeownerRepository } from '../domain/homeownerRepository';
import './portal.css';

interface HomeownerPortalProps {
  userId: string;
  onSignOut: () => void;
}

export default function HomeownerPortal({ userId, onSignOut }: HomeownerPortalProps) {
  const [data, setData] = useState<HomeownerDashboardData | null>(null);

  useEffect(() => {
    let active = true;
    demoHomeownerRepository.getDashboard(userId).then((dashboard) => {
      if (active) setData(dashboard);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!data) {
    return <div className="portal-loading">Loading your property hub…</div>;
  }

  const property = data.properties[0];
  const plan = data.renewalPlans.find((item) => item.propertyId === property?.id);
  const openTasks = plan?.tasks.filter((task) => task.status !== 'COMPLETED').length ?? 0;

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <button className="portal-back" onClick={onSignOut}><ArrowLeft size={16} /> Public site</button>
        <div className="portal-brand"><span className="portal-mark">H</span><span>HLABI <small>LIFESTYLE HUB</small></span></div>
        <span className="portal-role">HOMEOWNER</span>
      </header>

      <section className="portal-intro">
        <div>
          <p className="portal-eyebrow">YOUR HOMEOWNER HUB</p>
          <h1>Good to see you.</h1>
          <p>One place to understand your home, plan maintenance and keep the property journey moving.</p>
        </div>
        <button className="portal-primary"><Wrench size={17} /> Start a home audit</button>
      </section>

      <section className="property-overview">
        <div className="property-main">
          <div className="property-icon"><Home size={23} /></div>
          <div><span>YOUR PROPERTY</span><h2>{property.nickname}</h2><p>{property.address.suburb}, {property.address.city}</p></div>
        </div>
        <div className="property-health"><span>RENEWAL HEALTH</span><strong>{property.conditionScore}%</strong><small>{property.conditionGrade} · reviewed {data.audits[0]?.inspectedAt}</small></div>
      </section>

      <section className="portal-grid">
        <article className="portal-card plan-card">
          <div className="card-top"><div><span className="portal-label">HOME RENEWAL PLAN™</span><h3>{plan?.status === 'ACTIVE' ? 'Active five-year plan' : 'Plan setup'}</h3></div><ShieldCheck size={22} /></div>
          <p>Your current plan is organised around recurring reviews, practical maintenance and verified service providers.</p>
          <div className="plan-meta"><span><CalendarDays size={15} /> Next review</span><b>{plan?.nextReviewDate}</b><span><Wrench size={15} /> Open actions</span><b>{openTasks}</b></div>
        </article>

        <article className="portal-card">
          <span className="portal-label">UPCOMING</span>
          <h3>Property actions</h3>
          <div className="task-list">{plan?.tasks.map((task) => <div className="task" key={task.id}><div><b>{task.title}</b><small>{task.area} · due {task.dueDate}</small></div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>)}</div>
        </article>

        <article className="portal-card">
          <span className="portal-label">SUPPLIER QUOTES</span>
          <h3>Quote requests</h3>
          <div className="empty-state"><FileText size={22} /><p>No active quotes yet.</p><button>Request a quote</button></div>
        </article>

        <article className="portal-card">
          <span className="portal-label">RECENT ACTIVITY</span>
          <h3>Property timeline</h3>
          <div className="activity-list">{data.activity.map((event) => <div className="activity" key={event.id}><CheckCircle2 size={17} /><div><b>{event.title}</b><small>{event.occurredAt}</small></div></div>)}</div>
        </article>
      </section>

      <div className="portal-note">Portal foundation: this screen currently uses demo data. Authentication, API persistence, supplier matching, payments and document storage will connect through the backend contracts as those services are implemented.</div>
    </main>
  );
}

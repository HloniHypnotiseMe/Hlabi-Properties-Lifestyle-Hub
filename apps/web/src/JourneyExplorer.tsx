import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, KeyRound, Store, TrendingUp, X } from 'lucide-react';

type JourneyKey = 'BUYER' | 'SELLER' | 'INVESTOR';
type Field = { key: string; label: string; placeholder?: string; type?: string; required?: boolean };
const configs: Record<JourneyKey, { title: string; intro: string; icon: typeof KeyRound; steps: string[]; fields: Field[] }> = {
  BUYER: {
    title: 'Buying a home',
    intro: 'Build a live buying plan from your criteria through discovery, viewing, due diligence and ownership.',
    icon: KeyRound,
    steps: ['Define budget, area and priorities', 'Discover and shortlist suitable properties', 'Arrange viewing and due diligence', 'Plan finance, move and ownership'],
    fields: [
      { key: 'preferredSuburb', label: 'Preferred area', placeholder: 'e.g. Sandton, Rosebank' },
      { key: 'city', label: 'City', placeholder: 'e.g. Johannesburg' },
      { key: 'province', label: 'Province', placeholder: 'e.g. Gauteng' },
      { key: 'propertyTypes', label: 'Property types', placeholder: 'e.g. House, Apartment' },
      { key: 'maxBudget', label: 'Maximum budget (R)', placeholder: 'e.g. 2500000', type: 'number' },
      { key: 'bedrooms', label: 'Bedrooms', placeholder: 'e.g. 3', type: 'number' },
      { key: 'financingStatus', label: 'Finance status', placeholder: 'UNKNOWN, CASH, PRE_APPROVED or NEEDS_FINANCE' },
    ],
  },
  SELLER: {
    title: 'Selling a property',
    intro: 'Turn the decision to sell into a connected preparation, listing and transaction workspace.',
    icon: Store,
    steps: ['Identify the property and target timing', 'Assess condition and preparation needs', 'Prepare listing and buyer-facing information', 'Track offers, transfer and next steps'],
    fields: [
      { key: 'propertyId', label: 'Property ID', placeholder: 'Your Hlabi property ID' },
      { key: 'targetSaleDate', label: 'Target sale date', type: 'date' },
      { key: 'reason', label: 'Reason for selling', placeholder: 'What is driving the sale?' },
      { key: 'readiness', label: 'Preparation stage', placeholder: 'NOT_STARTED, PREPARING or READY_TO_LIST' },
      { key: 'notes', label: 'Notes', placeholder: 'Anything the property team should know?' },
    ],
  },
  INVESTOR: {
    title: 'Property investing',
    intro: 'Capture your investment thesis and turn it into a structured opportunity, diligence and operations workflow.',
    icon: TrendingUp,
    steps: ['Define strategy, area, budget and risk', 'Screen opportunities against your criteria', 'Run due diligence and financing checks', 'Plan acquisition and ongoing operations'],
    fields: [
      { key: 'targetArea', label: 'Target area', placeholder: 'e.g. Johannesburg North' },
      { key: 'strategy', label: 'Strategy', placeholder: 'LONG_TERM_RENTAL, FLIP, DEVELOPMENT or MIXED' },
      { key: 'minBudget', label: 'Minimum budget (R)', placeholder: 'e.g. 1000000', type: 'number' },
      { key: 'maxBudget', label: 'Maximum budget (R)', placeholder: 'e.g. 3000000', type: 'number' },
      { key: 'targetYieldPercent', label: 'Target yield (%)', placeholder: 'e.g. 8', type: 'number' },
      { key: 'riskProfile', label: 'Risk profile', placeholder: 'CONSERVATIVE, BALANCED or GROWTH' },
    ],
  },
};

const cents=(v:string)=>v?Math.round(Number(v)*100):undefined;
export default function JourneyExplorer() {
  const [selected,setSelected]=useState<JourneyKey|null>(null);
  const [form,setForm]=useState<Record<string,string>>({});
  const [status,setStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [message,setMessage]=useState('');
  const [savedJourney,setSavedJourney]=useState<Record<string,unknown>|null>(null);
  const config=selected?configs[selected]:null;
  const close=()=>{setSelected(null);setStatus('idle');setMessage('');setForm({});setSavedJourney(null);};
  const open=(key:JourneyKey)=>{setSelected(key);setStatus('idle');setMessage('');setForm({});setSavedJourney(null);};
  const submit=async(e:FormEvent)=>{
    e.preventDefault(); if(!selected)return;
    setStatus('saving'); setMessage('');
    const body=selected==='BUYER'
      ? {...form,propertyTypes:(form.propertyTypes||'').split(',').map(x=>x.trim()).filter(Boolean),maxBudgetCents:cents(form.maxBudget),bedrooms:form.bedrooms?Number(form.bedrooms):undefined}
      : selected==='SELLER'
      ? {...form,targetSaleDate:form.targetSaleDate?new Date(form.targetSaleDate+'T00:00:00.000Z').toISOString():undefined}
      : {...form,minBudgetCents:cents(form.minBudget),maxBudgetCents:cents(form.maxBudget),targetYieldPercent:form.targetYieldPercent?Number(form.targetYieldPercent):undefined};
    ['maxBudget','minBudget','bedrooms'].forEach(k=>delete body[k]);
    try{
      const res=await fetch(selected==='BUYER'?'/api/v1/buyer/journey':selected==='SELLER'?'/api/v1/seller/journey':'/api/v1/investor/journey',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!res.ok) throw new Error((await res.json()).error||'Unable to save journey');
      setSavedJourney(await res.json()); setStatus('saved'); setMessage('Your journey is now saved to your account.');
    }catch(err){setStatus('error');setMessage(err instanceof Error?err.message:'Unable to save journey. Sign in with the matching role and try again.');}
  };
  return <>
    <div className="journey-grid journey-grid-featured">
      {(Object.keys(configs) as JourneyKey[]).map(key=>{const c=configs[key];const Icon=c.icon;return <article className="journey journey-featured" key={key} onClick={()=>open(key)}><Icon size={24}/><span className="journey-kicker">{key==='BUYER'?'BUY':key==='SELLER'?'SELL':'INVEST'}</span><h3>{c.title}</h3><p>{c.intro}</p><button onClick={()=>open(key)}>Start journey <ArrowRight size={15}/></button></article>})}
    </div>
    {config&&<div className="journey-overlay" role="dialog" aria-modal="true" aria-label={config.title}>
      <div className="journey-modal"><button className="journey-close" onClick={close} aria-label="Close"><X size={20}/></button>
        {status==='saved'?<div className="journey-success"><CheckCircle2 size={42}/><p className="eyebrow">JOURNEY SAVED</p><h2>Now we can work from a real plan.</h2><p>{message}</p>{selected==='SELLER'&&<div className="journey-next"><b>Next action</b><span>{String(savedJourney?.readiness)==='READY_TO_LIST'?'Move into listing and buyer preparation.':String(savedJourney?.readiness)==='PREPARING'?'Complete property preparation and readiness checks.':'Capture the property and start preparation.'}</span></div>}{selected==='BUYER'&&<div className="journey-next"><b>Next action</b><span>{String(savedJourney?.financingStatus)==='NEEDS_FINANCE'?'Connect the finance pathway before narrowing the purchase plan.':'Move into property discovery and shortlist suitable opportunities.'}</span></div>}{selected==='INVESTOR'&&<div className="journey-next"><b>Next action</b><span>Screen opportunities against your strategy, budget, yield and risk criteria.</span></div>}<button className="primary" onClick={close}>Continue <ArrowRight size={18}/></button></div>:
        <form onSubmit={submit}><p className="eyebrow">YOUR PROPERTY JOURNEY</p><h2>{config.title}</h2><p className="journey-modal-intro">{config.intro}</p>
          <div className="journey-plan">{config.steps.map((step,i)=><div key={step}><b>0{i+1}</b><span>{step}</span></div>)}</div>
          <div className="journey-intake"><h3>Build your starting plan</h3>{config.fields.map(field=><label key={field.key}>{field.label}<input required={field.required||['propertyId','strategy','riskProfile'].includes(field.key)} type={field.type||'text'} placeholder={field.placeholder} value={form[field.key]||''} onChange={e=>setForm({...form,[field.key]:e.target.value})}/></label>)}</div>
          {message&&<p role="alert">{message}</p>}
          <button className="primary journey-submit" disabled={status==='saving'}>{status==='saving'?'Saving…':'Save my journey'} <ArrowRight size={18}/></button>
          <small className="journey-note">Journey data is planning context. It is not a credit, valuation, legal, tax or investment recommendation.</small>
        </form>}
      </div>
    </div>}
  </>;
}

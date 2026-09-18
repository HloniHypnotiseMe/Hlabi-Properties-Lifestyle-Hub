import { useEffect, useMemo, useState } from 'react';

const sections=['PROPERTY','OWNERSHIP','MAINTENANCE','RENOVATIONS','APPLIANCES','INSURANCE','FINANCE','SERVICES','DOCUMENTS','WARRANTIES','PROJECTS','PREFERENCES'] as const;

export default function HomePassport(){
  const [passport,setPassport]=useState<any>(null);
  const [linked,setLinked]=useState<any>(null);
  const [section,setSection]=useState<typeof sections[number]>('PROPERTY');
  const [value,setValue]=useState('{}');
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  async function load(){
    setError('');
    try{
      const r=await fetch('/api/v1/homeowner/properties/demo-property-1/passport');
      const d=await r.json();
      if(!r.ok)throw new Error(d.error??'Unable to load passport');
      setPassport(d.passport);
      setLinked(d.linked);
      setValue(JSON.stringify(d.passport?.data?.[section]??{},null,2));
    }catch(e){setError(e instanceof Error?e.message:'Unable to load passport');}
  }
  useEffect(()=>{void load();},[]);

  async function save(){
    setError('');setSaving(true);
    try{
      const parsed=JSON.parse(value);
      const r=await fetch('/api/v1/homeowner/properties/demo-property-1/passport',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({section,value:parsed})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error??'Unable to save');
      setPassport(d);
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Invalid passport data');}
    finally{setSaving(false);}
  }

  const stats=useMemo(()=>[
    ['Latest audit',linked?.latestAudit?'Available':'Not captured'],
    ['Quote requests',linked?.quoteRequests?.length??0],
    ['Supplier quotes',linked?.quotes?.reduce((n:any,x:any)=>n+(x.quotes?.length??0),0)??0],
    ['Service jobs',linked?.jobs?.length??0],
    ['Evidence records',linked?.jobEvidence?.reduce((n:any,x:any)=>n+(x.evidence?.length??0),0)??0],
    ['Renewal tasks',linked?.renewalTasks?.length??0],
  ],[linked]);

  return <section className="shell" id="home-passport" style={{padding:'72px 0'}}>
    <p className="eyebrow">HOME PASSPORT</p>
    <h2>Your property, remembered.</h2>
    <p>One living record for ownership, maintenance, upgrades, documents, warranties, services and future plans.</p>
    {error&&<p role="alert">{error}</p>}
    {passport&&<><div className="ecosystem-grid" style={{marginTop:24}}>
      {sections.map(s=><article className="journey" key={s}><h3>{s}</h3><p>{passport.data?.[s]?'Updated':'Not captured yet'}</p><button onClick={()=>{setSection(s);setValue(JSON.stringify(passport.data?.[s]??{},null,2));}}>Open</button></article>)}
    </div>
    <div className="ecosystem-grid" style={{marginTop:24}}>
      {stats.map(([label,count])=><article className="journey" key={label}><h3>{label}</h3><p>{count}</p></article>)}
    </div>
    <div style={{marginTop:24,maxWidth:720}}>
      <label>Section: <select value={section} onChange={e=>{const s=e.target.value as typeof sections[number];setSection(s);setValue(JSON.stringify(passport.data?.[s]??{},null,2));}}>{sections.map(s=><option key={s}>{s}</option>)}</select></label>
      <textarea aria-label={`Edit ${section} section`} value={value} onChange={e=>setValue(e.target.value)} rows={8} style={{display:'block',width:'100%',marginTop:12}}/>
      <button className="primary" disabled={saving} onClick={save} style={{marginTop:12}}>{saving?'Saving…':'Save to Home Passport'}</button>
    </div></>}
  </section>
}

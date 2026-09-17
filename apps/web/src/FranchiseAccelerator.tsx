import React, { useEffect, useState } from 'react';

type Stage = 'ACADEMY'|'AGENT'|'OFFICE'|'FRANCHISE';
type Profile = { stage:Stage; status:string; checklist:Record<string,boolean>; territory?:string; officeName?:string; franchiseOpportunityId?:string; notes?:string };

type Payload = { profile:Profile; readiness:{foundationComplete:boolean;evidencePackageReady:boolean;readinessPassed:boolean}; stageRequirements:Record<Stage,string[]>; nextStage:Stage|null; statutoryBoundary:string };

const labels:Record<Stage,string>={ACADEMY:'Academy',AGENT:'Agent',OFFICE:'Office',FRANCHISE:'Franchise'};

export function FranchiseAccelerator(){
  const [data,setData]=useState<Payload|null>(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const load=async()=>{try{const r=await fetch('/api/v1/academy/franchise-accelerator');if(!r.ok)throw new Error('Unable to load accelerator');setData(await r.json());}catch(e){setError(e instanceof Error?e.message:'Unable to load accelerator');}};
  useEffect(()=>{void load();},[]);
  const advance=async()=>{setBusy(true);setError('');try{const r=await fetch('/api/v1/academy/franchise-accelerator/advance',{method:'POST',headers:{'Content-Type':'application/json'}});const body=await r.json();if(!r.ok)throw new Error(body.error??'Stage requirements are incomplete');await load();}catch(e){setError(e instanceof Error?e.message:'Unable to advance');}finally{setBusy(false);}};
  const update=async(patch:Record<string,unknown>)=>{setBusy(true);setError('');try{const r=await fetch('/api/v1/academy/franchise-accelerator',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});const body=await r.json();if(!r.ok)throw new Error(body.error??'Update failed');await load();}catch(e){setError(e instanceof Error?e.message:'Update failed');}finally{setBusy(false);}};
  if(error&&!data)return <section><h2>Franchise Accelerator</h2><p>{error}</p></section>;
  if(!data)return <section><h2>Franchise Accelerator</h2><p>Loading…</p></section>;
  const {profile}=data; const required=data.stageRequirements[profile.stage]??[];
  return <section style={{padding:'1rem',maxWidth:900,margin:'0 auto'}}>
    <header><h2>Franchise Accelerator</h2><p>Academy → Agent → Office → Franchise</p></header>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,margin:'1rem 0'}}>{(['ACADEMY','AGENT','OFFICE','FRANCHISE'] as Stage[]).map(s=><div key={s} style={{padding:12,border:'1px solid currentColor',borderRadius:10,fontWeight:s===profile.stage?700:400}}>{labels[s]}<br/><small>{s===profile.stage?'CURRENT':s}</small></div>)}</div>
    <div style={{padding:'1rem',border:'1px solid currentColor',borderRadius:12}}><strong>{labels[profile.stage]} readiness</strong><p>Status: {profile.status}</p>
      {profile.stage==='ACADEMY'&&<p>Foundation: {data.readiness.foundationComplete?'complete':'incomplete'} · Evidence: {data.readiness.evidencePackageReady?'ready':'pending'} · Readiness exam: {data.readiness.readinessPassed?'passed':'pending'}</p>}
      <h3>Checklist</h3><ul>{required.map(k=><li key={k}><label><input type="checkbox" checked={profile.checklist[k]===true} onChange={e=>void update({checklist:{...profile.checklist,[k]:e.target.checked}})} /> {k}</label></li>)}</ul>
      {profile.stage!=='FRANCHISE'&&<button disabled={busy} onClick={()=>void advance()}>Advance to {labels[data.nextStage??profile.stage]}</button>}
      {error&&<p role="alert">{error}</p>}
    </div>
    <p style={{marginTop:'1rem',fontSize:'.85rem'}}>{data.statutoryBoundary}</p>
  </section>;
}

export default FranchiseAccelerator;

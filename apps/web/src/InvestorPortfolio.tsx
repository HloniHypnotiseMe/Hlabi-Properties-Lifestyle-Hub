import {useEffect,useState} from 'react';

const evidenceKinds=['OWNERSHIP','OCCUPANCY','RENTAL_INCOME','OPERATING_EXPENSES','COMPLIANCE','VALUATION','DOCUMENT'] as const;
export default function InvestorPortfolio(){
 const[d,setD]=useState<any>(null);const[e,setE]=useState('');const[active,setActive]=useState<string|null>(null);const load=()=>fetch('/api/v1/investor/portfolio').then(async r=>{if(!r.ok)throw new Error((await r.json()).error||'Unable to load portfolio');return r.json()}).then(setD).catch(x=>setE(x.message));useEffect(load,[]);
 if(e)return <p>{e}</p>;if(!d)return <p>Loading portfolio intelligence…</p>;
 return <section className="journey-opportunities"><div className="journey-next"><b>Investor diligence intelligence</b><span>Listing facts are shown as captured. Investment metrics are calculated only when the required income and expense evidence is verified.</span></div>
 {d.items.length===0?<p>No saved opportunities yet.</p>:d.items.map((x:any)=><article className="journey" key={x.portfolio.id}>
  <span className="journey-kicker">{x.portfolio.status.replace('_',' ')}</span><h3>{x.listing?.title||'Listing no longer public'}</h3>
  {x.listing&&<><p>{x.listing.description}</p><strong>{x.listing.askingPriceCents?'R'+(x.listing.askingPriceCents/100).toLocaleString():'Price not captured'}</strong></>}
  {active===x.portfolio.listingId?<DiligencePanel listingId={x.portfolio.listingId}/>:<button onClick={()=>setActive(x.portfolio.listingId)}>Open diligence</button>}
  <label>Stage<select value={x.portfolio.status} onChange={async ev=>{await fetch('/api/v1/investor/portfolio/'+x.portfolio.listingId,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:ev.target.value})});load()}}><option>WATCHLIST</option><option>DUE_DILIGENCE</option><option>OFFERED</option><option>ACQUIRED</option><option>PASSED</option></select></label>
 </article>)}</section>
}
function DiligencePanel({listingId}:{listingId:string}){
 const[d,setD]=useState<any>(null);const[error,setError]=useState('');const load=()=>fetch('/api/v1/investor/diligence/'+listingId).then(async r=>{if(!r.ok)throw new Error((await r.json()).error||'Unable to load diligence');return r.json()}).then(setD).catch(x=>setError(x.message));useEffect(load,[listingId]);
 if(error)return <small>{error}</small>;if(!d)return <small>Loading diligence…</small>;
 const byKind=new Map(d.evidence.map((x:any)=>[x.kind,x]));
 return <div className="journey-next"><b>Evidence</b><p>Captured: {d.evidence.filter((x:any)=>x.status==='CAPTURED').length} · Verified: {d.evidence.filter((x:any)=>x.status==='VERIFIED').length}</p>
  <p>{d.metrics.grossYieldPercent!==undefined?'Gross yield: '+d.metrics.grossYieldPercent+'%':'Gross yield: unavailable — verified annual rent is required.'}{d.metrics.netYieldPercent!==undefined?' · Net yield: '+d.metrics.netYieldPercent+'%':' · Net yield: unavailable — verified annual expenses are required.'}</p>
  <small>Next: {d.nextAction}</small><div>{evidenceKinds.map(kind=><EvidenceEditor key={kind} listingId={listingId} kind={kind} existing={byKind.get(kind)}/>)}</div>
 </div>
}
function EvidenceEditor({listingId,kind,existing}:{listingId:string;kind:string;existing?:any}){
 const[v,setV]=useState(existing?.value??'');const[status,setStatus]=useState(existing?.status==='VERIFIED'?'VERIFIED':'CAPTURED');const[message,setMessage]=useState('');
 const save=async()=>{const r=await fetch('/api/v1/investor/diligence/'+listingId+'/'+kind,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,label:kind.replaceAll('_',' '),value:v,source:'Investor captured evidence'})});setMessage(r.ok?'Saved':'Unable to save');};
 return <div><label>{kind.replaceAll('_',' ')} <select value={status} onChange={e=>setStatus(e.target.value)}><option>CAPTURED</option><option>MISSING</option></select></label><input value={v} onChange={e=>setV(e.target.value)} placeholder="Evidence value / reference"/><button onClick={save}>Save</button>{message&&<small>{message}</small>}</div>
}

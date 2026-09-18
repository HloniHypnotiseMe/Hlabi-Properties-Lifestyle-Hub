import { useEffect, useState } from 'react';

type Opportunity={listing:{id:string;title:string;description:string;askingPriceCents?:number};status:string;criteriaMatches:string[];missingData:string[];notes:string[]};
export default function InvestorOpportunities(){
 const [data,setData]=useState<any>(null); const [error,setError]=useState('');
 useEffect(()=>{fetch('/api/v1/investor/opportunities').then(async r=>{if(!r.ok)throw new Error((await r.json()).error||'Unable to load opportunities');return r.json()}).then(setData).catch(e=>setError(e instanceof Error?e.message:'Unable to load opportunities'));},[]);
 if(error)return <div className="journey-next"><b>Opportunity intelligence</b><span>{error}. Save an investor journey first.</span></div>;
 if(!data)return <p>Loading opportunity intelligence…</p>;
 const j=data.journey;
 return <section className="journey-opportunities"><div className="journey-next"><b>Screening context</b><span>{j.strategy} · {j.targetArea||'Any area'} · max {j.maxBudgetCents?'R'+(j.maxBudgetCents/100).toLocaleString():'not set'} · target yield {j.targetYieldPercent??'not set'}%</span></div>{data.opportunities.length===0?<p>No listed opportunities currently match the available screening inputs.</p>:data.opportunities.map((o:Opportunity)=><article key={o.listing.id} className="journey"><span className="journey-kicker">{o.status.replace('_',' ')}</span><h3>{o.listing.title}</h3><p>{o.listing.description}</p><strong>{o.listing.askingPriceCents?'R'+(o.listing.askingPriceCents/100).toLocaleString():'Price not captured'}</strong><p>Confirmed criteria: {o.criteriaMatches.length?o.criteriaMatches.join(', '):'none yet'}</p>{o.missingData.length>0&&<small>Needs verification: {o.missingData.join(', ')}.</small>}{o.notes.map(n=><small key={n}>{n}</small>)}</article>)}</section>;
}

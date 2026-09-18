import type {Pool} from 'pg';
import type {InvestorDiligenceEvidence,DiligenceEvidenceKind,DiligenceEvidenceStatus} from './investorDiligenceDomain.js';

export interface InvestorDiligenceRepository{
 list(investorId:string,listingId:string):Promise<InvestorDiligenceEvidence[]>;
 upsert(input:Omit<InvestorDiligenceEvidence,'id'|'capturedAt'>):Promise<InvestorDiligenceEvidence>;
}
export class MemoryInvestorDiligenceRepository implements InvestorDiligenceRepository{
 private items=new Map<string,InvestorDiligenceEvidence>();
 async list(i:string,l:string){return [...this.items.values()].filter(x=>x.investorId===i&&x.listingId===l);}
 async upsert(input:Omit<InvestorDiligenceEvidence,'id'|'capturedAt'>){const now=new Date().toISOString();const key=[input.investorId,input.listingId,input.kind].join(':');const old=this.items.get(key);const x={...input,id:old?.id??crypto.randomUUID(),capturedAt:old?.capturedAt??now,verifiedAt:input.status==='VERIFIED'?(input.verifiedAt??now):undefined};this.items.set(key,x);return x;}
}
export class PostgresInvestorDiligenceRepository implements InvestorDiligenceRepository{
 constructor(private pool:Pool){}
 private map(r:any):InvestorDiligenceEvidence{return{id:r.id,investorId:r.investor_id,listingId:r.listing_id,kind:r.kind,status:r.status,label:r.label,value:r.value??undefined,source:r.source??undefined,notes:r.notes??undefined,capturedAt:r.captured_at.toISOString(),verifiedAt:r.verified_at?.toISOString()};}
 async list(i:string,l:string){const q=await this.pool.query('SELECT * FROM investor_diligence_evidence WHERE investor_id=$1 AND listing_id=$2 ORDER BY kind',[i,l]);return q.rows.map(r=>this.map(r));}
 async upsert(input:Omit<InvestorDiligenceEvidence,'id'|'capturedAt'>){const q=await this.pool.query(`INSERT INTO investor_diligence_evidence(investor_id,listing_id,kind,status,label,value,source,notes,verified_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(investor_id,listing_id,kind) DO UPDATE SET status=EXCLUDED.status,label=EXCLUDED.label,value=EXCLUDED.value,source=EXCLUDED.source,notes=EXCLUDED.notes,verified_at=EXCLUDED.verified_at RETURNING *`,[input.investorId,input.listingId,input.kind,input.status,input.label,input.value??null,input.source??null,input.notes??null,input.status==='VERIFIED'?(input.verifiedAt??new Date().toISOString()):null]);return this.map(q.rows[0]);}
}

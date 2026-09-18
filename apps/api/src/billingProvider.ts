import type { PaymentProvider } from './billingDomain.js';

/** Foundation adapter: no live gateway calls and no credentials committed. */
export class ConfiguredGatewayPaymentProvider implements PaymentProvider {
  readonly name:string;
  constructor(name=process.env.PAYMENT_PROVIDER??'RemotePay') { this.name=name; }
  async parseWebhook(input:{body:Record<string,unknown>;signature?:string}) {
    if (this.name.toLowerCase()!=='sandbox') throw new Error('PAYMENT_WEBHOOK_NOT_IMPLEMENTED');
    const secret=process.env.PAYMENT_WEBHOOK_SECRET;
    if (secret && input.signature!==secret) throw new Error('INVALID_PAYMENT_WEBHOOK_SIGNATURE');
    const body=input.body;
    const eventId=typeof body.eventId==='string'?body.eventId:'';
    const reference=typeof body.reference==='string'?body.reference:'';
    const type=body.type;
    if(!eventId||!reference||!['PAYMENT_SUCCEEDED','PAYMENT_FAILED','PAYMENT_REFUNDED'].includes(String(type))) throw new Error('INVALID_PAYMENT_WEBHOOK');
    return {eventId,reference,type:String(type) as 'PAYMENT_SUCCEEDED'|'PAYMENT_FAILED'|'PAYMENT_REFUNDED',externalId:typeof body.externalId==='string'?body.externalId:undefined,failureCode:typeof body.failureCode==='string'?body.failureCode:undefined,failureReason:typeof body.failureReason==='string'?body.failureReason:undefined};
  }
  async createPayment(_input:{amountMinor:number;currency:string;reference:string;customerId:string;returnUrl?:string}) {
    if (process.env.PAYMENTS_ENABLED !== 'true') return {status:'PENDING' as const};
    if (this.name.toLowerCase()==='sandbox') return {status:'SUCCEEDED' as const,externalId:`sandbox-${crypto.randomUUID()}`};
    throw new Error('PAYMENT_PROVIDER_NOT_IMPLEMENTED');
  }
}

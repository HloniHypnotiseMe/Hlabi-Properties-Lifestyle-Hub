import type { PaymentProvider } from './billingDomain.js';

/** Foundation adapter: no live gateway calls and no credentials committed. */
export class ConfiguredGatewayPaymentProvider implements PaymentProvider {
  readonly name:string;
  constructor(name=process.env.PAYMENT_PROVIDER??'RemotePay') { this.name=name; }
  async createPayment(_input:{amountMinor:number;currency:string;reference:string;customerId:string;returnUrl?:string}) {
    if (process.env.PAYMENTS_ENABLED !== 'true') return {status:'PENDING' as const};
    if (this.name.toLowerCase()==='sandbox') return {status:'SUCCEEDED' as const,externalId:`sandbox-${crypto.randomUUID()}`};
    throw new Error('PAYMENT_PROVIDER_NOT_IMPLEMENTED');
  }
}

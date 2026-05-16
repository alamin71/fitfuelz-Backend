export interface IPaymentIntentStatus {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

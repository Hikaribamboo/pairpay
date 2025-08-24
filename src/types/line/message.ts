export interface SendRequestMessage {
  userId: string;
  userName: string;
  paymentTitle: string;
  paymentCost: number;
  itemLink?: string;
  paymentMemo?: string;
  category?: string;
  requestId?: string;
}

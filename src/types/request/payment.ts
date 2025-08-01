export interface Payment {
  requestId: string;
  userId: string;
  userName: string;
  paymentTitle: string;
  paymentCost: string;
  itemLink?: string;
  paymentMemo?: string;
  category?: string;
  createdAt: Date;
  isApproved: boolean;
}

export interface RequestPayment {
  userId: string;
  userName: string;
  paymentTitle: string;
  paymentCost: string;
  itemLink?: string;
  paymentMemo?: string;
  category?: string;
}

import type { Timestamp } from "firebase/firestore";

export interface Payment {
  requestId: string;
  userId: string;
  userName: string;
  paymentTitle: string;
  paymentCost: number;
  itemLink?: string;
  paymentMemo?: string;
  category?: string;
  createdAt: Date;
  approvedAt?: Timestamp | Date;
  isApproved: boolean;
}

export interface RequestPayment {
  userId: string;
  userName: string;
  paymentTitle: string;
  paymentCost: number;
  itemLink?: string;
  paymentMemo?: string;
  category?: string;
}

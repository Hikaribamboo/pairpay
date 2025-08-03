export interface SendRequestMessage {
  userId: string;
  userName: string;
  paymentTitle: string;
  paymentCost: number;
  itemLink?: string;
  paymentMemo?: string;
  category?: string;
  requestId?: string; // Firestoreに登録後に付与される
}

export interface LineTarget {
  groupId: string;
}

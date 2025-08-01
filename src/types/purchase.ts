export interface Purchase {
  requestId: string;
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: string;
  itemLink?: string;
  itemMemo?: string;
  createdAt: Date;
  isApproved: boolean;
}

export interface RequestPurchase {
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: string;
  itemLink?: string;
  itemMemo?: string;
}

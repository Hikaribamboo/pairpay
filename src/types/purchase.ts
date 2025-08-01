export interface Purchase {
  id: string;
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: string;
  itemLink?: string;
  itemMemo?: string;
  createdAt: any;
  isApproved: boolean;
};

export interface RequestPurchase {
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: string;
  itemLink?: string;
  itemMemo?: string;
};

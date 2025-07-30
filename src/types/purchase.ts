export interface Purchase {
  id: string;
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: number;
  itemLink?: string;
  itemMemo?: string;
  createdAt: any;
  isApproved: boolean;
};
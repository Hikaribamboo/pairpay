import { RequestPurchase } from "@/types/purchase";

export const fetchAllPurchases = async () => {
  const res = await fetch("/api/purchases");
  if (!res.ok) {
    throw new Error("Failed to fetch purchases");
  }
  return res.json();
};

export const createPurchaseRequest = async ({
  userId,
  userName,
  purchaseItem,
  itemCost,
  itemLink,
  itemMemo,
}: RequestPurchase) => {
  const res = await fetch("/api/requests/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      userName,
      purchaseItem,
      itemCost,
      itemLink,
      itemMemo,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create purchase request: ${res.statusText}`);
  }
  const { requestId } = await res.json();
  return requestId;
};

export const updatePurchases = async (requestId: string, userId: string) => {
  const updatedRequest = await fetch(
    `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL}/api/purchases/${requestId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true, userId }),
    }
  );
  return updatedRequest.json();
};

export const createPurchaseRequest = async ({
  userId,
  userName,
  purchaseItem,
  itemCost,
  itemLink,
  itemMemo,
}: {
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: number;
  itemLink: string;
  itemMemo: string;
}) => {
  const res = await fetch("/api/webhooks/purchase", {
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

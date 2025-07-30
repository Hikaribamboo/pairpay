export const sendRequestLine = async ({
  userId,
  userName,
  purchaseItem,
  itemCost,
  itemLink,
  itemMemo,
  requestId,
}: {
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: number;
  itemLink: string;
  itemMemo: string;
  requestId: string;
}) => {
  const res = await fetch("/api/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      userName,
      purchaseItem,
      itemCost,
      itemLink,
      itemMemo,
      requestId,
    }),
  });

  if (!res.ok) throw new Error("LINE送信失敗");
};

import { RequestPayment } from "@/types/request/payment";

export const fetchAllPaymentRequest = async () => {
  const res = await fetch("/api/request/payment");
  if (!res.ok) {
    throw new Error("Failed to fetch payment");
  }
  return res.json();
};

export const fetchPaymentByPeriod = async (from: string, to: string) => {
  const url = new URL("/api/request/payment/period", window.location.origin);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("支払いリクエストの取得に失敗しました");
  return res.json();
};

export const createPaymentRequest = async ({
  userId,
  userName,
  paymentTitle,
  paymentCost,
  itemLink,
  paymentMemo,
  category,
}: RequestPayment) => {
  const res = await fetch("/api/webhooks/line/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      userName,
      paymentTitle,
      paymentCost,
      itemLink,
      paymentMemo,
      category,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create payment request: ${res.statusText}`);
  }
  const { requestId } = await res.json();
  return requestId;
};

export const updatePayment = async (requestId: string, userId: string) => {
  const updatedRequest = await fetch(
    `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL}/api/request/payment/${requestId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true, userId }),
    }
  );
  return updatedRequest.json();
};

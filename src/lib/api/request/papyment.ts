import { RequestPayment } from "@/types/request/payment";

export const fetchAllPaymentRequestss = async () => {
  const res = await fetch("/api/payment");
  if (!res.ok) {
    throw new Error("Failed to fetch payment");
  }
  return res.json();
};

export const createPaymentRequest = async ({
  userId,
  userName,
  paymentTitle,
  paymentCost,
  itemLink,
  paymentMemo,
}: RequestPayment) => {
  const res = await fetch("/api/requests/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      userName,
      paymentTitle,
      paymentCost,
      itemLink,
      paymentMemo,
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
    `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL}/api/payment/${requestId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true, userId }),
    }
  );
  return updatedRequest.json();
};

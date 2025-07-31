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

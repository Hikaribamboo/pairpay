export const fetchAllPurchases = async () => {
  const res = await fetch("/api/purchases");
  if (!res.ok) {
    throw new Error("Failed to fetch purchases");
  }
  return res.json();
};

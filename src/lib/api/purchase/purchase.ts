import { db } from "@/lib/firebase-client";
import { collection, addDoc, Timestamp } from "firebase/firestore";

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
  const docRef = await addDoc(collection(db, "purchaseRequests"), {
    userId,
    userName,
    purchaseItem,
    itemCost,
    itemLink,
    itemMemo,
    createdAt: Timestamp.now(),
    isApproved: false,
  });

  return docRef.id;
};

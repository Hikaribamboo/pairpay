// lib/services/payment.ts
import { adminDb } from "@/lib/firebase-server";
import type { Payment } from "@/types/request/payment";
import { sendApprovalNotification } from "@/lib/services/line-message";

export class ApprovalError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function approvePaymentRequest(
  requestId: string,
  userId: string
): Promise<Payment> {
  const docRef = adminDb.collection("paymentRequests").doc(requestId);
  const beforeSnap = await docRef.get();

  if (!beforeSnap.exists) throw new ApprovalError(404, "Not Found");

  const data = beforeSnap.data();
  if (!data) throw new ApprovalError(500, "No data in document");

  if (data.userId === userId)
    throw new ApprovalError(403, "Cannot approve your own request");

  if (data.isApproved)
    throw new ApprovalError(409, "Already approved");

  await docRef.update({
    isApproved: true,
    approvedAt: new Date(),
  });

  const afterSnap = await docRef.get();
  const updatedPayment = {
    requestId,
    ...afterSnap.data(),
  } as Payment;

  // ✅ LINE通知をここで送る
  const groupId = process.env.LINE_GROUP_ID!;
  await sendApprovalNotification(updatedPayment, { groupId });

  return updatedPayment;
}

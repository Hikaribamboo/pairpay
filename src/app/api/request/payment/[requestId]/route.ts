// api/request/payment/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  approvePaymentRequest,
  ApprovalError,
} from "@/lib/services/approval-request";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params;
  const { isApproved, userId } = await req.json();

  if (isApproved !== true || typeof userId !== "string") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const updated = await approvePaymentRequest(requestId, userId);

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ApprovalError) {
      return new NextResponse(e.message, { status: e.status });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

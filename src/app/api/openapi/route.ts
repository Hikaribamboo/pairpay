import { NextResponse } from "next/server";
import { openapi } from "@/lib/openapi";

export async function GET() {
  return NextResponse.json(openapi);
}

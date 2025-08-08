// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthClient from "@/app/components/AuthClient";
import LeadLineFriend from "@/app/components/LeadLineFriend";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const codeParam = params.get("code");
  const stateParam = params.get("state");

  if (codeParam && stateParam) {
    return <AuthClient code={codeParam} state={stateParam} />;
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const groupId = localStorage.getItem("groupId");
    if (userId && token && groupId) {
      router.replace("/payments");
    }
  }, [router]);

  return <LeadLineFriend />;
}

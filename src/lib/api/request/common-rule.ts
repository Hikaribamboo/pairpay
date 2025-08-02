// lib/api/request/common-rule.ts
import type { CommonRules, CommonRulesChangeRequest } from "@/types/rules";

export type ContributionRatio = Record<string, number>;


const base = "/api/request/common-rule";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = `API ${res.url} ${res.status} ${res.statusText} ${text?.slice(0,200)}`;
    throw new Error(msg);
  }
  return res.json();
}


export async function getCurrentRules(): Promise<CommonRules> {
  const res = await fetch(`${base}`);
  return handleResponse<CommonRules>(res);
}

export async function getChangeRequests(): Promise<CommonRulesChangeRequest[]> {
  const res = await fetch(`${base}/changes`);
  return handleResponse<CommonRulesChangeRequest[]>(res);
}

export async function submitChangeRequest(
  payload: Partial<CommonRules>
): Promise<void> {
  const res = await fetch(`${base}/changes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handleResponse(res);
}

export async function approveChangeRequest(
  changeRequestId: string,
  approve: boolean,
  comment?: string
): Promise<void> {
  const res = await fetch(`${base}/changes/${changeRequestId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approve, comment }),
  });
  await handleResponse(res);
}

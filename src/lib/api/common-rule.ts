import { AllRules } from "@/types/common-rule";

export async function fetchRules(): Promise<AllRules> {
  const res = await fetch("/api/common-rule");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateRules(newData: Partial<AllRules>): Promise<void> {
  const res = await fetch("/api/common-rule", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error(await res.text());
}

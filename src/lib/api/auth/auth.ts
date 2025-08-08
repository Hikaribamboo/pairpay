// lib/api/auth/auth.ts
export async function fetchLineLogin(
  code: string,
  redirectUri: string,
  groupId: string
) {
  const res = await fetch("/api/auth/line", {
    method: "POST",
    body: JSON.stringify({ code, redirectUri, groupId }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json() as Promise<{
    userId: string;
    userName: string;
    customToken: string;
    pairUserId: string;
    pairUserName: string;
  }>;
}

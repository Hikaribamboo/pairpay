// app/page.tsx (Server Component)
import AuthClient from "@/app/components/AuthClient";

type ServerCpmponent = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ServerCpmponent>;
}) {
  const sp = await searchParams;
  const raw = sp?.code;
  const code = Array.isArray(raw) ? raw[0] : raw;

  return <AuthClient code={typeof code === "string" ? code : undefined} />;
}

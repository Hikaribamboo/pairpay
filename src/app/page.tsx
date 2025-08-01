// app/page.tsx (Server Component)
import AuthClient from "@/app/components/AuthClient";

export default function Page({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const code =
    typeof searchParams?.code === "string" ? searchParams.code : undefined;

  return <AuthClient code={code} />;
}

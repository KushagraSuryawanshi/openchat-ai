import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ChatShell } from "@/components/chat/chat-shell";
import { auth } from "@/lib/auth";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground" role="status">Loading workspace…</div>}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}

async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return <ChatShell name={session.user.name}>{children}</ChatShell>;
}

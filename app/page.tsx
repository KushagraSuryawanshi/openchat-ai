import { ModeToggle } from "@/components/ui/mode-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/auth/sign-out-button";
import { Suspense } from "react";

import { ConversationList } from "@/components/conversations/conversation-list";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedHome />
    </Suspense>
  );
}

async function AuthenticatedHome() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">OpenChat AI</h1>
        <ModeToggle />
        <SignOutButton />
      </div>

      <ConversationList />
    </main>
  );
}

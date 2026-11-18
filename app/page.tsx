import { ModeToggle } from "@/components/ui/mode-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/auth/sign-out-button";
import { Suspense } from "react";

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
    <div>
      <h1>hello world</h1>
      <ModeToggle />
      <SignOutButton />
    </div>
  );
}

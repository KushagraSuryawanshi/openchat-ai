import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { GoogleSignInButton } from "./google-sign-in-button";
import { GoogleLogo } from "./google-logo";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in | OpenChat AI",
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}

async function SignInContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 pt-8 pb-[max(2rem,14dvh)] sm:px-6">
      <Card className="w-full max-w-sm gap-6 rounded-2xl py-8 [--card-spacing:--spacing(6)] sm:py-10 sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="flex flex-col items-center gap-0 text-center">
          <h1 className="flex items-center justify-center gap-2.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            <Image
              src="/icon.svg"
              width={28}
              height={28}
              alt=""
              className="size-7 shrink-0"
            />
            OpenChat AI
          </h1>
          <h2 className="mt-7 text-xl font-medium tracking-tight text-foreground">
            Sign in
          </h2>
          <CardDescription className="mt-2 max-w-64 text-sm leading-relaxed text-balance">
            Continue with your Google account to start a conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <Button
                variant="outline"
                className="h-auto min-h-12 w-full gap-3 rounded-full border-foreground/20 whitespace-normal px-5 py-3"
                disabled
              >
                <GoogleLogo />
                Continue with Google
              </Button>
            }
          >
            <GoogleSignInButton />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}

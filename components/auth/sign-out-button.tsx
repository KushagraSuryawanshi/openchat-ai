"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const inFlight = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (inFlight.current) return;

    inFlight.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error("Sign-out failed");
      }

      router.replace("/sign-in");
    } catch {
      setError("Unable to sign out. Please try again.");
      inFlight.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="w-fit max-w-full space-y-3">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        disabled={isLoading}
        aria-busy={isLoading}
        onClick={signOut}
      >
        {isLoading && (
          <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
        )}
        {isLoading ? "Signing out…" : "Sign out"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

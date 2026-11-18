"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { GoogleLogo } from "./google-logo";

const signInError = "Unable to sign in with Google. Please try again.";

export function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const hasAuthError = searchParams.has("error");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(hasAuthError ? signInError : null);

  async function signIn() {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/sign-in",
      });

      if (result.error) {
        setError(signInError);
        setIsLoading(false);
      }
    } catch {
      setError(signInError);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="h-auto min-h-12 w-full gap-3 rounded-full border-foreground/20 whitespace-normal px-5 py-3 hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:border-foreground/20 dark:hover:border-foreground/30"
        disabled={isLoading}
        aria-busy={isLoading}
        onClick={signIn}
      >
        {isLoading ? (
          <Spinner aria-hidden="true" className="size-5 motion-reduce:animate-none" />
        ) : (
          <GoogleLogo />
        )}
        {isLoading ? "Connecting to Google…" : "Continue with Google"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

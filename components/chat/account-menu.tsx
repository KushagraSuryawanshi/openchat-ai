"use client";
import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { useRouter } from "next/navigation";

export default function AccountMenu({ name }: { name: string }) {
  const signOutInFlight = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const router = useRouter();

  async function signOut() {
    if (signOutInFlight.current) return;

    signOutInFlight.current = true;
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign-out failed");

      router.replace("/sign-in");
    } catch {
      setSignOutError("Unable to sign out. Please try again.");
      signOutInFlight.current = false;
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-auto min-h-12 min-w-0 flex-1 justify-start gap-3 rounded-lg px-2 py-2 text-left"
            />
          }
          aria-label={`Account menu for ${name}`}
        >
          <Avatar>
            <AvatarFallback className="bg-foreground/10 text-foreground">
              {name.trim().charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block text-xs font-normal text-muted-foreground">
              Personal workspace
            </span>
          </span>
          <ChevronsUpDown
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={8}
          className="min-w-56 max-w-[calc(100vw-2rem)] motion-reduce:animate-none"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 whitespace-normal [overflow-wrap:anywhere]">
              {name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              closeOnClick={false}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              className="min-h-11 gap-2 px-2"
            >
              {isSigningOut ? (
                <Spinner
                  className="motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <LogOut aria-hidden="true" />
              )}
              {isSigningOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {signOutError && (
        <Alert variant="destructive">
          <AlertDescription>{signOutError}</AlertDescription>
        </Alert>
      )}
    </>
  );
}

"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/chat/brand-logo";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ModeToggle } from "@/components/ui/mode-toggle";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import AccountMenu from "./account-menu";

function ChatNavigation({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const { isMobile, openMobile, open, setOpenMobile } = useSidebar();

  return (
    <>
      <Sidebar id="chat-sidebar" className="border-sidebar-border/60">
        <div
          className="flex h-full min-h-0 flex-col"
          inert={!isMobile && !open}
        >
          <SidebarHeader className="gap-6 px-4 pt-5 pb-3">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/"
                onClick={() => setOpenMobile(false)}
                className="flex min-h-11 items-center gap-2.5 rounded-lg font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BrandLogo className="size-8 shrink-0 text-black dark:text-white" />
                <span className="whitespace-nowrap">OpenChat AI</span>
              </Link>
              <SidebarTrigger
                className="size-11 text-muted-foreground"
                aria-controls="chat-sidebar"
                aria-expanded={isMobile ? openMobile : open}
              />
            </div>
          </SidebarHeader>
          <SidebarContent className="overscroll-contain px-3">
            <ConversationList />
          </SidebarContent>
          <SidebarFooter className="gap-3 border-t border-sidebar-border/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex min-w-0 items-center gap-2">
              <AccountMenu name={name} />
              <ModeToggle />
            </div>
          </SidebarFooter>
        </div>
      </Sidebar>
      <SidebarInset
        id="main-content"
        tabIndex={-1}
        className="min-h-0 min-w-0 outline-none"
      >
        <header className="flex h-18 shrink-0 items-center gap-3 border-b border-border/50 px-4 sm:px-6">
          <SidebarTrigger
            className="size-11 text-muted-foreground"
            aria-controls="chat-sidebar"
            aria-expanded={isMobile ? openMobile : open}
          />
          <span className="text-sm font-medium">Your workspace</span>
        </header>
        <div className="chat-content flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          {children}
        </div>
      </SidebarInset>
    </>
  );
}

export function ChatShell({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  return (
    <SidebarProvider
      className="chat-shell h-dvh min-h-0 overflow-clip"
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
    >
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-background p-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ChatNavigation name={name}>{children}</ChatNavigation>
    </SidebarProvider>
  );
}

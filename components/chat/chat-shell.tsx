"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/chat/brand-logo";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const isConversation = usePathname().startsWith("/c/");

  return (
    <>
      <Sidebar id="chat-sidebar" className="border-sidebar-border/60">
        <div
          className="group/sidebar-hover flex h-full min-h-0 flex-col"
          inert={!isMobile && !open}
        >
          <SidebarHeader className="gap-6 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/"
                onClick={() => setOpenMobile(false)}
                className="flex min-h-11 items-center gap-2.5 rounded-lg font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BrandLogo className="size-8 shrink-0 text-black dark:text-white" />
                <span className="whitespace-nowrap [text-box:trim-both_cap_alphabetic]">OpenChat AI</span>
              </Link>
              <SidebarTrigger
                className="size-11 text-muted-foreground"
                aria-controls="chat-sidebar"
                aria-expanded={isMobile ? openMobile : open}
              />
            </div>
          </SidebarHeader>
          <SidebarContent className="overflow-hidden">
            <ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]]:overscroll-contain [&_[data-slot=scroll-area-viewport]]:px-3 [&_[data-slot=scroll-area-scrollbar]]:left-0! [&_[data-slot=scroll-area-scrollbar]]:right-auto! [&_[data-slot=scroll-area-scrollbar]]:w-1.5 [&_[data-slot=scroll-area-scrollbar]]:pointer-events-none [&_[data-slot=scroll-area-scrollbar]]:opacity-0 group-hover/sidebar-hover:[&_[data-slot=scroll-area-scrollbar]]:pointer-events-auto group-hover/sidebar-hover:[&_[data-slot=scroll-area-scrollbar]]:opacity-100 [&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/20 hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/40">
              <ConversationList />
            </ScrollArea>
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
        {!isConversation && (
          <header className="flex min-h-[calc(3.5rem+max(1.25rem,env(safe-area-inset-top)))] shrink-0 items-center px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 sm:px-6">
            <SidebarTrigger
              hideWhenExpanded
              className="size-11 text-muted-foreground"
              aria-controls="chat-sidebar"
              aria-expanded={isMobile ? openMobile : open}
            />
          </header>
        )}
        <div className={`chat-content flex min-h-0 flex-1 flex-col ${isConversation ? "overflow-clip" : "overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"}`}>
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

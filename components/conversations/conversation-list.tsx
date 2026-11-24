"use client";

import { useConversations } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { useCreateConversation } from "@/hooks/use-create-conversation";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, SquarePen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function ConversationList() {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useConversations();

  //renaming isPending and isError cuz we used it just above
  const {
    mutateAsync,
    isPending: isCreating,
    isError: isCreatingError,
  } = useCreateConversation();

  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  async function handleNewChat() {
    try {
      const result = await mutateAsync();
      router.push(`/c/${result.conversation.id}`);
      setOpenMobile(false);
    } catch {
      // The mutation error is displayed beside the action so it can be retried.
    }
  }

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 pb-4" aria-labelledby="conversations-heading">
      <Button type="button" variant="outline" className="mb-5 min-h-11 w-full justify-start gap-3 rounded-xl border-border/80 bg-background px-3 text-foreground shadow-xs" onClick={handleNewChat} disabled={isCreating} aria-busy={isCreating}>
        {isCreating ? <Spinner className="motion-reduce:animate-none" aria-hidden="true" /> : <SquarePen aria-hidden="true" />}
        {isCreating ? "Creating…" : "New chat"}
      </Button>
      {isCreatingError && <p role="alert" className="px-2 pb-3 text-xs text-destructive">Couldn't create your chat. Please try again.</p>}
      <h2 id="conversations-heading" className="px-3 pb-2 text-xs font-medium text-muted-foreground">Your conversations</h2>
      {isPending ? (
        <div className="space-y-3 px-3" role="status">
          <span className="sr-only">Loading conversations…</span>
          {["w-4/5", "w-3/5", "w-5/6"].map((width) => <Skeleton key={width} className={`h-4 ${width} motion-reduce:animate-none`} />)}
        </div>
      ) : isError && !data ? (
        <div className="px-3 text-xs leading-5">
          <p role="alert">Couldn't load your conversations.</p>
          <Button variant="link" className="min-h-11 px-0 text-foreground" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="mx-1 rounded-xl border border-dashed border-sidebar-border p-4 text-xs leading-6 text-muted-foreground">
          <MessageSquare className="mb-2 size-4" aria-hidden="true" />
          <p className="font-medium text-foreground">A clean slate</p>
          <p>Your conversations will appear here after you start a new chat.</p>
        </div>
      ) : (
        <nav aria-label="Conversations">
        <SidebarMenu className="gap-1">
          {conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id}>
              <SidebarMenuButton
                render={<Link href={`/c/${conversation.id}`} />}
                isActive={pathname === `/c/${conversation.id}`}
                aria-current={pathname === `/c/${conversation.id}` ? "page" : undefined}
                onClick={() => setOpenMobile(false)}
                title={conversation.title}
                className="min-h-11 gap-3 rounded-xl px-3 transition-colors duration-150"
              >
                <MessageSquare className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{conversation.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        </nav>
      )}
      {isFetchNextPageError && <p role="alert" className="px-3 text-xs text-destructive">Couldn't load more chats. Please try again.</p>}
      {hasNextPage && (
        <Button
          type="button"
          variant="ghost"
          className="mt-2 min-h-11 w-full text-xs text-muted-foreground"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </section>
  );
}

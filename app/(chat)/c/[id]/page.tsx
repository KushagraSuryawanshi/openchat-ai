import ConversationView from "@/components/chat/conversation-view";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

//PageProps also require searchParams, but this child only receives params.
type AuthenticatedChatProps = {
  params: Promise<{ id: string }>;
};

export default function ChatPage({ params }: PageProps<"/c/[id]">) {
  return (
    <Suspense fallback={null}>
      <AuthenticatedChat params={params} />
    </Suspense>
  );
}

const AuthenticatedChat = async ({ params }: AuthenticatedChatProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <header className="mx-auto flex min-h-[calc(3.5rem+max(1.25rem,env(safe-area-inset-top)))] min-w-0 w-full max-w-6xl shrink-0 items-center gap-3 pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-3 pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pl-[max(2rem,env(safe-area-inset-left))]">
        <SidebarTrigger hideWhenExpanded className="size-11 shrink-0 text-muted-foreground" aria-controls="chat-sidebar" />
        <h1
          tabIndex={0}
          title={conversation.title}
          className="min-w-0 flex-1 truncate py-0.5 text-base font-medium tracking-tight outline-none focus:whitespace-normal focus:[overflow-wrap:anywhere] focus-visible:ring-2 focus-visible:ring-ring sm:text-lg"
        >
          {conversation.title}
        </h1>
      </header>
      <ConversationView conversationId={conversation.id} messages={conversation.messages}/>
    </div>
  );
};

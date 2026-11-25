import ConversationView from "@/components/chat/conversation-view";
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
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Conversation</p>
      <h1 className="mb-8 text-2xl font-medium tracking-tight [overflow-wrap:anywhere]">{conversation.title}</h1>
      <ConversationView conversationId={conversation.id} messages={conversation.messages}/>
    </div>
  );
};

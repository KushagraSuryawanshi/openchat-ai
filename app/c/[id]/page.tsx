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
    <div>
      <h1>{conversation.title} </h1>
      <ul>
        {conversation.messages.map((el) => (
          <li key={el.id}>{el.content}</li>
        ))}
      </ul>
    </div>
  );
};

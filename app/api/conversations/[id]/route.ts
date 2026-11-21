import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/conversations/[id]">,
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session)
    return Response.json({ error: "Unauthorised" }, { status: 401 });

  //Fetch this conversation only if it belongs to this user.
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation)
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  return Response.json({ conversation }, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: RouteContext<"/api/conversations/[id]">,
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session)
    return Response.json({ error: "Unauthorised" }, { status: 401 });

  //Delete only a converstaion owned by this user.
  const deletedConversation = await prisma.conversation.deleteMany({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  if (!deletedConversation.count) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

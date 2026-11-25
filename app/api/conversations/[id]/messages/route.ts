import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const contentSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/conversations/[id]/messages">,
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!conversation)
    return Response.json({ error: "Conversation not found" }, { status: 404 });

  const parsedBody = contentSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({ error: parsedBody.error }, { status: 400 });
  }
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: parsedBody.data.content,
    },
  });

  return Response.json({ message }, { status: 201 });
}

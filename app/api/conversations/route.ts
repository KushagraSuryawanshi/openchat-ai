import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session)
    return Response.json({ error: "Unauthorised" }, { status: 401 });

  // Always use the authenticated user's ID, not one from the request.
  const conversation = await prisma.conversation.create({
    data: { userId: session.user.id },
  });

  return Response.json({ conversation }, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session)
    return Response.json({ error: "Unauthorised" }, { status: 401 });

  const cursor = new URL(request.url).searchParams.get("cursor");

  // Make sure the pagination cursor belongs to this user.
  if (cursor) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: cursor,
        userId: session.user.id,
      },
    });

    if (!conversation) {
      return Response.json({ error: "Bad Request" }, { status: 400 });
    }
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { id: true, title: true },

    // Fetch one extra to check whether another page exists.
    take: 21,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = conversations.length > 20;
  const page = conversations.slice(0, 20);

  // Frontend sends this ID when requesting the next page.
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return Response.json({ conversations: page, nextCursor }, { status: 200 });
}


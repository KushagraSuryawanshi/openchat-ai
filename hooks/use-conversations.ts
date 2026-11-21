"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

type ConversationPage = {
  conversations: { id: string; title: string }[];
  nextCursor: string | null;
};

async function fetchConversations(
  cursor: string | null,
): Promise<ConversationPage> {
  const url = cursor
    ? `/api/conversations?cursor=${encodeURIComponent(cursor)}`
    : "/api/conversations";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch converstaions");
  }

  return response.json();
}

export function useConversations() {
  return useInfiniteQuery({
    queryKey: ["conversations"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchConversations(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

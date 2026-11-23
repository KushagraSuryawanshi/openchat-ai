"use client";

import { useConversations } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { useCreateConversation } from "@/hooks/use-create-conversation";

export function ConversationList() {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations();

  //renaming ispending cuz we used it just above
  const { mutate, isPending: isCreating } = useCreateConversation();

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Conversations</h2>

      <Button type="button" onClick={() => mutate()} disabled={isCreating}>
        {isCreating ? "Creating..." : "New Chat"}
      </Button>

      {isPending ? (
        <p>Loading conversations...</p>
      ) : isError ? (
        <p>Error fetching conversation</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>{conversation.title}</li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </section>
  );
}

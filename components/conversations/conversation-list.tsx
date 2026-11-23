"use client";

import { useConversations } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { useCreateConversation } from "@/hooks/use-create-conversation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ConversationList() {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations();

  //renaming isPending and isError cuz we used it just above
  const {
    mutateAsync,
    isPending: isCreating,
    isError: isCreatingError,
  } = useCreateConversation();

  const router = useRouter();

  async function handleNewChat() {
    try {
      const result = await mutateAsync();
      router.push(`/c/${result.conversation.id}`);
    } catch {
      {
        isCreatingError && <p>Error creating conversation</p>;
      }
    }
  }

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Conversations</h2>

      <Button type="button" onClick={handleNewChat} disabled={isCreating}>
        {isCreating ? "Creating..." : "New Chat"}
      </Button>

      {isPending ? (
        <p>Loading conversations...</p>
      ) : isError ? (
        <p>Error fetching conversation</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              {" "}
              <Link href={`/c/${conversation.id}`}>
                {conversation.title}
              </Link>{" "}
            </li>
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

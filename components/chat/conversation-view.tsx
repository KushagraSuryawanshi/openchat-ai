"use client";

import ChatMessages from "./chat-message";
import MessageComposer from "./message-composer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat";

export default function ConversationView({
  messages,
  conversationId,
}: {
  messages: Message[];
  conversationId: string;
}) {
  const { data: displayedMessages } = useQuery<Message[]>({
    queryKey: ["conversation-messages", conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      return data.conversation.messages;
    },
    initialData: messages,
    staleTime: 30_000,
  });

  const queryClient = useQueryClient();

  const handleSend = async (message: string) => {
    const savedMessage = await mutateAsync(message);

    queryClient.setQueryData<Message[]>(
      ["conversation-messages", conversationId],
      (prev) => [...(prev ?? []), savedMessage],
    );
  };
  const {
    mutateAsync,
    isPending: isSending,
    isError: isSendingError,
  } = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: message }),
        },
      );
      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();
      return data.message;
    },
  });

  return (
    <>
      <ul
        aria-label="Conversation messages"
        className="mb-10 space-y-8 text-sm leading-relaxed text-foreground sm:space-y-10 sm:text-base"
      >
        {displayedMessages.map((message) => (
          <ChatMessages key={message.id} message={message} />
        ))}
      </ul>
      {isSendingError && (
        <p role="alert">Failed to send message. Please try again.</p>
      )}
      <MessageComposer
        onSend={handleSend}
        isSending={isSending}
        placeholder={
          displayedMessages.length === 0
            ? "What are we cooking today?"
            : "Write a message..."
        }
      />
    </>
  );
}

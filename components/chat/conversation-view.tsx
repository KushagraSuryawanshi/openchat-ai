"use client";

import MessageComposer from "./message-composer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Message = {
  id: string;
  role: string;
  content: string;
};

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
      <ul className="space-y-6 text-sm leading-7">
        {displayedMessages.map((el) => (
          <li
            key={el.id}
            className="whitespace-pre-wrap [overflow-wrap:anywhere]"
          >
            {el.role}
            {el.content}
          </li>
        ))}
      </ul>
      {isSendingError && (
        <p role="alert">Failed to send message. Please try again.</p>
      )}
      <MessageComposer onSend={handleSend} isSending={isSending} />
    </>
  );
}

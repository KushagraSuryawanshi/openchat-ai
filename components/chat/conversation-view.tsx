"use client";

import MessageComposer from "./message-composer";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

    if (!response.ok) {
      throw new Error("Error sending response");
    }
    const data = await response.json();

    queryClient.setQueryData<Message[]>(
      ["conversation-messages", conversationId],
      (prev) => [...(prev ?? []), data.message],
    );
  };

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
      <MessageComposer onSend={handleSend} />
    </>
  );
}

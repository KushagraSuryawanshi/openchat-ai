"use client";

import ChatMessages from "./chat-message";
import MessageComposer from "./message-composer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MessageScrollerProvider
        key={conversationId}
        autoScroll
        defaultScrollPosition="end"
        scrollEdgeThreshold={64}
      >
        <MessageScroller className="h-auto flex-1">
          <MessageScrollerViewport
            aria-label="Conversation messages"
            className="scroll-pt-4 data-[overflow-y-start]:[mask:linear-gradient(black,black)_no-clip_subtract,linear-gradient(to_bottom,black,transparent)_0_0/100%_1rem_no-repeat_no-clip] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <MessageScrollerContent className="mx-auto w-full max-w-6xl py-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pl-[max(2rem,env(safe-area-inset-left))]">
              <ul className="space-y-8 text-sm leading-relaxed text-foreground sm:space-y-10 sm:text-base">
                {displayedMessages.map((message) => (
                  <ChatMessages key={message.id} message={message} />
                ))}
              </ul>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
      <div className="mx-auto w-full max-w-3xl shrink-0 pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pt-4 sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pl-[max(2rem,env(safe-area-inset-left))]">
        {isSendingError && (
          <p role="alert" className="mb-2">Failed to send message. Please try again.</p>
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
      </div>
    </div>
  );
}

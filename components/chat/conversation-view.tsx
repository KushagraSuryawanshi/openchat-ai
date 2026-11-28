"use client";

import ChatMessages from "./chat-message";
import MessageComposer from "./message-composer";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { UIMessage, DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

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
  const initialMessages: UIMessage[] = messages.map((el) => ({
    id: el.id,
    role: el.role === "USER" ? "user" : "assistant",
    parts: [{ type: "text", text: el.content }],
  }));

  const {
    messages: chatMessages,
    sendMessage,
    status,
    error,
  } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `/api/conversations/${conversationId}/messages`,
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          content:
            messages.at(-1)?.parts.find((part) => part.type === "text")?.text ??
            "",
        },
      }),
    }),
  });

  const handleSend = async (message: string) => {
    await sendMessage({ text: message });
  };


  useEffect(() => {
    const initialMessage = sessionStorage.getItem(
      `initial-prompt:${conversationId}`,
    );

    if (!initialMessage) return;

    sessionStorage.removeItem(`initial-prompt:${conversationId}`);

    queueMicrotask(() => {
      void sendMessage({ text: initialMessage }).catch(console.error);
    });
  }, [conversationId, sendMessage]);

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
                {chatMessages.map((message) => (
                  <ChatMessages key={message.id} message={message} />
                ))}
              </ul>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
      <div className="mx-auto w-full max-w-3xl shrink-0 pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pt-4 sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pl-[max(2rem,env(safe-area-inset-left))]">
        {error && (
          <p role="alert" className="mb-2">
            Failed to send message. Please try again.
          </p>
        )}
        <MessageComposer
          onSend={handleSend}
          isSending={status === "submitted" || status === "streaming"}
          placeholder={
            chatMessages.length === 0
              ? "What are we cooking today?"
              : "Write a message..."
          }
        />
      </div>
    </div>
  );
}

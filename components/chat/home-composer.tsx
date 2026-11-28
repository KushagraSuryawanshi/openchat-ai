"use client";
import { useCreateConversation } from "@/hooks/use-create-conversation";
import MessageComposer from "./message-composer";
import { useRouter } from "next/navigation";

export default function HomeComposer() {
  const { mutateAsync, isPending, isError } = useCreateConversation();
  const router = useRouter();

  async function handleSend(message: string) {
    const result = await mutateAsync();
    const conversationId = result.conversation.id;

    sessionStorage.setItem(`initial-prompt:${conversationId}`, message);
    router.push(`/c/${conversationId}`);
  }

  return (
    <MessageComposer
      onSend={handleSend}
      isSending={isPending}
      placeholder="Ask anything..."
    />
  );
}

"use client";

import MessageComposer from "./message-composer";

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
  const handleSend = (message: string) => {
    console.log(message);
  };

  return (
    <>
      <ul className="space-y-6 text-sm leading-7">
        {messages.map((el) => (
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

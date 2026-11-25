"use client";

import { type SubmitEvent, useState } from "react";

export default function MessageComposer({
  onSend,
  isSending,
}: {
  onSend: (message: string) => Promise<void>;
  isSending: boolean;
}) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = text.trim();

    if (!content || isSending) return;
    try {
      await onSend(content);
      setText("");
    } catch {
      //Preserve the draft when sending fails.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isSending}
      ></textarea>
      <button disabled={isSending}>Send</button>
    </form>
  );
}

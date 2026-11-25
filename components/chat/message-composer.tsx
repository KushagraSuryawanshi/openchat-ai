"use client";

import { type SubmitEvent, useState } from "react";

export default function MessageComposer({
  onSend,
}: {
  onSend: (message: string) => Promise<void>;
}) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = text.trim();

    if (!content) return;
    try {
      await onSend(content);
      setText("");
    } catch (error) {
      //Preserve the draft when sending fails
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button>Send</button>
    </form>
  );
}

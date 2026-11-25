"use client";

import { type SubmitEvent, useState } from "react";

export default function MessageComposer({
  onSend,
}: {
  onSend: (message: string) => void;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = text.trim();

    if (!content) return;

    onSend(content);
    setText("");
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

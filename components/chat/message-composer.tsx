"use client";

import { type SubmitEvent, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MessageComposer({
  onSend,
  isSending,
  placeholder,
}: {
  onSend: (message: string) => Promise<void>;
  isSending: boolean;
  placeholder: string;
}) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = text.trim();

    if (!content || isSending) return;
    try {
      setText("");
      await onSend(content);
    } catch {
      //Preserve the draft when sending fails.
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full rounded-[1rem] border border-border bg-card shadow-[0_8px_24px_-8px] shadow-foreground/15 transition-colors hover:border-muted-foreground/40 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 motion-reduce:transition-none dark:shadow-black/30"
    >
      <ScrollArea className="max-h-48 rounded-[inherit] [&_[data-slot=scroll-area-viewport]]:h-auto [&_[data-slot=scroll-area-viewport]]:max-h-48 [&_[data-slot=scroll-area-scrollbar]]:right-0 [&_[data-slot=scroll-area-scrollbar]]:left-auto [&_[data-slot=scroll-area-scrollbar]]:w-1.5 [&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/20">
        <label className="block min-w-0">
          <span className="sr-only">Message</span>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // keyCode 229 also guards Safari's IME confirmation event.
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.repeat &&
                !e.nativeEvent.isComposing &&
                e.nativeEvent.keyCode !== 229
              ) {
                e.preventDefault();

                e.currentTarget.form?.requestSubmit();
              }
            }}
            readOnly={isSending}
            rows={1}
            placeholder={placeholder}
            className="no-scrollbar field-sizing-content min-h-14 w-full resize-none overflow-y-auto rounded-[1rem] border-0 bg-transparent px-4 pt-3.5 pb-14 text-base leading-6 text-foreground shadow-none placeholder-shown:pr-16 placeholder-shown:pb-3.5 focus-visible:ring-0 disabled:bg-transparent motion-reduce:transition-none md:text-base dark:bg-transparent dark:disabled:bg-transparent"
          />
        </label>
      </ScrollArea>
      <div className="absolute right-2 bottom-2">
        <Button
          type="submit"
          size="icon"
          disabled={isSending}
          aria-busy={isSending}
          className="size-10 rounded-full bg-foreground text-background hover:bg-foreground/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
          <span className="sr-only">
            {isSending ? "Sending message" : "Send message"}
          </span>
        </Button>
      </div>
    </form>
  );
}

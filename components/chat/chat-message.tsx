import { UIMessage } from "ai";
export default function ChatMessages({ message }: { message: UIMessage }) {
  const role = message.role.toUpperCase();
  const isUser = role === "USER";
  const isAssistant = role === "ASSISTANT";

  const content = message.parts
    .filter((part) => (part.type === "text"))
    .map((part) => part.text)
    .join("");

  return (
    <li
      key={message.id}
      className={`flex min-w-0 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={
          isUser
            ? "min-w-0 max-w-[min(90%,65ch)] rounded-[0.75rem] rounded-br-[0.25rem] bg-linear-to-br from-primary/15 to-primary/5 px-3.5 py-2.5 text-foreground sm:max-w-[min(80%,65ch)] sm:px-4"
            : isAssistant
              ? "min-w-0 w-full max-w-[65ch]"
              : "min-w-0 max-w-[65ch] rounded-[0.5rem] bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        }
      >
        <span
          className={
            isUser
              ? "sr-only"
              : "mb-2 block text-xs font-medium tracking-wide text-muted-foreground"
          }
        >
          {isUser
            ? "You"
            : isAssistant
              ? "Assistant"
              : role === "SYSTEM"
                ? "System"
                : message.role}
          <span className="sr-only">: </span>
        </span>
        <div className="whitespace-pre-wrap [overflow-wrap:anywhere]">
          {content}
        </div>
      </div>
    </li>
  );
}

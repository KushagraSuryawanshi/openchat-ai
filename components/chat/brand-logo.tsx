import type { ComponentProps } from "react";

// The site's existing mark, rendered with the surrounding monochrome color.
export function BrandLogo(props: ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" {...props}>
      <path fillRule="evenodd" d="M18 4h11v56H18L6 48V16L18 4ZM12 28v7h11v-7H12ZM1 27a3 3 0 0 1 3-3v16a3 3 0 0 1-3-3V27Z" />
      <path d="M35 5c6-4 13 0 15 7 10-1 15 10 9 18 8 8 3 22-8 23-2 8-10 11-16 6V38c6 2 10 7 13 12a2.5 2.5 0 0 0 4-3c-3-6-7-10-11-13 5-3 9-6 12-11a2.5 2.5 0 0 0-4-3c-4 6-8 9-14 10V5Z" />
    </svg>
  );
}

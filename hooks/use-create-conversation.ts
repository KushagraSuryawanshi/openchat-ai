"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createConversation() {
  const response = await fetch("/api/conversations", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to create conversation.");
  }
  return response.json();
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

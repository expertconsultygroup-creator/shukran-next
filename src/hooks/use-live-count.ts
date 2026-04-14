"use client";

import { useRealtime } from "@/components/providers/RealtimeProvider";

export function useLiveCount() {
  const { messageCount } = useRealtime();
  return messageCount;
}

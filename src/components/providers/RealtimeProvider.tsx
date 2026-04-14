"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "./SupabaseProvider";

interface RealtimeContextValue {
  messageCount: number;
  latestApprovedMessage: Record<string, unknown> | null;
  latestPendingMessage: Record<string, unknown> | null;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  messageCount: 0,
  latestApprovedMessage: null,
  latestPendingMessage: null,
});

export function RealtimeProvider({
  children,
  initialCount,
}: {
  children: React.ReactNode;
  initialCount: number;
}) {
  const supabase = useSupabase();
  const [messageCount, setMessageCount] = useState(initialCount);
  const [latestApprovedMessage, setLatestApprovedMessage] = useState<Record<string, unknown> | null>(null);
  const [latestPendingMessage, setLatestPendingMessage] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Skip subscriptions if Supabase is not configured
    if (!supabase) return;

    const counterChannel = supabase
      .channel("counter-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "counter_cache" },
        (payload) => {
          if (payload.new && typeof payload.new.total_approved === "number") {
            setMessageCount(payload.new.total_approved);
          }
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("message-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new && payload.new.status === "approved") {
            setLatestApprovedMessage(payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setLatestPendingMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(counterChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [supabase]);

  return (
    <RealtimeContext.Provider
      value={{ messageCount, latestApprovedMessage, latestPendingMessage }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}

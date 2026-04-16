"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useTranslations } from "next-intl";

export function Ticker() {
  const t = useTranslations("ticker");
  
  const defaultEvents = [
    t("event1"),
    t("event2"),
    t("event3"),
    t("event4"),
  ];

  const [events, setEvents] = useState<string[]>(defaultEvents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { latestApprovedMessage, messageCount } = useRealtime();

  useEffect(() => {
    // Re-initialize default events if locale changes
    setEvents(prev => prev.length > 0 ? [defaultEvents[0], defaultEvents[1], defaultEvents[2], defaultEvents[3], ...prev.slice(4)] : defaultEvents);
  }, [t]);

  useEffect(() => {
    if (latestApprovedMessage) {
      const msg = latestApprovedMessage as { name?: string; nationality?: string };
      const newEvent = `✉ ${msg.name || t("participant")} ${msg.nationality || ""} ${t("sentMessage")}`;
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    }
  }, [latestApprovedMessage, t]);

  useEffect(() => {
    if (messageCount > 0 && messageCount % 1000 === 0) {
      const milestone = t("milestone", { count: messageCount.toLocaleString() });
      setEvents((prev) => [milestone, ...prev.slice(0, 19)]);
    }
  }, [messageCount, t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [events.length]);

  return (
    <div className="h-9 bg-[var(--bg-deep)] border-b border-[var(--border)] flex items-center px-4 overflow-hidden w-full relative z-40">
      <div className="flex items-center gap-2 pe-4 border-e border-[var(--border)] whitespace-nowrap">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--sea)] animate-ping" />
        <span className="text-[var(--sea)] text-xs font-bold font-sans">{t("live")}</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute end-4 text-[var(--gold)] text-sm font-sans whitespace-nowrap"
          >
            {events[currentIndex % events.length]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

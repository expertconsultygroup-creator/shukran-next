"use client";

import { LiveCounter } from "@/components/shared/LiveCounter";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { MessageCard } from "@/components/messages/MessageCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useRef } from "react";
import { COUNTER_GOAL } from "@/lib/constants";
import { useLiveCount } from "@/hooks/use-live-count";
import { useTranslations, useFormatter } from "next-intl";
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize, RotateCcw, SkipBack, SkipForward } from "lucide-react";

const natColors = ["#CBA344", "#3F8E50", "#0090D4", "#7A9BB5", "#D83731", "#9EA2A9"];

interface HomeClientProps {
  initialMessages: any[];
  initialCount: number;
}

export default function HomeClient({ initialMessages, initialCount }: HomeClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [stats, setStats] = useState({ totalMessages: 0, totalCountries: 0, totalVideos: 0, totalPoems: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ label: string; count: number }[]>([]);
  const liveCount = useLiveCount();

  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  // Use live count if available, otherwise fall back to fetched stats, then initialCount
  const messageCount = liveCount > 0 ? liveCount : (stats.totalMessages > 0 ? stats.totalMessages : initialCount);

  useEffect(() => {
    // Fetch latest messages if none passed
    if (messages.length === 0) {
      fetch("/api/messages?limit=6&status=approved")
        .then((r) => r.json())
        .then((d) => setMessages(d.messages || []))
        .catch(() => {});
    }

    // Fetch aggregated stats
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats({
          totalMessages: d.totalMessages || 0,
          totalCountries: d.totalCountries || 0,
          totalVideos: d.totalVideos || 0,
          totalPoems: d.totalPoems || 0,
        });
        setCategoryBreakdown(
          (d.categoryBreakdown || []).map((c: any, i: number) => ({
            ...c,
            color: natColors[i % natColors.length],
          }))
        );
        if (d.dailyStats?.length > 0) {
          setDailyData(
            [...d.dailyStats].reverse().map((s: any) => ({
              // We could use next-intl for date formatting, but sticking to existing logic with locale fallback for now if locale is needed
              label: new Date(s.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
              count: s.message_count,
            }))
          );
        }
      })
      .catch(() => {});
  }, [messages.length]);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION — Video Background */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/media/hero-poster.jpeg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/media/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/80 via-[var(--bg-deep)]/60 to-[var(--bg-deep)]/90" />
          {/* Gold shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(203,163,68,0.08)] via-transparent to-[rgba(203,163,68,0.05)]" />
        </div>

        <ShamsaPattern className="opacity-[0.06] z-[1]" />

        <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
          {/* Logo badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <img
              src="/media/logo.jpeg"
              alt="مبادرة درع الوطن"
              width={120}
              height={120}
              className="rounded-2xl shadow-[0_0_40px_rgba(203,163,68,0.3)] border-2 border-[var(--gold)]/30"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 px-4 py-1.5 rounded-full bg-[var(--gold-dim)] border border-[var(--gold)] shadow-[0_0_15px_rgba(203,163,68,0.2)] animate-pulse backdrop-blur-sm"
          >
            <span className="text-[var(--gold-dark)] font-bold text-sm tracking-wide">{t("guinnessBadge")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-sans font-black text-[64px] sm:text-7xl md:text-[130px] leading-none text-[var(--gold)] mb-2 drop-shadow-[0_4px_30px_rgba(203,163,68,0.4)]"
          >
            {t("title1")}
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="font-sans font-bold text-2xl sm:text-4xl md:text-[80px] text-[var(--white)] mb-6 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
          >
            {t("title2")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[var(--muted-light)] text-lg md:text-xl max-w-[480px] mb-16 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
          >
            {t("description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="w-full max-w-4xl mx-auto mb-16"
          >
            <LiveCounter />

            <div className="mt-12 w-full max-w-2xl mx-auto">
              <div className="flex justify-between text-sm mb-3 font-sans font-bold text-[var(--muted-light)]">
                <span>{format.number(messageCount)} {t("documented")}</span>
                <span className="text-[var(--gold)]">{t("goal")} {format.number(COUNTER_GOAL)}</span>
              </div>
              <div className="h-3 w-full bg-[var(--surface-2)]/60 rounded-full overflow-hidden border border-[var(--border)] relative flex rtl:flex-row-reverse backdrop-blur-sm" dir="ltr">
                <div
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-light)] rounded-full start-0 rtl:right-0 rtl:left-auto"
                  style={{ width: `${Math.min((messageCount / COUNTER_GOAL) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/send" className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-lg shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform min-w-[200px]">
              {t("sendNow")}
            </Link>
            <Link href="/messages" className="px-8 py-4 rounded-full border-2 border-[var(--gold)] text-[var(--gold-light)] font-sans font-bold text-lg hover:bg-[var(--gold-dim)] transition-colors min-w-[200px] backdrop-blur-sm">
              {t("browseMessages")}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-[var(--gold)]/40 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 rounded-full bg-[var(--gold)]/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* OUR STORY VIDEO SECTION */}
      <StoryVideoSection />

      {/* STATS SECTION */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--gold-dim)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: t("statMessage"), value: format.number(messageCount) },
              { label: t("statCountry"), value: format.number(stats.totalCountries) },
              { label: t("statVideo"), value: format.number(stats.totalVideos) },
              { label: t("statPoem"), value: format.number(stats.totalPoems) }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--card-glass)] backdrop-blur-md rounded-2xl p-6 border-s-4 border-[var(--gold)] shadow-lg"
              >
                <div className="font-mono text-3xl md:text-4xl text-[var(--gold)] font-bold mb-2 text-start" dir="ltr">{stat.value}</div>
                <div className="font-sans text-[var(--muted-light)] font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST MESSAGES */}
      <section className="py-24 relative">
        <ShamsaPattern className="opacity-[0.02]" />
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-4">{t("latestMessagesTitle")}</h2>
              <div className="h-1 w-20 bg-[var(--gold)] rounded-full"></div>
            </div>
            <Link href="/messages" className="text-[var(--gold-light)] font-bold hover:underline hidden sm:block">
              {tCommon("viewAll")} &larr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.slice(0, 6).map((msg: any, i: number) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <MessageCard message={msg} />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/messages" className="text-[var(--gold-light)] font-bold hover:underline inline-block p-4">
              {tCommon("viewAll")} &larr;
            </Link>
          </div>
        </div>
      </section>

      {/* ANALYTICS PREVIEW */}
      <section className="py-24 bg-[var(--bg-deep)] border-t border-[var(--border)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-4">{t("pulseTitle")}</h2>
            <p className="text-[var(--muted)]">{t("pulseDesc")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="ltr">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 h-[280px] sm:h-[400px]">
              <h3 className="font-sans font-bold text-lg text-[var(--white)] mb-6" dir="auto">{t("dailyMessages")}</h3>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--muted)" tick={{fill: 'var(--muted)', fontSize: 12}} />
                    <YAxis stroke="var(--muted)" tick={{fill: 'var(--muted)', fontSize: 12}} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--gold-dim)', borderRadius: '8px' }} itemStyle={{ color: 'var(--gold)' }} />
                    <Area type="monotone" dataKey="count" stroke="var(--gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--muted)]" dir="auto">{t("noDailyData")}</div>
              )}
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 flex flex-col justify-center items-center h-[280px] sm:h-[400px]">
              <h3 className="font-sans font-bold text-lg text-[var(--white)] mb-6 self-start w-full" dir="auto">{t("participationDist")}</h3>
              <div className="relative w-48 h-48 rounded-full border-[16px] border-[var(--surface-2)] shadow-[var(--glow-gold)] flex items-center justify-center">
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-[var(--gold)] border-r-[var(--gold)] transform rotate-45"></div>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-b-[var(--green)] transform rotate-[10deg]"></div>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-l-[var(--sea)] transform -rotate-[15deg]"></div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--white)]">{stats.totalCountries}</div>
                  <div className="text-xs text-[var(--muted)]" dir="auto">{t("country")}</div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 flex-wrap justify-center w-full" dir="auto">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map((c: any) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span>
                    <span className="text-sm text-[var(--muted-light)]">{c.name} {c.value}%</span>
                  </div>
                )) : (
                  <div className="text-sm text-[var(--muted)]">{tCommon("loading")}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Story Video Section ── */
function StoryVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const t = useTranslations("home");

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isEnded) {
      video.currentTime = 0;
      setIsEnded(false);
    }
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolume = (val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
  };

  const skip = (sec: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));
  };

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
    setIsEnded(false);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  };

  // Auto-hide controls when playing
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
      setCurrentTime(video.currentTime);
    };
    const onLoaded = () => setDuration(video.duration);
    const onEnd = () => { setIsPlaying(false); setIsEnded(true); setShowControls(true); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => { setIsPlaying(false); setShowControls(true); };
    const onFS = () => setIsFullscreen(!!document.fullscreenElement);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("ended", onEnd);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    document.addEventListener("fullscreenchange", onFS);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      document.removeEventListener("fullscreenchange", onFS);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [isPlaying]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <section className="py-24 bg-gradient-to-b from-[var(--bg-deep)] to-[var(--surface)] relative overflow-hidden">
      <ShamsaPattern className="opacity-[0.03]" />
      <div className="container mx-auto px-4 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-4">
            {t("storyTitle")}
          </h2>
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full mx-auto mb-4" />
          <p className="text-[var(--muted-light)] max-w-2xl mx-auto text-lg leading-relaxed">
            {t("storyDesc")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border border-[var(--gold)]/20 shadow-[0_0_60px_rgba(203,163,68,0.15)] bg-black"
            onMouseMove={resetHideTimer}
            onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
            onTouchStart={resetHideTimer}
          >
            {/* Video */}
            <video
              ref={videoRef}
              className="w-full aspect-video object-contain bg-black cursor-pointer"
              poster="/media/logo.jpeg"
              preload="none"
              playsInline
              onClick={togglePlay}
            >
              <source src="/media/story.mp4" type="video/mp4" />
            </video>

            {/* Center play overlay — initial state or ended */}
            {(!isPlaying && !isEnded) && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-[0_0_40px_rgba(203,163,68,0.4)]"
                >
                  <Play size={36} className="text-[var(--bg-deep)] ms-1" fill="var(--bg-deep)" />
                </motion.div>
              </button>
            )}

            {/* Replay overlay — when ended */}
            {isEnded && (
              <button
                onClick={replay}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 cursor-pointer gap-3"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-[0_0_40px_rgba(203,163,68,0.4)]"
                >
                  <RotateCcw size={36} className="text-[var(--bg-deep)]" />
                </motion.div>
                <span className="text-white/80 font-sans font-bold text-sm">{t("storyReplay")}</span>
              </button>
            )}

            {/* Controls bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-10 pb-3 px-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {/* Progress bar */}
              <div
                className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/bar relative hover:h-2.5 transition-all"
                onClick={seek}
              >
                {/* Buffered (optional visual) */}
                <div
                  className="absolute top-0 left-0 h-full bg-[var(--gold)] rounded-full transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[var(--gold)] rounded-full shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 7px)` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Left controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-1.5 sm:p-2 text-white hover:text-[var(--gold)] transition-colors"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  {/* Skip back 10s */}
                  <button
                    onClick={() => skip(-10)}
                    className="p-1.5 sm:p-2 text-white/70 hover:text-[var(--gold)] transition-colors hidden sm:block"
                    title="-10s"
                  >
                    <SkipBack size={18} />
                  </button>

                  {/* Skip forward 10s */}
                  <button
                    onClick={() => skip(10)}
                    className="p-1.5 sm:p-2 text-white/70 hover:text-[var(--gold)] transition-colors hidden sm:block"
                    title="+10s"
                  >
                    <SkipForward size={18} />
                  </button>

                  {/* Volume */}
                  <div
                    className="relative flex items-center"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                  >
                    <button
                      onClick={toggleMute}
                      className="p-1.5 sm:p-2 text-white hover:text-[var(--gold)] transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      <VolumeIcon size={20} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${showVolume ? 'w-20 sm:w-24 opacity-100 ms-1' : 'w-0 opacity-0'}`}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolume(parseFloat(e.target.value))}
                        className="w-full h-1 accent-[var(--gold)] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time display */}
                  <span className="text-white/70 text-xs sm:text-sm font-mono ms-1 sm:ms-2 select-none" dir="ltr">
                    {fmt(currentTime)} / {fmt(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1">
                  {/* Replay */}
                  <button
                    onClick={replay}
                    className="p-1.5 sm:p-2 text-white/70 hover:text-[var(--gold)] transition-colors"
                    title="Replay"
                  >
                    <RotateCcw size={18} />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 sm:p-2 text-white hover:text-[var(--gold)] transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

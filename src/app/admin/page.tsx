"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
} from "recharts";

const catColors = ["var(--gold)", "var(--green)", "var(--sea)", "var(--desert)", "var(--camel)", "var(--red)"];

export default function AdminOverview() {
  const [kpis, setKpis] = useState({
    total: 0,
    pending: 0,
    rejected: 0,
    todayMessages: 0,
  });
  const [dailyData, setDailyData] = useState<{ label: string; count: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    // Fetch all stats from the unified endpoint
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setKpis({
          total: data.totalMessages || 0,
          pending: data.pendingMessages || 0,
          rejected: data.rejectedMessages || 0,
          todayMessages: data.dailyStats?.[0]?.message_count || 0,
        });

        // Category breakdown from real data
        if (data.categoryBreakdown?.length > 0) {
          setCategoryData(
            data.categoryBreakdown.map((c: any, i: number) => ({
              name: c.name,
              value: c.value,
              color: catColors[i % catColors.length],
            }))
          );
        }

        // Daily stats from real data
        if (data.dailyStats?.length > 0) {
          setDailyData(
            [...data.dailyStats].reverse().map((s: any) => ({
              label: new Date(s.date).toLocaleDateString("ar-AE", { weekday: "short" }),
              count: s.message_count,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const kpiCards = [
    { label: "إجمالي الرسائل", value: kpis.total.toLocaleString(), trend: "", color: "var(--gold)" },
    { label: "رسائل اليوم", value: kpis.todayMessages.toLocaleString(), trend: "", color: "var(--green)" },
    { label: "في انتظار المراجعة", value: kpis.pending.toLocaleString(), trend: "⚠️", color: "var(--camel)" },
    { label: "رسائل مرفوضة", value: kpis.rejected.toLocaleString(), trend: "🔴", color: "var(--red)" },
  ];

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guinness-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Export failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="text-[var(--muted-light)] text-sm font-bold mb-2">{kpi.label}</div>
            <div className="flex items-end justify-between">
              <div className="font-mono text-3xl font-bold text-[var(--gold)]">{kpi.value}</div>
              {kpi.trend && <div className="font-sans font-bold text-sm" style={{ color: kpi.color }}>{kpi.trend}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 h-[350px]">
          <h3 className="font-bold text-[var(--white)] mb-6">الرسائل اليومية — آخر 7 أيام</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--muted)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }} />
                <Area type="monotone" dataKey="count" stroke="var(--gold)" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[80%] flex items-center justify-center text-[var(--muted)]">لا توجد بيانات يومية بعد</div>
          )}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 h-[350px]">
          <h3 className="font-bold text-[var(--white)] mb-6">تصنيف المرسلين</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <RechartsPie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-[80%] flex items-center justify-center text-[var(--muted)]">لا توجد بيانات بعد</div>
          )}
        </div>
      </div>

      <div className="bg-[var(--surface-2)] border border-[var(--gold)] rounded-2xl p-6 shadow-[var(--glow-gold)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-[var(--white)] text-xl mb-2">تصدير بيانات غينيس</h3>
          <p className="text-[var(--muted-light)] text-sm">استخراج التقرير الرسمي لتقديم الأرقام إلى موسوعة غينيس</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="date" className="bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--white)] px-3 py-2 rounded-lg text-sm" />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <Download size={18} /> تصدير CSV
          </button>
        </div>
      </div>
    </div>
  );
}

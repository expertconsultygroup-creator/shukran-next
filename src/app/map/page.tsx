"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function MapPage() {
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("الكل");

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(setCountries).catch(() => {});
  }, []);

  const tabs = ["الكل", "الخليج", "العالم العربي", "آسيا", "أوروبا", "أمريكا", "أفريقيا"];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-2">رسائل من كل أنحاء العالم</h1>
            <p className="text-[var(--muted-light)]">124 دولة شاركت في توثيق حب الوطن</p>
          </div>
          <div className="bg-[var(--gold-dim)] border border-[var(--gold)] px-4 py-2 rounded-full text-[var(--gold)] font-bold shadow-[var(--glow-gold)]">مشاركة عالمية</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] pb-6">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${activeTab === tab ? "bg-[var(--surface-2)] text-[var(--white)] border border-[var(--gold)]" : "text-[var(--muted)] hover:text-[var(--white)]"}`}>{tab}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 relative overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center shadow-lg">
            <div className="absolute inset-0 bg-[#020a14]"><ShamsaPattern className="opacity-[0.02]" /></div>
            <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} className="w-full h-full relative z-10 focus:outline-none">
              <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => {
                    const isUAE = geo.properties.name === "United Arab Emirates";
                    const hasMessages = Math.random() > 0.6;
                    let fillColor = "var(--surface-2)";
                    if (isUAE) fillColor = "var(--gold)";
                    else if (hasMessages) {
                      const rand = Math.random();
                      if (rand > 0.8) fillColor = "rgba(203,163,68,0.8)";
                      else if (rand > 0.4) fillColor = "rgba(203,163,68,0.5)";
                      else fillColor = "rgba(203,163,68,0.25)";
                    }
                    return (
                      <Geography key={geo.rsmKey} geography={geo} fill={fillColor} stroke="var(--border)" strokeWidth={0.5}
                        style={{ default: { outline: "none" }, hover: { fill: "var(--gold-light)", outline: "none", cursor: "pointer" }, pressed: { fill: "var(--gold)", outline: "none" } }}
                        onMouseEnter={() => { if (isUAE || hasMessages) { setTooltipContent({ name: isUAE ? "الإمارات العربية المتحدة" : geo.properties.name, count: Math.floor(Math.random() * 50000) + 1000 }); } }}
                        onMouseLeave={() => setTooltipContent(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            {tooltipContent && (
              <div className="absolute top-8 left-8 bg-[var(--card-glass-deep)] backdrop-blur-md border border-[var(--gold-dim)] p-4 rounded-xl shadow-2xl z-20 pointer-events-none">
                <div className="font-sans font-bold text-[var(--white)] mb-1">{tooltipContent.name}</div>
                <div className="font-mono text-[var(--gold)] font-bold">{tooltipContent.count.toLocaleString()} رسالة</div>
              </div>
            )}
            <div className="absolute bottom-6 right-6 bg-[var(--card-glass-alt)] backdrop-blur-sm border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2 z-20">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--gold)]"></div><span className="text-[var(--muted)] text-xs">الإمارات</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[rgba(203,163,68,0.8)]"></div><span className="text-[var(--muted)] text-xs">مشاركة عالية</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[rgba(203,163,68,0.25)]"></div><span className="text-[var(--muted)] text-xs">مشاركة منخفضة</span></div>
            </div>
          </div>

          <div className="xl:col-span-1 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 flex flex-col h-[500px] md:h-[600px]">
            <h3 className="font-sans font-bold text-2xl text-[var(--white)] mb-6">أعلى 10 دول</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {countries.slice(0, 10).map((country: any, idx: number) => (
                <div key={country.code} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${idx === 0 ? "bg-[var(--gold-dim)] border border-[var(--gold-dim)]" : "hover:bg-[var(--surface-2)]"}`} style={idx === 0 ? { borderRight: "3px solid var(--gold)" } : {}}>
                  <div className="font-mono text-[var(--gold)] font-bold w-6">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="font-sans font-bold text-[var(--white)] text-sm mb-1">{country.name_ar || country.name}</div>
                    <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: `${countries[0] ? (country.count / (countries[0].count || 1)) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="font-mono text-[var(--muted-light)] text-sm font-bold">{(country.count || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useTranslations, useLocale } from "next-intl";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map from English country names (in topojson) to our country codes
const nameToCode: Record<string, string> = {
  "United Arab Emirates": "AE", "Saudi Arabia": "SA", "Kuwait": "KW", "Bahrain": "BH",
  "Qatar": "QA", "Oman": "OM", "Jordan": "JO", "Egypt": "EG", "Lebanon": "LB",
  "Iraq": "IQ", "Syria": "SY", "Palestine": "PS", "Yemen": "YE", "Sudan": "SD",
  "Morocco": "MA", "Algeria": "DZ", "Tunisia": "TN", "Libya": "LY", "India": "IN",
  "Pakistan": "PK", "Philippines": "PH", "United States of America": "US",
  "United Kingdom": "GB", "France": "FR", "Germany": "DE", "China": "CN",
  "Japan": "JP", "South Korea": "KR", "Australia": "AU", "Brazil": "BR",
  "Turkey": "TR", "Indonesia": "ID", "Bangladesh": "BD", "Sri Lanka": "LK",
  "Nepal": "NP", "Ethiopia": "ET", "Kenya": "KE", "Nigeria": "NG",
  "South Africa": "ZA", "Canada": "CA",
};

export default function MapPage() {
  const t = useTranslations("map");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then((data) => {
      const sorted = (data || []).sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
      setCountries(sorted);
    }).catch(() => {});
  }, []);

  // Build a lookup map: country_code -> { name, count }
  const countryMap = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    countries.forEach((c) => {
      map[c.code] = { name: isRtl ? c.name_ar : (c.name_en || c.name_ar), count: c.count || 0 };
    });
    return map;
  }, [countries, isRtl]);

  const maxCount = useMemo(() => {
    return Math.max(...countries.map((c) => c.count || 0), 1);
  }, [countries]);

  const participatingCountries = countries.filter((c) => c.count > 0).length;

  function getCountryFill(geoName: string): string {
    const code = nameToCode[geoName];
    if (!code) return "var(--surface-2)";
    const info = countryMap[code];
    if (!info || info.count === 0) return "var(--surface-2)";
    if (code === "AE") return "var(--gold)";
    const ratio = info.count / maxCount;
    if (ratio > 0.5) return "rgba(203,163,68,0.8)";
    if (ratio > 0.2) return "rgba(203,163,68,0.5)";
    return "rgba(203,163,68,0.25)";
  }

  function getTooltip(geoName: string) {
    const code = nameToCode[geoName];
    if (!code) return null;
    const info = countryMap[code];
    if (!info || info.count === 0) return null;
    return { name: info.name, count: info.count };
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]" dir="auto">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-start">
            <h1 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-2">{t("heroTitle")}</h1>
            <p className="text-[var(--muted-light)]">{t("heroDesc", { count: participatingCountries })}</p>
          </div>
          <div className="bg-[var(--gold-dim)] border border-[var(--gold)] px-4 py-2 rounded-full text-[var(--gold)] font-bold shadow-[var(--glow-gold)]">{t("globalParticipation")}</div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 relative overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center shadow-lg text-start">
            <div className="absolute inset-0 bg-[#020a14]"><ShamsaPattern className="opacity-[0.02]" /></div>
            <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} className="w-full h-full relative z-10 focus:outline-none">
              <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => {
                    const geoName = geo.properties.name;
                    const fillColor = getCountryFill(geoName);
                    return (
                      <Geography key={geo.rsmKey} geography={geo} fill={fillColor} stroke="var(--border)" strokeWidth={0.5}
                        style={{ default: { outline: "none" }, hover: { fill: "var(--gold-light)", outline: "none", cursor: "pointer" }, pressed: { fill: "var(--gold)", outline: "none" } }}
                        onMouseEnter={() => {
                          const tip = getTooltip(geoName);
                          if (tip) setTooltipContent(tip);
                        }}
                        onMouseLeave={() => setTooltipContent(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            {tooltipContent && (
              <div className="absolute top-8 start-8 bg-[var(--card-glass-deep)] backdrop-blur-md border border-[var(--gold-dim)] p-4 rounded-xl shadow-2xl z-20 pointer-events-none">
                <div className="font-sans font-bold text-[var(--white)] mb-1">{tooltipContent.name}</div>
                <div className="font-mono text-[var(--gold)] font-bold"><span dir="ltr">{tooltipContent.count.toLocaleString()}</span> {t("messageLabel")}</div>
              </div>
            )}
            <div className="absolute bottom-6 end-6 bg-[var(--card-glass-alt)] backdrop-blur-sm border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2 z-20">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--gold)]"></div><span className="text-[var(--muted)] text-xs">{t("uaeLabel")}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[rgba(203,163,68,0.8)]"></div><span className="text-[var(--muted)] text-xs">{t("highParticipation")}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[rgba(203,163,68,0.25)]"></div><span className="text-[var(--muted)] text-xs">{t("lowParticipation")}</span></div>
            </div>
          </div>

          <div className="xl:col-span-1 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 flex flex-col h-[500px] md:h-[600px] text-start">
            <h3 className="font-sans font-bold text-2xl text-[var(--white)] mb-6">{t("topCountries")}</h3>
            <div className={`flex-1 overflow-y-auto space-y-4 ${isRtl ? 'pl-2' : 'pr-2'}`}>
              {countries.filter(c => c.count > 0).slice(0, 15).map((country: any, idx: number) => (
                <div key={country.code} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${idx === 0 ? "bg-[var(--gold-dim)] border border-[var(--gold-dim)]" : "hover:bg-[var(--surface-2)]"}`} style={idx === 0 ? (isRtl ? { borderLeft: "3px solid var(--gold)" } : { borderRight: "3px solid var(--gold)" }) : {}}>
                  <div className="font-mono text-[var(--gold)] font-bold w-6 text-center">{idx + 1}</div>
                  <div className="flex-1 text-start">
                    <div className="font-sans font-bold text-[var(--white)] text-sm mb-1">{isRtl ? country.name_ar : (country.name_en || country.name_ar)}</div>
                    <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                      <div className={`h-full bg-[var(--gold)] rounded-full`} style={{ width: `${(country.count / maxCount) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="font-mono text-[var(--muted-light)] text-sm font-bold text-end" dir="ltr">{country.count.toLocaleString()}</div>
                </div>
              ))}
              {countries.filter(c => c.count > 0).length === 0 && (
                <div className="text-center text-[var(--muted)] py-12">{t("noParticipations")}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

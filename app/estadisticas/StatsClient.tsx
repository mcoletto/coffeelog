"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COFFEE_TYPE_LABELS } from "@/lib/coffee-types";
import type { CoffeeType } from "@prisma/client";

interface Stats {
  total: number;
  todayCount: number;
  allByType: { type: CoffeeType; count: number }[];
  allByContext: { CASA: number; CAFETERIA: number };
  allByTemperature: { CALIENTE: number; FRIO: number };
  byCountry: { country: string; count: number }[];
  byCompanion: { name: string; count: number }[];
  dailyLast30: { date: string; label: string; count: number }[];
  monthly: { label: string; count: number }[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  Argentina: "🇦🇷",
  Uruguay: "🇺🇾",
  Brasil: "🇧🇷",
  "Estados Unidos": "🇺🇸",
  España: "🇪🇸",
};

function PercentBar({ value, total, color = "bg-primary" }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export function StatsClient({ stats }: { stats: Stats }) {
  const totalContext = stats.allByContext.CASA + stats.allByContext.CAFETERIA;
  const totalTemp    = stats.allByTemperature.CALIENTE + stats.allByTemperature.FRIO;

  return (
    <div className="space-y-6">

      {/* Totales rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</p>
          <p className="font-serif text-3xl text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">cafés registrados</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hoy</p>
          <p className="font-serif text-3xl text-primary">{stats.todayCount}</p>
          <p className="text-xs text-muted-foreground">cafés hoy</p>
        </div>
      </div>

      {/* Últimos 30 días */}
      {stats.dailyLast30.some((d) => d.count > 0) && (
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Últimos 30 días</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={stats.dailyLast30} barCategoryGap="20%">
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {stats.dailyLast30.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 0 ? "var(--primary)" : "var(--muted)"} />
                ))}
              </Bar>
              <Tooltip
                cursor={false}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="rounded-xl bg-card border border-border px-2 py-1 text-xs shadow-warm">
                      {payload[0].payload.label}: <strong>{payload[0].value}</strong>
                    </div>
                  ) : null
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Por mes */}
      {stats.monthly.length > 1 && (
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Por mes</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={stats.monthly} barCategoryGap="20%">
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Tooltip
                cursor={false}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="rounded-xl bg-card border border-border px-2 py-1 text-xs shadow-warm">
                      {payload[0].payload.label}: <strong>{payload[0].value}</strong>
                    </div>
                  ) : null
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tipo más tomado */}
      {stats.allByType.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Por tipo</p>
          <div className="space-y-2.5">
            {stats.allByType.slice(0, 5).map(({ type, count }) => (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">{COFFEE_TYPE_LABELS[type]}</p>
                  <p className="text-xs text-muted-foreground">{count}</p>
                </div>
                <PercentBar value={count} total={stats.total} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Casa vs Cafetería */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Dónde</p>
        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>🏠 En casa</span>
              <span className="text-muted-foreground">{stats.allByContext.CASA}</span>
            </div>
            <PercentBar value={stats.allByContext.CASA} total={totalContext} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>☕ Cafetería</span>
              <span className="text-muted-foreground">{stats.allByContext.CAFETERIA}</span>
            </div>
            <PercentBar value={stats.allByContext.CAFETERIA} total={totalContext} color="bg-accent" />
          </div>
        </div>
      </div>

      {/* Caliente vs Frío */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Temperatura</p>
        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>☕ Caliente</span>
              <span className="text-muted-foreground">{stats.allByTemperature.CALIENTE}</span>
            </div>
            <PercentBar value={stats.allByTemperature.CALIENTE} total={totalTemp} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>🧊 Frío</span>
              <span className="text-muted-foreground">{stats.allByTemperature.FRIO}</span>
            </div>
            <PercentBar value={stats.allByTemperature.FRIO} total={totalTemp} color="bg-blue-300" />
          </div>
        </div>
      </div>

      {/* Por país */}
      {stats.byCountry.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Por país</p>
          <div className="space-y-2">
            {stats.byCountry.map(({ country, count }) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{COUNTRY_FLAGS[country] ?? "🌍"}</span>
                  <span className="text-sm text-foreground">{country}</span>
                </div>
                <span className="text-sm font-medium text-primary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Con quién */}
      {stats.byCompanion.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 shadow-warm space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Con quién</p>
          <div className="space-y-2">
            {stats.byCompanion.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{name}</span>
                <span className="text-sm font-medium text-primary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

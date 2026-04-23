import { prisma } from "@/lib/prisma";
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  subDays, format,
} from "date-fns";
import { es } from "date-fns/locale";
import type { CoffeeType, ContextType, Temperature } from "@prisma/client";

export async function coffeesToday() {
  const now = new Date();
  return prisma.coffee.findMany({
    where: {
      datePrecision: "EXACT",
      loggedAt: { gte: startOfDay(now), lte: endOfDay(now) },
    },
    include: { companions: true },
    orderBy: { loggedAt: "desc" },
  });
}

export async function coffeesThisWeek() {
  const now = new Date();
  return prisma.coffee.findMany({
    where: {
      datePrecision: "EXACT",
      loggedAt: {
        gte: startOfWeek(now, { weekStartsOn: 1 }),
        lte: endOfWeek(now, { weekStartsOn: 1 }),
      },
    },
    include: { companions: true },
    orderBy: { loggedAt: "desc" },
  });
}

export async function recentCoffees(limit = 8) {
  return prisma.coffee.findMany({
    take: limit,
    include: { companions: true },
    orderBy: [{ loggedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getStats() {
  const all = await prisma.coffee.findMany({ include: { companions: true } });
  const exact = all.filter((c) => c.datePrecision === "EXACT" && c.loggedAt);

  const now = new Date();
  const todayCount = exact.filter(
    (c) => c.loggedAt! >= startOfDay(now) && c.loggedAt! <= endOfDay(now)
  ).length;

  const allByType = Object.entries(
    all.reduce<Record<string, number>>((acc, c) => {
      acc[c.coffeeType] = (acc[c.coffeeType] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([type, count]) => ({ type: type as CoffeeType, count }))
    .sort((a, b) => b.count - a.count);

  const allByContext = all.reduce<Record<ContextType, number>>(
    (acc, c) => { acc[c.contextType] = (acc[c.contextType] ?? 0) + 1; return acc; },
    { CASA: 0, CAFETERIA: 0 }
  );

  const allByTemperature = all.reduce<Record<Temperature, number>>(
    (acc, c) => { acc[c.temperature] = (acc[c.temperature] ?? 0) + 1; return acc; },
    { CALIENTE: 0, FRIO: 0 }
  );

  const byCountry = Object.entries(
    all.reduce<Record<string, number>>((acc, c) => {
      acc[c.country] = (acc[c.country] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  let solaCount = 0;
  const companionMap: Record<string, number> = {};
  for (const coffee of all) {
    if (coffee.companions.length === 0) {
      solaCount++;
    } else {
      for (const c of coffee.companions) {
        const key = c.name.toLowerCase();
        companionMap[key] = (companionMap[key] ?? 0) + 1;
      }
    }
  }
  const byCompanion = [
    { name: "Sola", count: solaCount },
    ...Object.entries(companionMap)
      .map(([name, count]) => ({ name: capitalizeFirst(name), count }))
      .sort((a, b) => b.count - a.count),
  ];

  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    dailyMap[format(subDays(now, i), "yyyy-MM-dd")] = 0;
  }
  for (const c of exact) {
    const key = format(c.loggedAt!, "yyyy-MM-dd");
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyLast30 = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    label: format(new Date(date + "T12:00:00"), "d MMM", { locale: es }),
    count,
  }));

  const monthlyMap: Record<string, { label: string; count: number }> = {};
  for (const c of exact) {
    const key = format(c.loggedAt!, "yyyy-MM");
    if (!monthlyMap[key]) monthlyMap[key] = { label: format(c.loggedAt!, "MMM yy", { locale: es }), count: 0 };
    monthlyMap[key].count++;
  }
  for (const c of all.filter((x) => x.datePrecision === "MONTH_ONLY" && x.month && x.year)) {
    const key = `${c.year}-${String(c.month!).padStart(2, "0")}`;
    if (!monthlyMap[key]) {
      const d = new Date(c.year!, c.month! - 1, 1);
      monthlyMap[key] = { label: format(d, "MMM yy", { locale: es }), count: 0 };
    }
    monthlyMap[key].count++;
  }
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return {
    total: all.length,
    todayCount,
    allByType,
    allByContext,
    allByTemperature,
    byCountry,
    byCompanion,
    dailyLast30,
    monthly,
  };
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

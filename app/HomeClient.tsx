"use client";
import { useState, useEffect, useCallback } from "react";
import { TodaySection } from "@/components/home/TodaySection";
import { RecentCoffees } from "@/components/home/RecentCoffees";
import { AddCoffeeSheet } from "@/components/home/AddCoffeeSheet";
import { toArgDateStr } from "@/lib/utils";
import type { Coffee, Companion } from "@prisma/client";

type CoffeeWithCompanions = Coffee & { companions: Companion[] };

export function HomeClient() {
  const [coffees, setCoffees] = useState<CoffeeWithCompanions[]>([]);

  const fetchCoffees = useCallback(() => {
    fetch("/api/coffees")
      .then((r) => r.json())
      .then(setCoffees)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCoffees();
  }, [fetchCoffees]);

  const todayStr = toArgDateStr(new Date());
  const todayCoffees = coffees.filter(
    (c) => c.datePrecision === "EXACT" && c.loggedAt && toArgDateStr(new Date(c.loggedAt)) === todayStr
  );
  const recentCoffees = coffees.slice(0, 10);

  return (
    <>
      <TodaySection coffees={todayCoffees} />
      <AddCoffeeSheet onAdded={fetchCoffees} />
      <RecentCoffees coffees={recentCoffees} />
    </>
  );
}

export const dynamic = "force-dynamic";

import { coffeesToday, recentCoffees } from "@/lib/stats";
import { greetingByHour } from "@/lib/utils";
import { TodaySection } from "@/components/home/TodaySection";
import { RecentCoffees } from "@/components/home/RecentCoffees";
import { AddCoffeeSheet } from "@/components/home/AddCoffeeSheet";

export default async function HomePage() {
  const [today, recent] = await Promise.all([
    coffeesToday(),
    recentCoffees(10),
  ]);

  const greeting = greetingByHour();

  return (
    <div className="px-5 pt-10 pb-6 space-y-8">
      {/* Greeting */}
      <header className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {greeting}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <h1 className="font-serif text-2xl text-foreground">CoffeeLog</h1>
        </div>
      </header>

      {/* Today */}
      <TodaySection coffees={today} />

      {/* Add button */}
      <AddCoffeeSheet />

      {/* Recent */}
      <RecentCoffees coffees={recent} />
    </div>
  );
}

import { greetingByHour } from "@/lib/utils";
import { HomeClient } from "./HomeClient";

export default function HomePage() {
  const greeting = greetingByHour();

  return (
    <div className="px-5 pt-10 pb-6 space-y-8">
      <header className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {greeting}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <h1 className="font-serif text-2xl text-foreground">CoffeeLog</h1>
        </div>
      </header>

      <HomeClient />
    </div>
  );
}

"use client";
import { formatCoffeeDate, formatDateGroup, toArgDateStr } from "@/lib/utils";
import { COFFEE_TYPE_LABELS } from "@/lib/coffee-types";
import { Badge } from "@/components/ui/badge";
import type { Coffee, Companion } from "@prisma/client";

type CoffeeWithCompanions = Coffee & { companions: Companion[] };

interface RecentCoffeesProps {
  coffees: CoffeeWithCompanions[];
}

export function RecentCoffees({ coffees }: RecentCoffeesProps) {
  const todayStr = toArgDateStr(new Date());
  const nonToday = coffees.filter(
    (c) => !(c.datePrecision === "EXACT" && c.loggedAt && toArgDateStr(new Date(c.loggedAt)) === todayStr)
  );

  if (nonToday.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg text-foreground">Últimos registros</h2>
      <div className="space-y-2">
        {nonToday.map((coffee) => (
          <div
            key={coffee.id}
            className="flex items-start gap-3 rounded-2xl bg-card border border-border px-4 py-3 shadow-warm"
          >
            <span className="text-lg mt-0.5">
              {coffee.temperature === "FRIO" ? "🧊" : "☕"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">
                  {COFFEE_TYPE_LABELS[coffee.coffeeType]}
                  {coffee.coffeeType === "OTRO" && coffee.coffeeTypeOther && ` — ${coffee.coffeeTypeOther}`}
                </p>
                {coffee.contextName && (
                  <Badge variant="warm" className="text-[10px]">{coffee.contextName}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCoffeeDate(coffee.datePrecision, coffee.loggedAt, coffee.month, coffee.year)}
                {coffee.companions.length > 0 && ` · con ${coffee.companions.map((c) => c.name).join(", ")}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

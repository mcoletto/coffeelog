"use client";
import { COFFEE_TYPE_LABELS } from "@/lib/coffee-types";
import { formatCoffeeDate } from "@/lib/utils";
import type { Coffee, Companion } from "@prisma/client";

type CoffeeWithCompanions = Coffee & { companions: Companion[] };

interface TodaySectionProps {
  coffees: CoffeeWithCompanions[];
}

export function TodaySection({ coffees }: TodaySectionProps) {
  const dateLabel = new Date().toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="space-y-4">
      {/* Header editorial */}
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">{dateLabel}</p>
        <h1 className="font-serif text-2xl text-foreground">Hoy</h1>
      </div>

      {/* Tarjeta del día */}
      <div className="rounded-2xl bg-card border border-border shadow-warm p-5">
        {coffees.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Aún no registraste ningún café hoy.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-4xl text-primary">{coffees.length}</span>
              <span className="text-sm text-muted-foreground">
                {coffees.length === 1 ? "café" : "cafés"}
              </span>
            </div>
            <div className="space-y-2 pt-1">
              {coffees.map((coffee) => (
                <div key={coffee.id} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">
                    {coffee.temperature === "FRIO" ? "🧊" : "☕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {COFFEE_TYPE_LABELS[coffee.coffeeType]}
                      {coffee.coffeeType === "OTRO" && coffee.coffeeTypeOther && ` — ${coffee.coffeeTypeOther}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCoffeeDate(coffee.datePrecision, coffee.loggedAt)}
                      {coffee.contextName && ` · ${coffee.contextName}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

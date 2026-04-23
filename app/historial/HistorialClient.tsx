"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCoffeeDate } from "@/lib/utils";
import { COFFEE_TYPE_LABELS, CONTEXT_LABELS } from "@/lib/coffee-types";
import type { Coffee, Companion, CoffeeType, ContextType } from "@prisma/client";

type CoffeeWithCompanions = Coffee & { companions: Companion[] };

interface HistorialClientProps {
  initialCoffees: CoffeeWithCompanions[];
}

export function HistorialClient({ initialCoffees }: HistorialClientProps) {
  const router = useRouter();
  const [coffees, setCoffees] = useState(initialCoffees);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType]       = useState<CoffeeType | "ALL">("ALL");
  const [filterContext, setFilterContext] = useState<ContextType | "ALL">("ALL");
  const [filterCountry, setFilterCountry] = useState<string>("ALL");

  const countries = useMemo(() => {
    const set = new Set(coffees.map((c) => c.country));
    return Array.from(set).sort();
  }, [coffees]);

  const filtered = useMemo(() => {
    return coffees.filter((c) => {
      if (filterType !== "ALL" && c.coffeeType !== filterType) return false;
      if (filterContext !== "ALL" && c.contextType !== filterContext) return false;
      if (filterCountry !== "ALL" && c.country !== filterCountry) return false;
      return true;
    });
  }, [coffees, filterType, filterContext, filterCountry]);

  // Group by date label
  const groups = useMemo(() => {
    const map = new Map<string, CoffeeWithCompanions[]>();
    for (const c of filtered) {
      const key = formatCoffeeDate(c.datePrecision, c.loggedAt, c.month, c.year).split(",")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  async function deleteCoffee(id: string) {
    if (!confirm("¿Eliminar este café?")) return;
    const res = await fetch(`/api/coffees/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoffees((prev) => prev.filter((c) => c.id !== id));
      toast("Café eliminado");
      router.refresh();
    } else {
      toast.error("No se pudo eliminar");
    }
  }

  const hasFilters = filterType !== "ALL" || filterContext !== "ALL" || filterCountry !== "ALL";

  return (
    <div className="space-y-4">
      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} registros</p>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
          Filtros
          {hasFilters && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tipo</p>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as CoffeeType | "ALL")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {(Object.keys(COFFEE_TYPE_LABELS) as CoffeeType[]).map((t) => (
                    <SelectItem key={t} value={t}>{COFFEE_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Contexto</p>
              <Select value={filterContext} onValueChange={(v) => setFilterContext(v as ContextType | "ALL")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CASA">En casa</SelectItem>
                  <SelectItem value="CAFETERIA">Cafetería</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">País</p>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => { setFilterType("ALL"); setFilterContext("ALL"); setFilterCountry("ALL"); }}
            >
              <X className="h-3 w-3 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Coffee list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12 italic">
          No hay registros para los filtros seleccionados.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">{dateLabel}</p>
              {items.map((coffee) => (
                <div
                  key={coffee.id}
                  className="flex items-start gap-3 rounded-2xl bg-card border border-border px-4 py-3 shadow-warm"
                >
                  <span className="text-base mt-0.5">
                    {coffee.temperature === "FRIO" ? "🧊" : "☕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">
                        {COFFEE_TYPE_LABELS[coffee.coffeeType]}
                        {coffee.coffeeType === "OTRO" && coffee.coffeeTypeOther && ` — ${coffee.coffeeTypeOther}`}
                      </p>
                      {coffee.contextType === "CAFETERIA" && (
                        <Badge variant="warm" className="text-[10px]">Cafetería</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCoffeeDate(coffee.datePrecision, coffee.loggedAt, coffee.month, coffee.year)}
                      {coffee.contextName && ` · ${coffee.contextName}`}
                      {coffee.country !== "Argentina" && ` · ${coffee.country}`}
                      {coffee.companions.length > 0 && ` · con ${coffee.companions.map((c) => c.name).join(", ")}`}
                    </p>
                    {coffee.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">{coffee.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCoffee(coffee.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1 mt-0.5"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

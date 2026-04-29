"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, SlidersHorizontal, X, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCoffeeDate } from "@/lib/utils";
import { COFFEE_TYPE_LABELS } from "@/lib/coffee-types";
import { EditCoffeeSheet, type CoffeeWithCompanions } from "@/components/home/EditCoffeeSheet";
import { AddCoffeeSheet } from "@/components/home/AddCoffeeSheet";
import type { Coffee, Companion, CoffeeType, ContextType } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _unused = Coffee | Companion; // keep imports used


interface HistorialClientProps {
  initialCoffees: CoffeeWithCompanions[];
}

export function HistorialClient({ initialCoffees }: HistorialClientProps) {
  const router = useRouter();
  const [coffees, setCoffees] = useState<CoffeeWithCompanions[]>(initialCoffees);
  const [editing, setEditing] = useState<CoffeeWithCompanions | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType]       = useState<CoffeeType | "ALL">("ALL");
  const [filterContext, setFilterContext] = useState<ContextType | "ALL">("ALL");
  const [filterCountry, setFilterCountry] = useState<string>("ALL");

  // Fetch fresh data on every mount so new entries always appear
  useEffect(() => {
    fetch("/api/coffees")
      .then((r) => r.json())
      .then((data) => setCoffees(data))
      .catch(() => {});
  }, []);

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

  const groups = useMemo(() => {
    const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    function toMonthKey(c: CoffeeWithCompanions): string {
      if (c.loggedAt) {
        const argStr = new Date(c.loggedAt).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
        const [y, m] = argStr.split("-");
        return `${y}-${m}`;
      }
      if (c.month && c.year) return `${c.year}-${String(c.month).padStart(2, "0")}`;
      return "0000-00";
    }

    const sorted = [...filtered].sort((a, b) => toMonthKey(b).localeCompare(toMonthKey(a)));

    const map = new Map<string, { label: string; items: CoffeeWithCompanions[] }>();
    for (const c of sorted) {
      const key = toMonthKey(c);
      if (!map.has(key)) {
        const [y, m] = key.split("-").map(Number);
        const label = key === "0000-00" ? "Fecha desconocida" : `${MONTHS[m - 1]} ${y}`;
        map.set(key, { label, items: [] });
      }
      map.get(key)!.items.push(c);
    }
    return Array.from(map.entries()).map(([, v]) => v);
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

  function handleSaved(updated: CoffeeWithCompanions) {
    setCoffees((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setEditing(null);
  }

  const hasFilters = filterType !== "ALL" || filterContext !== "ALL" || filterCountry !== "ALL";

  return (
    <div className="space-y-4">
      <AddCoffeeSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          fetch("/api/coffees").then((r) => r.json()).then(setCoffees).catch(() => {});
        }}
      />
      <EditCoffeeSheet
        key={editing?.id ?? "none"}
        coffee={editing}
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        onSaved={handleSaved}
      />
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dónde</p>
              <Select value={filterContext} onValueChange={(v) => setFilterContext(v as ContextType | "ALL")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CASA">Mi casa</SelectItem>
                  <SelectItem value="CAFETERIA">Cafetería</SelectItem>
                  <SelectItem value="CASA_AJENA">Casa de...</SelectItem>
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

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12 italic">
          No hay registros para los filtros seleccionados.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label} className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">{label}</p>
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
                      {coffee.contextType === "CASA_AJENA" && (
                        <Badge variant="secondary" className="text-[10px]">Casa de amigos</Badge>
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
                  <div className="flex items-center gap-1 ml-1 mt-0.5">
                    <button
                      onClick={() => setEditing(coffee)}
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCoffee(coffee.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
        aria-label="Agregar café"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  COFFEE_TYPE_LABELS, MILK_LABELS, SWEETENER_LABELS,
  COUNTRIES, COMPANION_PRESETS, ALL_COFFEE_TYPES, ALL_MILK_TYPES, ALL_SWEETENERS,
} from "@/lib/coffee-types";
import type { Coffee, Companion, CoffeeType, Temperature, MilkType, SweetenerType, ContextType } from "@prisma/client";

export type CoffeeWithCompanions = Coffee & { companions: Companion[] };

function formatLocalDatetime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function coffeeToDate(coffee: CoffeeWithCompanions): string {
  if (coffee.loggedAt) return formatLocalDatetime(new Date(coffee.loggedAt));
  if (coffee.month && coffee.year) return formatLocalDatetime(new Date(coffee.year, coffee.month - 1, 1, 12, 0));
  return formatLocalDatetime(new Date());
}

const PRESET_NAMES = COMPANION_PRESETS.map((p) => p.toLowerCase());

interface EditCoffeeSheetProps {
  coffee: CoffeeWithCompanions | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: CoffeeWithCompanions) => void;
}

export function EditCoffeeSheet({ coffee, open, onOpenChange, onSaved }: EditCoffeeSheetProps) {
  const [loading, setLoading] = useState(false);
  const [coffeeType, setCoffeeType]   = useState<CoffeeType>("CAFE_CON_LECHE");
  const [typeOther, setTypeOther]     = useState("");
  const [temperature, setTemperature] = useState<Temperature>("CALIENTE");
  const [milkType, setMilkType]       = useState<MilkType>("SIN_LECHE");
  const [sweetener, setSweetener]     = useState<SweetenerType>("SIN_AZUCAR");
  const [contextType, setContextType] = useState<ContextType>("CASA");
  const [contextName, setContextName] = useState("");
  const [country, setCountry]         = useState("Argentina");
  const [companions, setCompanions]   = useState<string[]>([]);
  const [otherPerson, setOtherPerson] = useState("");
  const [loggedAt, setLoggedAt]       = useState(formatLocalDatetime(new Date()));
  const [notes, setNotes]             = useState("");

  // Reset form whenever the coffee changes (new edit target)
  useEffect(() => {
    if (!coffee) return;
    setCoffeeType(coffee.coffeeType);
    setTypeOther(coffee.coffeeTypeOther ?? "");
    setTemperature(coffee.temperature);
    setMilkType(coffee.milkType);
    setSweetener(coffee.sweetener);
    setContextType(coffee.contextType);
    setContextName(coffee.contextName ?? "");
    setCountry(coffee.country);
    setCompanions(
      coffee.companions
        .filter((c) => PRESET_NAMES.includes(c.name.toLowerCase()))
        .map((c) => COMPANION_PRESETS.find((p) => p.toLowerCase() === c.name.toLowerCase()) ?? c.name)
    );
    setOtherPerson(
      coffee.companions
        .filter((c) => !PRESET_NAMES.includes(c.name.toLowerCase()))
        .map((c) => c.name)
        .join(", ")
    );
    setLoggedAt(coffeeToDate(coffee));
    setNotes(coffee.notes ?? "");
  }, [coffee]);

  function toggleCompanion(name: string) {
    setCompanions((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coffee) return;
    setLoading(true);
    try {
      const allCompanions = otherPerson.trim()
        ? [...companions, ...otherPerson.split(",").map((s) => s.trim()).filter(Boolean)]
        : companions;

      const res = await fetch(`/api/coffees/${coffee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coffeeType,
          coffeeTypeOther: coffeeType === "OTRO" ? typeOther : null,
          temperature,
          milkType,
          sweetener,
          contextType,
          contextName: contextName.trim() || null,
          country,
          companions: allCompanions,
          loggedAt: new Date(loggedAt).toISOString(),
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      toast("✏️ Café actualizado");
      onOpenChange(false);
      onSaved(updated);
    } catch {
      toast.error("No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  }

  if (!coffee) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar café</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de café</Label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_COFFEE_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => setCoffeeType(type)}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-xs font-medium text-center transition-all",
                    coffeeType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {COFFEE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            {coffeeType === "OTRO" && (
              <Input placeholder="¿Qué café es?" value={typeOther} onChange={(e) => setTypeOther(e.target.value)} />
            )}
          </div>

          {/* Temperatura */}
          <div className="space-y-2">
            <Label>Temperatura</Label>
            <div className="flex gap-2">
              {(["CALIENTE", "FRIO"] as Temperature[]).map((t) => (
                <button key={t} type="button" onClick={() => setTemperature(t)}
                  className={cn(
                    "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
                    temperature === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {t === "CALIENTE" ? "☕ Caliente" : "🧊 Frío"}
                </button>
              ))}
            </div>
          </div>

          {/* Leche */}
          <div className="space-y-2">
            <Label>Leche</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_MILK_TYPES.map((m) => (
                <button key={m} type="button" onClick={() => setMilkType(m)}
                  className={cn(
                    "rounded-xl border py-2.5 text-xs font-medium transition-all",
                    milkType === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {MILK_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Azúcar */}
          <div className="space-y-2">
            <Label>Azúcar / Endulzante</Label>
            <div className="flex gap-2">
              {ALL_SWEETENERS.map((s) => (
                <button key={s} type="button" onClick={() => setSweetener(s)}
                  className={cn(
                    "flex-1 rounded-xl border py-2.5 text-xs font-medium transition-all",
                    sweetener === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {SWEETENER_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Contexto */}
          <div className="space-y-2">
            <Label>Dónde</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "CASA",       label: "🏠 Mi casa" },
                { value: "CAFETERIA",  label: "☕ Cafetería" },
                { value: "CASA_AJENA", label: "🏡 Casa de..." },
              ] as { value: ContextType; label: string }[]).map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => { setContextType(value); setContextName(""); }}
                  className={cn(
                    "rounded-xl border py-2.5 text-xs font-medium transition-all",
                    contextType === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <Input
              placeholder={
                contextType === "CAFETERIA"  ? "Nombre del lugar" :
                contextType === "CASA_AJENA" ? "¿En casa de quién?" :
                "Marca, cápsula o café"
              }
              value={contextName}
              onChange={(e) => setContextName(e.target.value)}
            />
          </div>

          {/* País */}
          <div className="space-y-2">
            <Label>País</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Con quién */}
          <div className="space-y-2">
            <Label>Con quién</Label>
            <div className="flex flex-wrap gap-2">
              {COMPANION_PRESETS.map((name) => (
                <button key={name} type="button" onClick={() => toggleCompanion(name)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                    companions.includes(name)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            <Input
              placeholder="Otra persona (opcional)"
              value={otherPerson}
              onChange={(e) => setOtherPerson(e.target.value)}
            />
          </div>

          {/* Fecha y hora */}
          <div className="space-y-2">
            <Label>Fecha y hora</Label>
            <Input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
            />
          </div>

          {/* Nota */}
          <div className="space-y-2">
            <Label>Nota (opcional)</Label>
            <Textarea
              placeholder="¿Algo para recordar de este café?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

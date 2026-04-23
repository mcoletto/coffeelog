import type { CoffeeType, Temperature, MilkType, SweetenerType, ContextType } from "@prisma/client";

export const COFFEE_TYPE_LABELS: Record<CoffeeType, string> = {
  CAFE_CON_LECHE:    "Café con leche",
  FLAT_WHITE:        "Flat white",
  ICED_COFFEE_LATTE: "Iced latte",
  CAPUCCINO:         "Cappuccino",
  ESPRESSO:          "Espresso",
  AMERICANO:         "Americano",
  LATTE:             "Latte",
  MOCHA:             "Mocha",
  OTRO:              "Otro",
};

export const COFFEE_TYPE_EMOJI: Record<CoffeeType, string> = {
  CAFE_CON_LECHE:    "☕",
  FLAT_WHITE:        "☕",
  ICED_COFFEE_LATTE: "🧊",
  CAPUCCINO:         "☕",
  ESPRESSO:          "☕",
  AMERICANO:         "☕",
  LATTE:             "☕",
  MOCHA:             "☕",
  OTRO:              "☕",
};

export const TEMPERATURE_LABELS: Record<Temperature, string> = {
  CALIENTE: "Caliente",
  FRIO:     "Frío",
};

export const MILK_LABELS: Record<MilkType, string> = {
  ENTERA:     "Entera",
  DESCREMADA: "Descremada",
  VEGETAL:    "Vegetal",
  SIN_LECHE:  "Sin leche",
};

export const SWEETENER_LABELS: Record<SweetenerType, string> = {
  AZUCAR:      "Azúcar",
  EDULCORANTE: "Edulcorante",
  SIN_AZUCAR:  "Sin azúcar",
};

export const CONTEXT_LABELS: Record<ContextType, string> = {
  CASA:      "En casa",
  CAFETERIA: "Cafetería",
};

export const COUNTRIES = [
  "Argentina",
  "Uruguay",
  "Brasil",
  "Estados Unidos",
  "España",
  "Otro",
] as const;

export type Country = typeof COUNTRIES[number];

export const COMPANION_PRESETS = ["Fede", "Vicu"] as const;

export const ALL_COFFEE_TYPES = Object.keys(COFFEE_TYPE_LABELS) as CoffeeType[];
export const ALL_MILK_TYPES   = Object.keys(MILK_LABELS) as MilkType[];
export const ALL_SWEETENERS   = Object.keys(SWEETENER_LABELS) as SweetenerType[];

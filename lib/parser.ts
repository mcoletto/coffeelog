import type {
  CoffeeType, Temperature, ContextType, DatePrecision, MilkType, SweetenerType,
} from "@prisma/client";

export interface ParsedCoffee {
  coffeeType:      CoffeeType;
  coffeeTypeOther: string | null;
  temperature:     Temperature;
  milkType:        MilkType;
  sweetener:       SweetenerType;
  contextType:     ContextType;
  contextName:     string | null;
  country:         string;
  datePrecision:   DatePrecision;
  loggedAt:        Date | null;
  month:           number | null;
  year:            number | null;
  notes:           string | null;
  companions:      string[];
  warnings:        string[];
}

export interface ParseResult {
  entries: ParsedCoffee[];
  skipped: string[];
}

const TYPE_PATTERNS: [RegExp, CoffeeType][] = [
  [/cafe\s+con\s+leche/i,        "CAFE_CON_LECHE"],
  [/flat\s+white/i,              "FLAT_WHITE"],
  [/iced\s+coffee\s+latte/i,     "ICED_COFFEE_LATTE"],
  [/iced\s+latte/i,              "ICED_COFFEE_LATTE"],
  [/iced\s+coffee/i,             "ICED_COFFEE_LATTE"],
  [/cold\s*brew/i,               "ICED_COFFEE_LATTE"],
  [/cappucc|capuccino|capu\b/i,  "CAPUCCINO"],
  [/espresso/i,                  "ESPRESSO"],
  [/americano/i,                 "AMERICANO"],
  [/\blatte\b/i,                 "LATTE"],
  [/mocha|mocaccino|mochaccino/i,"MOCHA"],
  [/\bcafe\b/i,                  "CAFE_CON_LECHE"],
];

const CON_SKIP = new Set(["leche", "cafe", "latte", "el", "la", "los", "las", "un", "una"]);

const MONTH_NAMES: Record<string, number> = {
  enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6,
  julio:7, agosto:8, septiembre:9, octubre:10, noviembre:11, diciembre:12,
};

const COUNTRY_ALIASES: Record<string, string> = {
  arg:"Argentina",       argentina:"Argentina",
  uru:"Uruguay",         uruguay:"Uruguay",
  brasil:"Brasil",       brazil:"Brasil",
  us:"Estados Unidos",   usa:"Estados Unidos",
  "estados unidos":"Estados Unidos",
  españa:"España",       spain:"España",
};

function detectType(text: string): CoffeeType {
  for (const [pattern, type] of TYPE_PATTERNS) {
    if (pattern.test(text)) return type;
  }
  return "OTRO";
}

function detectTemperature(text: string): Temperature {
  return /iced|cold\s*brew|frozen|frío|frio/i.test(text) ? "FRIO" : "CALIENTE";
}

function detectCompanions(text: string): string[] {
  const companions: string[] = [];
  for (const m of text.matchAll(/\bcon\s+(\w+)/gi)) {
    const word = m[1].toLowerCase();
    if (!CON_SKIP.has(word)) companions.push(word);
  }
  return [...new Set(companions)];
}

function detectContext(text: string): { contextType: ContextType; contextName: string | null; warnings: string[] } {
  const warnings: string[] = [];

  if (/cafetera/i.test(text)) {
    const enMatch = text.match(/cafetera\s+en\s+(.+?)(?:\s+con\s+\w+)?$/i);
    if (enMatch) return { contextType: "CASA", contextName: toTitleCase(enMatch[1].trim()), warnings };
    const brandMatch = text.match(/cafetera\s+(?!con\b)([a-záéíóúñ]+)/i);
    if (brandMatch) return { contextType: "CASA", contextName: toTitleCase(brandMatch[1]), warnings };
    return { contextType: "CASA", contextName: null, warnings };
  }

  if (/nespres[oa]/i.test(text)) {
    return { contextType: "CASA", contextName: "Nespresso", warnings };
  }

  const bottleMatch = text.match(/de\s+botella\s+de\s+([a-záéíóúñ]+)/i);
  if (bottleMatch) return { contextType: "CAFETERIA", contextName: toTitleCase(bottleMatch[1]), warnings };

  const enIdx = text.toLowerCase().lastIndexOf(" en ");
  if (enIdx !== -1) {
    let place = text.slice(enIdx + 4).trim();
    place = place.replace(/\s+con\s+\w+$/i, "").trim();
    if (/buscar\s+nombre/i.test(place)) {
      place = place.replace(/\s*buscar\s+nombre\s*/i, "").trim();
      warnings.push("Nombre del lugar no registrado — revisar manualmente");
    }
    if (place.length > 0) return { contextType: "CAFETERIA", contextName: toTitleCase(place), warnings };
  }

  return { contextType: "CASA", contextName: null, warnings };
}

export function parseTxt(raw: string, defaultYear = new Date().getFullYear()): ParseResult {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries: ParsedCoffee[] = [];
  const skipped: string[] = [];

  let currentCountry = "Argentina";
  let currentMonth: number | null = null;
  let currentYear = defaultYear;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower === "cafes" || lower === "cafés") continue;
    if (MONTH_NAMES[lower] !== undefined) { currentMonth = MONTH_NAMES[lower]; continue; }
    if (COUNTRY_ALIASES[lower] !== undefined) { currentCountry = COUNTRY_ALIASES[lower]; continue; }
    if (/^\d{4}$/.test(lower)) { currentYear = parseInt(lower, 10); continue; }
    if (lower.length < 3) { skipped.push(line); continue; }

    const coffeeType = detectType(lower);
    const temperature = detectTemperature(lower);
    const { contextType, contextName, warnings } = detectContext(lower);
    const companions = detectCompanions(lower).filter(
      (c) => !["leche", "cafe", "latte"].includes(c)
    );

    entries.push({
      coffeeType,
      coffeeTypeOther: coffeeType === "OTRO" ? line : null,
      temperature,
      milkType: "SIN_LECHE",
      sweetener: "SIN_AZUCAR",
      contextType,
      contextName,
      country: currentCountry,
      datePrecision: "MONTH_ONLY",
      loggedAt: null,
      month: currentMonth,
      year: currentYear,
      notes: warnings.length > 0 ? warnings.join("; ") : null,
      companions,
      warnings,
    });
  }

  return { entries, skipped };
}

function toTitleCase(str: string): string {
  return str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

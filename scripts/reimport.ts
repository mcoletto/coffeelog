/**
 * Reimport script — wipes DB and inserts the full historical coffee dataset (52 entries).
 * Run: npm run reimport
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Entry {
  coffeeType: string;
  temperature: string;
  contextType: string;
  contextName: string | null;
  country: string;
  month: number;
  year: number;
  companions?: string[];
  notes?: string;
}

const ENTRIES: Entry[] = [
  // ── ENERO ─────────────────────────────────────────────────────
  // Brasil
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Casa De Pao De Queijo", country:"Brasil",         month:1, year:2026 },
  // Uruguay
  { coffeeType:"MOCHA",            temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"La Linda",              country:"Uruguay",        month:1, year:2026 },
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"La Rebelion",           country:"Uruguay",        month:1, year:2026 },
  { coffeeType:"ICED_COFFEE_LATTE",temperature:"FRIO",     contextType:"CAFETERIA", contextName:"Aura",                  country:"Uruguay",        month:1, year:2026 },
  { coffeeType:"FLAT_WHITE",       temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Maguja",                country:"Uruguay",        month:1, year:2026 },
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Francesco",             country:"Uruguay",        month:1, year:2026 },

  // ── FEBRERO ───────────────────────────────────────────────────
  // Uruguay (continúa)
  { coffeeType:"FLAT_WHITE",       temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"La Rebelion",           country:"Uruguay",        month:2, year:2026, companions:["mini"] },
  // Argentina
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Delirante",             country:"Argentina",      month:2, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Delirante",             country:"Argentina",      month:2, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Argentina",      month:2, year:2026, companions:["nacho"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Argentina",      month:2, year:2026, companions:["vicu"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Argentina",      month:2, year:2026, companions:["vicu"] },
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Moritz",                country:"Argentina",      month:2, year:2026, companions:["vicu"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Argentina",      month:2, year:2026, companions:["vicu"] },
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Costal",                country:"Argentina",      month:2, year:2026, companions:["vicu"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Tucumán",               country:"Argentina",      month:2, year:2026, companions:["vicu"], notes:"Nombre del lugar no registrado — revisar manualmente" },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Lo De Tato",            country:"Argentina",      month:2, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Lo De Ali",             country:"Argentina",      month:2, year:2026 },
  // Estados Unidos
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Estados Unidos", month:2, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Estados Unidos", month:2, year:2026 },
  { coffeeType:"MOCHA",            temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Ralph's Coffee",        country:"Estados Unidos", month:2, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Estados Unidos", month:2, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:null,                    country:"Estados Unidos", month:2, year:2026 },

  // ── MARZO ─────────────────────────────────────────────────────
  // Estados Unidos (continúa)
  { coffeeType:"CAPUCCINO",        temperature:"FRIO",     contextType:"CAFETERIA", contextName:"Joffrey's Animal Kingdom Disney", country:"Estados Unidos", month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Starbucks",             country:"Estados Unidos", month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Starbucks",             country:"Estados Unidos", month:3, year:2026 },
  // Argentina
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Delirante",             country:"Argentina",      month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Delirante",             country:"Argentina",      month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026, companions:["vicu"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026, companions:["vicu"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"ICED_COFFEE_LATTE",temperature:"FRIO",     contextType:"CAFETERIA", contextName:"Cuervo Café",           country:"Argentina",      month:3, year:2026, companions:["vicu"] },
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Blu",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"CAPUCCINO",        temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Birkin",                country:"Argentina",      month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"FLAT_WHITE",       temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Cuervo",                country:"Argentina",      month:3, year:2026, companions:["vicu"] },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"ICED_COFFEE_LATTE",temperature:"FRIO",     contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:3, year:2026 },
  { coffeeType:"ICED_COFFEE_LATTE",temperature:"FRIO",     contextType:"CAFETERIA", contextName:"Starbucks",             country:"Argentina",      month:3, year:2026 },

  // ── ABRIL ─────────────────────────────────────────────────────
  // Argentina (continúa)
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:4, year:2026 },
  // Uruguay
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Nespresso",             country:"Uruguay",        month:4, year:2026 },
  // Argentina
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:4, year:2026 },
  { coffeeType:"ICED_COFFEE_LATTE",temperature:"FRIO",     contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CAFETERIA", contextName:"Salt Café",             country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Noi",                   country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Bigface",               country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Bigface",               country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Bigface",               country:"Argentina",      month:4, year:2026 },
  { coffeeType:"CAFE_CON_LECHE",   temperature:"CALIENTE", contextType:"CASA",      contextName:"Bigface",               country:"Argentina",      month:4, year:2026 },
];

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.companion.deleteMany();
  await prisma.coffee.deleteMany();

  console.log(`Importando ${ENTRIES.length} cafés...`);
  let count = 0;

  for (const e of ENTRIES) {
    await prisma.coffee.create({
      data: {
        coffeeType:    e.coffeeType as never,
        temperature:   e.temperature as never,
        milkType:      "SIN_LECHE",
        sweetener:     "SIN_AZUCAR",
        contextType:   e.contextType as never,
        contextName:   e.contextName ?? undefined,
        country:       e.country,
        datePrecision: "MONTH_ONLY",
        month:         e.month,
        year:          e.year,
        notes:         e.notes ?? undefined,
        companions:    e.companions?.length
          ? { create: e.companions.map((name) => ({ name })) }
          : undefined,
      },
    });
    count++;
  }

  console.log(`✓ ${count} cafés importados.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

/**
 * Generic import from a .txt file using the parser.
 * Usage: npm run import -- <path-to-file> [year]
 *
 * Example: npm run import -- data/cafes.txt 2025
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { parseTxt } from "../lib/parser";

const prisma = new PrismaClient();

async function main() {
  const filePath = process.argv[2];
  const year     = process.argv[3] ? parseInt(process.argv[3]) : undefined;

  if (!filePath) {
    console.error("Uso: npm run import -- <archivo.txt> [año]");
    process.exit(1);
  }

  const text = readFileSync(filePath, "utf-8");
  const { entries, skipped } = parseTxt(text, year);

  console.log(`Parseado: ${entries.length} cafés, ${skipped.length} líneas saltadas`);

  if (skipped.length > 0) {
    console.log("\nLíneas saltadas:");
    skipped.forEach((l) => console.log("  ·", l));
  }

  const warnings = entries.filter((e) => e.warnings.length > 0);
  if (warnings.length > 0) {
    console.log("\n⚠ Entradas con advertencias:");
    warnings.forEach((e) => console.log(`  · ${e.warnings.join("; ")}`));
  }

  console.log("\nImportando...");
  let count = 0;

  for (const e of entries) {
    await prisma.coffee.create({
      data: {
        coffeeType:      e.coffeeType,
        coffeeTypeOther: e.coffeeTypeOther ?? undefined,
        temperature:     e.temperature,
        milkType:        e.milkType,
        sweetener:       e.sweetener,
        contextType:     e.contextType,
        contextName:     e.contextName ?? undefined,
        country:         e.country,
        datePrecision:   e.datePrecision,
        loggedAt:        e.loggedAt ?? undefined,
        month:           e.month ?? undefined,
        year:            e.year ?? undefined,
        notes:           e.notes ?? undefined,
        companions:      e.companions.length
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

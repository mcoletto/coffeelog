export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTxt } from "@/lib/parser";

export async function POST(req: NextRequest) {
  const { text, year } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text requerido" }, { status: 400 });
  }

  const { entries, skipped } = parseTxt(text, year ?? new Date().getFullYear());

  const created = await Promise.all(
    entries.map((e) =>
      prisma.coffee.create({
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
          companions:      { create: e.companions.map((name) => ({ name })) },
        },
      })
    )
  );

  return NextResponse.json({
    imported: created.length,
    skipped: skipped.length,
    skippedLines: skipped,
  });
}

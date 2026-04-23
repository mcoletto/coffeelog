export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CoffeeSchema = z.object({
  coffeeType:      z.enum(["CAFE_CON_LECHE","FLAT_WHITE","ICED_COFFEE_LATTE","CAPUCCINO","ESPRESSO","AMERICANO","LATTE","MOCHA","OTRO"]),
  coffeeTypeOther: z.string().optional(),
  temperature:     z.enum(["CALIENTE","FRIO"]).default("CALIENTE"),
  milkType:        z.enum(["ENTERA","DESCREMADA","VEGETAL","SIN_LECHE"]).default("SIN_LECHE"),
  sweetener:       z.enum(["AZUCAR","EDULCORANTE","SIN_AZUCAR"]).default("SIN_AZUCAR"),
  contextType:     z.enum(["CASA","CAFETERIA"]).default("CASA"),
  contextName:     z.string().optional(),
  country:         z.string().default("Argentina"),
  companions:      z.array(z.string()).default([]),
  datePrecision:   z.enum(["EXACT","MONTH_ONLY"]).default("EXACT"),
  loggedAt:        z.string().optional(),
  month:           z.number().int().min(1).max(12).optional(),
  year:            z.number().int().optional(),
  notes:           z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {};

  const country = searchParams.get("country");
  if (country) where.country = country;

  const type = searchParams.get("type");
  if (type) where.coffeeType = type;

  const context = searchParams.get("context");
  if (context) where.contextType = context;

  const month = searchParams.get("month");
  const year  = searchParams.get("year");
  if (month && year) {
    where.OR = [
      { datePrecision: "MONTH_ONLY", month: parseInt(month), year: parseInt(year) },
      {
        datePrecision: "EXACT",
        loggedAt: {
          gte: new Date(`${year}-${month.padStart(2, "0")}-01`),
          lt:  new Date(`${year}-${String(parseInt(month) + 1).padStart(2, "0")}-01`),
        },
      },
    ];
  }

  const from = searchParams.get("from");
  const to   = searchParams.get("to");
  if (from || to) {
    where.loggedAt = {};
    if (from) (where.loggedAt as Record<string, unknown>).gte = new Date(from);
    if (to)   (where.loggedAt as Record<string, unknown>).lte = new Date(to);
  }

  const coffees = await prisma.coffee.findMany({
    where,
    include: { companions: true },
    orderBy: [{ loggedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });

  return NextResponse.json(coffees, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = CoffeeSchema.parse(body);
  const { companions, loggedAt, ...rest } = data;

  const coffee = await prisma.coffee.create({
    data: {
      ...rest,
      loggedAt: loggedAt ? new Date(loggedAt) : undefined,
      companions: {
        create: companions.map((name) => ({ name })),
      },
    },
    include: { companions: true },
  });

  return NextResponse.json(coffee, { status: 201 });
}

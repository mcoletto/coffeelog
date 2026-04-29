export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  coffeeType:      z.enum(["CAFE_CON_LECHE","FLAT_WHITE","ICED_COFFEE_LATTE","CAPUCCINO","ESPRESSO","AMERICANO","LATTE","MOCHA","OTRO"]).optional(),
  coffeeTypeOther: z.string().nullable().optional(),
  temperature:     z.enum(["CALIENTE","FRIO"]).optional(),
  milkType:        z.enum(["ENTERA","DESCREMADA","VEGETAL","SIN_LECHE"]).optional(),
  sweetener:       z.enum(["AZUCAR","EDULCORANTE","SIN_AZUCAR"]).optional(),
  contextType:     z.enum(["CASA","CAFETERIA","CASA_AJENA"]).optional(),
  contextName:     z.string().nullable().optional(),
  country:         z.string().optional(),
  companions:      z.array(z.string()).optional(),
  datePrecision:   z.enum(["EXACT","MONTH_ONLY"]).optional(),
  loggedAt:        z.string().nullable().optional(),
  month:           z.number().int().min(1).max(12).nullable().optional(),
  year:            z.number().int().nullable().optional(),
  notes:           z.string().nullable().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coffee = await prisma.coffee.findUnique({
    where: { id },
    include: { companions: true },
  });
  if (!coffee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coffee);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);
    const { companions, loggedAt, datePrecision, month, year, ...rest } = data;

    const coffee = await prisma.coffee.update({
      where: { id },
      data: {
        ...rest,
        ...(datePrecision === "EXACT" && loggedAt
          ? { datePrecision: "EXACT", loggedAt: new Date(loggedAt), month: null, year: null }
          : datePrecision === "MONTH_ONLY"
          ? { datePrecision: "MONTH_ONLY", loggedAt: null, month, year }
          : {}),
        ...(companions !== undefined && {
          companions: {
            deleteMany: {},
            create: companions.map((name) => ({ name })),
          },
        }),
      },
      include: { companions: true },
    });

    return NextResponse.json(coffee);
  } catch (err) {
    console.error("PUT /api/coffees/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.coffee.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

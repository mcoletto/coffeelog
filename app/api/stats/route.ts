export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats";

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats, {
    headers: { "Cache-Control": "no-store" },
  });
}

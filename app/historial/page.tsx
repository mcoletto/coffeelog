export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { HistorialClient } from "./HistorialClient";

export default async function HistorialPage() {
  const coffees = await prisma.coffee.findMany({
    include: { companions: true },
    orderBy: [{ loggedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="px-5 pt-10 pb-6">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Todos los registros</p>
        <h1 className="font-serif text-2xl text-foreground">Historial</h1>
      </header>
      <HistorialClient initialCoffees={coffees} />
    </div>
  );
}

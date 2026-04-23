export const dynamic = "force-dynamic";

import { getStats } from "@/lib/stats";
import { StatsClient } from "./StatsClient";

export default async function StatsPage() {
  const stats = await getStats();
  return (
    <div className="px-5 pt-10 pb-6">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Mis números</p>
        <h1 className="font-serif text-2xl text-foreground">Estadísticas</h1>
      </header>
      <StatsClient stats={stats} />
    </div>
  );
}

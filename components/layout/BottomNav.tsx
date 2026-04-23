"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/",             label: "Inicio",      Icon: Home },
  { href: "/historial",   label: "Historial",   Icon: Clock },
  { href: "/estadisticas",label: "Stats",       Icon: BarChart2 },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-safe"
      style={{ maxWidth: "28rem", margin: "0 auto" }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
              <span className={cn("text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DatePrecision } from "@prisma/client";

const TZ = "America/Argentina/Buenos_Aires";

/** Returns "YYYY-MM-DD" in Argentina timezone */
export function toArgDateStr(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoffeeDate(
  datePrecision: DatePrecision,
  loggedAt?: string | Date | null,
  month?: number | null,
  year?: number | null
): string {
  if (datePrecision === "EXACT" && loggedAt) {
    const d = typeof loggedAt === "string" ? new Date(loggedAt) : loggedAt;
    const dStr       = toArgDateStr(d);
    const todayStr   = toArgDateStr(new Date());
    const yestStr    = toArgDateStr(new Date(Date.now() - 864e5));
    if (dStr === todayStr) return "Hoy";
    if (dStr === yestStr)  return "Ayer";
    const [, m, day] = dStr.split("-").map(Number);
    const MONTHS_SHORT = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${day} ${MONTHS_SHORT[m - 1]}`;
  }
  if (month && year) {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    return `${monthNames[month - 1]} ${year}`;
  }
  return "Fecha desconocida";
}

export function formatDateGroup(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dStr     = toArgDateStr(d);
  const todayStr = toArgDateStr(new Date());
  const yestStr  = toArgDateStr(new Date(Date.now() - 864e5));
  if (dStr === todayStr) return "Hoy";
  if (dStr === yestStr)  return "Ayer";
  return d.toLocaleDateString("es-AR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function greetingByHour(): string {
  const h = Number(new Date().toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }));
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

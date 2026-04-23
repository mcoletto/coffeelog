import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import type { DatePrecision } from "@prisma/client";

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
    const d = typeof loggedAt === "string" ? parseISO(loggedAt) : loggedAt;
    if (isToday(d)) return `Hoy, ${format(d, "HH:mm")}`;
    if (isYesterday(d)) return `Ayer, ${format(d, "HH:mm")}`;
    return format(d, "d MMM, HH:mm", { locale: es });
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
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

export function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

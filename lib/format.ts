import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date: Date) {
  return format(date, "d MMM yyyy", { locale: fr });
}

export function formatDateTime(date: Date) {
  return format(date, "d MMM yyyy 'à' HH:mm", { locale: fr });
}

export function timeAgo(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean)
    .length;
  return Math.max(1, Math.round(words / 200));
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

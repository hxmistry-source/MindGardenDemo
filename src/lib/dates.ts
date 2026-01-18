type DateParts = {
  year: number;
  month: number;
  day: number;
};

function getZonedDateParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "1970");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "01");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "01");
  return { year, month, day };
}

export function getZonedDateKey(date: Date, timeZone: string) {
  const { year, month, day } = getZonedDateParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getZonedDayDiff(from: Date, to: Date, timeZone: string) {
  const fromParts = getZonedDateParts(from, timeZone);
  const toParts = getZonedDateParts(to, timeZone);
  const fromUtc = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day);
  const toUtc = Date.UTC(toParts.year, toParts.month - 1, toParts.day);
  return Math.floor((toUtc - fromUtc) / 86400000);
}

export function getTodayRange(timeZone: string) {
  const now = new Date();
  const { year, month, day } = getZonedDateParts(now, timeZone);
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return { start, end };
}

export function formatZonedDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone }).format(date);
}

export function formatZonedDateKey(dateKey: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return dateKey;
  }
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return formatZonedDate(date, timeZone);
}

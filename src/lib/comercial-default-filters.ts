const PERU_TIMEZONE = "America/Lima";

const SHORT_MONTH_NAMES: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function getDatePartsInPeru() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: PERU_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return { year, month, day };
}

function getIsoWeekFromDateParts(year: string, month: string, day: string) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const dayOfWeek = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return String(week);
}

export function getDefaultCommercialFilters() {
  const { year, month, day } = getDatePartsInPeru();
  const week = getIsoWeekFromDateParts(year, month, day);
  const date = `${year}${month}${day}`;

  return {
    year,
    month,
    monthLabel: SHORT_MONTH_NAMES[month] ?? month,
    week,
    weekLabel: `S${week}`,
    date,
    dateLabel: `${day}/${month}/${year}`,
  };
}

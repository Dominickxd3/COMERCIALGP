export type CommercialFilterState = {
  year: string;
  period: string;
  origin: string;
  versionCut: string;
};

export type EvolucionMensual = {
  periodo: string;
  mes: string;
  venta: number;
  kilos: number;
  precioPromedio: number;
  unidades: number;
};

export type FamilyParticipationItem = {
  familia: string;
  venta: number;
  kilos: number;
  participacion: number;
  color: string;
};

export type TopFamilyItem = {
  familia: string;
  venta: number;
  kilos: number;
  participacion: number;
};

export type TopSubfamilyItem = {
  subfamilia: string;
  familia: string;
  venta: number;
  kilos: number;
  participacion: number;
};

export const commercialFilterOptions = {
  years: ["2026"],
  periods: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
  origins: ["Todos", "Lima Norte", "Lima Sur", "Provincia"],
  versionCuts: ["Corte 2026-03-31", "Corte 2026-02-29", "Corte 2026-01-31"],
} as const;

const monthlyDataSource: EvolucionMensual[] = [
  { periodo: "202601", mes: "Enero", venta: 2_100_000, kilos: 250_000, precioPromedio: 8.4, unidades: 18_000 },
  { periodo: "202602", mes: "Febrero", venta: 2_550_000, kilos: 280_000, precioPromedio: 9.1, unidades: 21_000 },
  { periodo: "202603", mes: "Marzo", venta: 3_330_000, kilos: 312_000, precioPromedio: 10.67, unidades: 26_000 },
  { periodo: "202604", mes: "Abril", venta: 3_760_000, kilos: 398_000, precioPromedio: 9.45, unidades: 29_500 },
  { periodo: "202605", mes: "Mayo", venta: 4_280_000, kilos: 425_000, precioPromedio: 10.07, unidades: 32_000 },
];

const familyDataSource: FamilyParticipationItem[] = [
  { familia: "Pollo", venta: 3_400_000, kilos: 390_000, participacion: 42.6, color: "#1D4ED8" },
  { familia: "Cerdo", venta: 2_100_000, kilos: 230_000, participacion: 26.3, color: "#4F7DF3" },
  { familia: "Pavo", venta: 1_450_000, kilos: 150_000, participacion: 18.2, color: "#8FB2FF" },
  { familia: "Embutidos", venta: 1_030_000, kilos: 72_000, participacion: 12.9, color: "#D6E4FF" },
];

const topFamilyDataSource: TopFamilyItem[] = [
  { familia: "Pollo", venta: 3_400_000, kilos: 390_000, participacion: 42.6 },
  { familia: "Cerdo", venta: 2_100_000, kilos: 230_000, participacion: 26.3 },
  { familia: "Pavo", venta: 1_450_000, kilos: 150_000, participacion: 18.2 },
  { familia: "Embutidos", venta: 1_030_000, kilos: 72_000, participacion: 12.9 },
  { familia: "Congelados", venta: 820_000, kilos: 61_000, participacion: 10.3 },
];

const topSubfamilyDataSource: TopSubfamilyItem[] = [
  { subfamilia: "Pechuga", familia: "Pollo", venta: 1_580_000, kilos: 122_000, participacion: 19.8 },
  { subfamilia: "Chuleta", familia: "Cerdo", venta: 1_120_000, kilos: 96_000, participacion: 14.0 },
  { subfamilia: "Muslo", familia: "Pollo", venta: 990_000, kilos: 108_000, participacion: 12.4 },
  { subfamilia: "Pavo entero", familia: "Pavo", venta: 860_000, kilos: 76_000, participacion: 10.8 },
  { subfamilia: "Jamonada", familia: "Embutidos", venta: 740_000, kilos: 42_000, participacion: 9.3 },
];

export function formatCurrencyCompact(value: number) {
  if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `S/ ${(value / 1_000).toFixed(0)}K`;
  return `S/ ${value.toFixed(0)}`;
}

export function formatKilosCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M kg`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K kg`;
  return `${value.toFixed(0)} kg`;
}

export function formatNumberCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

export function formatUnitsCompact(value: number) {
  return formatNumberCompact(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatPriceKg(value: number) {
  return `S/ ${value.toFixed(2)} / kg`;
}

export function getCommercialDashboardData(filters: CommercialFilterState) {
  const periods: readonly string[] = commercialFilterOptions.periods;
  const monthIndex = periods.indexOf(filters.period);
  const boundedIndex = monthIndex >= 0 ? monthIndex : 2;
  const monthlyData = monthlyDataSource.slice(0, boundedIndex + 1);
  const currentMonth = monthlyData.at(-1) ?? monthlyDataSource[2];
  const previousMonth = monthlyData.at(-2) ?? monthlyData.at(-1) ?? monthlyDataSource[1];

  const totalSales = monthlyData.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = monthlyData.reduce((sum, item) => sum + item.kilos, 0);
  const totalUnits = monthlyData.reduce((sum, item) => sum + item.unidades, 0);
  const averagePrice = totalSales / totalKilos;

  const salesDelta = previousMonth ? ((currentMonth.venta - previousMonth.venta) / previousMonth.venta) * 100 : 0;
  const kilosDelta = previousMonth ? ((currentMonth.kilos - previousMonth.kilos) / previousMonth.kilos) * 100 : 0;
  const priceDelta = previousMonth ? ((currentMonth.precioPromedio - previousMonth.precioPromedio) / previousMonth.precioPromedio) * 100 : 0;
  const unitsDelta = previousMonth ? ((currentMonth.unidades - previousMonth.unidades) / previousMonth.unidades) * 100 : 0;

  return {
    filters,
    monthlyData,
    executiveSummary: `Al periodo seleccionado, el negocio mantiene una venta acumulada de ${formatCurrencyCompact(totalSales)}, con ${formatKilosCompact(totalKilos)} vendidos y un precio promedio de ${formatPriceKg(averagePrice)}. Las principales familias concentran la mayor participación comercial del periodo.`,
    kpis: [
      { title: "Venta Total", value: formatCurrencyCompact(totalSales), delta: `${salesDelta >= 0 ? "+" : ""}${salesDelta.toFixed(1)}%`, helper: "Vs. periodo anterior" },
      { title: "Kilos Vendidos", value: formatKilosCompact(totalKilos), delta: `${kilosDelta >= 0 ? "+" : ""}${kilosDelta.toFixed(1)}%`, helper: "Volumen acumulado" },
      { title: "Precio Promedio Kg", value: formatPriceKg(averagePrice), delta: `${priceDelta >= 0 ? "+" : ""}${priceDelta.toFixed(1)}%`, helper: "Ticket promedio por kilo" },
      { title: "Unidades Vendidas", value: formatUnitsCompact(totalUnits), delta: `${unitsDelta >= 0 ? "+" : ""}${unitsDelta.toFixed(1)}%`, helper: "Unidades acumuladas" },
    ],
    familyData: familyDataSource,
    topFamilies: topFamilyDataSource,
    topSubfamilies: topSubfamilyDataSource,
  };
}

export type CommercialFilterState = {
  year: string;
  period: string;
  origin: string;
  versionCut: string;
};

export type PeriodOption = {
  value: string;
  label: string;
  month: string;
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

const periodOptions: PeriodOption[] = [
  { value: "202601", label: "202601 - Enero", month: "Enero" },
  { value: "202602", label: "202602 - Febrero", month: "Febrero" },
  { value: "202603", label: "202603 - Marzo", month: "Marzo" },
  { value: "202604", label: "202604 - Abril", month: "Abril" },
  { value: "202605", label: "202605 - Mayo", month: "Mayo" },
  { value: "202606", label: "202606 - Junio", month: "Junio" },
  { value: "202607", label: "202607 - Julio", month: "Julio" },
  { value: "202608", label: "202608 - Agosto", month: "Agosto" },
  { value: "202609", label: "202609 - Septiembre", month: "Septiembre" },
  { value: "202610", label: "202610 - Octubre", month: "Octubre" },
  { value: "202611", label: "202611 - Noviembre", month: "Noviembre" },
  { value: "202612", label: "202612 - Diciembre", month: "Diciembre" },
];

export const commercialFilterOptions = {
  years: ["2026"],
  periods: periodOptions,
  origins: ["Todos", "GP", "TDA"],
  versionCuts: ["Corte 2026-03-31", "Corte 2026-02-29", "Corte 2026-01-31"],
} as const;

const monthlyDataSource: EvolucionMensual[] = [
  { periodo: "202601", mes: "Enero", venta: 2_100_000, kilos: 250_000, precioPromedio: 8.4, unidades: 18_000 },
  { periodo: "202602", mes: "Febrero", venta: 2_550_000, kilos: 280_000, precioPromedio: 9.1, unidades: 21_000 },
  { periodo: "202603", mes: "Marzo", venta: 3_330_000, kilos: 312_000, precioPromedio: 10.67, unidades: 26_000 },
  { periodo: "202604", mes: "Abril", venta: 3_760_000, kilos: 398_000, precioPromedio: 9.45, unidades: 29_500 },
  { periodo: "202605", mes: "Mayo", venta: 4_280_000, kilos: 425_000, precioPromedio: 10.07, unidades: 32_000 },
  { periodo: "202606", mes: "Junio", venta: 4_120_000, kilos: 411_000, precioPromedio: 10.02, unidades: 31_600 },
  { periodo: "202607", mes: "Julio", venta: 4_460_000, kilos: 438_000, precioPromedio: 10.18, unidades: 33_200 },
  { periodo: "202608", mes: "Agosto", venta: 4_710_000, kilos: 456_000, precioPromedio: 10.33, unidades: 34_500 },
  { periodo: "202609", mes: "Septiembre", venta: 4_530_000, kilos: 449_000, precioPromedio: 10.09, unidades: 33_900 },
  { periodo: "202610", mes: "Octubre", venta: 4_860_000, kilos: 471_000, precioPromedio: 10.32, unidades: 35_100 },
  { periodo: "202611", mes: "Noviembre", venta: 5_020_000, kilos: 484_000, precioPromedio: 10.37, unidades: 35_900 },
  { periodo: "202612", mes: "Diciembre", venta: 5_480_000, kilos: 512_000, precioPromedio: 10.7, unidades: 37_400 },
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

export function getPeriodLabel(periodValue: string) {
  return commercialFilterOptions.periods.find((period) => period.value === periodValue)?.label ?? periodValue;
}

export function getPeriodMonth(periodValue: string) {
  return commercialFilterOptions.periods.find((period) => period.value === periodValue)?.month ?? periodValue;
}

export function getCommercialDashboardData(filters: CommercialFilterState) {
  const monthIndex = monthlyDataSource.findIndex((item) => item.periodo === filters.period);
  const boundedIndex = monthIndex >= 0 ? monthIndex : 2;
  const monthlyData = monthlyDataSource.slice(0, boundedIndex + 1);
  const currentMonth = monthlyData.at(-1) ?? monthlyDataSource[2];
  const previousMonth = monthlyData.at(-2) ?? monthlyData.at(-1) ?? monthlyDataSource[1];

  const totalSales = monthlyData.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = monthlyData.reduce((sum, item) => sum + item.kilos, 0);
  const totalUnits = monthlyData.reduce((sum, item) => sum + item.unidades, 0);
  const averagePrice = totalSales / totalKilos;
  const activeFamilies = topFamilyDataSource.length;
  const activeProducts = 222;

  const salesDelta = previousMonth ? ((currentMonth.venta - previousMonth.venta) / previousMonth.venta) * 100 : 0;
  const kilosDelta = previousMonth ? ((currentMonth.kilos - previousMonth.kilos) / previousMonth.kilos) * 100 : 0;

  return {
    filters,
    monthlyData,
    executiveSummary: `Al periodo seleccionado, el negocio mantiene una venta acumulada de ${formatCurrencyCompact(totalSales)}, con ${formatKilosCompact(totalKilos)} vendidos y un precio promedio de ${formatPriceKg(averagePrice)}. Las principales familias concentran la mayor participación comercial del periodo.`,
    kpis: [
      {
        title: "Venta Total",
        value: formatCurrencyCompact(totalSales),
        delta: `${salesDelta >= 0 ? "+" : ""}${salesDelta.toFixed(1)}%`,
        helper: "Venta acumulada del periodo",
      },
      {
        title: "Kilos Vendidos",
        value: formatKilosCompact(totalKilos),
        delta: `${kilosDelta >= 0 ? "+" : ""}${kilosDelta.toFixed(1)}%`,
        helper: "Volumen comercial acumulado",
      },
      {
        title: "Familias Activas",
        value: formatUnitsCompact(activeFamilies),
        delta: "+0.0%",
        helper: "Familias con venta en el periodo",
      },
      {
        title: "Productos Activos",
        value: formatUnitsCompact(activeProducts),
        delta: "+2.4%",
        helper: "Productos con movimiento comercial",
      },
    ],
    familyData: familyDataSource,
    topFamilies: topFamilyDataSource,
    topSubfamilies: topSubfamilyDataSource,
    meta: {
      totalUnits,
      averagePrice,
    },
  };
}

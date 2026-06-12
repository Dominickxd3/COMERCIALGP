export type PeriodOption = {
  value: string;
  label: string;
  month: string;
};

export type SubfamilyFiltersState = {
  year: string;
  period: string;
  origin: string;
  family: string;
  subfamily: string;
};

export type SubfamilyMetricBase = {
  familia: string;
  subfamilia: string;
  venta: number;
  kilos: number;
  unidades: number;
  productos: number;
  color: string;
};

export type SubfamilyMetricRow = SubfamilyMetricBase & {
  precioPromedio: number;
  participacionVenta: number;
  participacionKilos: number;
};

export type SubfamilyKpi = {
  title: string;
  value: string;
  delta: string;
  helper: string;
};

export const subfamilyFilterOptions = {
  years: ["2026"],
  periods: [
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
  ] as PeriodOption[],
  origins: ["Todos", "GP", "TDA"],
  families: ["Todas", "Pollo", "Cerdo", "Pavo", "Embutidos", "Congelados"],
} as const;

const baseSubfamilyRows: SubfamilyMetricBase[] = [
  { familia: "Pollo", subfamilia: "Pechuga", venta: 1_580_000, kilos: 122_000, unidades: 9_500, productos: 42, color: "#1D4ED8" },
  { familia: "Pollo", subfamilia: "Muslo", venta: 990_000, kilos: 108_000, unidades: 8_100, productos: 31, color: "#3B82F6" },
  { familia: "Pollo", subfamilia: "Pierna", venta: 860_000, kilos: 97_000, unidades: 7_200, productos: 26, color: "#60A5FA" },
  { familia: "Cerdo", subfamilia: "Chuleta", venta: 1_120_000, kilos: 96_000, unidades: 7_200, productos: 29, color: "#4F7DF3" },
  { familia: "Cerdo", subfamilia: "Costilla", venta: 760_000, kilos: 64_000, unidades: 5_500, productos: 18, color: "#6D93F5" },
  { familia: "Pavo", subfamilia: "Pavo entero", venta: 860_000, kilos: 76_000, unidades: 6_200, productos: 14, color: "#8FB2FF" },
  { familia: "Pavo", subfamilia: "Pechuga de pavo", venta: 420_000, kilos: 38_000, unidades: 2_900, productos: 10, color: "#AAC3FF" },
  { familia: "Embutidos", subfamilia: "Jamonada", venta: 740_000, kilos: 42_000, unidades: 5_400, productos: 21, color: "#BFD1FF" },
  { familia: "Embutidos", subfamilia: "Hot dog", venta: 290_000, kilos: 18_000, unidades: 1_900, productos: 12, color: "#CFDCFF" },
  { familia: "Congelados", subfamilia: "Mixtos", venta: 480_000, kilos: 36_000, unidades: 3_200, productos: 11, color: "#D7E3FF" },
  { familia: "Congelados", subfamilia: "Empanizados", venta: 340_000, kilos: 25_000, unidades: 2_100, productos: 8, color: "#E6EEFF" },
];

function formatCompact(value: number, prefix = "") {
  if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${prefix}${Math.round(value / 1_000)}K`;
  return `${prefix}${value.toFixed(0)}`;
}

export function formatCurrencyCompact(value: number) {
  return formatCompact(value, "S/ ");
}

export function formatKilosCompact(value: number) {
  return `${formatCompact(value)} kg`;
}

export function formatUnitsCompact(value: number) {
  return formatCompact(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatPriceKg(value: number) {
  return `S/ ${value.toFixed(2)} / kg`;
}

function getMonthIndex(period: string) {
  return Math.max(0, subfamilyFilterOptions.periods.findIndex((option) => option.value === period));
}

function getPeriodFactor(period: string) {
  return 0.84 + getMonthIndex(period) * 0.0275;
}

function getOriginFactor(origin: string) {
  if (origin === "GP") return 0.68;
  if (origin === "TDA") return 0.32;
  return 1;
}

export function getSubfamilyOptions(selectedFamily: string) {
  const values = baseSubfamilyRows
    .filter((row) => selectedFamily === "Todas" || row.familia === selectedFamily)
    .map((row) => row.subfamilia);

  return ["Todas", ...Array.from(new Set(values))];
}

function buildRows(filters: SubfamilyFiltersState) {
  const periodFactor = getPeriodFactor(filters.period);
  const originFactor = getOriginFactor(filters.origin);

  const scaled = baseSubfamilyRows.map((item) => {
    const venta = Math.round(item.venta * periodFactor * originFactor);
    const kilos = Math.round(item.kilos * periodFactor * originFactor);
    const unidades = Math.round(item.unidades * periodFactor * originFactor);

    return {
      ...item,
      venta,
      kilos,
      unidades,
      precioPromedio: venta / Math.max(kilos, 1),
      participacionVenta: 0,
      participacionKilos: 0,
    };
  });

  const familyFiltered =
    filters.family === "Todas" ? scaled : scaled.filter((item) => item.familia === filters.family);

  const subfamilyFiltered =
    filters.subfamily === "Todas"
      ? familyFiltered
      : familyFiltered.filter((item) => item.subfamilia === filters.subfamily);

  const totalVenta = subfamilyFiltered.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = subfamilyFiltered.reduce((sum, item) => sum + item.kilos, 0);

  return subfamilyFiltered
    .map((item) => ({
      ...item,
      participacionVenta: totalVenta ? (item.venta / totalVenta) * 100 : 0,
      participacionKilos: totalKilos ? (item.kilos / totalKilos) * 100 : 0,
    }))
    .sort((a, b) => b.venta - a.venta);
}

function buildKpis(rows: SubfamilyMetricRow[]): SubfamilyKpi[] {
  const totalVenta = rows.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = rows.reduce((sum, item) => sum + item.kilos, 0);
  const averagePrice = totalVenta / Math.max(totalKilos, 1);
  const activeSubfamilies = new Set(rows.map((item) => item.subfamilia)).size;
  const activeProducts = rows.reduce((sum, item) => sum + item.productos, 0);

  return [
    { title: "Venta Total", value: formatCurrencyCompact(totalVenta), delta: "+4.0%", helper: "Venta acumulada del filtro actual" },
    { title: "Kilos Vendidos", value: formatKilosCompact(totalKilos), delta: "+3.2%", helper: "Volumen por subfamilia" },
    { title: "Precio Promedio Kg", value: formatPriceKg(averagePrice), delta: "+1.3%", helper: "Relación venta sobre kilos" },
    { title: "Subfamilias Activas", value: formatUnitsCompact(activeSubfamilies), delta: "+0.0%", helper: "Subfamilias con venta en el periodo" },
    { title: "Productos Activos", value: formatUnitsCompact(activeProducts), delta: "+2.4%", helper: "Productos con movimiento comercial" },
  ];
}

export function getSubfamilyAnalyticsData(filters: SubfamilyFiltersState) {
  const rows = buildRows(filters);

  return {
    rows,
    ranking: rows,
    participation: rows,
    kpis: buildKpis(rows),
  };
}

export type PeriodOption = {
  value: string;
  label: string;
  month: string;
};

export type ProductFiltersState = {
  year: string;
  period: string;
  origin: string;
  family: string;
  subfamily: string;
  product: string;
  search: string;
};

export type ProductMetricBase = {
  origen: string;
  familia: string;
  subfamilia: string;
  producto: string;
  productoMarca: string;
  venta: number;
  kilos: number;
  unidades: number;
};

export type ProductMetricRow = ProductMetricBase & {
  precioPromedio: number;
  participacionVenta: number;
  participacionKilos: number;
};

export type ProductKpi = {
  title: string;
  value: string;
  delta: string;
  helper: string;
};

export const productFilterOptions = {
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

const baseProductRows: ProductMetricBase[] = [
  { origen: "GP", familia: "Pollo", subfamilia: "Pechuga", producto: "Pechuga fresca", productoMarca: "Del Campo", venta: 820_000, kilos: 62_000, unidades: 4_800 },
  { origen: "TDA", familia: "Pollo", subfamilia: "Pechuga", producto: "Pechuga premium", productoMarca: "Avinka", venta: 760_000, kilos: 60_000, unidades: 4_700 },
  { origen: "GP", familia: "Pollo", subfamilia: "Muslo", producto: "Muslo nacional", productoMarca: "Del Campo", venta: 540_000, kilos: 58_000, unidades: 4_100 },
  { origen: "TDA", familia: "Pollo", subfamilia: "Pierna", producto: "Pierna seleccionada", productoMarca: "Norky", venta: 480_000, kilos: 53_000, unidades: 3_600 },
  { origen: "GP", familia: "Cerdo", subfamilia: "Chuleta", producto: "Chuleta premium", productoMarca: "Otto Kunz", venta: 690_000, kilos: 56_000, unidades: 3_900 },
  { origen: "TDA", familia: "Cerdo", subfamilia: "Costilla", producto: "Costilla especial", productoMarca: "Braedt", venta: 430_000, kilos: 36_000, unidades: 2_500 },
  { origen: "GP", familia: "Pavo", subfamilia: "Pavo entero", producto: "Pavo entero congelado", productoMarca: "San Fernando", venta: 520_000, kilos: 45_000, unidades: 3_100 },
  { origen: "TDA", familia: "Pavo", subfamilia: "Pechuga de pavo", producto: "Filete de pavo", productoMarca: "San Fernando", venta: 340_000, kilos: 31_000, unidades: 2_200 },
  { origen: "GP", familia: "Embutidos", subfamilia: "Jamonada", producto: "Jamonada familiar", productoMarca: "Braedt", venta: 470_000, kilos: 25_000, unidades: 3_200 },
  { origen: "TDA", familia: "Embutidos", subfamilia: "Hot dog", producto: "Hot dog parrillero", productoMarca: "Otto Kunz", venta: 260_000, kilos: 16_000, unidades: 1_900 },
  { origen: "GP", familia: "Congelados", subfamilia: "Mixtos", producto: "Mixto apanado", productoMarca: "Delisnack", venta: 310_000, kilos: 23_000, unidades: 1_700 },
  { origen: "TDA", familia: "Congelados", subfamilia: "Empanizados", producto: "Nuggets clasicos", productoMarca: "Delisnack", venta: 210_000, kilos: 14_000, unidades: 1_200 },
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
  return Math.max(0, productFilterOptions.periods.findIndex((option) => option.value === period));
}

function getPeriodFactor(period: string) {
  return 0.84 + getMonthIndex(period) * 0.0275;
}

export function getSubfamilyOptions(selectedFamily: string) {
  const values = baseProductRows
    .filter((row) => selectedFamily === "Todas" || row.familia === selectedFamily)
    .map((row) => row.subfamilia);

  return ["Todas", ...Array.from(new Set(values))];
}

export function getProductOptions(selectedFamily: string, selectedSubfamily: string) {
  const values = baseProductRows
    .filter((row) => selectedFamily === "Todas" || row.familia === selectedFamily)
    .filter((row) => selectedSubfamily === "Todas" || row.subfamilia === selectedSubfamily)
    .map((row) => row.producto);

  return ["Todos", ...Array.from(new Set(values))];
}

function buildRows(filters: ProductFiltersState) {
  const periodFactor = getPeriodFactor(filters.period);

  const scaled = baseProductRows.map((item) => {
    const venta = Math.round(item.venta * periodFactor);
    const kilos = Math.round(item.kilos * periodFactor);
    const unidades = Math.round(item.unidades * periodFactor);

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

  const filtered = scaled
    .filter((item) => filters.origin === "Todos" || item.origen === filters.origin)
    .filter((item) => filters.family === "Todas" || item.familia === filters.family)
    .filter((item) => filters.subfamily === "Todas" || item.subfamilia === filters.subfamily)
    .filter((item) => filters.product === "Todos" || item.producto === filters.product)
    .filter((item) => {
      const search = filters.search.trim().toLowerCase();
      if (!search) return true;
      return (
        item.producto.toLowerCase().includes(search) ||
        item.productoMarca.toLowerCase().includes(search)
      );
    });

  const totalVenta = filtered.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = filtered.reduce((sum, item) => sum + item.kilos, 0);

  return filtered
    .map((item) => ({
      ...item,
      participacionVenta: totalVenta ? (item.venta / totalVenta) * 100 : 0,
      participacionKilos: totalKilos ? (item.kilos / totalKilos) * 100 : 0,
    }))
    .sort((a, b) => b.venta - a.venta);
}

function buildKpis(rows: ProductMetricRow[]): ProductKpi[] {
  const totalVenta = rows.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = rows.reduce((sum, item) => sum + item.kilos, 0);
  const averagePrice = totalVenta / Math.max(totalKilos, 1);
  const activeProducts = new Set(rows.map((item) => item.producto)).size;

  return [
    { title: "Venta Total", value: formatCurrencyCompact(totalVenta), delta: "+4.3%", helper: "Venta acumulada del filtro actual" },
    { title: "Kilos Vendidos", value: formatKilosCompact(totalKilos), delta: "+3.5%", helper: "Volumen comercial por producto" },
    { title: "Precio Promedio Kg", value: formatPriceKg(averagePrice), delta: "+1.2%", helper: "Relación venta sobre kilos" },
    { title: "Productos Activos", value: formatUnitsCompact(activeProducts), delta: "+0.0%", helper: "Productos con venta en el periodo" },
  ];
}

export function getProductAnalyticsData(filters: ProductFiltersState) {
  const rows = buildRows(filters);

  return {
    rows,
    salesRanking: [...rows].sort((a, b) => b.venta - a.venta).slice(0, 8),
    kilosRanking: [...rows].sort((a, b) => b.kilos - a.kilos).slice(0, 8),
    kpis: buildKpis(rows),
  };
}

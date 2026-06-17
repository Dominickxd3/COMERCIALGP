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
    kpis: buildKpis(rows),
  };
}

/* ═══════════════════════════════════════════
   Drilldown data for selected subfamily
   ═══════════════════════════════════════════ */

export type SubfamilyOriginBreakdown = {
  origen: string;
  venta: number;
  kilos: number;
  participacion: number;
};

export type SubfamilyTopProduct = {
  productoMarca: string;
  venta: number;
  kilos: number;
};

export type SubfamilyFamilyBreakdown = {
  familia: string;
  venta: number;
  kilos: number;
  participacion: number;
};

export type SubfamilyDrilldownData = {
  summary: {
    subfamilia: string;
    familia: string;
    venta: number;
    kilos: number;
    precioPromedio: number;
    participacionVenta: number;
  };
  families: SubfamilyFamilyBreakdown[];
  origins: SubfamilyOriginBreakdown[];
  topProducts: SubfamilyTopProduct[];
};

export function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return numerator / denominator;
}

export function calculateAveragePricePerKg(venta: number, kilos: number) {
  return safeDivide(venta, kilos);
}

/* ── Mock product catalog per subfamily ── */

const baseProductsBySubfamily: Record<string, Array<{ productoMarca: string; ventaBase: number; kilosBase: number }>> = {
  Pechuga: [
    { productoMarca: "Pechuga Entera [San Fernando]", ventaBase: 420_000, kilosBase: 32_000 },
    { productoMarca: "Pechuga Deshuesada [San Fernando]", ventaBase: 380_000, kilosBase: 28_000 },
    { productoMarca: "Pechuga Fileteada [Redondos]", ventaBase: 310_000, kilosBase: 24_000 },
    { productoMarca: "Pechuga Aplanada [San Fernando]", ventaBase: 260_000, kilosBase: 22_000 },
    { productoMarca: "Pechuga Trozada [Redondos]", ventaBase: 210_000, kilosBase: 16_000 },
  ],
  Muslo: [
    { productoMarca: "Muslo de Pollo [San Fernando]", ventaBase: 320_000, kilosBase: 38_000 },
    { productoMarca: "Muslo Deshuesado [Redondos]", ventaBase: 260_000, kilosBase: 30_000 },
    { productoMarca: "Muslo Marinado [San Fernando]", ventaBase: 220_000, kilosBase: 22_000 },
    { productoMarca: "Muslo Especial [Redondos]", ventaBase: 190_000, kilosBase: 18_000 },
  ],
  Pierna: [
    { productoMarca: "Pierna de Pollo [San Fernando]", ventaBase: 290_000, kilosBase: 34_000 },
    { productoMarca: "Pierna Deshuesada [Redondos]", ventaBase: 240_000, kilosBase: 28_000 },
    { productoMarca: "Pierna Especial [San Fernando]", ventaBase: 180_000, kilosBase: 20_000 },
    { productoMarca: "Pierna Marinada [Redondos]", ventaBase: 150_000, kilosBase: 15_000 },
  ],
  Chuleta: [
    { productoMarca: "Chuleta de Cerdo [San Fernando]", ventaBase: 360_000, kilosBase: 30_000 },
    { productoMarca: "Chuleta Ahumada [La Preferida]", ventaBase: 310_000, kilosBase: 26_000 },
    { productoMarca: "Chuleta Premium [San Fernando]", ventaBase: 250_000, kilosBase: 22_000 },
    { productoMarca: "Chuleta Marinada [La Preferida]", ventaBase: 200_000, kilosBase: 18_000 },
  ],
  Costilla: [
    { productoMarca: "Costilla de Cerdo [San Fernando]", ventaBase: 280_000, kilosBase: 24_000 },
    { productoMarca: "Costilla BBQ [La Preferida]", ventaBase: 240_000, kilosBase: 20_000 },
    { productoMarca: "Costilla Ahumada [San Fernando]", ventaBase: 240_000, kilosBase: 20_000 },
  ],
  "Pavo entero": [
    { productoMarca: "Pavo Entero Navideño [San Fernando]", ventaBase: 380_000, kilosBase: 34_000 },
    { productoMarca: "Pavo Entero Premium [Redondos]", ventaBase: 280_000, kilosBase: 24_000 },
    { productoMarca: "Pavo Entero Económico [San Fernando]", ventaBase: 200_000, kilosBase: 18_000 },
  ],
  "Pechuga de pavo": [
    { productoMarca: "Pechuga de Pavo [San Fernando]", ventaBase: 220_000, kilosBase: 20_000 },
    { productoMarca: "Pechuga de Pavo Light [Redondos]", ventaBase: 200_000, kilosBase: 18_000 },
  ],
  Jamonada: [
    { productoMarca: "Jamonada Clásica [San Fernando]", ventaBase: 280_000, kilosBase: 16_000 },
    { productoMarca: "Jamonada Premium [La Preferida]", ventaBase: 220_000, kilosBase: 12_000 },
    { productoMarca: "Jamonada Light [San Fernando]", ventaBase: 150_000, kilosBase: 8_000 },
    { productoMarca: "Jamonada Económica [Redondos]", ventaBase: 90_000, kilosBase: 6_000 },
  ],
  "Hot dog": [
    { productoMarca: "Hot Dog Clásico [San Fernando]", ventaBase: 140_000, kilosBase: 9_000 },
    { productoMarca: "Hot Dog Premium [La Preferida]", ventaBase: 90_000, kilosBase: 5_500 },
    { productoMarca: "Hot Dog Jumbo [Redondos]", ventaBase: 60_000, kilosBase: 3_500 },
  ],
  Mixtos: [
    { productoMarca: "Mix Congelado Familiar [San Fernando]", ventaBase: 210_000, kilosBase: 16_000 },
    { productoMarca: "Mix Congelado Premium [Redondos]", ventaBase: 160_000, kilosBase: 12_000 },
    { productoMarca: "Mix Parrillero [San Fernando]", ventaBase: 110_000, kilosBase: 8_000 },
  ],
  Empanizados: [
    { productoMarca: "Nuggets de Pollo [San Fernando]", ventaBase: 150_000, kilosBase: 11_000 },
    { productoMarca: "Milanesa Empanizada [Redondos]", ventaBase: 110_000, kilosBase: 8_000 },
    { productoMarca: "Deditos de Pollo [San Fernando]", ventaBase: 80_000, kilosBase: 6_000 },
  ],
};

/* GP/TDA split ratios per subfamily */
const originSplit: Record<string, number> = {
  Pechuga: 0.72,
  Muslo: 0.65,
  Pierna: 0.60,
  Chuleta: 0.58,
  Costilla: 0.55,
  "Pavo entero": 0.70,
  "Pechuga de pavo": 0.62,
  Jamonada: 0.50,
  "Hot dog": 0.45,
  Mixtos: 0.52,
  Empanizados: 0.48,
};

export function getSubfamilyDrilldownData(
  filters: SubfamilyFiltersState,
  selectedSubfamily: string,
): SubfamilyDrilldownData {
  const allRows = buildRows(filters);
  const totalVentaAll = allRows.reduce((s, r) => s + r.venta, 0);
  const row = allRows.find((r) => r.subfamilia === selectedSubfamily) ?? allRows[0];

  if (!row) {
    return {
      summary: { subfamilia: selectedSubfamily, familia: "—", venta: 0, kilos: 0, precioPromedio: 0, participacionVenta: 0 },
      families: [],
      origins: [],
      topProducts: [],
    };
  }

  const precioPromedio = safeDivide(row.venta, row.kilos);
  const participacionVenta = safeDivide(row.venta, totalVentaAll) * 100;

  // Family breakdown — each subfamily belongs to exactly one familia in current data
  const families: SubfamilyFamilyBreakdown[] = [
    { familia: row.familia, venta: row.venta, kilos: row.kilos, participacion: 100 },
  ];

  // Origin breakdown — GP / TDA split
  const gpRatio = originSplit[selectedSubfamily] ?? 0.65;
  const tdaRatio = 1 - gpRatio;
  const periodFactor = getPeriodFactor(filters.period);
  const origins: SubfamilyOriginBreakdown[] = filters.origin === "Todos"
    ? [
        {
          origen: "GP",
          venta: Math.round(row.venta * gpRatio),
          kilos: Math.round(row.kilos * gpRatio),
          participacion: gpRatio * 100,
        },
        {
          origen: "TDA",
          venta: Math.round(row.venta * tdaRatio),
          kilos: Math.round(row.kilos * tdaRatio),
          participacion: tdaRatio * 100,
        },
      ]
    : [
        {
          origen: filters.origin,
          venta: row.venta,
          kilos: row.kilos,
          participacion: 100,
        },
      ];

  // Top products — scaled by period/origin factors
  const originFactor = getOriginFactor(filters.origin);
  const rawProducts = baseProductsBySubfamily[selectedSubfamily] ?? [];
  const topProducts: SubfamilyTopProduct[] = rawProducts.map((p) => ({
    productoMarca: p.productoMarca,
    venta: Math.round(p.ventaBase * periodFactor * originFactor),
    kilos: Math.round(p.kilosBase * periodFactor * originFactor),
  }));

  return {
    summary: {
      subfamilia: selectedSubfamily,
      familia: row.familia,
      venta: row.venta,
      kilos: row.kilos,
      precioPromedio,
      participacionVenta,
    },
    families,
    origins,
    topProducts,
  };
}

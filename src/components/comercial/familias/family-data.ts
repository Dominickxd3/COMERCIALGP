export type FamilyFiltersState = {
  year: string;
  period: string;
  origin: string;
  family: string;
};

export type PeriodOption = {
  value: string;
  label: string;
  month: string;
};

export type FamilyMetricBase = {
  familia: string;
  venta: number;
  kilos: number;
  unidades: number;
  subfamilias: number;
  productos: number;
  color: string;
};

export type FamilyMetricRow = FamilyMetricBase & {
  precioPromedio: number;
  participacionVenta: number;
  participacionKilos: number;
};

export type FamilyKpi = {
  title: string;
  value: string;
  delta: string;
  helper: string;
};

export type FamilyMonthlyPoint = {
  periodo: string;
  mes: string;
  venta: number;
  kilos: number;
};

export type FamilySubfamilyLeader = {
  subfamilia: string;
  venta: number;
  kilos: number;
};

export type FamilyTopProduct = {
  productoMarca: string;
  venta: number;
  kilos: number;
};

export type FamilyOriginBreakdown = {
  origen: string;
  venta: number;
  kilos: number;
  participacion: number;
};

export type FamilyDrilldownData = {
  summary: {
    familia: string;
    venta: number;
    kilos: number;
    origenPrincipal: string;
    subfamiliaLider: string;
  };
  monthly: FamilyMonthlyPoint[];
  topSubfamilies: FamilySubfamilyLeader[];
  topProducts: FamilyTopProduct[];
  origins: FamilyOriginBreakdown[];
};

export const familyFilterOptions = {
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

const baseFamilyRows: FamilyMetricBase[] = [
  { familia: "Pollo", venta: 3_400_000, kilos: 390_000, unidades: 28_000, subfamilias: 12, productos: 145, color: "#1D4ED8" },
  { familia: "Cerdo", venta: 2_100_000, kilos: 230_000, unidades: 15_000, subfamilias: 8, productos: 92, color: "#4F7DF3" },
  { familia: "Pavo", venta: 1_450_000, kilos: 150_000, unidades: 11_000, subfamilias: 6, productos: 64, color: "#8FB2FF" },
  { familia: "Embutidos", venta: 1_030_000, kilos: 72_000, unidades: 8_000, subfamilias: 5, productos: 58, color: "#BFD1FF" },
  { familia: "Congelados", venta: 820_000, kilos: 61_000, unidades: 6_400, subfamilias: 4, productos: 36, color: "#D7E3FF" },
];

const familyMonthlySource: Record<string, FamilyMonthlyPoint[]> = {
  Pollo: [
    { periodo: "202601", mes: "Enero", venta: 760_000, kilos: 88_000 },
    { periodo: "202602", mes: "Febrero", venta: 910_000, kilos: 103_000 },
    { periodo: "202603", mes: "Marzo", venta: 1_040_000, kilos: 118_000 },
    { periodo: "202604", mes: "Abril", venta: 1_180_000, kilos: 132_000 },
    { periodo: "202605", mes: "Mayo", venta: 1_260_000, kilos: 145_000 },
  ],
  Cerdo: [
    { periodo: "202601", mes: "Enero", venta: 430_000, kilos: 46_000 },
    { periodo: "202602", mes: "Febrero", venta: 520_000, kilos: 55_000 },
    { periodo: "202603", mes: "Marzo", venta: 610_000, kilos: 66_000 },
    { periodo: "202604", mes: "Abril", venta: 720_000, kilos: 78_000 },
    { periodo: "202605", mes: "Mayo", venta: 780_000, kilos: 84_000 },
  ],
  Pavo: [
    { periodo: "202601", mes: "Enero", venta: 310_000, kilos: 31_000 },
    { periodo: "202602", mes: "Febrero", venta: 360_000, kilos: 37_000 },
    { periodo: "202603", mes: "Marzo", venta: 420_000, kilos: 43_000 },
    { periodo: "202604", mes: "Abril", venta: 500_000, kilos: 52_000 },
    { periodo: "202605", mes: "Mayo", venta: 560_000, kilos: 58_000 },
  ],
  Embutidos: [
    { periodo: "202601", mes: "Enero", venta: 210_000, kilos: 14_000 },
    { periodo: "202602", mes: "Febrero", venta: 240_000, kilos: 16_000 },
    { periodo: "202603", mes: "Marzo", venta: 290_000, kilos: 19_000 },
    { periodo: "202604", mes: "Abril", venta: 330_000, kilos: 23_000 },
    { periodo: "202605", mes: "Mayo", venta: 360_000, kilos: 25_000 },
  ],
  Congelados: [
    { periodo: "202601", mes: "Enero", venta: 150_000, kilos: 11_000 },
    { periodo: "202602", mes: "Febrero", venta: 180_000, kilos: 13_000 },
    { periodo: "202603", mes: "Marzo", venta: 210_000, kilos: 16_000 },
    { periodo: "202604", mes: "Abril", venta: 240_000, kilos: 18_000 },
    { periodo: "202605", mes: "Mayo", venta: 280_000, kilos: 21_000 },
  ],
};

const familySubfamiliesSource: Record<string, FamilySubfamilyLeader[]> = {
  Pollo: [
    { subfamilia: "Pechuga", venta: 1_410_000, kilos: 122_000 },
    { subfamilia: "Muslo", venta: 886_000, kilos: 108_000 },
    { subfamilia: "Pierna", venta: 770_000, kilos: 95_000 },
  ],
  Cerdo: [
    { subfamilia: "Chuleta", venta: 1_120_000, kilos: 96_000 },
    { subfamilia: "Costilla", venta: 760_000, kilos: 64_000 },
    { subfamilia: "Panceta", venta: 520_000, kilos: 46_000 },
  ],
  Pavo: [
    { subfamilia: "Pavo entero", venta: 860_000, kilos: 76_000 },
    { subfamilia: "Pechuga de pavo", venta: 420_000, kilos: 38_000 },
    { subfamilia: "Hamburguesa de pavo", venta: 170_000, kilos: 16_000 },
  ],
  Embutidos: [
    { subfamilia: "Jamonada", venta: 740_000, kilos: 42_000 },
    { subfamilia: "Hot dog", venta: 290_000, kilos: 18_000 },
    { subfamilia: "Mortadela", venta: 180_000, kilos: 12_000 },
  ],
  Congelados: [
    { subfamilia: "Mixtos", venta: 480_000, kilos: 36_000 },
    { subfamilia: "Empanizados", venta: 340_000, kilos: 25_000 },
    { subfamilia: "Nuggets", venta: 150_000, kilos: 11_000 },
  ],
};

const familyTopProductsSource: Record<string, FamilyTopProduct[]> = {
  Pollo: [
    { productoMarca: "Pechuga especial [Del Campo]", venta: 420_000, kilos: 32_000 },
    { productoMarca: "Muslo premium [Del Campo]", venta: 350_000, kilos: 41_000 },
    { productoMarca: "Pierna familiar [Avinka]", venta: 280_000, kilos: 34_000 },
    { productoMarca: "Pechuga filete [Avinka]", venta: 245_000, kilos: 20_000 },
    { productoMarca: "Muslo fresco [Norky]", venta: 180_000, kilos: 23_000 },
  ],
  Cerdo: [
    { productoMarca: "Chuleta premium [Otto Kunz]", venta: 390_000, kilos: 31_000 },
    { productoMarca: "Costilla especial [Braedt]", venta: 280_000, kilos: 24_000 },
    { productoMarca: "Panceta fina [Braedt]", venta: 190_000, kilos: 17_000 },
    { productoMarca: "Chuleta parrillera [Otto Kunz]", venta: 170_000, kilos: 15_000 },
    { productoMarca: "Lomo centro [Braedt]", venta: 120_000, kilos: 10_000 },
  ],
  Pavo: [
    { productoMarca: "Pavo entero congelado [San Fernando]", venta: 300_000, kilos: 26_000 },
    { productoMarca: "Filete de pavo [San Fernando]", venta: 220_000, kilos: 19_000 },
    { productoMarca: "Pechuga de pavo [Del Campo]", venta: 150_000, kilos: 13_000 },
    { productoMarca: "Hamburguesa de pavo [San Fernando]", venta: 95_000, kilos: 9_000 },
    { productoMarca: "Pavo ahumado [Del Campo]", venta: 70_000, kilos: 6_000 },
  ],
  Embutidos: [
    { productoMarca: "Jamonada familiar [Braedt]", venta: 240_000, kilos: 14_000 },
    { productoMarca: "Hot dog parrillero [Otto Kunz]", venta: 150_000, kilos: 9_000 },
    { productoMarca: "Mortadela clásica [Braedt]", venta: 90_000, kilos: 6_000 },
    { productoMarca: "Salchicha cocktail [Otto Kunz]", venta: 70_000, kilos: 4_000 },
    { productoMarca: "Jamonada fina [Braedt]", venta: 55_000, kilos: 3_000 },
  ],
  Congelados: [
    { productoMarca: "Mixto apanado [Delisnack]", venta: 180_000, kilos: 13_000 },
    { productoMarca: "Nuggets clásicos [Delisnack]", venta: 140_000, kilos: 10_000 },
    { productoMarca: "Empanizado mix [Delisnack]", venta: 110_000, kilos: 8_000 },
    { productoMarca: "Alitas spicy [Delisnack]", venta: 70_000, kilos: 5_000 },
    { productoMarca: "Croquetas mixtas [Delisnack]", venta: 45_000, kilos: 3_000 },
  ],
};

const familyOriginsSource: Record<string, Array<{ origen: "GP" | "TDA"; venta: number; kilos: number }>> = {
  Pollo: [
    { origen: "GP", venta: 2_400_000, kilos: 280_000 },
    { origen: "TDA", venta: 640_000, kilos: 69_000 },
  ],
  Cerdo: [
    { origen: "GP", venta: 1_520_000, kilos: 166_000 },
    { origen: "TDA", venta: 360_000, kilos: 39_000 },
  ],
  Pavo: [
    { origen: "GP", venta: 1_020_000, kilos: 106_000 },
    { origen: "TDA", venta: 280_000, kilos: 29_000 },
  ],
  Embutidos: [
    { origen: "GP", venta: 720_000, kilos: 50_000 },
    { origen: "TDA", venta: 180_000, kilos: 13_000 },
  ],
  Congelados: [
    { origen: "GP", venta: 560_000, kilos: 41_000 },
    { origen: "TDA", venta: 160_000, kilos: 12_000 },
  ],
};

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
  return Math.max(0, familyFilterOptions.periods.findIndex((option) => option.value === period));
}

function getPeriodFactor(period: string) {
  return 0.84 + getMonthIndex(period) * 0.0275;
}

function getOriginFactor(origin: string) {
  if (origin === "GP") return 0.68;
  if (origin === "TDA") return 0.32;
  return 1;
}

function scaleValue(value: number, periodFactor: number, originFactor: number) {
  return Math.round(value * periodFactor * originFactor);
}

function buildRows(filters: FamilyFiltersState) {
  const periodFactor = getPeriodFactor(filters.period);
  const originFactor = getOriginFactor(filters.origin);

  const scaled = baseFamilyRows.map((item) => {
    const venta = scaleValue(item.venta, periodFactor, originFactor);
    const kilos = scaleValue(item.kilos, periodFactor, originFactor);
    const unidades = scaleValue(item.unidades, periodFactor, originFactor);

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

  const filtered = filters.family === "Todas" ? scaled : scaled.filter((item) => item.familia === filters.family);
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

function buildKpis(rows: FamilyMetricRow[]): FamilyKpi[] {
  const totalVenta = rows.reduce((sum, item) => sum + item.venta, 0);
  const totalKilos = rows.reduce((sum, item) => sum + item.kilos, 0);
  const totalUnits = rows.reduce((sum, item) => sum + item.unidades, 0);
  const averagePrice = totalVenta / Math.max(totalKilos, 1);
  const activeFamilies = rows.length;

  return [
    { title: "Venta Total", value: formatCurrencyCompact(totalVenta), delta: "+4.2%", helper: "Venta acumulada del filtro actual" },
    { title: "Kilos Vendidos", value: formatKilosCompact(totalKilos), delta: "+3.6%", helper: "Volumen comercial por familia" },
    { title: "Precio Promedio Kg", value: formatPriceKg(averagePrice), delta: "+1.1%", helper: "Relación venta sobre kilos" },
    { title: "Familias Activas", value: formatUnitsCompact(activeFamilies), delta: totalUnits > 0 ? "+0.0%" : "0.0%", helper: "Familias con venta en el periodo" },
  ];
}

export function getFamilyAnalyticsData(filters: FamilyFiltersState) {
  const rows = buildRows(filters);

  return {
    rows,
    ranking: rows,
    participation: rows,
    kpis: buildKpis(rows),
  };
}

export function getFamilyDrilldownData(filters: FamilyFiltersState, selectedFamily: string): FamilyDrilldownData {
  const periodFactor = getPeriodFactor(filters.period);
  const originFactor = getOriginFactor(filters.origin);
  const selectedRow = buildRows({ ...filters, family: selectedFamily }).find((row) => row.familia === selectedFamily)
    ?? buildRows({ ...filters, family: "Todas" }).find((row) => row.familia === selectedFamily)
    ?? buildRows({ ...filters, family: "Todas" })[0];

  const monthlySource = familyMonthlySource[selectedFamily] ?? familyMonthlySource.Pollo;
  const periodIndex = getMonthIndex(filters.period);
  const monthly = monthlySource
    .slice(0, periodIndex + 1)
    .map((item) => ({
      ...item,
      venta: scaleValue(item.venta, 1, originFactor),
      kilos: scaleValue(item.kilos, 1, originFactor),
    }));

  const topSubfamilies = (familySubfamiliesSource[selectedFamily] ?? familySubfamiliesSource.Pollo).map((item) => ({
    ...item,
    venta: scaleValue(item.venta, periodFactor, originFactor),
    kilos: scaleValue(item.kilos, periodFactor, originFactor),
  }));

  const topProducts = (familyTopProductsSource[selectedFamily] ?? familyTopProductsSource.Pollo).map((item) => ({
    ...item,
    venta: scaleValue(item.venta, periodFactor, originFactor),
    kilos: scaleValue(item.kilos, periodFactor, originFactor),
  }));

  const originsRaw = familyOriginsSource[selectedFamily] ?? familyOriginsSource.Pollo;
  const totalOriginVenta = originsRaw.reduce((sum, item) => sum + scaleValue(item.venta, periodFactor, 1), 0);
  const origins = originsRaw.map((item) => {
    const venta = scaleValue(item.venta, periodFactor, 1);
    const kilos = scaleValue(item.kilos, periodFactor, 1);
    return {
      origen: item.origen,
      venta,
      kilos,
      participacion: totalOriginVenta ? (venta / totalOriginVenta) * 100 : 0,
    };
  });

  const origenPrincipal = origins.sort((a, b) => b.venta - a.venta)[0]?.origen ?? "GP";

  return {
    summary: {
      familia: selectedRow.familia,
      venta: selectedRow.venta,
      kilos: selectedRow.kilos,
      origenPrincipal,
      subfamiliaLider: topSubfamilies[0]?.subfamilia ?? "Pechuga",
    },
    monthly,
    topSubfamilies,
    topProducts,
    origins,
  };
}

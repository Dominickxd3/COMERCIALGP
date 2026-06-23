import { getSqlPool, sql } from "@/lib/db";
import { getDefaultCommercialFilters } from "@/lib/comercial-default-filters";

export type DashboardFilters = {
  year?: string | null;
  period?: string | null;
  week?: string | null;
  date?: string | null;
  origin?: string | null;
  family?: string | null;
};

type CommercialRow = {
  Periodo: string;
  Fecha: string;
  EffectiveDate: Date | null;
  SWUltVersion: number | boolean | null;
  SWORIGEN: string;
  Familia: string;
  Producto: string;
  ProductoMarca: string;
  VEN_KGS: number;
  VEN_VAL: number;
};

export type FamilyChartItem = {
  name: string;
  kilos: number;
  toneladas: number;
  percentage: number;
};

export type ProductChartItem = {
  name: string;
  kilos: number;
  toneladas: number;
};

export type TopProductsByFamily = Record<string, ProductChartItem[]>;

export type DashboardDataResult = {
  totalKilos: number;
  totalToneladas: number;
  totalVenta: number;
  familyChartData: FamilyChartItem[];
  productsBySelectedFamily: ProductChartItem[];
  topProductsByFamily: TopProductsByFamily;
  availableYears: string[];
  availablePeriods: string[];
  availableWeeks: string[];
  availableDates: string[];
  availableOrigins: string[];
  resolvedFilters: {
    year: string;
    period: string;
    week: string;
    date: string;
    businessDate: string;
    origin: string;
    family: string;
  };
  debug: {
    periodSql: string;
    fechaSql: string;
    weekApplied: string;
    rowsByPeriod: number;
    rowsByPeriodAndFecha: number;
    rowsAfterAllFilters: number;
    latestFechaForPeriod: string;
    hasSWUltVersion: boolean;
  };
};

const VIEW_NAME = "dbo.vw_WEB_Comercial_VentasNetasUtilidades_Clean";
const REMOTE_VIEW_NAME = "dbo.vw_REMOTO_Comercial_VentasNetasUtilidades";
const REFRESH_SP = "dbo.sp_WEB_Refrescar_VentasNetasUtilidades";
const BASE_TABLE_NAME = "dbo.Tab_WEB_Comercial_VentasNetasUtilidades";
const STATIC_ORIGINS = ["Todos", "GP", "TDA"] as const;

function normalizePeriod(period?: string | null) {
  if (!period || period === "Todos") return "Todos";
  return period.padStart(2, "0");
}

function normalizeWeek(week?: string | null) {
  if (!week || week === "Todas") return "Todas";
  return week;
}

function normalizeDate(date?: string | null) {
  if (!date) return "";
  const digits = date.replace(/\D/g, "");
  return digits.length === 8 ? digits : "";
}

function normalizeOrigin(origin?: string | null) {
  if (!origin) return "GP";
  if (origin === "Todos") return "Todos";
  return origin;
}

function normalizeFamily(family?: string | null) {
  if (!family) return "";
  return family.trim();
}

function getProductDisplayName(row: CommercialRow) {
  const productMarca = row.ProductoMarca?.trim();
  if (productMarca) return productMarca;
  return row.Producto?.trim() ?? "";
}

function parseDateKey(dateKey: string) {
  if (!/^\d{8}$/.test(dateKey)) return null;
  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(4, 6)) - 1;
  const day = Number(dateKey.slice(6, 8));
  const date = new Date(Date.UTC(year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateToKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function getWeekNumber(date: Date) {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return String(week);
}

function getEffectiveWeek(row: CommercialRow) {
  if (row.EffectiveDate) {
    return getWeekNumber(row.EffectiveDate);
  }
  const parsed = parseDateKey(row.Fecha);
  return parsed ? getWeekNumber(parsed) : "";
}

function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toToneladas(kilos: number) {
  return kilos / 1000;
}

function toSqlPeriod(year: string, period: string) {
  if (!year || period === "Todos") return "";
  return `${year}${period}`;
}

function sortDateKeys(values: Iterable<string>) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function isLatestVersionRow(row: CommercialRow) {
  return row.SWUltVersion === true || row.SWUltVersion === 1;
}

function resolveLatestDate(rows: CommercialRow[], requestedDate: string, preferredDate = "") {
  const availableDates = sortDateKeys(rows.map((row: CommercialRow) => row.Fecha));

  if (requestedDate && availableDates.includes(requestedDate)) {
    return {
      availableDates,
      resolvedDate: requestedDate,
    };
  }

  if (preferredDate && availableDates.includes(preferredDate)) {
    return {
      availableDates,
      resolvedDate: preferredDate,
    };
  }

  const latestVersionDates = sortDateKeys(
    rows.filter((row: CommercialRow) => isLatestVersionRow(row)).map((row: CommercialRow) => row.Fecha),
  );

  return {
    availableDates,
    resolvedDate: latestVersionDates.at(-1) ?? availableDates.at(-1) ?? "",
  };
}

function resolveFallbackDate(
  year: string,
  period: string,
  requestedDate: string,
  resolvedDate: string,
) {
  if (requestedDate) return requestedDate;
  if (resolvedDate) return resolvedDate;

  return "";
}

async function getLatestRemoteDate(year: string, period: string, origin: string) {
  const periodSql = toSqlPeriod(year, period);
  if (!periodSql) return "";

  const pool = await getSqlPool();
  const result = await pool.request()
    .input("periodSql", sql.VarChar(6), periodSql)
    .input("origin", sql.VarChar(20), origin === "Todos" ? null : origin)
    .query<{ latestDate: string | null }>(`
      SELECT MAX(RIGHT('00000000' + CAST([Fecha] AS varchar(8)), 8)) AS [latestDate]
      FROM ${REMOTE_VIEW_NAME}
      WHERE CAST([Periodo] AS varchar(6)) = @periodSql
        AND (
          @origin IS NULL
          OR LTRIM(RTRIM(CAST([SWORIGEN] AS varchar(20)))) = @origin
        );
    `);

  return result.recordset[0]?.latestDate?.trim() ?? "";
}

async function getAvailableYears() {
  const pool = await getSqlPool();
  const result = await pool.request().query<{ year: string }>(`
    SELECT DISTINCT LEFT(CAST([Periodo] AS varchar(6)), 4) AS [year]
    FROM ${VIEW_NAME}
    WHERE [Periodo] IS NOT NULL
    ORDER BY [year] DESC;
  `);

  const years = result.recordset
    .map((row: { year: string }) => row.year?.trim())
    .filter((value: string | undefined): value is string => Boolean(value));

  years.push(getDefaultCommercialFilters().year);

  return [...new Set(years)].sort((a, b) => b.localeCompare(a));
}

async function getAvailablePeriods(year: string) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input("year", sql.VarChar(4), year)
    .query<{ period: string }>(`
      SELECT DISTINCT RIGHT(CAST([Periodo] AS varchar(6)), 2) AS [period]
      FROM ${VIEW_NAME}
      WHERE LEFT(CAST([Periodo] AS varchar(6)), 4) = @year
      ORDER BY [period] ASC;
    `);

  const periods = result.recordset
    .map((row: { period: string }) => row.period?.trim())
    .filter((value: string | undefined): value is string => Boolean(value));

  if (periods.length > 0) {
    return periods;
  }

  const currentDefaults = getDefaultCommercialFilters();
  if (year === currentDefaults.year) {
    return Array.from({ length: Number(currentDefaults.month) }, (_, index) =>
      String(index + 1).padStart(2, "0"),
    );
  }

  return [];
}

async function getOptionRows(year: string, period: string, origin: string) {
  const pool = await getSqlPool();
  const periodSql = toSqlPeriod(year, period);
  const request = pool.request()
    .input("year", sql.VarChar(4), year)
    .input("periodSql", sql.VarChar(6), periodSql || null)
    .input("origin", sql.VarChar(20), origin === "Todos" ? null : origin);

  const result = await request.query<CommercialRow>(`
    SELECT DISTINCT
      CAST([Periodo] AS varchar(6)) AS [Periodo],
      RIGHT('00000000' + CAST([Fecha] AS varchar(8)), 8) AS [Fecha],
      COALESCE(
        TRY_CONVERT(date, [DiaDate]),
        TRY_CONVERT(date, [FechaDate]),
        TRY_CONVERT(date, RIGHT('00000000' + CAST([Fecha] AS varchar(8)), 8), 112)
      ) AS [EffectiveDate],
      COALESCE(TRY_CONVERT(int, [SWUltVersion]), 0) AS [SWUltVersion],
      CAST([SWORIGEN] AS varchar(20)) AS [SWORIGEN],
      CAST([Familia] AS nvarchar(255)) AS [Familia],
      CAST([Producto] AS nvarchar(255)) AS [Producto],
      CAST([ProductoMarca] AS nvarchar(255)) AS [ProductoMarca],
      COALESCE(TRY_CONVERT(float, [VEN_KGS]), 0) AS [VEN_KGS],
      COALESCE(TRY_CONVERT(float, [VEN_VAL]), 0) AS [VEN_VAL]
    FROM ${VIEW_NAME}
    WHERE (
        (@periodSql IS NOT NULL AND CAST([Periodo] AS varchar(6)) = @periodSql)
        OR (@periodSql IS NULL AND LEFT(CAST([Periodo] AS varchar(6)), 4) = @year)
      )
      AND (@origin IS NULL OR CAST([SWORIGEN] AS varchar(20)) = @origin);
  `);

  return Array.from(result.recordset);
}

async function getDashboardDebugInfo(
  year: string,
  period: string,
  week: string,
  date: string,
  origin: string,
) {
  const pool = await getSqlPool();
  const periodSql = toSqlPeriod(year, period);
  const request = pool.request()
    .input("year", sql.VarChar(4), year)
    .input("origin", sql.VarChar(20), origin === "Todos" ? null : origin)
    .input("periodSql", sql.VarChar(6), periodSql || null)
    .input("date", sql.VarChar(8), date || null);

  const periodResult = await request.query<{
    rowsByPeriod: number;
    rowsByPeriodAndFecha: number;
    latestFechaForPeriod: string;
  }>(`
    SELECT
      COUNT(*) AS [rowsByPeriod],
      SUM(
        CASE
          WHEN @date IS NOT NULL
           AND RIGHT('00000000' + CAST([Fecha] AS varchar(8)), 8) = @date THEN 1
          ELSE 0
        END
      ) AS [rowsByPeriodAndFecha],
      MAX(RIGHT('00000000' + CAST([Fecha] AS varchar(8)), 8)) AS [latestFechaForPeriod]
    FROM ${VIEW_NAME}
    WHERE (
        (@periodSql IS NOT NULL AND CAST([Periodo] AS varchar(6)) = @periodSql)
        OR (@periodSql IS NULL AND LEFT(CAST([Periodo] AS varchar(6)), 4) = @year)
      )
      AND (@origin IS NULL OR CAST([SWORIGEN] AS varchar(20)) = @origin);
  `);

  const swRequest = pool.request()
    .input("periodSql", sql.VarChar(6), periodSql || null)
    .input("date", sql.VarChar(8), date || null);
  const swResult = await swRequest.query<{ total: number }>(`
    SELECT COUNT(*) AS [total]
    FROM ${BASE_TABLE_NAME}
    WHERE (@periodSql IS NULL OR CAST([Periodo] AS varchar(6)) = @periodSql)
      AND (@date IS NULL OR RIGHT('00000000' + CAST([Fecha] AS varchar(8)), 8) = @date)
      AND COALESCE(TRY_CONVERT(int, [SWUltVersion]), 0) = 1;
  `);

  const periodRow = periodResult.recordset[0];
  return {
    periodSql,
    fechaSql: date,
    weekApplied: week === "Todas" ? "Todas" : `S${week}`,
    rowsByPeriod: Number(periodRow?.rowsByPeriod ?? 0),
    rowsByPeriodAndFecha: Number(periodRow?.rowsByPeriodAndFecha ?? 0),
    latestFechaForPeriod: periodRow?.latestFechaForPeriod ?? "",
    hasSWUltVersion: Number(swResult.recordset[0]?.total ?? 0) > 0,
  };
}

export async function getDashboardData(filters: DashboardFilters): Promise<DashboardDataResult> {
  const shouldComputeDebug = process.env.NODE_ENV !== "production";
  const currentDefaults = getDefaultCommercialFilters();
  const availableYears = await getAvailableYears();
  const requestedYear = filters.year?.trim();
  const resolvedYear =
    requestedYear && /^\d{4}$/.test(requestedYear)
      ? requestedYear
      : availableYears.includes(currentDefaults.year)
        ? currentDefaults.year
        : (availableYears[0] ?? "");

  if (!resolvedYear) {
    return {
      totalKilos: 0,
      totalToneladas: 0,
      totalVenta: 0,
      familyChartData: [],
      productsBySelectedFamily: [],
      topProductsByFamily: {},
      availableYears: [],
      availablePeriods: [],
      availableWeeks: [],
      availableDates: [],
      availableOrigins: [...STATIC_ORIGINS],
      resolvedFilters: {
        year: "",
        period: "Todos",
        week: "Todas",
        date: "",
        businessDate: "",
        origin: normalizeOrigin(filters.origin),
        family: normalizeFamily(filters.family),
      },
      debug: {
        periodSql: "",
        fechaSql: "",
        weekApplied: "Todas",
        rowsByPeriod: 0,
        rowsByPeriodAndFecha: 0,
        rowsAfterAllFilters: 0,
        latestFechaForPeriod: "",
        hasSWUltVersion: false,
      },
    };
  }

  const availablePeriods = await getAvailablePeriods(resolvedYear);
  const requestedPeriod = normalizePeriod(filters.period);
  const resolvedPeriod =
    requestedPeriod !== "Todos" && availablePeriods.includes(requestedPeriod)
      ? requestedPeriod
      : filters.period === "Todos"
        ? "Todos"
        : availablePeriods.includes(currentDefaults.month)
          ? currentDefaults.month
          : resolvedYear === currentDefaults.year
            ? currentDefaults.month
            : (availablePeriods.at(-1) ?? "Todos");

  const requestedOrigin = normalizeOrigin(filters.origin);
  const resolvedOrigin =
    requestedOrigin === "Todos" || STATIC_ORIGINS.includes(requestedOrigin as (typeof STATIC_ORIGINS)[number])
      ? requestedOrigin
      : "GP";
  const optionRows = await getOptionRows(resolvedYear, resolvedPeriod, resolvedOrigin);
  const weekSet = new Set<string>();

  for (const row of optionRows) {
    const week = getEffectiveWeek(row);
    if (week) weekSet.add(week);
  }

  const availableWeeks = [...weekSet].sort((a, b) => Number(a) - Number(b));
  const requestedWeek = normalizeWeek(filters.week);
  const preferLatestWeek = !requestedWeek || requestedWeek === "Todas";
  const resolvedWeek =
    resolvedPeriod === "Todos"
      ? "Todas"
      : requestedWeek !== "Todas" && availableWeeks.includes(requestedWeek)
        ? requestedWeek
        : filters.week === "Todas"
          ? "Todas"
          : preferLatestWeek
            ? (availableWeeks.at(-1) ?? "Todas")
            : availableWeeks.includes(currentDefaults.week)
              ? currentDefaults.week
              : (availableWeeks.at(-1) ?? "Todas");

  const weekFilteredRows = optionRows.filter((row: CommercialRow) => {
    if (resolvedWeek === "Todas") return true;
    return getEffectiveWeek(row) === resolvedWeek;
  });
  const requestedDate = normalizeDate(filters.date);
  const preferredDate = requestedDate ? "" : currentDefaults.date;
  const { availableDates, resolvedDate: latestResolvedDate } = resolveLatestDate(
    weekFilteredRows,
    requestedDate,
    preferredDate,
  );
  let resolvedDate = resolveFallbackDate(
    resolvedYear,
    resolvedPeriod,
    requestedDate,
    latestResolvedDate,
  );

  if (!resolvedDate && resolvedPeriod !== "Todos") {
    resolvedDate = await getLatestRemoteDate(resolvedYear, resolvedPeriod, resolvedOrigin);
  }

  let filteredRows: CommercialRow[] = [];
  if (resolvedPeriod === "Todos") {
    const latestFechaMap = new Map<string, string>();
    for (const row of weekFilteredRows) {
      const p = row.Periodo;
      const f = row.Fecha;
      const currentLatest = latestFechaMap.get(p);
      if (!currentLatest || f.localeCompare(currentLatest) > 0) {
        latestFechaMap.set(p, f);
      }
    }
    filteredRows = weekFilteredRows.filter((row: CommercialRow) => row.Fecha === latestFechaMap.get(row.Periodo));
    resolvedDate = latestResolvedDate || (availableDates.at(-1) ?? "");
  } else {
    filteredRows = weekFilteredRows.filter((row: CommercialRow) => row.Fecha === resolvedDate);
  }

  const latestBusinessDate = filteredRows
    .map((row: CommercialRow) => row.EffectiveDate)
    .filter((value): value is Date => value instanceof Date && !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())
    .at(-1);
  const businessDate = latestBusinessDate ? formatDateToKey(latestBusinessDate) : resolvedDate;

  const debugInfo = shouldComputeDebug
    ? await getDashboardDebugInfo(
      resolvedYear,
      resolvedPeriod,
      resolvedWeek,
      resolvedDate,
      resolvedOrigin,
    )
    : {
      periodSql: toSqlPeriod(resolvedYear, resolvedPeriod),
      fechaSql: resolvedDate,
      weekApplied: resolvedWeek === "Todas" ? "Todas" : `S${resolvedWeek}`,
      rowsByPeriod: 0,
      rowsByPeriodAndFecha: 0,
      latestFechaForPeriod: "",
      hasSWUltVersion: false,
    };

  const totalKilos = filteredRows.reduce((sum: number, row: CommercialRow) => sum + safeNumber(row.VEN_KGS), 0);
  const totalVenta = filteredRows.reduce((sum: number, row: CommercialRow) => sum + safeNumber(row.VEN_VAL), 0);
  const totalToneladas = toToneladas(totalKilos);

  const familyMap = new Map<string, number>();
  for (const row of filteredRows) {
    const family = row.Familia?.trim();
    if (!family) continue;
    familyMap.set(family, (familyMap.get(family) ?? 0) + safeNumber(row.VEN_KGS));
  }

  const sortedFamilies = [...familyMap.entries()]
    .map(([name, kilos]: [string, number]) => ({
      name,
      kilos,
      toneladas: toToneladas(kilos),
    }))
    .sort((a, b) => b.kilos - a.kilos);

  const familyChartData = sortedFamilies.map((item) => ({
    ...item,
    percentage: totalKilos > 0 ? (item.kilos / totalKilos) * 100 : 0,
  }));

  const topProductsByFamily: TopProductsByFamily = {};
  const productMapsByFamily = new Map<string, Map<string, number>>();

  for (const row of filteredRows) {
    const family = row.Familia?.trim();
    const product = getProductDisplayName(row);
    if (!family || !product) continue;

    let familyProducts = productMapsByFamily.get(family);
    if (!familyProducts) {
      familyProducts = new Map<string, number>();
      productMapsByFamily.set(family, familyProducts);
    }

    familyProducts.set(product, (familyProducts.get(product) ?? 0) + safeNumber(row.VEN_KGS));
  }

  for (const [family, productsMap] of productMapsByFamily.entries()) {
    topProductsByFamily[family] = [...productsMap.entries()]
      .map(([name, kilos]) => ({
        name,
        kilos,
        toneladas: toToneladas(kilos),
      }))
      .sort((a, b) => b.kilos - a.kilos)
      .slice(0, 5);
  }

  const selectedFamily = normalizeFamily(filters.family);
  const productsBySelectedFamily = selectedFamily
    ? (topProductsByFamily[selectedFamily] ?? [])
    : [];

  return {
    totalKilos,
    totalToneladas,
    totalVenta,
    familyChartData,
    productsBySelectedFamily,
    topProductsByFamily,
    availableYears,
    availablePeriods,
    availableWeeks,
    availableDates,
    availableOrigins: [...STATIC_ORIGINS],
    resolvedFilters: {
      year: resolvedYear,
      period: resolvedPeriod,
      week: resolvedWeek,
      date: resolvedDate,
      businessDate,
      origin: resolvedOrigin,
      family: selectedFamily,
    },
    debug: {
      ...debugInfo,
      rowsAfterAllFilters: filteredRows.length,
    },
  };
}

export async function refreshCommercialData(filters: DashboardFilters) {
  const year = String(filters.year || "").trim();
  const period = normalizePeriod(filters.period);
  const date = normalizeDate(filters.date);
  const shouldExecuteRefresh = Boolean(year && period !== "Todos" && date);
  const periodSql = toSqlPeriod(year, period);

  let spDuration = 0;
  if (shouldExecuteRefresh) {
    const spStart = performance.now();
    const pool = await getSqlPool();
    await pool.request()
      .input("Periodo", sql.VarChar(6), `${year}${period}`)
      .input("Fecha", sql.VarChar(8), date)
      .input("EjecutarSPRemoto", sql.Bit, false)
      .execute(REFRESH_SP);
    spDuration = Math.round(performance.now() - spStart);
  }

  const queryStart = performance.now();
  const data = await getDashboardData({
    ...filters,
    year,
    period,
    date,
  });
  const queryDuration = Math.round(performance.now() - queryStart);
  const rowsAfterRefresh = data.debug.rowsByPeriodAndFecha;

  console.info(`[TIMING] refresh SP=${spDuration}ms query=${queryDuration}ms total=${spDuration + queryDuration}ms periodo=${periodSql} fecha=${date} rows=${rowsAfterRefresh}`);

  return {
    executed: shouldExecuteRefresh,
    periodo: periodSql,
    fecha: date,
    rowsAfterRefresh,
    data,
  };
}

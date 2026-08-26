"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader2,
  RefreshCw,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderActions } from "@/components/layout/header-actions-context";
import { FamilyPieChart, formatVolume } from "@/components/comercial/FamilyPieChart";
import { getDefaultCommercialFilters } from "@/lib/comercial-default-filters";
import { showRefreshError, showRefreshSuccess, showRefreshWarning } from "@/lib/alerts";

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardFilters = {
  year: string;
  mes: string;
  semana: string;
  version: string;
  origin: string;
};

type DashboardResponse = {
  kpis: {
    totalKilos: number;
    totalToneladas: number;
    totalVenta: number;
  };
  families: Array<{
    name: string;
    kilos: number;
    toneladas: number;
    percentage: number;
  }>;
  products: Array<{
    name: string;
    kilos: number;
    toneladas: number;
  }>;
  topProductsByFamily: Record<string, Array<{
    name: string;
    kilos: number;
    toneladas: number;
  }>>;
  options: {
    years: string[];
    periods: string[];
    weeks: string[];
    dates: string[];
    origins: string[];
  };
  resolvedFilters: {
    year: string;
    period: string;
    week: string;
    date: string;
    businessDate: string;
    origin: string;
    family: string;
  };
};

type RefreshResponse = {
  ok: boolean;
  state?: string;
  executedRefresh?: boolean;
  periodo?: string;
  fecha?: string;
  rowsAfterRefresh?: number;
  warning?: string | null;
  error?: string;
  kpis: DashboardResponse["kpis"];
  families: DashboardResponse["families"];
  products: DashboardResponse["products"];
  topProductsByFamily: DashboardResponse["topProductsByFamily"];
  options: DashboardResponse["options"];
  resolvedFilters: DashboardResponse["resolvedFilters"];
};

type StatusResponse = RefreshResponse & {
  state: "pending" | "running" | "done" | "error";
  warning?: string | null;
};

type PieChartItem = {
  name: string;
  value: number;
  percentage: number;
  isOther?: boolean;
  children?: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
};

type ProductItem = {
  name: string;
  value: number;
  percentage: number;
};

/**
 * State machine for a single data fetch:
 *   idle     → never fetched
 *   loading  → request in-flight (show stale data + spinner)
 *   success  → data available
 *   empty    → request done, zero rows
 *   error    → request failed
 */
type FetchStatus = "idle" | "loading" | "success" | "empty" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero",   "02": "Febrero", "03": "Marzo",
  "04": "Abril",   "05": "Mayo",    "06": "Junio",
  "07": "Julio",   "08": "Agosto",  "09": "Septiembre",
  "10": "Octubre", "11": "Noviembre","12": "Diciembre",
};

const SHORT_MONTH_NAMES: Record<string, string> = {
  "01": "Ene.", "02": "Feb.", "03": "Mar.", "04": "Abr.",
  "05": "May.", "06": "Jun.", "07": "Jul.", "08": "Ago.",
  "09": "Set.", "10": "Oct.", "11": "Nov.", "12": "Dic.",
};

const MOBILE_MONTH_NAMES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(value: number) {
  if (value >= 1_000_000) {
    const millones = value / 1_000_000;
    const rounded = Math.round((millones + Number.EPSILON) * 10) / 10;
    if (rounded === Math.floor(rounded)) {
      return `S/ ${rounded.toLocaleString("es-PE")} millones`;
    }
    return `S/ ${rounded.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} millones`;
  }
  return `S/ ${Math.round(value).toLocaleString("es-PE")}`;
}

function parseYyyymmdd(value: string) {
  if (!/^\d{8}$/.test(value)) return new Date();
  return new Date(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6, 8)),
  );
}

/** Unique stable cache key for a set of filters */
function cacheKey(f: DashboardFilters) {
  return `${f.year}|${f.mes}|${f.semana}|${f.origin}`;
}

/** Fetch wrapper that throws on non-ok */
async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

/**
 * Resolves the best initial period (year + mes) for the first load:
 *   1. Current year/month if that periodo exists in the available periods
 *   2. Otherwise whatever the API resolved (latest available)
 */
function resolveInitialPeriod(
  resolvedYear: string,
  resolvedPeriod: string,
  availablePeriods: string[],
  defaults: ReturnType<typeof getDefaultCommercialFilters>,
): { year: string; mes: string } {
  // API already resolved to the current year/month → keep it
  if (resolvedYear === defaults.year && resolvedPeriod === defaults.month) {
    return { year: resolvedYear, mes: resolvedPeriod };
  }

  // Current month exists in DB for the current year → prefer it
  const currentPeriodoExists = availablePeriods.includes(defaults.month);
  if (resolvedYear === defaults.year && currentPeriodoExists) {
    return { year: defaults.year, mes: defaults.month };
  }

  // Fallback: what the API resolved (latest available)
  return { year: resolvedYear, mes: resolvedPeriod };
}

/**
 * Resolves the best initial week for the first load.
 *
 * Rules (only applied during isInit — never overwrites manual selection):
 *   1. If the selected period is the current year+month:
 *      a. Use the current ISO week if it exists in availableWeeks
 *      b. Otherwise use the last available week
 *      c. Otherwise use "Todas"
 *   2. If the selected period is NOT the current year+month:
 *      → use "Todas" (don't force a week on historical periods)
 */
function resolveInitialWeek(
  resolvedYear: string,
  resolvedMes: string,
  availableWeeks: string[],
  defaults: ReturnType<typeof getDefaultCommercialFilters>,
): string {
  const isCurrentPeriod =
    resolvedYear === defaults.year && resolvedMes === defaults.month;

  if (!isCurrentPeriod || availableWeeks.length === 0) {
    return "Todas";
  }

  // Always prefer the current ISO week if we're in the current period,
  // even if it's not explicitly in availableWeeks — fall back to last available
  if (availableWeeks.includes(defaults.week)) {
    return defaults.week;
  }

  // If current week not available but we're in current period, use last available week
  if (isCurrentPeriod) {
    return availableWeeks.at(-1) ?? "Todas";
  }

  // Fall back to the last available week in the period
  return availableWeeks.at(-1) ?? "Todas";
}

function sameFilters(a: DashboardFilters, b: DashboardFilters) {
  return (
    a.year === b.year &&
    a.mes === b.mes &&
    a.semana === b.semana &&
    a.origin === b.origin &&
    a.version === b.version
  );
}

// ─── CalendarPicker ───────────────────────────────────────────────────────────

function CalendarPicker({
  value,
  availableDates,
  onChange,
}: {
  value: string;
  availableDates: string[];
  onChange: (nextDate: string) => void;
}) {
  const selectedDate = useMemo(() => parseYyyymmdd(value), [value]);
  const [navYear, setNavYear] = useState(selectedDate.getFullYear());
  const [navMonth, setNavMonth] = useState(String(selectedDate.getMonth() + 1).padStart(2, "0"));
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  const monthStart = new Date(navYear, Number(navMonth) - 1, 1);
  const monthEnd = new Date(navYear, Number(navMonth), 0);
  const startWeekday = (monthStart.getDay() + 6) % 7;
  const totalDays = monthEnd.getDate();

  const daysGrid = useMemo(() => {
    const cells: Array<{ day: number | null; dateStr: string }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, dateStr: "" });
    for (let day = 1; day <= totalDays; day++) {
      const month = String(Number(navMonth)).padStart(2, "0");
      cells.push({ day, dateStr: `${navYear}${month}${String(day).padStart(2, "0")}` });
    }
    return cells;
  }, [navMonth, navYear, startWeekday, totalDays]);

  const handlePrevMonth = () => {
    const prev = new Date(navYear, Number(navMonth) - 2, 1);
    setNavYear(prev.getFullYear());
    setNavMonth(String(prev.getMonth() + 1).padStart(2, "0"));
  };
  const handleNextMonth = () => {
    const next = new Date(navYear, Number(navMonth), 1);
    setNavYear(next.getFullYear());
    setNavMonth(String(next.getMonth() + 1).padStart(2, "0"));
  };

  return (
    <div className="w-full max-w-[260px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          type="button"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-xs font-bold text-slate-800">
          {MONTH_NAMES[navMonth]} {navYear}
        </div>
        <button
          onClick={handleNextMonth}
          type="button"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-[10px] font-bold text-slate-400">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((cell, index) => {
          if (!cell.day) return <div key={`empty-${index}`} className="h-7 w-7" />;
          const isSelected = value === cell.dateStr;
          const isAvailable = availableDateSet.has(cell.dateStr);
          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={!isAvailable}
              onClick={() => onChange(cell.dateStr)}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                isSelected
                  ? "cursor-pointer bg-slate-900 text-slate-50"
                  : isAvailable
                    ? "cursor-pointer text-slate-700 hover:bg-slate-50"
                    : "cursor-not-allowed text-slate-300"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── HeaderActions ─────────────────────────────────────────────────────────────

function HeaderActions({
  draft,
  onDraftChange,
  onRefresh,
  availableYears,
  availableMonths,
  availableWeeks,
  availableOrigins,
  currentDate,
  isRefreshing,
  isLoading,
  isMobile,
}: {
  draft: DashboardFilters;
  onDraftChange: (patch: Partial<DashboardFilters>) => void;
  onRefresh: () => void;
  availableYears: string[];
  availableMonths: string[];
  availableWeeks: string[];
  availableOrigins: string[];
  currentDate: string;
  isRefreshing: boolean;
  isLoading: boolean;
  isMobile: boolean;
}) {
  const selectedMonthLabel = isMobile
    ? (!draft.mes ? "Mes" : draft.mes === "Todos" ? "Todos" : (MOBILE_MONTH_NAMES[draft.mes] ?? draft.mes))
    : (!draft.mes ? "Mes" : draft.mes === "Todos" ? "Mes: Todos" : `Mes: ${SHORT_MONTH_NAMES[draft.mes] ?? draft.mes}`);
  const selectedWeekLabel = isMobile
    ? (!draft.semana ? "Sem." : draft.semana === "Todas" ? "Todas" : `S${draft.semana}`)
    : (!draft.semana ? "Semana" : draft.semana === "Todas" ? "Sem. Todas" : `Sem. ${draft.semana}`);

  const busy = isRefreshing;

  return (
    <div className="flex w-full items-center justify-between gap-2 py-1 md:w-auto md:justify-end">
      {/* Logo container */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <img src="/logo-gp.png" className="h-[26px] w-[26px] object-contain" alt="GP" />
        )}
      </div>

      {/* Selects container (Horizontal scrollable only for filters) */}
      <div className="no-scrollbar flex flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto sm:gap-2 md:flex-none">
        {/* Año */}
        <Select
          value={draft.year}
          onValueChange={(year) => onDraftChange({ year, mes: "Todos", semana: "Todas", version: currentDate })}
          disabled={busy}
        >
          <SelectTrigger
            className="h-10 w-[76px] shrink-0 rounded-lg border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 md:w-[94px]"
            aria-label="Año"
          >
            <span className="truncate">{draft.year || "Año"}</span>
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mes */}
        <Select
          value={draft.mes}
          onValueChange={(mes) => onDraftChange({ mes, semana: "Todas", version: currentDate })}
          disabled={busy}
        >
          <SelectTrigger
            className="h-10 w-[68px] shrink-0 rounded-lg border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 md:w-[118px]"
            aria-label="Mes"
          >
            <span className="truncate">{selectedMonthLabel}</span>
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            <SelectItem value="Todos">Todos</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>{MONTH_NAMES[month] ?? month}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Semana */}
        <Select
          value={draft.semana}
          onValueChange={(semana) => onDraftChange({ semana, version: currentDate })}
          disabled={busy || draft.mes === "Todos" || availableWeeks.length === 0}
        >
          <SelectTrigger
            className="h-10 w-[68px] shrink-0 rounded-lg border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 md:w-[98px]"
            aria-label={availableWeeks.length === 0 ? "Sin semanas disponibles" : "Semana"}
          >
            <span className="truncate">{selectedWeekLabel}</span>
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            <SelectItem value="Todas">Todas</SelectItem>
            {availableWeeks.map((week) => (
              <SelectItem key={week} value={week}>{`Sem. ${week}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Origen */}
        <Select
          value={draft.origin}
          onValueChange={(origin) => onDraftChange({ origin })}
          disabled={busy}
        >
          <SelectTrigger
            className="h-10 w-[60px] shrink-0 rounded-lg border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 md:w-[90px]"
            aria-label="Origen"
          >
            <span className="truncate">{draft.origin || "GP"}</span>
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            {availableOrigins.map((origin) => (
              <SelectItem key={origin} value={origin}>{origin}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Refresh button */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing || !draft.year}
        aria-label="Actualizar datos"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors duration-150 hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <RefreshCw className="h-4 w-4 text-slate-600" />
        )}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const isMobile = useIsMobile();
  const { setActions } = useHeaderActions();
  const currentDefaults = useMemo(() => getDefaultCommercialFilters(), []);

  // ── Filter state ──
  const [filterDraft, setFilterDraft] = useState<DashboardFilters>({
    year: "",
    mes: "Todos",
    semana: "Todas",
    version: currentDefaults.date,
    origin: "GP",
  });
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({
    year: "",
    mes: "Todos",
    semana: "Todas",
    version: currentDefaults.date,
    origin: "GP",
  });

  // ── Options (years / months / weeks / origins) ──
  const [availableYears, setAvailableYears]   = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks]   = useState<string[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>(["Todos", "GP", "TDA"]);

  // ── Dashboard data (kept across loads for stale-while-loading) ──
  const [dashboard, setDashboard]         = useState<DashboardResponse | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedOther, setSelectedOther] = useState(false);
  const [selectedOtherFamily, setSelectedOtherFamily] = useState<string | null>(null);

  // ── Fetch status machine ──
  const [fetchStatus, setFetchStatus]     = useState<FetchStatus>("idle");
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [refreshStage, setRefreshStage]   = useState<string | null>(null);
  const [refreshError, setRefreshError]   = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState<DashboardFilters>({
    year: "",
    mes: "Todos",
    semana: "Todas",
    version: currentDefaults.date,
    origin: "GP",
  });

  // ── AbortController ref — cancel in-flight requests on new filter ──
  const abortRef = useRef<AbortController | null>(null);

  // ── In-memory cache keyed by "year|mes|semana|origin" ──
  const cacheRef = useRef<Map<string, DashboardResponse>>(new Map());
  const currentDraftRef = useRef<DashboardFilters>({
    year: "",
    mes: "Todos",
    semana: "Todas",
    version: currentDefaults.date,
    origin: "GP",
  });

  // ────────────────────────────────────────────────────────────────────────────
  // applyResolvedDashboard
  // ────────────────────────────────────────────────────────────────────────────
  const applyResolvedDashboard = useCallback(
    (response: DashboardResponse, fallback: DashboardFilters, isInit = false) => {
      let resolvedMes = response.resolvedFilters.period || fallback.mes;
      let resolvedYear = response.resolvedFilters.year || fallback.year;
      // semana: start from what the API resolved, then override during init
      let resolvedSemana = response.resolvedFilters.week || fallback.semana;
      let resolvedOrigin = response.resolvedFilters.origin || fallback.origin;

      // On first load: prefer current year/month and auto-select best week
      if (isInit) {
        const available = resolveInitialPeriod(
          resolvedYear,
          resolvedMes,
          response.options.periods,
          currentDefaults,
        );
        resolvedYear = available.year;
        resolvedMes  = available.mes;

        // Auto-select the current ISO week (or last available) for the init period.
        // resolvedMes may have just been updated to the current month above.
        resolvedSemana = resolveInitialWeek(
          resolvedYear,
          resolvedMes,
          response.options.weeks,
          currentDefaults,
        );

        // Resolve default origin: default to "GP" if available, else first available
        const origins = response.options.origins || [];
        if (origins.includes("GP")) {
          resolvedOrigin = "GP";
        } else if (origins.includes("Todos")) {
          resolvedOrigin = "Todos";
        } else if (origins.length > 0) {
          resolvedOrigin = origins[0];
        }
      }

      const resolved: DashboardFilters = {
        year: resolvedYear,
        mes: resolvedMes,
        semana: resolvedSemana,
        version: fallback.version,
        origin: isInit ? resolvedOrigin : fallback.origin,
      };

      setAppliedFilters(resolved);
      if (isInit || !sameFilters(currentDraftRef.current, resolved)) {
        setFilterDraft(resolved);
      }
      setDashboard(response);
      setAvailableYears(response.options.years);
      setAvailableMonths(response.options.periods);
      setAvailableWeeks(response.options.weeks);
      setAvailableOrigins(response.options.origins);

      const hasRows = response.kpis.totalKilos > 0 || response.kpis.totalVenta > 0;
      setFetchStatus(hasRows ? "success" : "empty");
    },
    [currentDefaults],
  );

  // ────────────────────────────────────────────────────────────────────────────
  // loadDashboard — reads only, never executes SP
  // ────────────────────────────────────────────────────────────────────────────
  const loadDashboard = useCallback(
    async (filters: DashboardFilters, isInit = false) => {
      // 1. Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const key = cacheKey(filters);

      // 2. Serve from cache instantly (stale-while-revalidate on init)
      if (cacheRef.current.has(key)) {
        const cached = cacheRef.current.get(key)!;
        applyResolvedDashboard(cached, filters, isInit);
        // Skip network hit (not a refresh)
        return;
      }

      // 3. Keep stale data visible, show spinner
      setFetchStatus("loading");
      setRefreshError(null);

      try {
        const params = new URLSearchParams({
          year:   filters.year,
          period: filters.mes,
          week:   filters.semana,
          origin: filters.origin,
        });
        const response = await fetchJson<DashboardResponse>(
          `/api/comercial/dashboard?${params.toString()}`,
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        // 4. Store in cache
        cacheRef.current.set(key, response);

        applyResolvedDashboard(response, filters, isInit);
      } catch (error) {
        if (controller.signal.aborted) return; // ignore cancelled
        setFetchStatus("error");
        setRefreshError(error instanceof Error ? error.message : "No se pudo cargar la información.");
      }
    },
    [applyResolvedDashboard],
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Initialization — runs once
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const initialFilters: DashboardFilters = {
        year: "",       // empty → API resolves to latest available year
        mes: "Todos",
        semana: "Todas",
        version: currentDefaults.date,
        origin: "GP",
      };
      setFilterDraft(initialFilters);
      setAppliedFilters(initialFilters);
      setFetchStatus("loading");

      try {
        const params = new URLSearchParams({
          year:   initialFilters.year,
          period: initialFilters.mes,
          week:   initialFilters.semana,
          origin: initialFilters.origin,
        });
        const response = await fetchJson<DashboardResponse>(
          `/api/comercial/dashboard?${params.toString()}`,
        );
        if (cancelled) return;

        // Cache the empty-year response
        cacheRef.current.set(cacheKey(initialFilters), response);
        applyResolvedDashboard(response, initialFilters, /* isInit */ true);
        setHasInitialized(true);
      } catch {
        if (cancelled) return;
        setFetchStatus("error");
        setHasInitialized(true);
      }
    }

    void initialize();
    return () => { cancelled = true; };
  }, [applyResolvedDashboard, currentDefaults.date]);

  useEffect(() => {
    currentDraftRef.current = filterDraft;
  }, [filterDraft]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filterDraft);
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [filterDraft]);

  // ────────────────────────────────────────────────────────────────────────────
  // React to filter changes (after initialization)
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasInitialized || !debouncedFilters.year) return;
    void loadDashboard(debouncedFilters);
  }, [
    hasInitialized,
    debouncedFilters.year,
    debouncedFilters.mes,
    debouncedFilters.semana,
    debouncedFilters.origin,
    // version intentionally omitted — it's only relevant for refresh
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ────────────────────────────────────────────────────────────────────────────
  // handleDraftChange
  // ────────────────────────────────────────────────────────────────────────────
  const handleDraftChange = useCallback((patch: Partial<DashboardFilters>) => {
    setRefreshError(null);
    setSelectedFamily(null);
    setSelectedOther(false);
    setSelectedOtherFamily(null);
    setFilterDraft((current) => ({ ...current, ...patch }));
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // handleRefresh — starts SP async, polls status, never blocks UI
  // ────────────────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    const year = filterDraft.year || currentDefaults.year;
    if (!year) return;

    setIsRefreshing(true);
    setRefreshStage("Iniciando actualización…");
    setRefreshError(null);
    setHasAttemptedRefresh(true);

    console.time("refresh-total-ui");
    console.time("refresh-start-request");

    try {
      const { jobId } = await fetchJson<{ ok: boolean; jobId: string }>(
        "/api/comercial/refresh/start",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year:   year,
            period: filterDraft.mes,
            week:   filterDraft.semana,
            date:   filterDraft.version,
            origin: filterDraft.origin,
          }),
        },
      );

      console.timeEnd("refresh-start-request");
      console.time("poll-status");

      setRefreshStage("Consultando estado…");

      const poll = async (): Promise<RefreshResponse> => {
        const res = await fetchJson<StatusResponse>(
          `/api/comercial/refresh/status?id=${jobId}`,
        );
        if (res.state === "done") {
          console.timeEnd("poll-status");
          return res;
        }
        if (res.state === "error") throw new Error(res.error || "Error en refresh");
        await new Promise((r) => setTimeout(r, 2000));
        return poll();
      };

      const response = await poll();

      setRefreshStage("Actualizando dashboard…");

      const newApplied: DashboardFilters = {
        year:    response.resolvedFilters.year   || filterDraft.year,
        mes:     response.resolvedFilters.period || filterDraft.mes,
        semana:  response.resolvedFilters.week   || filterDraft.semana,
        version: response.resolvedFilters.date   || filterDraft.version,
        origin:  response.resolvedFilters.origin || filterDraft.origin,
      };

      cacheRef.current.delete(cacheKey(newApplied));

      setSelectedFamily(null);
      setSelectedOther(false);
      setSelectedOtherFamily(null);

      const dashboardResponse: DashboardResponse = {
        kpis: response.kpis,
        families: response.families,
        products: response.products,
        topProductsByFamily: response.topProductsByFamily,
        options: response.options,
        resolvedFilters: response.resolvedFilters,
      };

      cacheRef.current.set(cacheKey(newApplied), dashboardResponse);
      applyResolvedDashboard(dashboardResponse, newApplied);
      const hasDashboardData =
        dashboardResponse.kpis.totalKilos > 0 ||
        dashboardResponse.kpis.totalVenta > 0 ||
        dashboardResponse.families.length > 0;

      if (hasDashboardData) {
        setRefreshStage("Finalizando…");
        console.timeEnd("refresh-total-ui");
        void showRefreshSuccess("Datos actualizados correctamente.");
      } else if (response.warning) {
        console.timeEnd("refresh-total-ui");
        void showRefreshWarning(response.warning);
      }
    } catch (error) {
      console.timeEnd("refresh-total-ui");
      if (error instanceof Error && error.name !== "AbortError") {
        setRefreshError(error.message || "No se pudo actualizar la información.");
      }
    } finally {
      setIsRefreshing(false);
      setRefreshStage(null);
    }
  }, [applyResolvedDashboard, filterDraft, isRefreshing]);

  useEffect(() => {
    if (!refreshError || !isRefreshing) return;
    void showRefreshError(refreshError);
  }, [refreshError, isRefreshing]);

  // ────────────────────────────────────────────────────────────────────────────
  // Mount header actions
  // ────────────────────────────────────────────────────────────────────────────
  const isLoading = fetchStatus === "loading";

  useEffect(() => {
    setActions(
      <HeaderActions
        draft={filterDraft}
        onDraftChange={handleDraftChange}
        onRefresh={() => { void handleRefresh(); }}
        availableYears={availableYears}
        availableMonths={availableMonths}
        availableWeeks={availableWeeks}
        availableOrigins={availableOrigins}
        currentDate={currentDefaults.date}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        isMobile={isMobile}
      />,
    );
    return () => setActions(null);
  }, [
    currentDefaults.date,
    filterDraft,
    handleDraftChange,
    handleRefresh,
    isRefreshing,
    isLoading,
    availableOrigins,
    availableMonths,
    availableWeeks,
    availableYears,
    setActions,
    isMobile,
  ]);

  // ────────────────────────────────────────────────────────────────────────────
  // Derived data for charts
  // ────────────────────────────────────────────────────────────────────────────
  const availableDates     = [currentDefaults.date];
  const selectedDateLabel  = currentDefaults.dateLabel;

  const kilosPieData = useMemo<PieChartItem[]>(() => {
    if (!dashboard || !dashboard.families) return [];

    // 1. Agrupar por Familia (name) y sumar kilos (excluyendo "Otros" si viniera)
    const groupedMap = new Map<string, number>();
    dashboard.families.forEach((item) => {
      const name = item.name.trim();
      if (!name || name.toUpperCase() === "OTROS") {
        return;
      }
      const currentVal = groupedMap.get(name) || 0;
      groupedMap.set(name, currentVal + item.kilos);
    });

    // 2. Convertir a array y ordenar de forma descendente por kilos
    const sortedFamilies = Array.from(groupedMap.entries())
      .map(([name, kilos]) => ({ name, kilos }))
      .sort((a, b) => b.kilos - a.kilos);

    const totalKilos = sortedFamilies.reduce((sum, item) => sum + item.kilos, 0);
    if (totalKilos === 0) return [];

    // 3. Si hay 5 o menos familias, no agrupar en "Otros"
    if (sortedFamilies.length <= 5) {
      return sortedFamilies.map((item) => ({
        name: item.name,
        value: item.kilos,
        percentage: totalKilos > 0 ? (item.kilos / totalKilos) * 100 : 0,
        isOther: false,
      }));
    }

    // 4. Si hay más de 5 familias, tomar Top 5 y agrupar las restantes en "Otros"
    const top5 = sortedFamilies.slice(0, 5);
    const otherFamilies = sortedFamilies.slice(5);

    const result: PieChartItem[] = top5.map((item) => ({
      name: item.name,
      value: item.kilos,
      percentage: totalKilos > 0 ? (item.kilos / totalKilos) * 100 : 0,
      isOther: false,
    }));

    if (otherFamilies.length > 0) {
      const otrosKilos = otherFamilies.reduce((sum, item) => sum + item.kilos, 0);

      result.push({
        name: "Otros",
        value: otrosKilos,
        percentage: totalKilos > 0 ? (otrosKilos / totalKilos) * 100 : 0,
        isOther: true,
        children: otherFamilies.map((item) => ({
          name: item.name,
          value: item.kilos,
          percentage: totalKilos > 0 ? (item.kilos / totalKilos) * 100 : 0,
        })),
      });
    }

    return result;
  }, [dashboard]);

  const hasOtros = useMemo(() => {
    if (!dashboard || !dashboard.families) return false;
    const uniqueFamilies = new Set(dashboard.families.map(f => f.name.trim()));
    return uniqueFamilies.size > 5;
  }, [dashboard]);

  const pieSubtitle = hasOtros 
    ? "Top 5 familias + Otros por toneladas vendidas" 
    : "Top 5 familias por toneladas vendidas";

  const productsPieData = useMemo<ProductItem[]>(() => {
    const activeFamily = selectedOtherFamily ?? selectedFamily;
    if (!dashboard || !activeFamily) return [];
    const familyProducts = dashboard.topProductsByFamily?.[activeFamily] ?? [];
    const total = familyProducts.reduce((s, i) => s + i.kilos, 0);
    return familyProducts.map((item) => ({
      name: item.name,
      value: item.kilos,
      percentage: total > 0 ? (item.kilos / total) * 100 : 0,
    }));
  }, [dashboard, selectedFamily, selectedOtherFamily]);

  // Determine whether we have real data to display
  const hasData = Boolean(
    dashboard && (dashboard.kpis.totalKilos > 0 || dashboard.kpis.totalVenta > 0),
  );

  // Show empty state only when fetch is DONE and returned nothing
  const showEmptyState = (fetchStatus === "empty" || fetchStatus === "error") && !hasData;

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <section className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6 pb-6">
      {/* ── Title row ── */}
      <div className="flex w-full items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
            Ventas año {appliedFilters.year || "—"}
          </h1>
          {/* Inline loading badge — never shows blank screen */}
          {isLoading && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Actualizando…
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
            {isMobile ? (
              <Sheet open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-[135px] cursor-pointer justify-between rounded-lg border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:ring-1"
                  >
                    <span>{selectedDateLabel}</span>
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl bg-white p-4">
                  <SheetTitle className="sr-only">Seleccionar fecha</SheetTitle>
                  <div className="flex justify-center py-2">
                    <CalendarPicker
                      key={currentDefaults.date}
                      value={currentDefaults.date}
                      availableDates={availableDates}
                      onChange={() => setIsSelectorOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Popover open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-[135px] cursor-pointer justify-between rounded-lg border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:ring-1"
                  >
                    <span>{selectedDateLabel}</span>
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="z-50 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <CalendarPicker
                    key={currentDefaults.date}
                    value={currentDefaults.date}
                    availableDates={availableDates}
                    onChange={() => setIsSelectorOpen(false)}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

      {/* ── Refresh progress bar ── */}
      {isRefreshing && (
        <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-xs">
          <div className="h-1 w-full bg-slate-100">
            <div className="h-full w-full animate-[indeterminate_1.8s_ease-in-out_infinite] rounded-full bg-slate-900" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-500" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700">Actualizando información comercial…</p>
              {refreshStage && (
                <p className="text-[11px] text-slate-400">{refreshStage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Content area ── */}
      {showEmptyState ? (
        /* Empty state — only shown when fetch finished and truly no data */
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <div className="space-y-2 text-center">
              <p className="text-sm text-slate-400">No hay datos para la fecha seleccionada.</p>
              <p className="text-xs text-slate-400">
                {hasAttemptedRefresh
                  ? `No se encontraron datos para ${selectedDateLabel} después de actualizar.`
                  : "Presiona actualizar para generar la versión de esta fecha."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Data area — rendered even while isLoading (stale data stays visible) */
        <div
          className={`w-full max-w-full min-w-0 space-y-6 transition-opacity duration-200 ${
            isLoading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="w-full max-w-full min-w-0 border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 sm:h-10 sm:w-10">
                    <Weight className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                      VOLUMEN VENDIDO
                    </p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      {formatVolume(dashboard?.kpis.totalKilos ?? 0)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 sm:mt-3 sm:text-xs">Volumen vendido del periodo seleccionado</p>
              </CardContent>
            </Card>

            <Card className="w-full max-w-full min-w-0 border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 sm:h-10 sm:w-10">
                    <DollarSign className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                      VALOR VENTA
                    </p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      {fmtCurrency(dashboard?.kpis.totalVenta ?? 0)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 sm:mt-3 sm:text-xs">Valor vendido del periodo seleccionado</p>
              </CardContent>
            </Card>
          </div>

          {/* Family pie chart */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <FamilyPieChart
              title="Participación por familia Top 5 familias"
              subtitle={pieSubtitle}
              data={kilosPieData}
              selectedFamily={selectedFamily}
              onSelectFamily={setSelectedFamily}
              selectedOther={selectedOther}
              onSelectOther={setSelectedOther}
              selectedOtherFamily={selectedOtherFamily}
              onSelectOtherFamily={setSelectedOtherFamily}
              productsData={productsPieData}
            />
          </div>
        </div>
      )}
    </section>
  );
}

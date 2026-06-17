"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, DollarSign, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderActions } from "@/components/layout/header-actions-context";
import { FamilyPieChart, formatVolume } from "@/components/comercial/FamilyPieChart";

/* ═══════════════════════════════════════════════════════════════
   Data model — mirrors SQL Server commercial table structure
   ═══════════════════════════════════════════════════════════════ */

type CommercialRow = {
  periodo: string;       // YYYYMM
  fecha: string;         // YYYYMMDD — version/cut date
  swUltVersion: boolean; // true = latest version for this period
  sworigen: string;      // "GP" | "TDA"
  familia: string;       // Product family
  subfamilia: string;    // Product subfamily
  producto: string;      // Product name
  venVal: number;        // VEN_VAL
  venKgs: number;        // VEN_KGS
};

const commercialData: CommercialRow[] = (() => {
  const rows: CommercialRow[] = [];
  const monthlyBase = [
    { periodo: "202601", ventaGP: 1_428_000, ventaTDA: 672_000, kilosGP: 170_000, kilosTDA: 80_000 },
    { periodo: "202602", ventaGP: 1_734_000, ventaTDA: 816_000, kilosGP: 190_400, kilosTDA: 89_600 },
    { periodo: "202603", ventaGP: 2_264_400, ventaTDA: 1_065_600, kilosGP: 212_160, kilosTDA: 99_840 },
    { periodo: "202604", ventaGP: 2_556_800, ventaTDA: 1_203_200, kilosGP: 270_640, kilosTDA: 127_360 },
    { periodo: "202605", ventaGP: 2_910_400, ventaTDA: 1_369_600, kilosGP: 289_000, kilosTDA: 136_000 },
    { periodo: "202606", ventaGP: 2_801_600, ventaTDA: 1_318_400, kilosGP: 279_480, kilosTDA: 131_520 },
  ];

  // Distribute sales and kilos by family:
  // Sales: Pollo (40%), Cerdo (25%), Pavo (15%), Embutidos (10%), Congelados (6%), Huevos (3%), Alimentos (1%)
  // Kilos: Pollo (42%), Cerdo (20%), Pavo (13%), Congelados (12%), Embutidos (7%), Huevos (4%), Alimentos (2%)
  const families = [
    { name: "Pollo", salesPct: 0.40, kilosPct: 0.42 },
    { name: "Cerdo", salesPct: 0.25, kilosPct: 0.20 },
    { name: "Pavo", salesPct: 0.15, kilosPct: 0.13 },
    { name: "Embutidos", salesPct: 0.10, kilosPct: 0.07 },
    { name: "Congelados", salesPct: 0.06, kilosPct: 0.12 },
    { name: "Huevos", salesPct: 0.03, kilosPct: 0.04 },
    { name: "Alimentos", salesPct: 0.01, kilosPct: 0.02 },
  ];

  const familySubfamilies: Record<string, string[]> = {
    Pollo: ["Pechuga", "Pierna", "Entero", "Ala", "Menudencia"],
    Cerdo: ["Chuleta", "Costilla", "Lomo", "Panceta", "Bondiola"],
    Pavo: ["Pavo entero", "Pechuga de pavo", "Pavita trozada", "Jamón pavo", "Tocino pavo"],
    Embutidos: ["Jamonada", "Hot dog", "Salchicha", "Chorizo", "Salchichón"],
    Congelados: ["Mixtos", "Empanizados", "Papas", "Hamburguesas", "Enrollado"],
    Huevos: ["Pardos", "Blancos", "Orgánicos", "Codorniz", "Claras"],
    Alimentos: ["Pollo balanceado", "Cerdo balanceado", "Pavo balanceado", "Suplemento", "Premezcla"],
  };

  const productPcts = [0.42, 0.28, 0.18, 0.08, 0.04];

  for (const mb of monthlyBase) {
    const year = parseInt(mb.periodo.slice(0, 4), 10);
    const month = parseInt(mb.periodo.slice(4), 10);
    const lastDay = new Date(year, month, 0).getDate();
    const versionDates = [
      { day: 15, factor: 0.92 },
      { day: lastDay, factor: 1.0 },
    ];
    if (month >= 5) {
      versionDates.splice(1, 0, { day: 22, factor: 0.97 });
    }

    versionDates.forEach((v, idx) => {
      const isLast = idx === versionDates.length - 1;
      const dd = String(v.day).padStart(2, "0");
      const mm = String(month).padStart(2, "0");
      const fecha = `${year}${mm}${dd}`;

      families.forEach((fam) => {
        const subfams = familySubfamilies[fam.name] || ["Genérico"];
        subfams.forEach((subName, sIdx) => {
          const pct = productPcts[sIdx] ?? 0.05;
          rows.push({
            periodo: mb.periodo,
            fecha,
            swUltVersion: isLast,
            sworigen: "GP",
            familia: fam.name,
            subfamilia: subName,
            producto: `${subName} producto`,
            venVal: Math.round(mb.ventaGP * v.factor * fam.salesPct * pct),
            venKgs: Math.round(mb.kilosGP * v.factor * fam.kilosPct * pct),
          });
          rows.push({
            periodo: mb.periodo,
            fecha,
            swUltVersion: isLast,
            sworigen: "TDA",
            familia: fam.name,
            subfamilia: subName,
            producto: `${subName} producto`,
            venVal: Math.round(mb.ventaTDA * v.factor * fam.salesPct * pct),
            venKgs: Math.round(mb.kilosTDA * v.factor * fam.kilosPct * pct),
          });
        });
      });
    });
  }
  return rows;
})();

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function fmtCurrency(v: number) {
  if (v >= 1_000_000) return `S/ ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `S/ ${Math.round(v / 1_000)}K`;
  return `S/ ${v.toFixed(0)}`;
}

/* ═══════════════════════════════════════════════════════════════
   Filter types and options
   ═══════════════════════════════════════════════════════════════ */

type DashboardFilters = {
  year: string;
  mes: string;
  semana: string;
  version: string;
};

function getWeekNumber(dateStr: string): number {
  if (dateStr.length !== 8) return 0;
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(4, 6), 10) - 1;
  const d = parseInt(dateStr.slice(6, 8), 10);
  const date = new Date(y, m, d);
  const oneJan = new Date(y, 0, 1);
  const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

function getAvailableYears(): string[] {
  const years = new Set(commercialData.map((r) => r.periodo.slice(0, 4)));
  return Array.from(years).sort();
}

function getAvailableMonths(year: string): string[] {
  const months = new Set(
    commercialData
      .filter((r) => r.periodo.slice(0, 4) === year)
      .map((r) => r.periodo.slice(4, 6))
  );
  return Array.from(months).sort();
}

function getAvailableWeeks(year: string, mes: string): number[] {
  const filtered = commercialData.filter((r) => {
    const rYear = r.periodo.slice(0, 4);
    if (rYear !== year) return false;
    if (mes !== "Todos" && r.periodo.slice(4, 6) !== mes) return false;
    return true;
  });
  
  const weeks = new Set<number>();
  for (const r of filtered) {
    weeks.add(getWeekNumber(r.fecha));
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

function getAvailableDates(year: string, mes: string, semana: string): string[] {
  const filtered = commercialData.filter((r) => {
    const rYear = r.periodo.slice(0, 4);
    if (rYear !== year) return false;
    if (mes !== "Todos" && r.periodo.slice(4, 6) !== mes) return false;
    if (semana !== "Todas" && getWeekNumber(r.fecha) !== parseInt(semana, 10)) return false;
    return true;
  });
  
  const dates = new Set(filtered.map((r) => r.fecha));
  return Array.from(dates).sort();
}

/* ═══════════════════════════════════════════════════════════════
   KPI calculation
   ═══════════════════════════════════════════════════════════════ */

function getKpiData(filters: DashboardFilters) {
  let filtered: CommercialRow[];

  // 1. Filter by year
  filtered = commercialData.filter((r) => r.periodo.slice(0, 4) === filters.year);

  // 2. Filter by month/mes
  if (filters.mes !== "Todos") {
    filtered = filtered.filter((r) => r.periodo.slice(4, 6) === filters.mes);
  }

  // 3. Filter by semana/version
  if (filters.semana !== "Todas") {
    // Show only that specific week
    const targetWeek = parseInt(filters.semana, 10);
    filtered = filtered.filter((r) => getWeekNumber(r.fecha) === targetWeek);
  } else {
    // Semana = Todas: show cumulative data up to the selected version/fecha
    if (filters.version) {
      const targetMonthStr = filters.version.slice(4, 6);
      const targetMonth = parseInt(targetMonthStr, 10);
      
      const periods = new Set(filtered.map((r) => r.periodo));
      const finalRows: CommercialRow[] = [];
      for (const p of periods) {
        const rMonth = parseInt(p.slice(4, 6), 10);
        if (rMonth < targetMonth) {
          // Past months: take latest version
          const periodRows = filtered.filter((r) => r.periodo === p);
          const ultRows = periodRows.filter((r) => r.swUltVersion);
          finalRows.push(...(ultRows.length > 0 ? ultRows : periodRows));
        } else if (rMonth === targetMonth) {
          // Selected month: take the specific selected version date
          const periodRows = filtered.filter((r) => r.periodo === p && r.fecha === filters.version);
          finalRows.push(...periodRows);
        }
        // Future months are excluded
      }
      filtered = finalRows;
    } else {
      // Fallback
      const periods = new Set(filtered.map((r) => r.periodo));
      const finalRows: CommercialRow[] = [];
      for (const p of periods) {
        const periodRows = filtered.filter((r) => r.periodo === p);
        const ultRows = periodRows.filter((r) => r.swUltVersion);
        finalRows.push(...(ultRows.length > 0 ? ultRows : periodRows));
      }
      filtered = finalRows;
    }
  }

  const totalVenta = filtered.reduce((s, r) => s + r.venVal, 0);
  const totalKilos = filtered.reduce((s, r) => s + r.venKgs, 0);
  return { totalVenta, totalKilos, hasData: filtered.length > 0, filteredRows: filtered };
}

type PieChartItem = {
  name: string;
  value: number;
  percentage: number;
};

function getPieChartData(filteredRows: CommercialRow[], type: "sales" | "kilos"): PieChartItem[] {
  const total = filteredRows.reduce((s, r) => s + (type === "sales" ? r.venVal : r.venKgs), 0);
  if (total === 0) return [];

  // Group by family
  const groups: Record<string, number> = {};
  for (const r of filteredRows) {
    groups[r.familia] = (groups[r.familia] ?? 0) + (type === "sales" ? r.venVal : r.venKgs);
  }

  // Convert to array
  const list = Object.entries(groups).map(([name, val]) => ({ name, value: val }));

  // Sort descending
  list.sort((a, b) => b.value - a.value);

  // Take top 4 and combine the rest as "Otros"
  const top4 = list.slice(0, 4);
  const rest = list.slice(4);

  const result: Array<{ name: string; value: number }> = [...top4];
  if (rest.length > 0) {
    const otrosValue = rest.reduce((s, item) => s + item.value, 0);
    result.push({ name: "Otros", value: otrosValue });
  }

  // Calculate percentages
  return result.map((item) => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));
}

type ProductItem = {
  name: string;
  value: number;
  percentage: number;
};

function getProductPieData(filteredRows: CommercialRow[], selectedFamily: string): ProductItem[] {
  const rows = filteredRows.filter((r) => r.familia === selectedFamily);
  const total = rows.reduce((s, r) => s + r.venKgs, 0);
  if (total === 0) return [];

  const groups: Record<string, number> = {};
  for (const r of rows) {
    groups[r.producto] = (groups[r.producto] ?? 0) + r.venKgs;
  }

  const list = Object.entries(groups).map(([name, val]) => ({ name, value: val }));

  list.sort((a, b) => b.value - a.value);

  const top5 = list.slice(0, 5);

  return top5.map((item) => ({
    name: item.name,
    value: item.value,
    percentage: (item.value / total) * 100,
  }));
}

/* ═══════════════════════════════════════════════════════════════
   Period context label from applied filters
   ═══════════════════════════════════════════════════════════════ */

// getPeriodContext removed since context labels are no longer used

/* ═══════════════════════════════════════════════════════════════
   Header action buttons
   ═══════════════════════════════════════════════════════════════ */

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

function formatFechaDmy(f: string): string {
  if (!f || f.length !== 8) return f;
  return `${f.slice(6)}/${f.slice(4, 6)}/${f.slice(0, 4)}`;
}

function parseYyyymmdd(str: string): Date {
  if (!str || str.length !== 8) return new Date();
  const y = parseInt(str.slice(0, 4), 10);
  const m = parseInt(str.slice(4, 6), 10) - 1;
  const d = parseInt(str.slice(6, 8), 10);
  return new Date(y, m, d);
}

const MONTHS_SPANISH = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

function CalendarPicker({
  value,
  onChange,
}: {
  value: string; // YYYYMMDD
  onChange: (value: string) => void;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [navDate, setNavDate] = useState(() => parseYyyymmdd(value));

  if (value !== prevValue) {
    setPrevValue(value);
    setNavDate(parseYyyymmdd(value));
  }

  const navYear = navDate.getFullYear();
  const navMonth = navDate.getMonth();

  const handlePrevMonth = () => {
    setNavDate(new Date(navYear, navMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(navYear, navMonth + 1, 1));
  };

  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(navYear, navMonth, 1).getDay();
    const totalDays = new Date(navYear, navMonth + 1, 0).getDate();
    
    const grid: Array<{ day: number | null; dateStr: string | null }> = [];
    
    // Add empty spots for days of the week before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ day: null, dateStr: null });
    }
    
    // Add the days of the month
    for (let d = 1; d <= totalDays; d++) {
      const mm = String(navMonth + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      grid.push({
        day: d,
        dateStr: `${navYear}${mm}${dd}`,
      });
    }
    
    return grid;
  }, [navYear, navMonth]);

  const isSelected = (dateStr: string | null) => {
    return dateStr === value;
  };

  const handleDayClick = (dateStr: string | null) => {
    if (dateStr) {
      onChange(dateStr);
    }
  };

  return (
    <div className="w-[250px] select-none text-slate-800">
      {/* Header with Mes/Año and navigation */}
      <div className="flex items-center justify-between pb-3">
        <button
          onClick={handlePrevMonth}
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-xs font-bold text-slate-800">
          {MONTHS_SPANISH[navMonth]} {navYear}
        </div>
        <button
          onClick={handleNextMonth}
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays headers */}
      <div className="grid grid-cols-7 gap-1 text-center pb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-[10px] font-bold text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((cell, idx) => {
          if (!cell.day) {
            return <div key={`empty-${idx}`} className="h-7 w-7" />;
          }

          const selected = isSelected(cell.dateStr);

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => handleDayClick(cell.dateStr)}
              className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                selected
                  ? "bg-slate-900 text-slate-50 hover:bg-slate-900"
                  : "text-slate-700 hover:bg-slate-50"
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

function HeaderActions({
  draft,
  onDraftChange,
  onApply,
  availableYears,
  isRefreshing,
}: {
  draft: DashboardFilters;
  onDraftChange: (patch: Partial<DashboardFilters>) => void;
  onApply: () => void;
  availableYears: string[];
  isRefreshing: boolean;
}) {
  const availableMonths = useMemo(() => {
    return getAvailableMonths(draft.year);
  }, [draft.year]);

  const availableWeeks = useMemo(() => {
    return getAvailableWeeks(draft.year, draft.mes);
  }, [draft.year, draft.mes]);

  const handleYearChange = (y: string) => {
    const months = getAvailableMonths(y);
    const hasCurrentMonth = draft.mes === "Todos" || months.includes(draft.mes);
    const nextMonth = hasCurrentMonth ? draft.mes : "Todos";
    
    const wks = getAvailableWeeks(y, nextMonth);
    const hasCurrentWeek = draft.semana === "Todas" || wks.includes(parseInt(draft.semana, 10));
    const nextWeek = hasCurrentWeek ? draft.semana : "Todas";

    onDraftChange({
      year: y,
      mes: nextMonth,
      semana: nextWeek,
    });
  };

  const handleMonthChange = (m: string) => {
    const wks = getAvailableWeeks(draft.year, m);
    const hasCurrentWeek = draft.semana === "Todas" || wks.includes(parseInt(draft.semana, 10));
    onDraftChange({
      mes: m,
      semana: hasCurrentWeek ? draft.semana : "Todas",
    });
  };

  const isSemanaDisabled = availableWeeks.length === 0;

  return (
    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
      {/* Logo GP (botón de actualización de datos) */}
      <button
        onClick={onApply}
        disabled={isRefreshing}
        aria-label="Actualizar datos"
        className={`flex h-9 w-9 items-center justify-center bg-transparent border-0 p-0 shadow-none outline-none shrink-0 transition-all ${
          isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:opacity-80 active:scale-95 cursor-pointer"
        }`}
      >
        <img
          src="/logo-gp.png"
          className={`h-[34px] w-[34px] object-contain ${isRefreshing ? "animate-pulse" : ""}`}
          alt="GP"
        />
      </button>

      {/* Selectores agrupados */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Año */}
        <Select value={draft.year} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[66px] sm:w-[76px] rounded-lg text-xs px-1.5 bg-slate-50 border-slate-200 font-semibold text-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Periodo */}
        <Select value={draft.mes} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-8 w-[92px] sm:w-[110px] rounded-lg text-xs px-1.5 bg-slate-50 border-slate-200 font-semibold text-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {MONTH_NAMES[m] ?? m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Semana */}
        <Select
          value={isSemanaDisabled ? "" : draft.semana}
          onValueChange={(w) => onDraftChange({ semana: w })}
          disabled={isSemanaDisabled}
        >
          <SelectTrigger className="h-8 w-[88px] sm:w-[105px] rounded-lg text-xs px-1.5 bg-slate-50 border-slate-200 font-semibold text-slate-700">
            <SelectValue placeholder="Semana" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            {availableWeeks.map((w) => (
              <SelectItem key={w} value={String(w)}>Semana {w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════ */

// defaultFilters removed

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export default function HomePage() {
  const availableYears = useMemo(() => getAvailableYears(), []);
  const todayStr = useMemo(() => getTodayStr(), []);

  // Draft = what user edits inside the filter panel
  const [draft, setDraft] = useState<DashboardFilters>(() => {
    const defaultYear = availableYears[0] ?? "2026";
    return {
      year: defaultYear,
      mes: "Todos",
      semana: "Todas",
      version: getTodayStr(),
    };
  });

  // Applied = what the dashboard actually uses
  const [applied, setApplied] = useState<DashboardFilters>(() => {
    const defaultYear = availableYears[0] ?? "2026";
    return {
      year: defaultYear,
      mes: "Todos",
      semana: "Todas",
      version: getTodayStr(),
    };
  });

  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const { setActions } = useHeaderActions();

  const handleDraftChange = useCallback((patch: Partial<DashboardFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  // Available dates for the currently selected filters in draft
  const draftAvailableDates = useMemo(() => {
    return getAvailableDates(draft.year, draft.mes, draft.semana);
  }, [draft.year, draft.mes, draft.semana]);

  // Fallback to the latest available date if draft.version is empty or invalid
  const resolvedDraftVersion = useMemo(() => {
    const isYearMatch = draft.version && draft.version.startsWith(draft.year);
    const isMonthMatch = !draft.version || draft.mes === "Todos" || draft.version.slice(4, 6) === draft.mes;
    if (draft.version && isYearMatch && isMonthMatch) {
      return draft.version;
    }
    const pastOrEqualDates = draftAvailableDates.filter((d) => d <= todayStr);
    return pastOrEqualDates.length > 0 ? pastOrEqualDates.at(-1)! : (draftAvailableDates.at(-1) ?? todayStr);
  }, [draft.version, draft.year, draft.mes, draftAvailableDates, todayStr]);

  // Available dates for applied filters (used for title date selector)
  const appliedAvailableDates = useMemo(() => {
    return getAvailableDates(applied.year, applied.mes, applied.semana);
  }, [applied.year, applied.mes, applied.semana]);

  // Fallback for applied version
  const resolvedAppliedVersion = useMemo(() => {
    const isYearMatch = applied.version && applied.version.startsWith(applied.year);
    const isMonthMatch = !applied.version || applied.mes === "Todos" || applied.version.slice(4, 6) === applied.mes;
    if (applied.version && isYearMatch && isMonthMatch) {
      return applied.version;
    }
    const pastOrEqualDates = appliedAvailableDates.filter((d) => d <= todayStr);
    return pastOrEqualDates.length > 0 ? pastOrEqualDates.at(-1)! : (appliedAvailableDates.at(-1) ?? todayStr);
  }, [applied.version, applied.year, applied.mes, appliedAvailableDates, todayStr]);

  const handleApply = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setApplied({
        ...draft,
        version: resolvedDraftVersion,
      });
      setSelectedFamily(null); // Clear selection on apply
      setIsRefreshing(false);
    }, 600);
  }, [draft, resolvedDraftVersion, isRefreshing]);

  // Inject header buttons
  useEffect(() => {
    setActions(
      <HeaderActions
        draft={draft}
        onDraftChange={handleDraftChange}
        onApply={handleApply}
        availableYears={availableYears}
        isRefreshing={isRefreshing}
      />,
    );
    return () => setActions(null);
  }, [draft, handleDraftChange, handleApply, availableYears, setActions, isRefreshing]);

  const appliedWithResolvedVersion = useMemo(() => {
    return {
      ...applied,
      version: resolvedAppliedVersion,
    };
  }, [applied, resolvedAppliedVersion]);

  // KPIs from applied filters
  const data = useMemo(() => getKpiData(appliedWithResolvedVersion), [appliedWithResolvedVersion]);

  // Grouped PieChart data
  const kilosPieData = useMemo(
    () => getPieChartData(data.filteredRows ?? [], "kilos"),
    [data.filteredRows]
  );

  const productsPieData = useMemo(() => {
    if (!selectedFamily) return [];
    return getProductPieData(data.filteredRows ?? [], selectedFamily);
  }, [data.filteredRows, selectedFamily]);

  return (
    <section className="space-y-6 pb-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-4 w-full border-b border-slate-100 pb-3">
          {/* Left: Título dinámico */}
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Ventas año {applied.year}
          </h1>

          {/* Right: Date selection Popover/Sheet */}
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Sheet open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-[135px] justify-between rounded-lg border-slate-200 bg-white text-xs px-2.5 font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:ring-1 cursor-pointer"
                  >
                    <span>
                      {resolvedDraftVersion ? formatFechaDmy(resolvedDraftVersion) : "Fecha"}
                    </span>
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl p-4 bg-white">
                  <div className="flex justify-center py-2">
                    <CalendarPicker
                      value={resolvedDraftVersion}
                      onChange={(d) => {
                        setDraft((prev) => ({ ...prev, version: d }));
                        setIsSelectorOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Popover open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-[135px] justify-between rounded-lg border-slate-200 bg-white text-xs px-2.5 font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:ring-1 cursor-pointer"
                  >
                    <span>
                      {resolvedDraftVersion ? formatFechaDmy(resolvedDraftVersion) : "Fecha"}
                    </span>
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[280px] p-3 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                  <CalendarPicker
                    value={resolvedDraftVersion}
                    onChange={(d) => {
                      setDraft((prev) => ({ ...prev, version: d }));
                      setIsSelectorOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>

      {!data.hasData ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-slate-400">No hay datos para la fecha seleccionada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* KPI: Volumen vendido */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Weight className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      VOLUMEN VENDIDO
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      {formatVolume(data.totalKilos)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Volumen vendido del periodo seleccionado
                </p>
              </CardContent>
            </Card>

            {/* KPI: Valor venta */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      VALOR VENTA
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      {fmtCurrency(data.totalVenta)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Valor vendido del periodo seleccionado
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <FamilyPieChart
              title="Participación por familia en toneladas"
              subtitle="Top 5 familias por toneladas vendidas"
              data={kilosPieData}
              selectedFamily={selectedFamily}
              onSelectFamily={setSelectedFamily}
              productsData={productsPieData}
            />
          </div>
        </div>
      )}
    </section>
  );
}

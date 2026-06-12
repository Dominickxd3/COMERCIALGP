"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PeriodOption, SubfamilyFiltersState } from "./subfamily-data";
import { getSubfamilyOptions, subfamilyFilterOptions } from "./subfamily-data";

type SubfamilyFiltersProps = {
  filters: SubfamilyFiltersState;
  onFilterChange: <K extends keyof SubfamilyFiltersState>(key: K, value: SubfamilyFiltersState[K]) => void;
};

function isPeriodOption(option: string | PeriodOption): option is PeriodOption {
  return typeof option !== "string";
}

function FilterField({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | readonly PeriodOption[];
  onValueChange: (value: string) => void;
}) {
  const periodOptions = options.filter(isPeriodOption);
  const selectedLabel =
    typeof options[0] === "string" ? value : periodOptions.find((option) => option.value === value)?.label;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm">
          <SelectValue placeholder={label}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const itemValue = typeof option === "string" ? option : option.value;
            const itemLabel = typeof option === "string" ? option : option.label;

            return (
              <SelectItem key={itemValue} value={itemValue}>
                {itemLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function FiltersCard({ filters, onFilterChange }: SubfamilyFiltersProps) {
  const subfamilyOptions = getSubfamilyOptions(filters.family);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-950">Filtros de subfamilia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Selecciona año, periodo, origen, familia y subfamilia para analizar el desempeño comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <FilterField
            label="Año"
            value={filters.year}
            options={subfamilyFilterOptions.years}
            onValueChange={(value) => onFilterChange("year", value)}
          />
          <FilterField
            label="Periodo"
            value={filters.period}
            options={subfamilyFilterOptions.periods}
            onValueChange={(value) => onFilterChange("period", value)}
          />
          <FilterField
            label="Origen"
            value={filters.origin}
            options={subfamilyFilterOptions.origins}
            onValueChange={(value) => onFilterChange("origin", value)}
          />
          <FilterField
            label="Familia"
            value={filters.family}
            options={subfamilyFilterOptions.families}
            onValueChange={(value) => onFilterChange("family", value)}
          />
          <FilterField
            label="Subfamilia"
            value={filters.subfamily}
            options={subfamilyOptions}
            onValueChange={(value) => onFilterChange("subfamily", value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function SubfamilyFilters({ filters, onFilterChange }: SubfamilyFiltersProps) {
  const subfamilyOptions = getSubfamilyOptions(filters.family);

  return (
    <>
      <div className="hidden lg:block">
        <FiltersCard filters={filters} onFilterChange={onFilterChange} />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white shadow-sm">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-4">
            <SheetHeader className="text-left">
              <SheetTitle>Filtros de subfamilia</SheetTitle>
              <SheetDescription>
                Selecciona año, periodo, origen, familia y subfamilia para analizar el desempeño comercial.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid gap-4">
              <FilterField
                label="Año"
                value={filters.year}
                options={subfamilyFilterOptions.years}
                onValueChange={(value) => onFilterChange("year", value)}
              />
              <FilterField
                label="Periodo"
                value={filters.period}
                options={subfamilyFilterOptions.periods}
                onValueChange={(value) => onFilterChange("period", value)}
              />
              <FilterField
                label="Origen"
                value={filters.origin}
                options={subfamilyFilterOptions.origins}
                onValueChange={(value) => onFilterChange("origin", value)}
              />
              <FilterField
                label="Familia"
                value={filters.family}
                options={subfamilyFilterOptions.families}
                onValueChange={(value) => onFilterChange("family", value)}
              />
              <FilterField
                label="Subfamilia"
                value={filters.subfamily}
                options={subfamilyOptions}
                onValueChange={(value) => onFilterChange("subfamily", value)}
              />
            </div>
            <SheetFooter className="mt-6">
              <Button className="w-full rounded-xl">Aplicar filtros</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

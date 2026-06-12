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
import type { FamilyFiltersState, PeriodOption } from "./family-data";
import { familyFilterOptions } from "./family-data";

type FamilyFiltersProps = {
  filters: FamilyFiltersState;
  onFilterChange: <K extends keyof FamilyFiltersState>(key: K, value: FamilyFiltersState[K]) => void;
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

function FiltersCard({ filters, onFilterChange }: FamilyFiltersProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-950">Filtros de familia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Selecciona año, periodo, origen y familia para analizar el desempeño comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterField
            label="Año"
            value={filters.year}
            options={familyFilterOptions.years}
            onValueChange={(value) => onFilterChange("year", value)}
          />
          <FilterField
            label="Periodo"
            value={filters.period}
            options={familyFilterOptions.periods}
            onValueChange={(value) => onFilterChange("period", value)}
          />
          <FilterField
            label="Origen"
            value={filters.origin}
            options={familyFilterOptions.origins}
            onValueChange={(value) => onFilterChange("origin", value)}
          />
          <FilterField
            label="Familia"
            value={filters.family}
            options={familyFilterOptions.families}
            onValueChange={(value) => onFilterChange("family", value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function FamilyFilters({ filters, onFilterChange }: FamilyFiltersProps) {
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
              <SheetTitle>Filtros de familia</SheetTitle>
              <SheetDescription>
                Selecciona año, periodo, origen y familia para analizar el desempeño comercial.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid gap-4">
              <FilterField
                label="Año"
                value={filters.year}
                options={familyFilterOptions.years}
                onValueChange={(value) => onFilterChange("year", value)}
              />
              <FilterField
                label="Periodo"
                value={filters.period}
                options={familyFilterOptions.periods}
                onValueChange={(value) => onFilterChange("period", value)}
              />
              <FilterField
                label="Origen"
                value={filters.origin}
                options={familyFilterOptions.origins}
                onValueChange={(value) => onFilterChange("origin", value)}
              />
              <FilterField
                label="Familia"
                value={filters.family}
                options={familyFilterOptions.families}
                onValueChange={(value) => onFilterChange("family", value)}
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

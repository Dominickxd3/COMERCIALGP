"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { CommercialFilterState } from "./commercial-data";
import { commercialFilterOptions } from "./commercial-data";

type CommercialFiltersProps = {
  filters: CommercialFilterState;
  onFilterChange: <K extends keyof CommercialFilterState>(key: K, value: CommercialFilterState[K]) => void;
};

function FilterField({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CommercialFilters({ filters, onFilterChange }: CommercialFiltersProps) {
  return (
    <>
      <Card className="hidden border-slate-200 bg-white shadow-sm lg:block">
        <CardContent className="grid grid-cols-4 gap-4 p-4">
          <FilterField
            label="Año"
            value={filters.year}
            options={commercialFilterOptions.years}
            onValueChange={(value) => onFilterChange("year", value)}
          />
          <FilterField
            label="Periodo"
            value={filters.period}
            options={commercialFilterOptions.periods}
            onValueChange={(value) => onFilterChange("period", value)}
          />
          <FilterField
            label="Origen"
            value={filters.origin}
            options={commercialFilterOptions.origins}
            onValueChange={(value) => onFilterChange("origin", value)}
          />
          <FilterField
            label="Fecha de corte"
            value={filters.versionCut}
            options={commercialFilterOptions.versionCuts}
            onValueChange={(value) => onFilterChange("versionCut", value)}
          />
        </CardContent>
      </Card>

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
              <SheetTitle>Filtros comerciales</SheetTitle>
              <SheetDescription>Ajusta año, periodo, origen y fecha de corte.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid gap-4">
              <FilterField
                label="Año"
                value={filters.year}
                options={commercialFilterOptions.years}
                onValueChange={(value) => onFilterChange("year", value)}
              />
              <FilterField
                label="Periodo"
                value={filters.period}
                options={commercialFilterOptions.periods}
                onValueChange={(value) => onFilterChange("period", value)}
              />
              <FilterField
                label="Origen"
                value={filters.origin}
                options={commercialFilterOptions.origins}
                onValueChange={(value) => onFilterChange("origin", value)}
              />
              <FilterField
                label="Fecha de corte"
                value={filters.versionCut}
                options={commercialFilterOptions.versionCuts}
                onValueChange={(value) => onFilterChange("versionCut", value)}
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

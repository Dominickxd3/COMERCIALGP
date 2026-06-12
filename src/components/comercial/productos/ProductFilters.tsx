"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { PeriodOption, ProductFiltersState } from "./product-data";
import { getProductOptions, getSubfamilyOptions, productFilterOptions } from "./product-data";

type ProductFiltersProps = {
  filters: ProductFiltersState;
  onFilterChange: <K extends keyof ProductFiltersState>(key: K, value: ProductFiltersState[K]) => void;
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

function SearchField({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5 xl:col-span-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Buscar producto o marca</p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Ej. Pechuga, Braedt, San Fernando"
          className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm"
        />
      </div>
    </div>
  );
}

function FiltersCard({ filters, onFilterChange }: ProductFiltersProps) {
  const subfamilyOptions = getSubfamilyOptions(filters.family);
  const productOptions = getProductOptions(filters.family, filters.subfamily);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-950">Filtros de producto</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Selecciona año, periodo, origen, familia, subfamilia y producto para analizar el desempeño comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <FilterField label="Año" value={filters.year} options={productFilterOptions.years} onValueChange={(value) => onFilterChange("year", value)} />
          <FilterField label="Periodo" value={filters.period} options={productFilterOptions.periods} onValueChange={(value) => onFilterChange("period", value)} />
          <FilterField label="Origen" value={filters.origin} options={productFilterOptions.origins} onValueChange={(value) => onFilterChange("origin", value)} />
          <FilterField label="Familia" value={filters.family} options={productFilterOptions.families} onValueChange={(value) => onFilterChange("family", value)} />
          <FilterField label="Subfamilia" value={filters.subfamily} options={subfamilyOptions} onValueChange={(value) => onFilterChange("subfamily", value)} />
          <FilterField label="Producto" value={filters.product} options={productOptions} onValueChange={(value) => onFilterChange("product", value)} />
          <SearchField value={filters.search} onValueChange={(value) => onFilterChange("search", value)} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const subfamilyOptions = getSubfamilyOptions(filters.family);
  const productOptions = getProductOptions(filters.family, filters.subfamily);

  return (
    <>
      <div className="hidden lg:block">
        <FiltersCard filters={filters} onFilterChange={onFilterChange} />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white shadow-sm">
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-4">
            <SheetHeader className="text-left">
              <SheetTitle>Filtros de producto</SheetTitle>
              <SheetDescription>
                Selecciona año, periodo, origen, familia, subfamilia y producto para analizar el desempeño comercial.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid gap-4">
              <FilterField label="Año" value={filters.year} options={productFilterOptions.years} onValueChange={(value) => onFilterChange("year", value)} />
              <FilterField label="Periodo" value={filters.period} options={productFilterOptions.periods} onValueChange={(value) => onFilterChange("period", value)} />
              <FilterField label="Origen" value={filters.origin} options={productFilterOptions.origins} onValueChange={(value) => onFilterChange("origin", value)} />
              <FilterField label="Familia" value={filters.family} options={productFilterOptions.families} onValueChange={(value) => onFilterChange("family", value)} />
              <FilterField label="Subfamilia" value={filters.subfamily} options={subfamilyOptions} onValueChange={(value) => onFilterChange("subfamily", value)} />
              <FilterField label="Producto" value={filters.product} options={productOptions} onValueChange={(value) => onFilterChange("product", value)} />
              <SearchField value={filters.search} onValueChange={(value) => onFilterChange("search", value)} />
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

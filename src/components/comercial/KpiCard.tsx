import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  title,
  value,
  delta,
  helper,
}: {
  title: string;
  value: string;
  delta: string;
  helper: string;
}) {
  const isPositive = delta.startsWith("+");
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {title}
          </CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className={isPositive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}
        >
          <Icon className="h-3.5 w-3.5" />
          {delta}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

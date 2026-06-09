import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ExecutiveSummaryCard({ summary }: { summary: string }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <Badge variant="outline" className="rounded-full border-[#D7E4FF] bg-[#EEF4FF] text-[#1D4ED8]">
          Resumen ejecutivo
        </Badge>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700 sm:text-[15px]">{summary}</p>
      </CardContent>
    </Card>
  );
}

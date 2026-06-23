import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJob } from "@/lib/refresh-jobs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");

  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Falta id del job" }, { status: 400 });
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json({ ok: false, error: "Job no encontrado" }, { status: 404 });
  }

  const base = {
    ok: true,
    state: job.state,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  };

  if (job.state === "done" && job.result) {
    return NextResponse.json({
      ...base,
      periodo: job.result.periodo,
      fecha: job.result.fecha,
      rowsAfterRefresh: job.result.rowsAfterRefresh,
      kpis: {
        totalKilos: job.result.data.totalKilos,
        totalToneladas: job.result.data.totalToneladas,
        totalVenta: job.result.data.totalVenta,
      },
      families: job.result.data.familyChartData,
      products: job.result.data.productsBySelectedFamily,
      topProductsByFamily: job.result.data.topProductsByFamily,
      options: {
        years: job.result.data.availableYears,
        periods: job.result.data.availablePeriods,
        weeks: job.result.data.availableWeeks,
        dates: job.result.data.availableDates,
        origins: job.result.data.availableOrigins,
      },
      resolvedFilters: job.result.data.resolvedFilters,
    });
  }

  if (job.state === "error") {
    return NextResponse.json({
      ...base,
      error: job.error,
    });
  }

  return NextResponse.json(base);
}

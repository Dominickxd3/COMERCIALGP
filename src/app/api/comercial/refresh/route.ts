import { NextResponse } from "next/server";
import { refreshCommercialData } from "@/lib/comercial-data";

export const runtime = "nodejs";

type RefreshBody = {
  year?: string;
  period?: string;
  week?: string;
  date?: string;
  origin?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RefreshBody;
    const result = await refreshCommercialData({
      year: body.year,
      period: body.period,
      week: body.week,
      date: body.date,
      origin: body.origin,
    });

    const warning =
      result.executed && result.rowsAfterRefresh === 0
        ? "No se generaron datos para esta version. Se mantiene la ultima version disponible."
        : null;

    if (process.env.NODE_ENV !== "production") {
      console.info("[comercial.refresh]", {
        periodo: result.periodo,
        fecha: result.fecha,
        rowsAfterRefresh: result.rowsAfterRefresh,
        warning,
      });
    }

    return NextResponse.json({
      ok: true,
      executedRefresh: result.executed,
      periodo: result.periodo,
      fecha: result.fecha,
      rowsAfterRefresh: result.rowsAfterRefresh,
      warning,
      kpis: {
        totalKilos: result.data.totalKilos,
        totalToneladas: result.data.totalToneladas,
        totalVenta: result.data.totalVenta,
      },
      families: result.data.familyChartData,
      products: result.data.productsBySelectedFamily,
      topProductsByFamily: result.data.topProductsByFamily,
      options: {
        years: result.data.availableYears,
        periods: result.data.availablePeriods,
        weeks: result.data.availableWeeks,
        dates: result.data.availableDates,
        origins: result.data.availableOrigins,
      },
      resolvedFilters: result.data.resolvedFilters,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo actualizar. Intenta nuevamente.",
      },
      { status: 500 },
    );
  }
}

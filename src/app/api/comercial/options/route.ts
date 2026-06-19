import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/comercial-data";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getDashboardData({
      year: searchParams.get("year"),
      period: searchParams.get("period"),
      week: searchParams.get("week"),
      date: searchParams.get("date"),
      origin: searchParams.get("origin"),
    });

    return NextResponse.json({
      years: data.availableYears,
      periods: data.availablePeriods,
      weeks: data.availableWeeks,
      dates: data.availableDates,
      origins: data.availableOrigins,
      resolvedFilters: data.resolvedFilters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load dashboard options.",
      },
      { status: 500 },
    );
  }
}

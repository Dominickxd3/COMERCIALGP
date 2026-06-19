import { NextResponse } from "next/server";
import { getDefaultCommercialFilters } from "@/lib/comercial-default-filters";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(getDefaultCommercialFilters());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load default filters.",
      },
      { status: 500 },
    );
  }
}

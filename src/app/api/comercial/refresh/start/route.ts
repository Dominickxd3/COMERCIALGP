import { NextResponse } from "next/server";
import { startRefreshJob } from "@/lib/refresh-jobs";

export const runtime = "nodejs";

type StartBody = {
  year?: string;
  period?: string;
  week?: string;
  date?: string;
  origin?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartBody;

    if (!body.year) {
      return NextResponse.json({ ok: false, error: "Falta año" }, { status: 400 });
    }

    const { jobId } = startRefreshJob({
      year: body.year,
      period: body.period,
      week: body.week,
      date: body.date,
      origin: body.origin,
    });

    return NextResponse.json({ ok: true, jobId });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar la actualización." },
      { status: 500 },
    );
  }
}

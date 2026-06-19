import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await getSqlPool();
    await pool.request().query("SELECT 1 AS ok");

    return NextResponse.json({
      status: "ok",
      app: "ComercialGP",
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        app: "ComercialGP",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    configured: Boolean(
      process.env.PAYDUNYA_MASTER_KEY &&
        process.env.PAYDUNYA_PRIVATE_KEY &&
        process.env.PAYDUNYA_TOKEN,
    ),
  });
}

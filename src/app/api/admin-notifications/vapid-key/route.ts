import { NextResponse } from "next/server";
import {
  getPushSetupError,
  getVapidPublicKey,
} from "@/lib/server/pushNotifications";

export const runtime = "nodejs";

export async function GET() {
  const setupError = getPushSetupError();

  return NextResponse.json({
    configured: !setupError,
    publicKey: getVapidPublicKey(),
    error: setupError,
  });
}

import { getRawDb } from "@/db";
import { accountUser } from "@/lib/account-auth";
import { leaderboard } from "@/lib/account-store";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const user = await accountUser(request), period = new URL(request.url).searchParams.get("period");
    return Response.json({ entries: await leaderboard(getRawDb(), user?.id || null, period || "today") }, { headers });
  } catch { return Response.json({ error: "UNAVAILABLE" }, { status: 503, headers }); }
}

import { NextResponse, type NextRequest } from "next/server";
import { isLang } from "@/lib/locales";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const first = request.nextUrl.pathname.split("/")[1];
  requestHeaders.set("x-magia-language", isLang(first) ? first : "es");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/((?!_next|assets|favicon.svg).*)"] };

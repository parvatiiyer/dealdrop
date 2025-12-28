// app/auth/callback/route.js
import { createServer } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect where user should land after login
  return NextResponse.redirect(new URL("/", request.url));
}


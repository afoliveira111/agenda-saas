import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "agenda_saas_dashboard_session"

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url))

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
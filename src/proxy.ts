import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "agenda_saas_dashboard_session"

export function proxy(request: NextRequest) {
  const sessionToken = process.env.DASHBOARD_SESSION_TOKEN

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "config")

    return NextResponse.redirect(loginUrl)
  }

  const currentSession = request.cookies.get(COOKIE_NAME)?.value

  if (currentSession === sessionToken) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  const nextUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`

  loginUrl.searchParams.set("next", nextUrl)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
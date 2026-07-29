import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "agenda_saas_session"

function getSafeNextUrl(request: NextRequest) {
  const nextUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`

  if (!nextUrl.startsWith("/")) {
    return "/dashboard"
  }

  if (nextUrl.startsWith("//")) {
    return "/dashboard"
  }

  return nextUrl
}

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)

  loginUrl.searchParams.set("next", getSafeNextUrl(request))

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
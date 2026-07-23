import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const remindersSecret = process.env.REMINDERS_API_SECRET

  const authorization = request.headers.get("authorization")
  const secretFromUrl = request.nextUrl.searchParams.get("secret")

  if (cronSecret && authorization === `Bearer ${cronSecret}`) {
    return true
  }

  if (remindersSecret && secretFromUrl === remindersSecret) {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Não autorizado.",
      },
      { status: 401 },
    )
  }

  const remindersSecret = process.env.REMINDERS_API_SECRET

  if (!remindersSecret) {
    return NextResponse.json(
      {
        status: "error",
        message: "REMINDERS_API_SECRET não configurado.",
      },
      { status: 500 },
    )
  }

  const remindersUrl = new URL(
    "/api/reminders/send-booking-reminders",
    request.nextUrl.origin,
  )

  remindersUrl.searchParams.set("secret", remindersSecret)

  const response = await fetch(remindersUrl, {
    method: "GET",
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  return NextResponse.json(
    {
      status: response.ok ? "ok" : "error",
      source: "cron",
      reminders: data,
    },
    { status: response.ok ? 200 : 500 },
  )
}
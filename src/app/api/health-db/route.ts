import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function isAuthorized(request: NextRequest) {
  const secret =
    process.env.CRON_SECRET?.trim() ||
    process.env.REMINDERS_API_SECRET?.trim()

  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }

  const authorization = request.headers.get("authorization")

  return authorization === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Não autorizado.",
      },
      { status: 401 }
    )
  }

  try {
    const businessesCount = await prisma.business.count()

    return NextResponse.json({
      status: "ok",
      database: "connected",
      businessesCount,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        status: "error",
        database: "not connected",
      },
      { status: 500 }
    )
  }
}
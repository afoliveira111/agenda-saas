import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function isAuthorized(request: NextRequest) {
  const secret = process.env.REMINDERS_API_SECRET

  if (!secret) {
    return true
  }

  const authorization = request.headers.get("authorization")
  const secretFromUrl = request.nextUrl.searchParams.get("secret")

  return authorization === `Bearer ${secret}` || secretFromUrl === secret
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
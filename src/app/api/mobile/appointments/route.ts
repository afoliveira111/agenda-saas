import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request)

    if (!session) {
      return NextResponse.json(
        {
          message: "Não autorizado.",
        },
        {
          status: 401,
        }
      )
    }

    const businessId = session.user.businessId

    if (!businessId) {
      return NextResponse.json(
        {
          message: "Utilizador sem negócio associado.",
        },
        {
          status: 403,
        }
      )
    }

    const now = new Date()

    const from = new Date(now)
    from.setUTCDate(from.getUTCDate() - 1)

    const until = new Date(now)
    until.setUTCDate(until.getUTCDate() + 7)

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        startAt: {
          gte: from,
          lt: until,
        },
      },

      orderBy: {
        startAt: "asc",
      },

      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        totalPriceCents: true,
        totalDurationMin: true,

        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },

        services: {
          select: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const appointments = bookings.map((booking) => ({
      id: booking.id,

      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email,

      serviceName: booking.services
        .map((item) => item.service.name)
        .join(" + "),

      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),

      durationMinutes: booking.totalDurationMin,
      totalPriceCents: booking.totalPriceCents,

      status: booking.status,
    }))

    return NextResponse.json({
      appointments,
    })
  } catch (error) {
    console.error("Mobile appointments error:", error)

    return NextResponse.json(
      {
        message: "Não foi possível carregar os agendamentos.",
      },
      {
        status: 500,
      }
    )
  }
}
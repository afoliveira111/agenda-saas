import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBookingReminderEmail } from "@/lib/email"

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

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
        ok: false,
        error: "Não autorizado.",
      },
      { status: 401 }
    )
  }

  const testNext = request.nextUrl.searchParams.get("testNext") === "true"

  const now = new Date()

  const windowStart = addHours(now, 23)
  const windowEnd = addHours(now, 25)

  const bookings = await prisma.booking.findMany({
    where: testNext
      ? {
          status: "CONFIRMED",
          reminderEmailSentAt: null,
          customer: {
            email: {
              not: null,
            },
          },
          startAt: {
            gte: now,
          },
        }
      : {
          status: "CONFIRMED",
          reminderEmailSentAt: null,
          customer: {
            email: {
              not: null,
            },
          },
          startAt: {
            gte: windowStart,
            lt: windowEnd,
          },
        },
    orderBy: {
      startAt: "asc",
    },
    take: testNext ? 1 : 50,
    include: {
      business: true,
      customer: true,
      services: {
        include: {
          service: true,
        },
      },
    },
  })

  const results = []

  for (const booking of bookings) {
    const sent = await sendBookingReminderEmail({
      business: {
        name: booking.business.name,
        email: booking.business.email,
        notificationEmail: booking.business.notificationEmail,
        phone: booking.business.phone,
        address: booking.business.address,
        slug: booking.business.slug,
      },
      customer: {
        name: booking.customer.name,
        phone: booking.customer.phone,
        email: booking.customer.email,
      },
      booking: {
        id: booking.id,
        startAt: booking.startAt,
        endAt: booking.endAt,
        totalPriceCents: booking.totalPriceCents,
        totalDurationMin: booking.totalDurationMin,
      },
      services: booking.services.map((item) => ({
        name: item.service.name,
        priceCents: item.priceCents,
        durationMin: item.durationMin,
      })),
    })

    if (sent) {
      await prisma.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          reminderEmailSentAt: new Date(),
        },
      })
    }

    results.push({
      bookingId: booking.id,
      customer: booking.customer.name,
      email: booking.customer.email,
      sent,
    })
  }

  return NextResponse.json({
    ok: true,
    mode: testNext ? "testNext" : "scheduled",
    found: bookings.length,
    results,
  })
}
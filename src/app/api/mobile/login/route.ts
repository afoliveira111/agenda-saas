import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth"
import { createMobileSession } from "@/lib/mobile-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : ""

    const password =
      typeof body.password === "string"
        ? body.password
        : ""

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email e palavra-passe são obrigatórios.",
        },
        {
          status: 400,
        }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        business: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          message: "Credenciais inválidas.",
        },
        {
          status: 401,
        }
      )
    }

    const validPassword = verifyPassword(
      password,
      user.passwordHash
    )

    if (!validPassword) {
      return NextResponse.json(
        {
          message: "Credenciais inválidas.",
        },
        {
          status: 401,
        }
      )
    }

    if (!user.businessId || !user.business) {
      return NextResponse.json(
        {
          message: "Este utilizador não está associado a um negócio.",
        },
        {
          status: 403,
        }
      )
    }

    const session = await createMobileSession(user.id)

    return NextResponse.json({
      token: session.token,

      expiresAt: session.expiresAt.toISOString(),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      business: {
        id: user.business.id,
        name: user.business.name,
        slug: user.business.slug,
      },
    })
  } catch (error) {
    console.error("Mobile login error:", error)

    return NextResponse.json(
      {
        message: "Não foi possível iniciar sessão.",
      },
      {
        status: 500,
      }
    )
  }
}
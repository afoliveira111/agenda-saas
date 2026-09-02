import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

const MOBILE_SESSION_DAYS = 7

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function createMobileSession(userId: string) {
  const token = randomBytes(32).toString("hex")
  const tokenHash = hashToken(token)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + MOBILE_SESSION_DAYS)

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  })

  return {
    token,
    expiresAt,
  }
}

export async function getMobileSession(request: Request) {
  const authorization = request.headers.get("authorization")

  if (!authorization) {
    return null
  }

  if (!authorization.startsWith("Bearer ")) {
    return null
  }

  const token = authorization
    .slice("Bearer ".length)
    .trim()

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: {
        include: {
          business: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    await prisma.session
      .delete({
        where: {
          id: session.id,
        },
      })
      .catch(() => null)

    return null
  }

  return session
}
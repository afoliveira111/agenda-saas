"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createPasswordHash, requireAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function redirectWithError(message: string): never {
  redirect(`/admin/users?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/admin/users?success=${encodeURIComponent(message)}`)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function createUserAction(formData: FormData) {
  await requireAdminSession("/admin/users")

  const name = normalizeText(formData.get("name"))
  const email = normalizeEmail(normalizeText(formData.get("email")))
  const password = normalizeText(formData.get("password"))
  const role = normalizeText(formData.get("role"))
  const businessId = normalizeText(formData.get("businessId"))

  if (name.length < 2 || name.length > 80) {
    redirectWithError("O nome deve ter entre 2 e 80 caracteres.")
  }

  if (!isValidEmail(email)) {
    redirectWithError("Informe um e-mail válido.")
  }

  if (password.length < 6) {
    redirectWithError("A senha deve ter pelo menos 6 caracteres.")
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirectWithError("Tipo de utilizador inválido.")
  }

  if (role === "OWNER" && !businessId) {
    redirectWithError("Selecione o negócio do gerente.")
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    redirectWithError("Já existe um utilizador com este e-mail.")
  }

  if (role === "OWNER") {
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    })

    if (!business) {
      redirectWithError("Negócio não encontrado.")
    }
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: createPasswordHash(password),
      role,
      businessId: role === "OWNER" ? businessId : null,
    },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  revalidatePath("/dashboard/businesses")

  redirectWithSuccess("Utilizador criado com sucesso.")
}

export async function updateUserRoleAction(formData: FormData) {
  const session = await requireAdminSession("/admin/users")

  const userId = normalizeText(formData.get("userId"))
  const role = normalizeText(formData.get("role"))
  const businessId = normalizeText(formData.get("businessId"))

  if (!userId) {
    redirectWithError("Utilizador não encontrado.")
  }

  if (userId === session.user.id) {
    redirectWithError(
      "Não é possível alterar as permissões do utilizador que está logado.",
    )
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirectWithError("Tipo de utilizador inválido.")
  }

  if (role === "OWNER" && !businessId) {
    redirectWithError("Selecione o negócio do gerente.")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    redirectWithError("Utilizador não encontrado.")
  }

  if (role === "OWNER") {
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    })

    if (!business) {
      redirectWithError("Negócio não encontrado.")
    }
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      role,
      businessId: role === "OWNER" ? businessId : null,
    },
  })

  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  revalidatePath("/dashboard/businesses")

  redirectWithSuccess("Permissões atualizadas com sucesso.")
}

export async function updateUserPasswordAction(formData: FormData) {
  const session = await requireAdminSession("/admin/users")

  const userId = normalizeText(formData.get("userId"))
  const password = normalizeText(formData.get("password"))

  if (!userId) {
    redirectWithError("Utilizador não encontrado.")
  }

  if (password.length < 6) {
    redirectWithError("A nova senha deve ter pelo menos 6 caracteres.")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    redirectWithError("Utilizador não encontrado.")
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: createPasswordHash(password),
    },
  })

  if (user.id !== session.user.id) {
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    })
  }

  revalidatePath("/admin/users")
  revalidatePath("/admin")

  redirectWithSuccess("Senha atualizada com sucesso.")
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireAdminSession("/admin/users")

  const userId = normalizeText(formData.get("userId"))

  if (!userId) {
    redirectWithError("Utilizador não encontrado.")
  }

  if (userId === session.user.id) {
    redirectWithError("Não é possível apagar o utilizador que está logado.")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    redirectWithError("Utilizador não encontrado.")
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    })

    if (adminCount <= 1) {
      redirectWithError("Não é possível apagar o único ADMIN da plataforma.")
    }
  }

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  revalidatePath("/dashboard/businesses")

  redirectWithSuccess("Utilizador apagado com sucesso.")
}
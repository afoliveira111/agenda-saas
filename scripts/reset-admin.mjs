import fs from "fs"
import path from "path"
import { randomBytes, scryptSync } from "crypto"
import readline from "readline/promises"
import { stdin as input, stdout as output } from "process"
import pg from "pg"

const { Client } = pg

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env")

  if (!fs.existsSync(envPath)) {
    return
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue
    }

    const equalIndex = trimmedLine.indexOf("=")

    if (equalIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, equalIndex).trim()
    let value = trimmedLine.slice(equalIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")

  return `scrypt:${salt}:${hash}`
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

loadDotEnv()

const connectionString =
  process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("Erro: DATABASE_URL ou DIRECT_DATABASE_URL não encontrada.")
  process.exit(1)
}

const rl = readline.createInterface({ input, output })

try {
  const nameAnswer = await rl.question("Nome do ADMIN: ")
  const emailAnswer = await rl.question("E-mail do ADMIN: ")
  const passwordAnswer = await rl.question("Nova senha do ADMIN: ")

  const name = nameAnswer.trim() || "Administrador"
  const email = normalizeEmail(emailAnswer)
  const password = passwordAnswer.trim()

  if (!validateEmail(email)) {
    console.error("Erro: e-mail inválido.")
    process.exit(1)
  }

  if (password.length < 6) {
    console.error("Erro: a senha precisa ter pelo menos 6 caracteres.")
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes("neon.tech")
      ? { rejectUnauthorized: true }
      : undefined,
  })

  await client.connect()

  const id = `user_${randomBytes(12).toString("hex")}`
  const passwordHash = createPasswordHash(password)

  const result = await client.query(
    `
      INSERT INTO "User"
        ("id", "name", "email", "passwordHash", "role", "businessId", "createdAt", "updatedAt")
      VALUES
        ($1, $2, $3, $4, 'ADMIN', NULL, NOW(), NOW())
      ON CONFLICT ("email")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "passwordHash" = EXCLUDED."passwordHash",
        "role" = 'ADMIN',
        "businessId" = NULL,
        "updatedAt" = NOW()
      RETURNING "id", "email", "role"
    `,
    [id, name, email, passwordHash],
  )

  const adminUser = result.rows[0]

  await client.query(
    `
      DELETE FROM "Session"
      WHERE "userId" = $1
    `,
    [adminUser.id],
  )

  await client.end()

  console.log("")
  console.log("ADMIN pronto com sucesso.")
  console.log(`E-mail: ${adminUser.email}`)
  console.log(`Tipo: ${adminUser.role}`)
  console.log("")
  console.log("Agora podes entrar em /login com esse e-mail e a nova senha.")
} finally {
  rl.close()
}
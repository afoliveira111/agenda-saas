import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})

const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.bookingService.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.service.deleteMany()
  await prisma.workHour.deleteMany()
  await prisma.blockedDay.deleteMany()
  await prisma.business.deleteMany()

  const business = await prisma.business.create({
    data: {
      name: "Essência Beauty Lounge",
      slug: "demo",
      phone: "351912345678",
      email: "contacto@essencia.pt",
      notificationEmail: "laisvieira.oliveirapt@gmail.com",
      address: "Coimbra, Portugal",
      description: "Serviços de beleza, unhas, sobrancelhas e pestanas.",
    },
  })

  await prisma.service.createMany({
    data: [
      {
        businessId: business.id,
        name: "Manicure Verniz Gel",
        description: "Manicure com aplicação de verniz gel.",
        priceCents: 1500,
        durationMin: 60,
      },
      {
        businessId: business.id,
        name: "Alongamento Gel",
        description: "Alongamento de unhas em gel.",
        priceCents: 3200,
        durationMin: 120,
      },
      {
        businessId: business.id,
        name: "Design de Sobrancelhas",
        description: "Design personalizado de sobrancelhas.",
        priceCents: 1200,
        durationMin: 30,
      },
      {
        businessId: business.id,
        name: "Lash Lifting",
        description: "Elevação e curvatura natural das pestanas.",
        priceCents: 3500,
        durationMin: 50,
      },
    ],
  })

  await prisma.workHour.createMany({
    data: [
      {
        businessId: business.id,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
      {
        businessId: business.id,
        dayOfWeek: 2,
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
      {
        businessId: business.id,
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
      {
        businessId: business.id,
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
      {
        businessId: business.id,
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
      {
        businessId: business.id,
        dayOfWeek: 6,
        startTime: "09:00",
        endTime: "13:00",
        active: true,
      },
      {
        businessId: business.id,
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "13:00",
        active: false,
      },
    ],
  })

  console.log("Seed criado com sucesso!")
  console.log(`Negócio: ${business.name}`)
  console.log(`E-mail de notificação: ${business.notificationEmail}`)
  console.log(`Link público: /book/${business.slug}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
type EmailRecipient = {
  email: string
  name?: string
}

type SendTransactionalEmailParams = {
  to: EmailRecipient[]
  subject: string
  htmlContent: string
  textContent: string
}

type BookingEmailService = {
  name: string
  priceCents: number
  durationMin: number
}

type BookingCreatedEmailParams = {
  business: {
    name: string
    email: string | null
    notificationEmail: string | null
    phone: string | null
    address: string | null
    slug: string
  }
  customer: {
    name: string
    phone: string | null
    email: string | null
  }
  booking: {
    id: string
    startAt: Date
    endAt: Date
    totalPriceCents: number
    totalDurationMin: number
  }
  services: BookingEmailService[]
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: SendTransactionalEmailParams) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || "Agenda SaaS"

  if (!apiKey || !senderEmail) {
    console.warn(
      "E-mail ignorado: configure BREVO_API_KEY e BREVO_SENDER_EMAIL."
    )
    return
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to,
      subject,
      htmlContent,
      textContent,
    }),
  })

  if (!response.ok) {
    const responseText = await response.text()

    throw new Error(
      `Erro ao enviar e-mail pela Brevo: ${response.status} ${responseText}`
    )
  }
}

function buildServicesText(services: BookingEmailService[]) {
  return services
    .map((service) => {
      return `- ${service.name} (${service.durationMin} min) - ${formatPrice(
        service.priceCents
      )}`
    })
    .join("\n")
}

function buildServicesHtml(services: BookingEmailService[]) {
  return services
    .map((service) => {
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>${escapeHtml(service.name)}</strong><br />
            <span style="color: #71717a;">${service.durationMin} minutos</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
            <strong>${formatPrice(service.priceCents)}</strong>
          </td>
        </tr>
      `
    })
    .join("")
}

function createClientEmailHtml({
  business,
  customer,
  booking,
  services,
}: BookingCreatedEmailParams) {
  return `
    <div style="margin: 0; padding: 0; background: #f4f4f5; font-family: Arial, sans-serif; color: #18181b;">
      <div style="max-width: 620px; margin: 0 auto; padding: 32px 16px;">
        <div style="background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #09090b; padding: 32px; color: #ffffff;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #a1a1aa;">
              Marcação confirmada
            </p>
            <h1 style="margin: 16px 0 0; font-size: 28px;">
              Olá, ${escapeHtml(customer.name)}
            </h1>
            <p style="margin: 16px 0 0; color: #d4d4d8;">
              A sua marcação em ${escapeHtml(business.name)} foi confirmada.
            </p>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; font-size: 20px;">Detalhes da marcação</h2>

            <p style="margin: 0 0 8px;"><strong>Data:</strong> ${formatDate(
              booking.startAt
            )}</p>
            <p style="margin: 0 0 8px;"><strong>Horário:</strong> ${formatTime(
              booking.startAt
            )} - ${formatTime(booking.endAt)}</p>
            <p style="margin: 0 0 24px;"><strong>Duração total:</strong> ${
              booking.totalDurationMin
            } minutos</p>

            <table style="width: 100%; border-collapse: collapse;">
              ${buildServicesHtml(services)}
            </table>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #18181b; display: flex; justify-content: space-between;">
              <strong>Total estimado</strong>
              <strong>${formatPrice(booking.totalPriceCents)}</strong>
            </div>

            ${
              business.address
                ? `<p style="margin: 24px 0 0;"><strong>Morada:</strong> ${escapeHtml(
                    business.address
                  )}</p>`
                : ""
            }

            ${
              business.phone
                ? `<p style="margin: 8px 0 0;"><strong>Contacto:</strong> +${escapeHtml(
                    business.phone
                  )}</p>`
                : ""
            }

            <p style="margin: 28px 0 0; color: #71717a; font-size: 14px;">
              Caso precise alterar ou cancelar a marcação, entre em contacto diretamente com o estabelecimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

function createClientEmailText({
  business,
  customer,
  booking,
  services,
}: BookingCreatedEmailParams) {
  return `
Olá, ${customer.name}.

A sua marcação em ${business.name} foi confirmada.

Data: ${formatDate(booking.startAt)}
Horário: ${formatTime(booking.startAt)} - ${formatTime(booking.endAt)}
Duração total: ${booking.totalDurationMin} minutos

Serviços:
${buildServicesText(services)}

Total estimado: ${formatPrice(booking.totalPriceCents)}

${business.address ? `Morada: ${business.address}` : ""}
${business.phone ? `Contacto: +${business.phone}` : ""}

Caso precise alterar ou cancelar a marcação, entre em contacto diretamente com o estabelecimento.
`.trim()
}

function createBusinessEmailHtml({
  business,
  customer,
  booking,
  services,
}: BookingCreatedEmailParams) {
  return `
    <div style="margin: 0; padding: 0; background: #f4f4f5; font-family: Arial, sans-serif; color: #18181b;">
      <div style="max-width: 620px; margin: 0 auto; padding: 32px 16px;">
        <div style="background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #09090b; padding: 32px; color: #ffffff;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #a1a1aa;">
              Nova marcação recebida
            </p>
            <h1 style="margin: 16px 0 0; font-size: 28px;">
              ${escapeHtml(customer.name)}
            </h1>
            <p style="margin: 16px 0 0; color: #d4d4d8;">
              Uma nova marcação foi registada em ${escapeHtml(business.name)}.
            </p>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; font-size: 20px;">Cliente</h2>

            <p style="margin: 0 0 8px;"><strong>Nome:</strong> ${escapeHtml(
              customer.name
            )}</p>
            <p style="margin: 0 0 8px;"><strong>Telefone:</strong> ${
              customer.phone ? escapeHtml(customer.phone) : "Não informado"
            }</p>
            <p style="margin: 0 0 24px;"><strong>E-mail:</strong> ${
              customer.email ? escapeHtml(customer.email) : "Não informado"
            }</p>

            <h2 style="margin: 0 0 16px; font-size: 20px;">Marcação</h2>

            <p style="margin: 0 0 8px;"><strong>Data:</strong> ${formatDate(
              booking.startAt
            )}</p>
            <p style="margin: 0 0 8px;"><strong>Horário:</strong> ${formatTime(
              booking.startAt
            )} - ${formatTime(booking.endAt)}</p>
            <p style="margin: 0 0 24px;"><strong>Duração total:</strong> ${
              booking.totalDurationMin
            } minutos</p>

            <table style="width: 100%; border-collapse: collapse;">
              ${buildServicesHtml(services)}
            </table>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #18181b; display: flex; justify-content: space-between;">
              <strong>Total estimado</strong>
              <strong>${formatPrice(booking.totalPriceCents)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function createBusinessEmailText({
  business,
  customer,
  booking,
  services,
}: BookingCreatedEmailParams) {
  return `
Nova marcação recebida em ${business.name}.

Cliente:
Nome: ${customer.name}
Telefone: ${customer.phone || "Não informado"}
E-mail: ${customer.email || "Não informado"}

Marcação:
Data: ${formatDate(booking.startAt)}
Horário: ${formatTime(booking.startAt)} - ${formatTime(booking.endAt)}
Duração total: ${booking.totalDurationMin} minutos

Serviços:
${buildServicesText(services)}

Total estimado: ${formatPrice(booking.totalPriceCents)}
`.trim()
}

export async function sendBookingCreatedEmails(
  params: BookingCreatedEmailParams
) {
  const customerEmail = params.customer.email
  const businessNotificationEmail =
  params.business.notificationEmail ||
  params.business.email ||
  process.env.BUSINESS_NOTIFICATION_EMAIL

  const emailsToSend: Promise<void>[] = []

  if (customerEmail) {
    emailsToSend.push(
      sendTransactionalEmail({
        to: [
          {
            email: customerEmail,
            name: params.customer.name,
          },
        ],
        subject: `Confirmação da sua marcação - ${params.business.name}`,
        htmlContent: createClientEmailHtml(params),
        textContent: createClientEmailText(params),
      })
    )
  }

  if (businessNotificationEmail) {
    emailsToSend.push(
      sendTransactionalEmail({
        to: [
          {
            email: businessNotificationEmail,
            name: params.business.name,
          },
        ],
        subject: `Nova marcação - ${params.customer.name}`,
        htmlContent: createBusinessEmailHtml(params),
        textContent: createBusinessEmailText(params),
      })
    )
  }

  const results = await Promise.allSettled(emailsToSend)

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Falha ao enviar e-mail transacional:", result.reason)
    }
  })
}
type BookingReminderEmailParams = BookingCreatedEmailParams

function createClientReminderEmailHtml({
  business,
  customer,
  booking,
  services,
}: BookingReminderEmailParams) {
  return `
    <div style="margin: 0; padding: 0; background: #f4f4f5; font-family: Arial, sans-serif; color: #18181b;">
      <div style="max-width: 620px; margin: 0 auto; padding: 32px 16px;">
        <div style="background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #09090b; padding: 32px; color: #ffffff;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #a1a1aa;">
              Lembrete de marcação
            </p>
            <h1 style="margin: 16px 0 0; font-size: 28px;">
              Olá, ${escapeHtml(customer.name)}
            </h1>
            <p style="margin: 16px 0 0; color: #d4d4d8;">
              A sua marcação em ${escapeHtml(business.name)} está chegando.
            </p>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; font-size: 20px;">Detalhes da marcação</h2>

            <p style="margin: 0 0 8px;"><strong>Data:</strong> ${formatDate(
              booking.startAt
            )}</p>

            <p style="margin: 0 0 8px;"><strong>Horário:</strong> ${formatTime(
              booking.startAt
            )} - ${formatTime(booking.endAt)}</p>

            <p style="margin: 0 0 24px;"><strong>Duração total:</strong> ${
              booking.totalDurationMin
            } minutos</p>

            <table style="width: 100%; border-collapse: collapse;">
              ${buildServicesHtml(services)}
            </table>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #18181b;">
              <p style="margin: 0;">
                <strong>Total estimado:</strong> ${formatPrice(
                  booking.totalPriceCents
                )}
              </p>
            </div>

            ${
              business.address
                ? `<p style="margin: 24px 0 0;"><strong>Morada:</strong> ${escapeHtml(
                    business.address
                  )}</p>`
                : ""
            }

            ${
              business.phone
                ? `<p style="margin: 8px 0 0;"><strong>Contacto:</strong> +${escapeHtml(
                    business.phone
                  )}</p>`
                : ""
            }

            <p style="margin: 28px 0 0; color: #71717a; font-size: 14px;">
              Caso precise alterar ou cancelar, entre em contacto diretamente com o estabelecimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

function createClientReminderEmailText({
  business,
  customer,
  booking,
  services,
}: BookingReminderEmailParams) {
  return `
Olá, ${customer.name}.

Este é um lembrete da sua marcação em ${business.name}.

Data: ${formatDate(booking.startAt)}
Horário: ${formatTime(booking.startAt)} - ${formatTime(booking.endAt)}
Duração total: ${booking.totalDurationMin} minutos

Serviços:
${buildServicesText(services)}

Total estimado: ${formatPrice(booking.totalPriceCents)}

${business.address ? `Morada: ${business.address}` : ""}
${business.phone ? `Contacto: +${business.phone}` : ""}

Caso precise alterar ou cancelar, entre em contacto diretamente com o estabelecimento.
`.trim()
}

export async function sendBookingReminderEmail(
  params: BookingReminderEmailParams
) {
  const customerEmail = params.customer.email

  if (!customerEmail) {
    return false
  }

  try {
    await sendTransactionalEmail({
      to: [
        {
          email: customerEmail,
          name: params.customer.name,
        },
      ],
      subject: `Lembrete da sua marcação - ${params.business.name}`,
      htmlContent: createClientReminderEmailHtml(params),
      textContent: createClientReminderEmailText(params),
    })

    return true
  } catch (error) {
    console.error("Falha ao enviar lembrete por e-mail:", error)
    return false
  }
}
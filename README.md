# MarcaFlow — Sistema de Marcações Online

O **MarcaFlow** é um SaaS multiempresa de gestão de agendamentos desenvolvido para salões de beleza, clínicas estéticas, barbearias, profissionais independentes e pequenos negócios que trabalham com marcações.

Cada negócio possui uma página pública própria, onde o cliente pode selecionar serviços, consultar horários disponíveis e realizar uma marcação online.

Os responsáveis pelo negócio utilizam um painel administrativo para gerir serviços, categorias, clientes, horários, bloqueios, marcações e configurações.

O ecossistema também inclui uma aplicação **Android nativa desenvolvida em Kotlin e Jetpack Compose**, integrada ao mesmo backend através de REST APIs autenticadas.

---

## Estado do projeto

O MarcaFlow encontra-se em desenvolvimento e validação em ambiente real.

Atualmente estão funcionais:

- SaaS multiempresa
- Página pública de reservas
- Painel administrativo
- Gestão de utilizadores e perfis
- Gestão de múltiplos negócios
- Gestão de serviços
- Gestão de categorias
- Gestão de horários
- Gestão de dias indisponíveis
- Gestão de clientes
- Gestão de marcações
- Reagendamento
- Estados das marcações
- Validação de conflitos de horários
- Notificações por e-mail
- Lembretes automáticos
- Aplicação Android nativa
- Login mobile
- Autenticação mobile através de Bearer Token
- Consulta dos agendamentos reais através da aplicação Android

---

# Funcionalidades

## Página pública de marcação

Cada negócio possui uma página pública própria, por exemplo:

```text
/book/demo
```

Funcionalidades disponíveis:

- Seleção de um ou mais serviços
- Serviços organizados por categorias
- Cálculo automático do preço total
- Cálculo automático da duração total do atendimento
- Consulta de datas disponíveis
- Consulta de horários disponíveis
- Disponibilidade calculada de acordo com o expediente do negócio
- Bloqueio automático de horários ocupados
- Bloqueio de dias indisponíveis
- Validação de disponibilidade no servidor
- Prevenção de conflitos de horários
- Formulário com nome, telefone e e-mail
- Página de confirmação após a marcação
- Token público para acesso à página de sucesso
- Layout responsivo para desktop e dispositivos móveis
- Temas visuais: Branco, Nude e Premium
- Proteção contra submissões repetidas no formulário público

---

## Painel do gerente

O responsável pelo negócio possui acesso ao painel administrativo.

Funcionalidades:

- Visão geral do negócio
- Gestão de serviços
- Gestão de categorias
- Ativação e desativação de serviços
- Gestão dos horários semanais
- Bloqueio de dias específicos
- Listagem de marcações
- Consulta de detalhes da marcação
- Reagendamento
- Alteração do estado da marcação
- Histórico de clientes
- Contacto do cliente através do WhatsApp
- Configuração dos dados públicos do negócio
- Configuração do tema visual da página pública

---

## Administração da plataforma

A plataforma também possui uma área administrativa destinada à gestão do SaaS.

Funcionalidades:

- Login privado
- Gestão de utilizadores
- Gestão de múltiplos negócios
- Associação de utilizadores a negócios
- Perfis de acesso
- Seleção do negócio ativo
- Temas visuais para a área administrativa
- Ferramentas internas para gestão e limpeza de dados de teste

Os perfis atualmente utilizados são:

```text
ADMIN
OWNER
```

### ADMIN

Possui acesso à administração geral da plataforma.

### OWNER

Possui acesso ao painel do negócio associado à sua conta.

Na interface, o perfil `OWNER` é apresentado como **Gerente**.

---

# Aplicação Android

O MarcaFlow também possui uma aplicação Android nativa destinada aos responsáveis pelos negócios cadastrados na plataforma.

A aplicação utiliza o mesmo backend e os mesmos dados do SaaS web.

## Tecnologias Android

- Kotlin
- Android SDK
- Jetpack Compose
- Material 3
- MVVM
- Coroutines
- StateFlow
- Repository Pattern
- Retrofit
- REST APIs

---

## Funcionalidades Android implementadas

- Login do utilizador
- Autenticação através de Bearer Token
- Comunicação com a API real do MarcaFlow
- Identificação automática do negócio associado ao utilizador
- Consulta dos próximos agendamentos
- Atualização manual da agenda
- Estados de loading, sucesso e erro
- Visualização dos dados da marcação

Cada item da agenda apresenta:

- Horário
- Data
- Cliente
- Serviço
- Duração
- Preço
- Estado da marcação

---

## Fluxo Android

```text
Android App
    ↓
Kotlin
    ↓
Jetpack Compose
    ↓
MVVM
    ↓
StateFlow
    ↓
Repository
    ↓
Retrofit
    ↓
REST API
    ↓
Next.js
    ↓
Prisma ORM
    ↓
PostgreSQL
```

Uma marcação realizada através da página pública do MarcaFlow é persistida no PostgreSQL e pode ser consultada pela aplicação Android através da API mobile.

---

# API Mobile

Foram criados endpoints específicos para integração entre o backend do MarcaFlow e a aplicação Android.

---

## Login Mobile

Endpoint:

```http
POST /api/mobile/login
```

Exemplo de request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Após validar as credenciais, o backend cria uma sessão e retorna um token.

Exemplo de resposta:

```json
{
  "token": "...",
  "expiresAt": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "OWNER"
  },
  "business": {
    "id": "...",
    "name": "...",
    "slug": "..."
  }
}
```

O token deve ser enviado posteriormente através do header:

```http
Authorization: Bearer <TOKEN>
```

---

## Consulta dos agendamentos

Endpoint:

```http
GET /api/mobile/appointments
```

Exemplo:

```http
Authorization: Bearer <TOKEN>
```

O backend:

1. valida o token;
2. identifica a sessão;
3. identifica o utilizador;
4. identifica o negócio associado;
5. consulta apenas as marcações desse negócio.

Exemplo de resposta:

```json
{
  "appointments": [
    {
      "id": "...",
      "customerName": "Cliente",
      "customerPhone": "...",
      "customerEmail": "...",
      "serviceName": "Serviço",
      "startAt": "2026-09-04T09:30:00.000Z",
      "endAt": "2026-09-04T10:00:00.000Z",
      "durationMinutes": 30,
      "totalPriceCents": 3500,
      "status": "CONFIRMED"
    }
  ]
}
```

---

# Notificações

O sistema possui integração com a **Brevo API** para envio de e-mails automáticos.

Funcionalidades implementadas:

- E-mail automático ao cliente após uma marcação
- E-mail automático ao negócio
- E-mail automático após reagendamento
- Lembretes automáticos antes da marcação
- Proteção contra envio duplicado de lembretes

A arquitetura também está preparada para futuras integrações com:

- SMS
- WhatsApp Business API

---

# Tecnologias utilizadas

## Web / Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- HTML
- CSS

## Backend

- Next.js Route Handlers
- TypeScript
- REST APIs
- Prisma ORM

## Base de dados

- PostgreSQL
- Neon Database
- Prisma ORM

## Android

- Kotlin
- Android SDK
- Jetpack Compose
- Material 3
- MVVM
- Coroutines
- StateFlow
- Retrofit

## Serviços externos

- Brevo API
- Vercel
- Neon Database

## Ferramentas

- Git
- GitHub
- npm
- Prisma CLI
- Android Studio
- VS Code

---

# Arquitetura geral

```text
                     ┌─────────────────────┐
                     │   Página pública    │
                     │    Next.js/React    │
                     └──────────┬──────────┘
                                │
                                │
                     ┌──────────▼──────────┐
                     │   Next.js Backend   │
                     │      REST APIs      │
                     └──────────┬──────────┘
                                │
                          Prisma ORM
                                │
                     ┌──────────▼──────────┐
                     │     PostgreSQL      │
                     │    Neon Database    │
                     └──────────▲──────────┘
                                │
                                │
                     ┌──────────┴──────────┐
                     │    Android App      │
                     │ Kotlin + Compose    │
                     │ Retrofit + MVVM     │
                     └─────────────────────┘
```

---

# Estrutura principal do projeto

A estrutura abaixo representa as principais áreas do SaaS.

Diretórios gerados ou exclusivamente locais como `.next`, `node_modules`, backups e ficheiros `.env` não são apresentados.

```text
agenda-saas/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── scripts/
│   └── reset-admin.mjs
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── actions.ts
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── actions.ts
│   │   │   ├── AdminBusinessThemeSelector.tsx
│   │   │   ├── AdminThemeFrame.tsx
│   │   │   ├── AdminThemeQuickSwitcher.tsx
│   │   │   ├── AdminThemeSelector.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   │
│   │   │   ├── cron/
│   │   │   │   └── send-booking-reminders/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── health-db/
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── mobile/
│   │   │   │   ├── appointments/
│   │   │   │   │   └── route.ts
│   │   │   │   │
│   │   │   │   └── login/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── reminders/
│   │   │       └── send-booking-reminders/
│   │   │           └── route.ts
│   │   │
│   │   ├── book/
│   │   │   └── [slug]/
│   │   │       ├── success/
│   │   │       │   └── page.tsx
│   │   │       │
│   │   │       ├── actions.ts
│   │   │       ├── BookingCustomerForm.tsx
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   │
│   │   │   ├── blocked-days/
│   │   │   │   ├── actions.ts
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── bookings/
│   │   │   │
│   │   │   ├── businesses/
│   │   │   │
│   │   │   ├── customers/
│   │   │   │
│   │   │   ├── services/
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── business/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   ├── BusinessThemeSelector.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   └── hours/
│   │   │   │       ├── actions.ts
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── tools/
│   │   │   │   ├── actions.ts
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   ├── actions.ts
│   │   │   └── page.tsx
│   │   │
│   │   ├── logout/
│   │   │   └── route.ts
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   └── lib/
│       ├── admin-theme.ts
│       ├── auth.ts
│       ├── business-theme.ts
│       ├── current-business.ts
│       ├── dashboard-theme.ts
│       ├── email.ts
│       ├── format-duration.ts
│       ├── login-rate-limit.ts
│       ├── mobile-auth.ts
│       ├── prisma.ts
│       ├── public-booking-rate-limit.ts
│       └── theme-options.ts
│
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

# Modelo de dados

O sistema utiliza PostgreSQL através do Prisma ORM.

As principais entidades são:

```text
Business
├── User
├── Service
├── ServiceCategory
├── Customer
├── Booking
├── WorkHour
└── BlockedDay
```

Uma marcação possui relações com:

```text
Booking
├── Business
├── Customer
└── BookingService
        └── Service
```

A entidade intermediária `BookingService` permite que uma mesma marcação possua múltiplos serviços.

---

# Multiempresa

O MarcaFlow foi desenvolvido com arquitetura multiempresa.

Cada negócio possui os seus próprios:

- Dados públicos
- Slug
- Tema visual
- Utilizadores
- Serviços
- Categorias
- Horários
- Bloqueios
- Clientes
- Marcações

As consultas administrativas e mobile utilizam o negócio associado ao utilizador autenticado para separar os dados entre empresas.

---

# Autenticação

O sistema possui autenticação própria com utilizadores e sessões persistidas no banco de dados.

---

## Autenticação Web

A aplicação web utiliza sessões através de cookies HTTP-only.

Os utilizadores possuem perfis:

```text
ADMIN
OWNER
```

---

## Autenticação Android

A aplicação Android utiliza Bearer Token.

Fluxo:

```text
E-mail + palavra-passe
        ↓
POST /api/mobile/login
        ↓
Validação das credenciais
        ↓
Criação da sessão
        ↓
Token devolvido ao Android
        ↓
Authorization: Bearer <TOKEN>
        ↓
Endpoints mobile protegidos
```

A password enviada no login é validada contra o hash armazenado no banco.

Os tokens das sessões não são armazenados diretamente no banco.

O backend armazena o hash do token da sessão.

---

# Segurança

Medidas aplicadas no projeto:

- Passwords não armazenadas em texto simples
- Hash de passwords
- Sessões persistidas no banco
- Cookies HTTP-only na aplicação web
- Autenticação Android através de Bearer Token
- Tokens de sessão armazenados através de hash
- Expiração das sessões
- Endpoints mobile protegidos
- Isolamento dos dados por negócio
- Proteção contra múltiplas tentativas de login
- Proteção contra submissões repetidas
- Validação das marcações no servidor
- Lock para evitar conflitos simultâneos de horários
- Proteção de endpoints internos através de segredo
- Lembretes protegidos contra envio duplicado
- Página de sucesso utilizando token público em vez do ID interno
- Página de sucesso sem indexação
- Dados sensíveis armazenados através de variáveis de ambiente

---

# Endpoints internos

Algumas rotas internas utilizam autenticação através de segredo.

Header:

```http
Authorization: Bearer <CRON_SECRET>
```

Exemplos:

```text
/api/health-db
/api/reminders/send-booking-reminders
```

Comportamento esperado:

```text
Sem Authorization
→ Não autorizado

Authorization válido
→ execução permitida
```

Os endpoints Android utilizam tokens de sessão próprios e **não utilizam `CRON_SECRET`**.

---

# Variáveis de ambiente

Crie um arquivo:

```text
.env
```

ou:

```text
.env.local
```

na raiz do projeto.

Exemplo:

```env
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

DASHBOARD_ADMIN_PASSWORD="..."

BREVO_API_KEY="..."
BREVO_SENDER_EMAIL="..."
BREVO_SENDER_NAME="MarcaFlow"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

CRON_SECRET="..."
REMINDERS_API_SECRET="..."
```

Nunca publique:

- `.env`
- passwords
- tokens de sessão
- API keys
- connection strings reais
- segredos internos

---

# Como executar localmente

Clone o repositório e entre na pasta do projeto.

Instale as dependências:

```bash
npm install
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations:

```bash
npx prisma migrate deploy
```

Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

---

# Testar noutro dispositivo da rede

Para disponibilizar o servidor para outros dispositivos da mesma rede:

```bash
npm run dev -- --hostname 0.0.0.0
```

Depois utilize o IP local do computador.

Exemplo:

```text
http://192.168.1.83:3000
```

---

# Build

Execute:

```bash
npm run build
```

O build executa:

```text
prisma generate
        ↓
prisma migrate deploy
        ↓
next build
```

Por isso, a base de dados precisa estar acessível durante o processo de build.

---

# Deploy

O projeto está preparado para deploy na **Vercel**.

Fluxo recomendado:

```bash
git status
git add <arquivos>
git commit -m "mensagem do commit"
git push origin main
```

Após um push para a branch:

```text
main
```

a Vercel inicia automaticamente um novo deploy.

---

# Roadmap

Funcionalidades consideradas para futuras versões:

- SMS automático
- WhatsApp Business API
- Pagamentos online
- Sinal de reserva
- Dashboard financeiro
- Assinatura mensal por negócio
- Imagens reais dos serviços
- Domínio personalizado por cliente
- Notificações internas
- Exportação avançada de clientes e marcações
- Notificações push no Android
- Persistência segura da sessão no Android
- Logout e gestão persistente da sessão mobile
- Consulta por diferentes períodos no Android
- Gestão de marcações através da aplicação Android
- Alteração do estado da marcação através do Android

---

# Objetivo do projeto

O MarcaFlow foi desenvolvido para oferecer uma solução própria, simples e escalável para negócios que trabalham com marcações.

A plataforma procura reduzir a dependência de soluções externas e centralizar a operação do negócio.

Além do valor prático para o Essência Beauty Lounge, o projeto aplica conceitos reais de:

- Desenvolvimento full stack
- Android nativo
- Kotlin
- Jetpack Compose
- Arquitetura MVVM
- Programação assíncrona
- Integração mobile/backend
- REST APIs
- Autenticação
- Gestão de sessões
- Bases de dados relacionais
- SaaS multiempresa
- Deploy cloud
- Integrações com serviços externos
- Segurança
- Regras reais de negócio

---

# Autor

Desenvolvido por **António Felipe Aguiar de Oliveira**.

GitHub: [afoliveira111](https://github.com/afoliveira111)

LinkedIn: [António Felipe](https://www.linkedin.com/in/id-antonio-felipe/)

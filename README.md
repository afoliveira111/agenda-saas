# MarcaFlow — Sistema de Marcações Online

MarcaFlow é um SaaS de agendamento online desenvolvido para salões de beleza, clínicas estéticas, barbearias, profissionais independentes e pequenos negócios que trabalham com marcações.

O sistema permite que cada negócio tenha uma página pública de marcação, onde o cliente escolhe serviços, data, horário disponível e confirma a marcação. O gerente acompanha tudo pelo painel administrativo, com gestão de serviços, horários, clientes, marcações, bloqueios de datas e temas visuais.

## Funcionalidades

### Página pública de marcação

- Página pública por negócio, por exemplo `/book/demo`
- Seleção de um ou mais serviços
- Serviços organizados por categorias
- Cálculo automático de preço total
- Cálculo automático de duração total
- Datas e horários disponíveis conforme expediente
- Bloqueio automático de horários ocupados
- Bloqueio de dias indisponíveis
- Formulário com nome, telefone e e-mail
- Página de sucesso com token público de confirmação
- Layout responsivo para desktop e telemóvel
- Temas visuais: Branco, Nude e Premium
- Proteção simples contra spam no formulário público

### Painel do gerente

- Visão geral do negócio
- Gestão de serviços
- Gestão de categorias
- Ativação e desativação de serviços
- Gestão de horários semanais
- Bloqueio de dias específicos
- Listagem de marcações
- Reagendamento de marcações
- Alteração de estado da marcação
- Histórico de clientes
- Botão para contacto via WhatsApp
- Configuração dos dados públicos do negócio
- Escolha do tema visual da página pública

### Administração da plataforma

- Login privado
- Gestão de utilizadores
- Perfis de acesso: Admin e Gerente
- Gestão de múltiplos negócios
- Seleção do negócio ativo no painel
- Temas visuais para a área administrativa
- Ferramentas internas para limpeza de dados de teste

### Notificações

- E-mail automático ao cliente após marcação
- E-mail automático ao negócio
- E-mail automático em caso de reagendamento
- Lembretes por e-mail antes da marcação
- Estrutura preparada para futura integração com SMS ou WhatsApp API

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Neon Database
- Vercel
- Brevo
- GitHub

## Estrutura principal

```txt
src/app
├── admin
├── api
├── book
│   └── [slug]
├── dashboard
├── login
└── logout

src/lib
├── auth.ts
├── prisma.ts
├── email.ts
├── business-theme.ts
├── dashboard-theme.ts
├── admin-theme.ts
├── login-rate-limit.ts
└── public-booking-rate-limit.ts

prisma
├── schema.prisma
└── migrations
Variáveis de ambiente

Crie um arquivo .env ou .env.local na raiz do projeto.

Exemplo:

DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

DASHBOARD_ADMIN_PASSWORD="..."

BREVO_API_KEY="..."
BREVO_SENDER_EMAIL="..."
BREVO_SENDER_NAME="MarcaFlow"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

CRON_SECRET="uma_chave_grande_para_proteger_endpoints_internos"
REMINDERS_API_SECRET="opcional_para_compatibilidade"

Nunca publique arquivos .env no GitHub.

Como rodar localmente

Instale as dependências:

npm install

Gere o Prisma Client:

npx prisma generate

Aplique as migrations:

npx prisma migrate deploy

Rode o projeto:

npm run dev

A aplicação ficará disponível em:

http://localhost:3000

Para testar no telemóvel dentro da mesma rede Wi-Fi:

npm run dev -- --hostname 0.0.0.0

Depois acesse pelo IP local do computador, por exemplo:

http://192.168.1.83:3000
Build
npm run build

O build executa:

prisma generate && prisma migrate deploy && next build

Por isso, a base de dados precisa estar acessível durante o build.

Deploy

O projeto está preparado para deploy na Vercel.

Fluxo recomendado:

git status
git add -A
git commit -m "mensagem do commit"
git push origin main

A Vercel faz o deploy automaticamente a partir da branch main.

Segurança operacional

Algumas rotas internas são protegidas por header de autorização:

Authorization: Bearer <CRON_SECRET>

Rotas internas protegidas:

/api/health-db
/api/reminders/send-booking-reminders

Comportamento esperado em produção:

Sem Authorization -> Não autorizado
Com Authorization correto -> 200 OK

Medidas já aplicadas:

Sessões persistidas no banco
Cookies HTTP-only
Proteção contra múltiplas tentativas de login
Proteção simples contra spam no formulário público
Validação de marcações no servidor
Lock para evitar conflitos simultâneos de horários
Proteção de endpoints internos por segredo
Lembretes com proteção contra envio duplicado
Página de sucesso com token público em vez de ID interno
Página de sucesso sem indexação e sem cache de dados pessoais
Autenticação

O sistema possui autenticação própria com utilizadores e sessões persistidas no banco.

Tipos técnicos de utilizador:

ADMIN: acesso à administração da plataforma
OWNER: acesso ao painel do negócio

Na interface, OWNER é apresentado como Gerente.

Multi-negócio

Cada negócio possui:

Nome
Slug público
Tema visual
Dados de contacto
Serviços
Categorias
Horários
Bloqueios
Clientes
Marcações

Exemplo de página pública:

/book/demo
Roadmap

Funcionalidades futuras:

SMS automático de confirmação
WhatsApp Business API
Pagamentos online
Dashboard financeiro
Assinatura mensal por negócio
Imagens reais dos serviços
Domínio personalizado por cliente
Notificações internas no painel
Exportação de clientes e marcações
App mobile ou PWA
Autor

Desenvolvido por António Felipe Aguiar de Oliveira.

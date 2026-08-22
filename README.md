# Cchat

AI WhatsApp agent for small businesses in Tanzania. Handles customer conversations in Swahili and English, manages product knowledge, tracks stock, and hands off to a human when needed.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL) via Drizzle ORM
- **AI:** DeepSeek (via OpenAI-compatible API)
- **Payments:** Pesapal (planned)
- **WhatsApp:** Meta Cloud API with Embedded Signup

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (https://supabase.com)
- A Clerk application (https://clerk.com)
- A DeepSeek API key (https://platform.deepseek.com)

### Setup

```bash
git clone https://github.com/callmecix009/Cchat.git
cd Cchat
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

Open http://localhost:3000

### Environment Variables

Fill in `.env.local` with:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk Dashboard, API Keys
- `CLERK_SECRET_KEY` - Clerk Dashboard, API Keys
- `CLERK_WEBHOOK_SECRET` - Clerk Dashboard, Webhooks
- `DATABASE_URL` - Supabase Dashboard, Settings, Database, Transaction pooler (port 6543)
- `DIRECT_URL` - Supabase Dashboard, Settings, Database, Direct connection (port 5432)
- `DEEPSEEK_API_KEY` - https://platform.deepseek.com/api_keys

## Database

Push schema to Supabase:

```bash
npm run db:push
```

This creates all tables: users, conversations, messages, commands, settings, whatsapp_connections.

## Scripts

- `npm run dev` - Start dev server (webpack)
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate migration files

## Project Structure

```
app/
  (auth)/          - Sign-in, sign-up (Clerk)
  (dashboard)/     - Dashboard pages (inbox, products, services, AI, settings, billing)
  api/             - API routes (inbox, onboarding, webhooks, WhatsApp)
  onboarding/      - Setup wizard
components/        - Shared UI components
lib/               - Database schema, utilities, brand config
drizzle/           - Database migrations
```

## License

Private. All rights reserved.

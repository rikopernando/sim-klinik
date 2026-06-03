# Sim-Klinik

A clinic management system (SIM Klinik) built with Next.js 15, covering patient registration, electronic medical records, pharmacy, laboratory, billing, and more.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router with Turbopack)
- **Language:** TypeScript (strict mode)
- **Authentication:** [Better Auth](https://better-auth.com/) with Drizzle adapter
- **Database:** [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack React Query
- **Icons:** [Lucide React](https://lucide.dev/) + Tabler Icons

## Modules

- **Registration** — patient registration and visit creation
- **Queue** — queue management per poli
- **Doctor Dashboard** — patient queue and examination flow
- **Medical Records (EMR)** — SOAP notes, ICD-10 diagnoses, ICD-9 procedures, prescriptions
- **Emergency (UGD)** — emergency room triage
- **Inpatient** — bed/room management, CPPT notes, vitals
- **Pharmacy** — prescription fulfillment and drug inventory
- **Laboratory** — lab orders, queue, and results
- **Cashier** — billing and payments
- **Master Data** — polis, rooms, services/tariffs
- **User Management** — RBAC user management (super_admin only)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for database)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sim-klinik
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Start the development database**

   ```bash
   npm run db:up
   ```

5. **Push the database schema**

   ```bash
   npm run db:push
   ```

6. **Seed initial data**

   ```bash
   npm run db:seed           # Users, roles, polis
   npm run db:seed:services  # Services and tariffs
   npm run db:seed:drugs     # Drug master data
   npm run db:seed:rooms     # Rooms and beds
   npm run db:seed:material  # Medical materials
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Development Commands

### Application

```bash
npm run dev           # Start dev server with Turbopack
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier format
npm run format:check  # Check formatting
```

### Database

```bash
npm run db:up              # Start dev PostgreSQL container (port 5433)
npm run db:down            # Stop dev PostgreSQL container
npm run db:push            # Push schema changes
npm run db:generate        # Generate migration files
npm run db:migrate         # Run migrations
npm run db:studio          # Open Drizzle Studio GUI
npm run db:reset           # Drop and recreate all tables
```

### Seeders

```bash
npm run db:seed              # Seed users, roles, polis
npm run db:seed:services     # Seed services/tariffs
npm run db:seed:drugs        # Seed drug master data
npm run db:seed:rooms        # Seed rooms and beds
npm run db:seed:material     # Seed medical materials
npm run db:update-passwords  # Re-hash passwords after algorithm changes
```

### Docker (full stack)

```bash
npm run docker:up    # Start app + postgres
npm run docker:down  # Stop containers
npm run docker:logs  # Tail container logs
```

## Project Structure

```
sim-klinik/
├── app/
│   ├── api/                    # API routes
│   └── dashboard/              # Dashboard pages
│       ├── registration/       # Patient registration
│       ├── queue/              # Queue management
│       ├── doctor/             # Doctor dashboard
│       ├── medical-records/    # EMR per visit
│       ├── emergency/          # Emergency room
│       ├── inpatient/          # Inpatient care
│       ├── pharmacy/           # Pharmacy + inventory
│       ├── laboratory/         # Lab orders + results
│       ├── cashier/            # Billing + payments
│       ├── patients/           # Patient list
│       ├── users/              # User management
│       ├── master-data/        # Polis and rooms
│       └── services/           # Service/tariff management
├── components/                 # Shared React components
│   └── ui/                     # shadcn/ui components
├── db/
│   ├── index.ts                # Database connection
│   ├── schema/                 # Drizzle schemas by domain
│   └── seeders/                # Seed scripts
├── hooks/                      # Domain-specific React Query hooks
├── lib/
│   ├── auth.ts                 # Better Auth configuration
│   ├── auth-client.ts          # Client-side auth helpers
│   ├── rbac/                   # RBAC middleware and session helpers
│   ├── services/               # Client-side API service layer
│   ├── cache/                  # Server-side API cache utilities
│   ├── constants/              # HTTP status codes, enums
│   └── validations/            # Zod schemas
├── types/                      # TypeScript type definitions
│   ├── rbac.ts                 # Roles and permissions
│   ├── visit-status.ts         # Visit state machine
│   ├── medical-record.ts       # EMR types
│   ├── billing.ts              # Billing types
│   └── api.ts                  # API response types
├── scripts/                    # Utility scripts
├── documentation/              # Project documentation and planning
├── docker-compose.yml
├── drizzle.config.ts
└── components.json             # shadcn/ui configuration
```

## RBAC Roles

The system has 10 roles with permission-based access control:

`super_admin`, `admin`, `doctor`, `nurse`, `pharmacist`, `cashier`, `receptionist`, `lab_technician`, `lab_supervisor`, `radiologist`

## Visit Status Flow

Visits follow a strict state machine:

```
registered → waiting → in_examination → examined → ready_for_billing → billed → paid → completed
```

Terminal states: `completed`, `cancelled`

Key rules:

- Locking a medical record auto-transitions the visit to `ready_for_billing`
- Discharge is blocked until status is `paid`

## Docker Setup

```bash
# Database only (develop app locally)
npm run db:up   # Start PostgreSQL on port 5433
npm run dev     # Start Next.js dev server

# Full stack
npm run docker:up  # Start app + database
```

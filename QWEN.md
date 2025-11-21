# sim-klinik Project Context

## Project Overview

This is a **sim-klinik** project (likely Simulasi Klinik in Indonesian, meaning Clinic Simulation), built as a modern web application using the **Codeguide Starter Fullstack** template. Under the hood, it's a Next.js 15 full-stack application with TypeScript, authentication, and database integration.

### Tech Stack
- **Framework:** Next.js 15 with App Router and Turbopack
- **Language:** TypeScript
- **Authentication:** Better Auth
- **Database:** Drizzle ORM with PostgreSQL
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (New York style)
- **Icons:** Lucide React and Tabler Icons
- **Theme System:** next-themes

### Project Purpose
Based on the project name "sim-klinik", this appears to be a clinic simulation system - likely for medical training, clinic management simulations, or healthcare education purposes.

## Project Structure
```
sim-klinik/ (codeguide-starter-fullstack template)
├── app/                        # Next.js app router pages
│   ├── api/                    # API routes
│   ├── dashboard/              # Dashboard pages
│   ├── sign-in/                # Authentication pages
│   ├── sign-up/                # Authentication pages
│   ├── globals.css            # Global styles with dark mode
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Main landing page
├── components/                # React components
│   └── ui/                    # shadcn/ui components (40+)
├── db/                        # Database configuration
│   ├── index.ts              # Database connection
│   └── schema/               # Database schemas
├── docker/                    # Docker configuration
│   └── postgres/             # PostgreSQL initialization
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
│   ├── auth.ts               # Better Auth configuration
│   └── utils.ts              # General utilities
├── scripts/                   # Database seeding scripts
├── .env.example             # Environment variables example
├── docker-compose.yaml      # Docker services configuration
├── Dockerfile               # Application container definition
├── drizzle.config.ts        # Drizzle configuration
└── components.json          # shadcn/ui configuration
```

## Development Commands

### Application
- `npm run dev` - Start development server with Turbopack (port 3000)
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:up` - Start PostgreSQL in Docker (port 5432)
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:dev` - Start development PostgreSQL (port 5433)
- `npm run db:dev-down` - Stop development PostgreSQL
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:reset` - Reset database (drop all tables and recreate)
- `npm run db:seed` - Seed the database with sample data
- `npm run db:seed:drugs` - Seed the database with drug data

### Docker
- `npm run docker:build` - Build application Docker image
- `npm run docker:up` - Start full application stack (app + database)
- `npm run docker:down` - Stop all containers
- `npm run docker:logs` - View container logs

## Environment Variables

The project uses the following environment variables:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Key Features

- 🔐 Authentication with Better Auth (email/password)
- 🗄️ PostgreSQL Database with Drizzle ORM
- 🎨 40+ shadcn/ui components (New York style)
- 🌙 Dark mode with system preference detection
- 🚀 App Router with Server Components and Turbopack
- 📱 Responsive design with TailwindCSS v4
- 🎯 Type-safe database operations
- 🔒 Modern authentication patterns
- 🐳 Full Docker support with multi-stage builds
- 🚀 Production-ready deployment configuration

## Development Setup

To start development:
1. Install dependencies: `npm install`
2. Start database: `npm run db:dev` (for development database on port 5433)
3. Start development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Database Integration

This starter includes modern database integration:

- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** as the database provider
- **Better Auth** integration with Drizzle adapter
- **Database migrations** with Drizzle Kit

## Project Context and Focus

As a clinic simulation system, this project is likely designed to:
- Simulate clinic operations and workflows
- Provide a platform for medical training or healthcare education
- Demonstrate healthcare management concepts
- Offer a realistic clinic management interface for educational purposes

When working on features, keep in mind the healthcare/medical context this system is designed for. Consider user roles like doctors, nurses, patients, administrators, and typical clinic workflows.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sim-Klinik** is a clinic management system built on a Next.js 15 fullstack starter template. The system includes modules for patient registration, electronic medical records (EMR), inpatient care, pharmacy, billing, and emergency services. Currently in Phase 1 (MVP) development.

## Documentation Reference

**IMPORTANT**: Before implementing any feature, always consult the detailed documentation in `/documentation/`:

- **`tasks.md`**: Complete task breakdown for Phase 1 MVP (A-G modules with priorities)
- **`project_requirements_document.md`**: Core requirements, in-scope vs out-of-scope features
- **`app_flow_document.md`**: Detailed user stories for all 7 modules with role-based workflows
- **`frontend_guidelines_document.md`**: Design system, component structure, styling patterns
- **`backend_structure_document.md`**: Database schema, API design, layered architecture
- **`security_guideline_document.md`**: Mandatory security practices and implementation guidelines
- **`tech_stack_document.md`**: Rationale for technology choices

⚠️ **NOTE**: Some documentation references **Prisma ORM** and **NextAuth.js**, but the actual codebase uses **Drizzle ORM** and **Better Auth**. Always prioritize the actual implementation in the codebase over documentation when there are conflicts.

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript (strict mode enabled)
- **Authentication**: Better Auth with email/password
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **UI Components**: 40+ Radix UI primitives via shadcn/ui
- **Theme**: Dark mode support via next-themes

## Development Commands

### Application
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Management
```bash
npm run db:up        # Start PostgreSQL (port 5432)
npm run db:down      # Stop PostgreSQL
npm run db:dev       # Start dev PostgreSQL (port 5433)
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio GUI
npm run db:reset     # Drop and recreate all tables
```

### Docker
```bash
npm run docker:build # Build app image
npm run docker:up    # Start full stack
npm run docker:down  # Stop all containers
npm run docker:logs  # View logs
```

## Architecture Overview

### Authentication Flow
- Better Auth configured with Drizzle adapter in `lib/auth.ts`
- Database schema for auth in `db/schema/auth.ts` (user, session, account, verification tables)
- Client-side auth utilities in `lib/auth-client.ts`
- Sign-in/Sign-up pages at `/sign-in` and `/sign-up`

### Database Architecture
- **Connection**: Configured in `db/index.ts` using Drizzle ORM with PostgreSQL
- **Schemas**: Organized in `db/schema/` directory by domain
- **Migrations**: Managed via Drizzle Kit, stored in `drizzle/` directory
- **Config**: `drizzle.config.ts` defines schema path and database credentials

**Expected Schema Structure** (from `backend_structure_document.md`):
- **users**: id, email, password_hash, created_at (auth tables already exist)
- **patients**: id, mr_number (auto-generated), nik, name, address, phone, insurance
- **visits**: id, patient_id, visit_type (outpatient/inpatient/er), doctor_id, poli_id, triage_status, status
- **medical_records**: id, visit_id, soap_subjective, soap_objective, soap_assessment, soap_plan, is_locked, doctor_id
- **diagnoses**: id, medical_record_id, icd10_code, description
- **procedures**: id, medical_record_id, icd9_code, description
- **prescriptions**: id, medical_record_id, drug_id, dosage, frequency, quantity, is_fulfilled
- **drugs**: id, name, unit, price (master data)
- **drug_inventory**: id, drug_id, batch_number, expiry_date, stock_quantity
- **rooms**: id, room_number, room_type, bed_count, status (available/occupied)
- **vitals_history**: id, visit_id, temperature, blood_pressure, pulse, respiration, recorded_at
- **billings**: id, visit_id, total_amount, discount, payment_status (pending/paid), payment_method
- **services**: id, name, price, service_type (consultation/procedure/room) (master data)

Each schema file should follow Drizzle conventions with proper relations and indexes.

### Project Structure
```
app/
├── api/              # API routes (auth endpoints)
├── dashboard/        # Protected dashboard area
│   ├── data.json    # Static demo data
│   ├── layout.tsx   # Dashboard layout wrapper
│   ├── page.tsx     # Dashboard home
│   └── theme.css    # Dashboard-specific styles
├── sign-in/         # Login page
├── sign-up/         # Registration page
├── globals.css      # Global styles + Tailwind
└── layout.tsx       # Root layout with providers

components/
└── ui/              # shadcn/ui components (40+)

db/
├── schema/          # Drizzle schema definitions
│   └── auth.ts      # Auth tables (user, session, account, verification)
└── index.ts         # Database connection

lib/
├── auth.ts          # Better Auth server config
├── auth-client.ts   # Better Auth client config
└── utils.ts         # Utility functions (cn, etc.)

documentation/
├── project_requirements_document.md  # MVP requirements
├── app_flow_document.md             # User stories for clinic modules
├── backend_structure_document.md     # Backend architecture
├── tech_stack_document.md           # Technology choices
├── frontend_guidelines_document.md  # UI/UX patterns
└── security_guideline_document.md   # Security practices
```

### Key Patterns

**Path Aliases**: Use `@/*` to import from project root
```typescript
import { db } from '@/db'
import { auth } from '@/lib/auth'
```

**Database Access**: All database operations go through Drizzle ORM
```typescript
import { db } from '@/db'
import { user } from '@/db/schema/auth'
```

**Authentication**: Better Auth provides session management and credential validation
- Server-side: Import from `@/lib/auth`
- Client-side: Import from `@/lib/auth-client`

**Styling**: Global styles + component-specific CSS + Tailwind utilities
- Use `cn()` utility from `@/lib/utils` for conditional classes
- shadcn/ui components are fully customizable via CSS variables
- Follow BEM-inspired naming conventions for custom CSS classes

## Design System

**Color Palette** (defined in CSS variables):
- **Primary Blue**: `#1E90FF` - Buttons, highlights
- **Secondary Navy**: `#2C3E50` - Header, sidebar backgrounds
- **Accent Cyan**: `#00CEC9` - Links, hover states
- **Neutral Light**: `#F8F9FA` - Page backgrounds
- **Neutral Dark**: `#2D3436` - Text, icons

**Typography**:
- **Font Family**: Inter (sans-serif) with system font fallbacks
- All font sizes and colors use CSS variables from `globals.css`

**UX Philosophy**:
- **Sederhana (Simple)**: Prioritize clarity and ease of use
- **2-Step Wizards**: Break complex forms into digestible steps
- **Instant Feedback**: Real-time validation on forms
- **Responsive**: Mobile-first design (min 320px width)
- **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation

## Environment Variables

Required variables (see `.env.example`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Development Workflow

1. **Database First**: Start PostgreSQL before running dev server
   ```bash
   npm run db:up && npm run db:push
   ```

2. **Schema Changes**: After modifying schema files
   ```bash
   npm run db:generate  # Create migration
   npm run db:push      # Apply to database
   ```

3. **Adding UI Components**: Use shadcn CLI
   ```bash
   npx shadcn@latest add [component-name]
   ```

4. **Type Safety**: TypeScript strict mode is enabled
   - All database operations are type-safe via Drizzle
   - No `any` types without explicit justification

## Project Context

This codebase is built for a **clinic management system** with seven core modules:

1. **Registration & Admission**: Patient data entry, visit registration (outpatient/inpatient/ER)
2. **EMR & Outpatient**: SOAP notes, ICD-10 diagnosis, ICD-9 procedures, digital prescriptions
3. **Inpatient Care**: Bed management, vital signs tracking, integrated progress notes (CPPT)
4. **Pharmacy**: E-prescription processing, inventory management, expiry tracking
5. **Billing & Cashier**: Automated billing aggregation, payment processing, receipt generation
6. **Patient Discharge**: Medical summaries, follow-up scheduling, billing verification
7. **Emergency Room**: Triage system, ER-specific EMR, disposition handling

Refer to `documentation/app_flow_document.md` for detailed user stories per module.

### Phase 1 (MVP) Implementation Priorities

Tasks are organized in `documentation/tasks.md` in these categories:

**A. Core Setup** (High Priority)
- Next.js + TypeScript + Environment setup
- Database ORM (Drizzle) + PostgreSQL connection
- Tailwind CSS + Base components
- Authentication (Better Auth) + RBAC middleware
- Application layout (Header, Sidebar)

**B. Registration Module** (High Priority)
- Patient search (NIK, MR, Name)
- New patient form (2-step wizard)
- Visit registration (Outpatient/Inpatient/ER)
- Queue management per Poli

**C-G. Clinical Modules** (See tasks.md for full breakdown)
- C: Emergency Room (UGD)
- D: Electronic Medical Records (EMR)
- E: Inpatient Care
- F: Pharmacy
- G: Billing & Patient Discharge

**Key Implementation Notes**:
- All forms must use React Hook Form + Zod validation
- Real-time notifications for pharmacy e-prescriptions
- Auto-generation of Medical Record (MR) numbers
- Billing gate: Patients cannot be discharged until payment status is "LUNAS" (paid)

## Security Considerations

**Critical Requirements** (see `documentation/security_guideline_document.md` for full details):

**Authentication & Access**:
- Passwords hashed via Better Auth (bcrypt with salt)
- Session tokens in HttpOnly, Secure, SameSite=Strict cookies
- Rate limiting on `/api/auth` to prevent brute-force attacks
- Strong password policy: min 12 chars, mixed case, numbers, symbols

**Input Handling**:
- All forms use Zod validation on both client and server
- Parameterized queries via Drizzle ORM (no raw SQL)
- Sanitize and validate all user inputs
- Prevent open redirects with allow-list validation

**Data Protection**:
- HTTPS/TLS 1.2+ enforced in production
- Never log passwords, tokens, or PII
- Database credentials in `.env` (never committed)
- Implement data retention policies for patient data

**Web Security**:
- CSRF protection on all state-changing operations
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, CSP
- Prevent XSS: escape user content, avoid dangerouslySetInnerHTML
- CORS restricted to authorized origins only

**Dependency Management**:
- Regular `npm audit` for vulnerability scanning
- Keep all packages updated
- Use `package-lock.json` for reproducible builds


## Testing & Quality Assurance

**Testing Strategy** (from `frontend_guidelines_document.md`):

**Unit Tests**:
- Jest + React Testing Library for components
- Test form validations, utility functions, hooks
- Example: Verify Sign In form shows errors for empty fields

**Integration Tests**:
- Test component interactions and API calls
- Use msw (Mock Service Worker) for API mocking

**E2E Tests**:
- Cypress or Playwright for full user flows
- Test: Sign up → Login → Dashboard navigation → Logout

**Code Quality**:
- ESLint for code style and bug detection
- Prettier for consistent formatting
- Husky git hooks run lint/tests before commits
- GitHub Actions CI runs tests on all PRs

**Current Status**: Testing infrastructure not yet implemented in Phase 1

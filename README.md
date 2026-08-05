# Rental Manager - Frontend

A premium, modern rental management platform built with Next.js 14, React 18, and Tailwind CSS. This application provides a comprehensive dashboard for managing vehicle rentals, clients, contracts, invoicing, and more.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture & Design Philosophy](#architecture--design-philosophy)
- [Brand & Design System](#brand--design-system)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [What's Implemented](#whats-implemented)
- [What Needs to Be Done](#what-needs-to-be-done)
- [Implementation Roadmap](#implementation-roadmap)
- [Key Features](#key-features)
- [API Integration](#api-integration)

---

## 🎯 Project Overview

Rental Manager is an enterprise-grade rental management system designed for vehicle rental companies. The frontend provides:

- **Dashboard**: Centralized hub for viewing key metrics and activity
- **Fleet Management**: Vehicle inventory and maintenance tracking
- **Client Management**: Customer profiles and communication history
- **Booking Management**: Reservation creation and modification
- **Contract Management**: Legal document handling and tracking
- **Invoicing**: Billing and payment processing
- **Payment Tracking**: Financial overview and transaction history
- **Reports**: Business intelligence and analytics
- **Super Admin Panel**: Tenant management and subscription monitoring
- **User Settings**: Profile and preference management

---

## 🛠 Technology Stack

- **Framework**: [Next.js 14.2.3](https://nextjs.org/) - React-based framework with App Router
- **UI Library**: [React 18](https://react.dev/) - Modern JavaScript library
- **Styling**: [Tailwind CSS 3.4.1](https://tailwindcss.com/) - Utility-first CSS framework
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) - Clean, professional typeface
- **Package Manager**: npm

### Development Tools
- ESLint for code quality
- PostCSS for CSS processing
- Next.js built-in optimization

---

## 🏗️ Architecture & Design Philosophy

### Shared Layout Pattern (Premium UX)

This application follows a **unified shell architecture** where:

✅ **All pages inherit a shared dashboard shell** - Consistent navigation and experience
✅ **Single sidebar navigation** - Centralized navigation for all features
✅ **Unified layout wrapper** - Common header, sidebar, and footer across app
✅ **No individual page layouts** - Pages are content-only, not layout providers

This approach ensures:
- **Premium feel**: Consistent, polished user experience throughout
- **Code reuse**: Single source of truth for layout components
- **Maintainability**: Changes to navigation reflect everywhere
- **Performance**: Reduced re-renders and layout shifts
- **Scalability**: Easy to add new pages and features

### Folder Structure Convention

```
app/
├── (auth)/              # Auth routes (outside dashboard shell)
│   └── login/
├── dashboard/           # Main dashboard shell
│   ├── layout.tsx       # SINGLE layout for entire app
│   ├── bookings/        # Content pages (no layouts)
│   ├── clients/
│   ├── contracts/
│   ├── fleet/
│   ├── invoices/
│   ├── payments/
│   ├── reports/
│   └── settings/
└── super-admin/         # Admin routes (separate shell)
    ├── layout.tsx       # Separate admin layout
    ├── reports/
    ├── subscriptions/
    ├── tenants/
    └── users/
```

**Key Pattern**: 
- Pages inside `dashboard/` inherit `dashboard/layout.tsx` automatically
- Each section (bookings, clients, etc.) contains only page content
- The layout provides: sidebar, header, navigation, footer
- New CRUD pages just add a file/folder under their section

---

## 🎨 Brand & Design System

### Brand Identity

**Brand Name**: Rental Manager
**Logo**: VISUAL (custom branding)

### Color Palette

The design system uses a professional, modern navy and blue color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| **Navy** | `#1e2a4a` | Sidebar background, primary navigation |
| **Navy Light** | `#2a3654` | Hover states, subtle backgrounds |
| **Accent** | `#64b5f6` | Active menu items, primary buttons |
| **Accent Light** | `#90caf9` | Hover states on accent elements |
| **Background** | `#f8f9fc` | Main content area background |
| **Card** | `#ffffff` | Card backgrounds (light mode) |
| **Card Dark** | `#24304a` | Card backgrounds (dark/gradient cards) |
| **Text** | `#1a1a1a` | Primary text color |
| **Text Muted** | `#6b7280` | Secondary text, labels |
| **Success** | `#22c55e` | Success states, confirmations |
| **Warning** | `#f59e0b` | Warning alerts and cautions |
| **Danger** | `#ef4444` | Error states, destructive actions |
| **Critical** | `#dc2626` | Critical alerts, high priority |

### Typography

- **Font Family**: Inter (Google Font)
- **H1**: `text-3xl font-bold` - Page titles
- **H2**: `text-2xl font-semibold` - Section headers
- **Body**: `text-base` - Standard text
- **Small**: `text-sm text-muted` - Captions, labels

### Spacing & Layout

- **Sidebar Width**: 260px
- **Card Padding**: p-6 (24px)
- **Gap/Spacing**: gap-6 (24px)
- **Border Radius**: rounded-2xl (16px) - Modern, friendly corners
- **Shadows**: shadow-sm (subtle elevation)

### Gradients

- **Navy Gradient**: `linear-gradient(135deg, #1e2a4a 0%, #2a3654 100%)` - Rich, professional depth

### Design Files

All brand configuration is centralized in [`src/lib/brand.ts`](src/lib/brand.ts) for consistency and easy updates.

---

## 📁 Project Structure

```
rental-manager-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes (public)
│   │   │   └── login/
│   │   ├── dashboard/          # Main dashboard shell
│   │   │   ├── layout.tsx       # ⭐ Shared layout (sidebar, header)
│   │   │   ├── bookings/        # Booking CRUD
│   │   │   ├── clients/         # Client management
│   │   │   ├── contracts/       # Contract management
│   │   │   ├── fleet/           # Vehicle management
│   │   │   ├── invoices/        # Invoicing
│   │   │   ├── payments/        # Payment tracking
│   │   │   ├── reports/         # Analytics & reports
│   │   │   └── settings/        # User settings
│   │   ├── super-admin/         # Admin-only routes
│   │   │   ├── layout.tsx        # Separate admin shell
│   │   │   ├── reports/
│   │   │   ├── subscriptions/
│   │   │   ├── tenants/
│   │   │   └── users/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # Reusable React components
│   │   ├── layout/              # Layout components
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   ├── Header.tsx        # Top header/nav
│   │   │   └── Footer.tsx        # Footer
│   │   └── ui/                  # UI elements
│   │       ├── Button.tsx        # Reusable buttons
│   │       ├── Card.tsx          # Card component
│   │       ├── Modal.tsx         # Modal dialogs
│   │       ├── Table.tsx         # Data tables
│   │       ├── Form.tsx          # Form elements
│   │       └── ...              # Other UI components
│   │
│   ├── context/                 # React Context API
│   │   └── auth-context.tsx      # Authentication state
│   │
│   ├── lib/                     # Utility functions & configs
│   │   ├── api-client.ts         # API communication
│   │   ├── brand.ts              # ⭐ Brand design system
│   │   └── types.ts              # TypeScript type definitions
│   │
│   └── public/                  # Static assets
│       ├── favicon.ico
│       ├── logo.svg
│       └── ...
│
├── tailwind.config.ts           # ⭐ Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.mjs              # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ or later
- npm (comes with Node.js)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rental-manager-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (create `.env.local`)
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   # Add other environment variables as needed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

---

## 💻 Development

### Running Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000` with hot reload enabled.

### Code Quality

```bash
npm run lint
```

### Building for Deployment

```bash
npm run build
```

This optimizes the app for production with:
- Code splitting and minification
- Font optimization
- Image optimization
- Bundle analysis

---

## ✅ What's Implemented

### Core Architecture & Foundation
- ✅ Next.js 14 with App Router and server components
- ✅ TypeScript configuration with strict type safety
- ✅ Tailwind CSS v4 with custom design tokens
- ✅ Premium brand design system (`brand.ts`) - Indigo theme
- ✅ Responsive layout structure with mobile support
- ✅ Global CSS with CSS variables for theming
- ✅ Font optimization with Inter

### Layout System
- ✅ Dashboard shell architecture (`DashboardShell.tsx`)
- ✅ Collapsible Sidebar with navigation groups (`Sidebar.tsx`)
- ✅ Top bar with user menu and notifications (`TopBar.tsx`)
- ✅ Bottom navigation for mobile (`BottomNav.tsx`)
- ✅ Super-admin separate layout
- ✅ Authentication routes with dedicated layout

### Component Library (180+ Components)

#### Layout Components
- ✅ `Sidebar` - Multi-group navigation with active states
- ✅ `TopBar` - Header with search, notifications, user menu
- ✅ `BottomNav` - Mobile-first navigation
- ✅ `DashboardShell` - Unified layout wrapper

#### UI Components (40+)
- ✅ `ActionButtons` - Primary/secondary action buttons
- ✅ `ActionMenu` - Dropdown action menus
- ✅ `Avatar` - User avatars with fallbacks
- ✅ `Badge` - Status badges with variants
- ✅ `BookingCalendar` - Calendar view for bookings
- ✅ `BookingPreviews` - Booking card previews
- ✅ `ConfirmDialog` - Confirmation modals
- ✅ `DataTable` - Sortable, filterable tables with TanStack Table
- ✅ `DocumentCard` - Document display cards
- ✅ `Drawer` - Slide-out drawers
- ✅ `EmptyState` - Empty state illustrations
- ✅ `FilterBar` - Filter controls
- ✅ `Modal` - Dialog modals
- ✅ `PageHeader` - Standard page headers
- ✅ `Pagination` - Table pagination
- ✅ `ProfileHeader` - User profile headers
- ✅ `QuickActions` - Quick action buttons
- ✅ `SearchInput` - Search with debounce
- ✅ `SectionCard` - Section containers
- ✅ `ServiceHealthBar` - Service status indicators
- ✅ `AddressAutocomplete` - Google Maps address input
- ✅ `ListToolbar` - List view toolbars
- ✅ `InfoGrid` - Information grids
- ✅ `FloatingActionBar` - Floating action buttons
- ✅ `QuickGarageModal` - Quick vehicle selection

#### Form Components
- ✅ `Input` - Text inputs with validation
- ✅ `Select` - Dropdown selects
- ✅ `Textarea` - Multi-line text inputs
- ✅ `DatePicker` - Date selection
- ✅ `DateRangePicker` - Date range selection
- ✅ `SmartInput` - Advanced input with formatting
- ✅ `FormGroup` - Form field wrappers
- ✅ `FileUpload` - Drag-and-drop file upload
- ✅ `PhoneInput` - International phone input

#### Feature-Specific Components

**Bookings**
- ✅ Booking forms and editors
- ✅ Booking timeline views
- ✅ Calendar integration
- ✅ Trip status tracking

**Clients**
- ✅ Client profile components
- ✅ Client lists and search
- ✅ Client onboarding flows

**Financials**
- ✅ `InvoicesTab` - Invoice management
- ✅ `PaymentsTab` - Payment tracking
- ✅ `ContractsTab` - Contract management
- ✅ `OverviewTab` - Financial dashboard
- ✅ Invoice status widgets
- ✅ Revenue overview widgets
- ✅ Payment recording modals
- ✅ Payment tables with filters

**Fleet**
- ✅ Vehicle cards and lists
- ✅ Fleet health indicators
- ✅ Vehicle status tracking

**Tasks**
- ✅ Task boards and lists
- ✅ Task assignment UI
- ✅ Task completion tracking

**Tenants (Multi-Tenancy)**
- ✅ Tenant onboarding wizard
- ✅ Tenant profile tabs
- ✅ Subscription status cards
- ✅ Payment gateway configuration
- ✅ Health score widgets
- ✅ Fleet utilization gauges
- ✅ Activity pulse widgets
- ✅ Revenue velocity sparklines

**Users & Roles**
- ✅ User management tables
- ✅ Role template components
- ✅ Permission management UI
- ✅ User invitation flows

**Settings**
- ✅ Settings forms
- ✅ Preference management
- ✅ Profile editing

**Scheduler**
- ✅ Scheduling components
- ✅ Calendar integration
- ✅ Resource allocation UI

**Public Documents**
- ✅ Public invoice views
- ✅ Contract preview pages
- ✅ Document sharing UI

### Custom Hooks (47 Hooks)

#### Data Fetching Hooks (TanStack Query)
- ✅ `useDashboard` - Dashboard metrics and alerts
- ✅ `useInvoices` - Invoice CRUD operations
- ✅ `usePayments` - Payment management
- ✅ `useContracts` - Contract operations
- ✅ `useFinancialOverview` - Financial summary data
- ✅ `useTenantsList` - Tenant listing
- ✅ `useTenantOnboarding` - Onboarding workflow
- ✅ `useUserProfile` - User profile management
- ✅ `useClientProfile` - Client profile data

#### Booking Hooks
- ✅ `useBookingForm` - Booking form logic
- ✅ `useBookingsPage` - Bookings list management
- ✅ `useBookingFinancials` - Booking payment data
- ✅ `useBookingLifecycle` - Booking state transitions
- ✅ `useExtendBooking` - Booking extension
- ✅ `useNewBooking` - New booking creation
- ✅ `useTripTimeline` - Trip progress tracking
- ✅ `useCalendar` - Calendar operations
- ✅ `useVehicleDetails` - Vehicle information
- ✅ `useBookingsReferenceData` - Booking dropdown data

#### Business Logic Hooks
- ✅ Various domain-specific hooks for complex workflows

### API Client Layer (20+ Modules)
- ✅ `api/bookings.ts` - Booking endpoints
- ✅ `api/clients.ts` - Client management
- ✅ `api/vehicles.ts` - Fleet management
- ✅ `api/invoices.ts` - Invoice operations
- ✅ `api/payments.ts` - Payment processing
- ✅ `api/contracts.ts` - Contract management
- ✅ `api/tasks.ts` - Task management
- ✅ `api/tenants.ts` - Multi-tenant operations
- ✅ `api/subscriptions.ts` - Subscription management
- ✅ `api/users.ts` - User management
- ✅ `api/reports.ts` - Reporting endpoints
- ✅ `api/activityLogs.ts` - Activity tracking
- ✅ `api/user-preferences.ts` - User settings
- ✅ `api/tenant-profile.ts` - Tenant configuration
- ✅ `api/subscriptionClient.ts` - Client subscriptions
- ✅ `api/roleTemplates.ts` - Role management
- ✅ Utility functions for currency formatting, date handling

### State Management
- ✅ Authentication context (`auth-context.tsx`)
- ✅ TanStack Query for server state
- ✅ React Context for global state
- ✅ Local state with hooks

### Pages & Routes

#### Dashboard Routes
- ✅ `/dashboard` - Main dashboard with tabs (Overview, Calendar, Analytics)
- ✅ `/dashboard/bookings` - Bookings list
- ✅ `/dashboard/bookings/new` - Create booking
- ✅ `/dashboard/bookings/[id]` - Booking details
- ✅ `/dashboard/bookings/calendar` - Calendar view
- ✅ `/dashboard/clients` - Client list
- ✅ `/dashboard/clients/new` - Create client
- ✅ `/dashboard/clients/[id]` - Client profile
- ✅ `/dashboard/fleet` - Vehicle inventory
- ✅ `/dashboard/fleet/new` - Add vehicle
- ✅ `/dashboard/fleet/[id]` - Vehicle details
- ✅ `/dashboard/financials` - Financial management
- ✅ `/dashboard/tasks` - Task board
- ✅ `/dashboard/users` - User management
- ✅ `/dashboard/profile` - User profile
- ✅ `/dashboard/settings` - Settings
- ✅ `/dashboard/vault` - Document vault

#### Super Admin Routes
- ✅ `/super-admin` - Admin dashboard
- ✅ `/super-admin/agencies` - Tenant management
- ✅ `/super-admin/users` - User administration
- ✅ `/super-admin/subscriptions` - Subscription monitoring
- ✅ `/super-admin/reports` - Platform reports
- ✅ `/super-admin/settings` - Platform settings

#### Public Routes
- ✅ `/invoice/[token]` - Public invoice view
- ✅ `/contracts/view/[token]` - Public contract view
- ✅ `/contracts/preview` - Contract preview
- ✅ `/verify` - Verification page
- ✅ `/invite` - User invitation

#### Authentication Routes
- ✅ `/login` - User login
- ✅ `/forgot-password` - Password recovery
- ✅ `/reset-password` - Password reset
- ✅ `/verify` - Email verification

### Design System
- ✅ Premium indigo color palette
- ✅ CSS variable-based theming
- ✅ Consistent spacing and typography
- ✅ Shadow system for elevation
- ✅ Border radius system
- ✅ Component-level design tokens

### Authentication & Authorization
- ✅ Login page with form validation
- ✅ Password reset flow
- ✅ Protected routes
- ✅ Session management
- ✅ Role-based access control (RBAC)
- ✅ User invitation system

### Multi-Tenancy Support
- ✅ Tenant onboarding wizard
- ✅ Subscription management
- ✅ Payment gateway configuration
- ✅ Tenant health monitoring
- ✅ Agency/branch management

---

## 📝 What Needs to Be Done

### Phase 1: Enhancements & Polish (Priority: HIGH)
- [ ] **Advanced Filtering** - Enhanced filter capabilities across all list views
- [ ] **Bulk Actions** - Select multiple items for batch operations
- [ ] **Keyboard Shortcuts** - Power user shortcuts for common actions
- [ ] **Offline Support** - Basic offline functionality with sync
- [ ] **Real-time Updates** - WebSocket integration for live data
- [ ] **Export Functions** - CSV/PDF export for tables and reports
- [ ] **Print Styles** - Optimized print layouts for documents

### Phase 2: Advanced Features (Priority: MEDIUM)
- [ ] **Advanced Analytics** - Deep dive analytics with custom date ranges
- [ ] **Automated Reminders** - Email/SMS reminders for bookings and payments
- [ ] **Document Templates** - Customizable contract and invoice templates
- [ ] **E-signature Integration** - Digital signature for contracts
- [ ] **Multi-language Support** - i18n for international users
- [ ] **Advanced Search** - Global search with filters and suggestions
- [ ] **Custom Fields** - Tenant-specific custom fields
- [ ] **Workflow Automation** - Automated task creation and notifications

### Phase 3: Performance & Quality (Priority: MEDIUM)
- [ ] **Unit Testing** - Jest/React Testing Library tests for components
- [ ] **Integration Testing** - Test critical user workflows
- [ ] **E2E Testing** - Playwright/Cypress for full application testing
- [ ] **Performance Monitoring** - Web Vitals tracking
- [ ] **Error Tracking** - Sentry or similar error monitoring
- [ ] **Accessibility Audit** - WCAG 2.1 AA compliance
- [ ] **SEO Optimization** - Meta tags and structured data for public pages
- [ ] **Bundle Optimization** - Code splitting and lazy loading review

### Phase 4: Mobile Experience (Priority: MEDIUM)
- [ ] **Progressive Web App** - PWA configuration and service workers
- [ ] **Mobile-Specific UI** - Touch-optimized interfaces
- [ ] **Native App Wrappers** - React Native or Capacitor consideration
- [ ] **Push Notifications** - Browser and mobile push support
- [ ] **Camera Integration** - Photo upload for vehicle conditions

### Phase 5: DevOps & Deployment (Priority: LOW)
- [ ] **CI/CD Pipeline** - GitHub Actions or similar
- [ ] **Docker Containerization** - Dockerfile and docker-compose
- [ ] **Environment Management** - Staging and production configs
- [ ] **Monitoring Dashboard** - Application health monitoring
- [ ] **Backup Strategy** - Data backup and recovery procedures
- [ ] **Security Hardening** - Security audit and penetration testing
- [ ] **Documentation Site** - User guides and API documentation

---

## 🗺️ Implementation Roadmap

### Current Status: Production-Ready Core ✅

The application has evolved from a foundation project to a **feature-complete rental management platform** with:

- ✅ **297 TypeScript files** across the codebase
- ✅ **180+ React components** organized by feature
- ✅ **47 custom hooks** for business logic and data fetching
- ✅ **20+ API client modules** for backend integration
- ✅ **Multi-tenancy support** with tenant onboarding
- ✅ **Complete CRUD operations** for all core entities
- ✅ **Premium design system** with indigo theme
- ✅ **TanStack Query** for efficient server state management
- ✅ **React Hook Form + Zod** for form validation
- ✅ **Lucide React** iconography throughout
- ✅ **Recharts** for data visualization
- ✅ **Google Maps integration** for addresses

### Next Sprints Focus

### Sprint 1: Testing & Quality (Week 1-2)
1. Set up Jest and React Testing Library
2. Write unit tests for critical components (50% coverage)
3. Implement E2E tests with Playwright for key workflows
4. Configure CI/CD pipeline with GitHub Actions
5. Set up error tracking with Sentry

### Sprint 2: Advanced Features (Week 2-3)
1. Implement advanced filtering and bulk actions
2. Add CSV/PDF export functionality
3. Build automated reminder system
4. Create customizable document templates
5. Integrate e-signature provider (DocuSign/HelloSign)

### Sprint 3: Performance & Mobile (Week 3-4)
1. Conduct performance audit and optimization
2. Implement PWA features (offline support, install prompt)
3. Optimize mobile touch interfaces
4. Add push notification support
5. Implement camera integration for vehicle photos

### Sprint 4: Internationalization & Accessibility (Week 4-5)
1. Add i18n support with react-i18next
2. Translate UI to target languages
3. Conduct accessibility audit (WCAG 2.1 AA)
4. Fix accessibility issues
5. Add keyboard navigation shortcuts

### Sprint 5: DevOps & Documentation (Week 5-6)
1. Create Docker configuration
2. Set up staging environment
3. Build comprehensive documentation site
4. Implement monitoring dashboard
5. Security audit and hardening

---

## 🎯 Key Features

### Dashboard Overview
- ✅ Real-time metrics and KPIs (active bookings, fleet size, clients, revenue)
- ✅ Interactive tab switcher (Overview, Bookings Calendar, Analytics)
- ✅ Fleet health monitoring with live status indicators
- ✅ Action center widget for tasks and alerts
- ✅ Needs attention alerts (service due, overdue returns)
- ✅ Floating action button for quick booking creation
- ✅ Premium stat cards with visual hierarchy

### Fleet Management
- ✅ Complete vehicle inventory tracking
- ✅ Vehicle status monitoring (available, rented, maintenance)
- ✅ Maintenance scheduling and tracking
- ✅ Vehicle details pages with full information
- ✅ Add/edit vehicle forms
- ✅ Fleet utilization analytics
- ✅ Service alerts and reminders

### Client Management
- ✅ Comprehensive client profiles
- ✅ Client listing with search and filters
- ✅ Client onboarding flows
- ✅ Rental history tracking
- ✅ Contact information management
- ✅ Client communication logs

### Booking System
- ✅ Create and modify bookings
- ✅ Booking calendar view with drag-and-drop
- ✅ Availability checking
- ✅ Automatic pricing calculation
- ✅ Booking confirmation workflow
- ✅ Trip timeline tracking
- ✅ Booking extension functionality
- ✅ Booking financial tracking
- ✅ Status lifecycle management

### Contract Management
- ✅ Digital contract creation
- ✅ Document management and storage
- ✅ Contract preview with public token access
- ✅ Audit trail
- ✅ Contract health monitoring
- ✅ Template support (planned)

### Invoicing & Financials
- ✅ Automated invoice generation
- ✅ Invoice listing and filtering
- ✅ Customizable templates
- ✅ Payment tracking and recording
- ✅ Overdue payment identification
- ✅ Revenue overview widgets
- ✅ Contract health widgets
- ✅ Activity feed for financial events
- ✅ Public invoice views with secure tokens

### Payment Processing
- ✅ Payment recording modal
- ✅ Payment method tracking
- ✅ Payment history tables
- ✅ Gateway configuration (Stripe, M-Pesa)
- ✅ Payment reliability tracking
- ✅ Revenue velocity analytics

### Reporting & Analytics
- ✅ Revenue analytics (MTD, custom ranges)
- ✅ Fleet utilization reports
- ✅ Client demographics
- ✅ Payment reports
- ✅ Visual charts with Recharts
- ✅ Exportable data (planned)

### Multi-Tenancy (Super Admin)
- ✅ Tenant/agency management
- ✅ Subscription monitoring and management
- ✅ Usage analytics
- ✅ Tenant onboarding wizard
- ✅ Health score monitoring
- ✅ Payment gateway configuration per tenant
- ✅ Admin controls and permissions
- ✅ Tenant profile customization

### Task Management
- ✅ Task boards and lists
- ✅ Task assignment
- ✅ Task completion tracking
- ✅ My tasks view
- ✅ Task priorities and statuses

### User Management
- ✅ User listing and search
- ✅ Role-based access control (RBAC)
- ✅ Permission management
- ✅ User invitation system
- ✅ Profile editing
- ✅ User preferences

### Authentication & Security
- ✅ Secure login with validation
- ✅ Password reset flow
- ✅ Email verification
- ✅ Session management
- ✅ Protected routes
- ✅ Role-based permissions
- ✅ User invitation tokens

### Public Document Access
- ✅ Public invoice viewing via secure tokens
- ✅ Contract preview pages
- ✅ Verification pages
- ✅ Mobile-responsive document views

---

## 🔗 API Integration

The frontend connects to a RESTful API with a comprehensive client layer:

### API Client Architecture
- ✅ **20+ dedicated API modules** organized by entity
- ✅ **Axios-based HTTP client** with interceptors
- ✅ **Type-safe responses** with TypeScript interfaces
- ✅ **Error handling** with consistent error formats
- ✅ **TanStack Query integration** for caching and refetching

### Available API Modules

#### Core Entities
- `bookings.ts` - Booking CRUD and lifecycle operations
- `clients.ts` - Client management and profiling
- `vehicles.ts` - Fleet management and status tracking
- `invoices.ts` - Invoice generation and retrieval
- `payments.ts` - Payment processing and history
- `contracts.ts` - Contract creation and management

#### User & Access
- `users.ts` - User CRUD and management
- `tenants.ts` - Multi-tenant operations
- `subscriptions.ts` - Subscription management
- `roleTemplates.ts` - Role and permission templates
- `user-preferences.ts` - User settings storage

#### Operations
- `tasks.ts` - Task management and assignment
- `reports.ts` - Analytics and reporting data
- `activityLogs.ts` - Audit trail and activity tracking
- `tenant-profile.ts` - Tenant configuration
- `subscriptionClient.ts` - Client-side subscription ops

### API Configuration
```typescript
// Base URL configured via environment variable
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

// API client handles:
// - Authentication headers
// - Request/response transformation
// - Error handling
// - Retry logic (planned)
// - Loading states
```

---

## 🛡️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
API_SECRET_KEY=your_secret_key_here

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google Maps (for address autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Optional Features
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Schema Validation](https://zod.dev/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)

---

## 🤝 Contributing

When contributing to this project:

1. **Follow the architecture** - Use the shared layout pattern, don't add layouts to content pages
2. **Use the design system** - Import colors and tokens from `brand.ts`
3. **TypeScript first** - Always use proper types and interfaces
4. **Component modularity** - Keep components small, focused, and reusable
5. **Custom hooks** - Extract business logic into hooks for reusability
6. **API client usage** - Use the existing API modules, don't make raw fetch calls
7. **TanStack Query** - Use React Query for server state management
8. **Form handling** - Use React Hook Form with Zod validation
9. **Responsive design** - Test on mobile, tablet, and desktop
10. **Accessibility** - Follow WCAG guidelines for all new components

### Code Style

- Use functional components with TypeScript
- Prefer composition over inheritance
- Use named exports for components
- Follow ESLint configuration
- Write meaningful commit messages

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| TypeScript Files | 297+ |
| React Components | 180+ |
| Custom Hooks | 47 |
| API Modules | 20+ |
| Dashboard Routes | 15+ |
| Super Admin Routes | 6+ |
| Public Pages | 4+ |

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: January 2026  
**Current Version**: Production-Ready Core  
**Status**: Feature-complete rental management platform  
**Next Focus**: Testing, Advanced Features & Mobile Optimization

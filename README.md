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

### Project Setup
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS with custom color system
- ✅ Brand design system (`brand.ts`)
- ✅ Responsive layout structure
- ✅ Tailwind configuration with extended colors
- ✅ Global CSS setup
- ✅ Font optimization with Inter

### Architecture
- ✅ Shared dashboard layout pattern
- ✅ Sidebar navigation structure
- ✅ Dashboard shell for main app
- ✅ Super-admin section structure
- ✅ Authentication routes (auth folder)

### File Organization
- ✅ Component folder structure (layout + ui)
- ✅ Context folder for state management
- ✅ Lib folder for utilities and types
- ✅ Public folder for static assets

---

## 📝 What Needs to Be Done

### Phase 1: Core Components (Priority: HIGH)
- [ ] **Sidebar Component** - Full navigation with active states
- [ ] **Header Component** - Top navigation with user menu
- [ ] **Footer Component** - App footer
- [ ] **Layout Wrapper** - Combine sidebar + header + footer
- [ ] **Authentication Context** - Implement auth state management
- [ ] **Protected Routes** - Route guards for authenticated pages

### Phase 2: UI Components Library (Priority: HIGH)
- [ ] **Button Component** - Multiple variants (primary, secondary, danger)
- [ ] **Card Component** - Consistent card styling
- [ ] **Modal/Dialog** - For confirmations and forms
- [ ] **Input Fields** - Text, email, password, select
- [ ] **Data Table** - Sortable, filterable tables
- [ ] **Pagination** - For large datasets
- [ ] **Tabs** - Tab navigation component
- [ ] **Breadcrumbs** - Navigation hints
- [ ] **Alert/Toast** - Notifications
- [ ] **Spinner/Loading** - Loading states
- [ ] **Badge** - Status indicators
- [ ] **Dropdown Menu** - Action menus

### Phase 3: Authentication (Priority: HIGH)
- [ ] **Login Page** - User authentication UI
- [ ] **Login Logic** - Auth service integration
- [ ] **Session Management** - Token storage and refresh
- [ ] **Logout Functionality** - Clear session
- [ ] **Remember Me** - Session persistence
- [ ] **Error Handling** - Invalid credentials, etc.

### Phase 4: Dashboard Pages (Priority: HIGH)
- [ ] **Dashboard/Home** - Overview with key metrics
- [ ] **Bookings Page** - List view with filters
- [ ] **Booking Details** - Individual booking page
- [ ] **Create Booking** - New booking form
- [ ] **Clients Page** - Client list
- [ ] **Client Details** - Client profile
- [ ] **Create Client** - New client form
- [ ] **Fleet Page** - Vehicle inventory
- [ ] **Vehicle Details** - Individual vehicle page
- [ ] **Add Vehicle** - New vehicle form

### Phase 5: Additional Features (Priority: MEDIUM)
- [ ] **Contracts Page** - Contract management
- [ ] **Invoices Page** - Invoice listing and creation
- [ ] **Payments Page** - Payment tracking
- [ ] **Reports Page** - Analytics and charts
- [ ] **Settings Page** - User preferences
- [ ] **Super Admin Panel** - Multi-tenant features
- [ ] **Search Functionality** - Global search
- [ ] **Filters/Advanced Search** - Better filtering
- [ ] **Export to PDF** - Report generation
- [ ] **Dark Mode** - Optional dark theme

### Phase 6: Backend Integration (Priority: MEDIUM)
- [ ] **API Client Setup** - Axios or Fetch wrapper
- [ ] **Error Handling** - Consistent error management
- [ ] **Loading States** - Show spinners during requests
- [ ] **Retry Logic** - Automatic retry on failure
- [ ] **Request/Response Interceptors** - Auth headers, etc.
- [ ] **Type Safety** - Generate types from API

### Phase 7: Performance & Quality (Priority: MEDIUM)
- [ ] **Image Optimization** - Next.js Image component
- [ ] **Code Splitting** - Dynamic imports for large components
- [ ] **Testing** - Unit and integration tests
- [ ] **E2E Testing** - Cypress or Playwright
- [ ] **Performance Monitoring** - Analytics
- [ ] **SEO Optimization** - Meta tags, structured data
- [ ] **Accessibility** - WCAG compliance
- [ ] **Error Boundaries** - Error handling UI

### Phase 8: Deployment & DevOps (Priority: LOW)
- [ ] **Environment Setup** - Dev, staging, production configs
- [ ] **CI/CD Pipeline** - Automated deployments
- [ ] **Docker** - Containerization
- [ ] **Documentation** - API docs, deployment guide
- [ ] **Monitoring** - Error tracking, logging
- [ ] **Performance Monitoring** - Analytics dashboard

---

## 🗺️ Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)
1. Create shared layout components (Sidebar, Header, Footer)
2. Implement dashboard shell layout
3. Set up authentication context
4. Create basic UI component library

### Sprint 2: Authentication (Week 2-3)
1. Build login page
2. Implement authentication logic
3. Add protected routes
4. Set up session management

### Sprint 3: Core Dashboard Features (Week 3-4)
1. Dashboard overview page
2. Clients CRUD pages
3. Fleet management pages
4. Bookings CRUD pages

### Sprint 4: Additional Features (Week 4-5)
1. Contracts management
2. Invoicing system
3. Payments tracking
4. Reports page

### Sprint 5: Backend Integration & Polish (Week 5-6)
1. Connect to backend API
2. Implement error handling
3. Add loading states
4. Performance optimization

### Sprint 6: Testing & Deployment (Week 6+)
1. Unit and integration tests
2. E2E testing
3. Security review
4. Deployment setup

---

## 🎯 Key Features

### Dashboard Overview
- Real-time metrics and KPIs
- Quick action buttons
- Recent activity feed
- Visual charts and graphs

### Fleet Management
- Vehicle inventory tracking
- Maintenance scheduling
- Status monitoring
- Cost analysis per vehicle

### Client Management
- Comprehensive client profiles
- Rental history
- Communication log
- Payment tracking

### Booking System
- Create and modify bookings
- Availability checking
- Automatic pricing calculation
- Booking confirmation workflow

### Contract Management
- Digital contract creation
- Document management
- E-signature integration (future)
- Audit trail

### Invoicing
- Automated invoice generation
- Customizable templates
- Payment tracking
- Overdue reminders

### Reporting
- Revenue analytics
- Fleet utilization reports
- Client demographics
- Payment reports
- Exportable dashboards

### Multi-Tenancy (Super Admin)
- Tenant management
- Subscription monitoring
- Usage analytics
- Admin controls

---

## 🔗 API Integration

The frontend connects to a RESTful API. The API client is configured in [`src/lib/api-client.ts`](src/lib/api-client.ts).

### Expected API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/dashboard` - Dashboard metrics
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/fleet` - List vehicles
- `POST /api/fleet` - Add vehicle
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/payments` - List payments
- `GET /api/reports` - Get report data

---

## 🛡️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
API_SECRET_KEY=your_secret_key_here

# Auth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

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

---

## 🤝 Contributing

When contributing to this project:

1. Follow the shared layout pattern - don't add layouts to content pages
2. Use the brand colors from `brand.ts`
3. Follow TypeScript conventions
4. Keep components modular and reusable
5. Use Tailwind utility classes for styling
6. Test on multiple screen sizes

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: June 2026
**Current Phase**: Foundation Setup
**Next Focus**: Core Components Library & Layout Implementation

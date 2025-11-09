# LogicFrame - Invoice Management SaaS

## Overview

LogicFrame is a Next.js-based SaaS platform designed for freelancers and solopreneurs to manage their business operations. The application provides professional tools for invoice generation, expense tracking, and other business utilities. Built with a modern tech stack, it emphasizes simplicity and ease of use with a "no bloat, no BS" philosophy.

The platform offers a freemium model with basic features available for free and premium features unlocked through a Pro subscription at $9/month.

## Recent Changes

**October 25, 2025**: Migrated from Vercel to Replit
- Configured Next.js development server to run on port 5000 and bind to 0.0.0.0 for Replit compatibility
- Set up development workflow to automatically run the server
- Configured autoscale deployment for production with proper build and start commands
- Application successfully running on Replit with all features functional

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15.5.6 with App Router
- Server and client components pattern for optimal rendering
- Client-side rendering ("use client") used for interactive components
- File-based routing under `/app` directory
- API routes handled through Next.js server functions

**UI Component Library**: Radix UI primitives with custom styling
- Comprehensive set of accessible UI components (dialogs, dropdowns, forms, etc.)
- shadcn/ui pattern for component composition
- Tailwind CSS v4 for styling with custom design tokens
- Dark mode support via ThemeProvider with system preference detection

**State Management**:
- React Query (@tanstack/react-query) for server state and caching
- Local React state (useState, useEffect) for UI state
- Custom hooks pattern (useAuth, useInvoices, useToast) for encapsulated logic

**Form Handling**:
- React Hook Form for form state management
- Zod for schema validation (@hookform/resolvers)
- Custom validation schemas in `/shared/schema.js`

### Data Storage

**Primary Storage**: Browser LocalStorage
- Invoice data stored under `invoicemaker_invoices` key
- Metadata stored under `invoicemaker_meta` key
- Real-time synchronization via Storage Events for cross-tab updates
- No backend database currently implemented

**Data Structure**:
- Invoices include: client info, line items, dates, status (pending/paid/overdue), calculations
- Auto-generated invoice numbers and unique IDs
- Statistics calculated client-side from invoice array

### Authentication & Authorization

**Current Implementation**: Mock authentication system
- Demo user injected client-side via useAuth hook
- No real authentication backend
- Subscription status tracked in mock user object
- Ready for integration with actual auth provider (structure in place)

**Planned Integration**: Stripe for payment processing
- Subscription form components present but not activated
- loadStripe configured but set to null pending setup

### PDF Generation

**Library**: @react-pdf/renderer
- Multiple invoice templates (modern, classic, minimal)
- Logo upload support with base64 encoding
- Template-specific styling and theming
- Client-side PDF generation and download

**Template System**:
- Configurable color schemes per template
- Support for custom branding
- Responsive layout for different invoice sizes

### Routing Structure

**Public Pages**:
- `/` - Landing page with hero, features, pricing, about sections
- `/invoicemaker` - Invoice app dashboard
- `/invoicemaker/invoices` - Invoice list view
- `/invoicemaker/invoice-view` - Create new invoice
- `/invoicemaker/invoices/[id]` - View specific invoice
- `/invoicemaker/pricing` - Pricing information

**Component Organization**:
- Shared UI components in `/invoicemaker/client/components/ui/`
- Feature components in `/invoicemaker/client/components/`
- Business logic hooks in `/invoicemaker/client/hooks/`
- Utilities in `/invoicemaker/client/lib/`

### Design System

**Color Scheme**:
- Primary accent: `#00D9FF` (cyan/turquoise)
- Dark backgrounds: `#0f1729`, `#0a0f1e`
- Gradient effects and floating animations for visual interest
- Glass morphism effects with backdrop blur

**Typography**:
- Geist Sans and Geist Mono font families from Google Fonts
- CSS custom properties for theming
- Responsive font scaling

**Layout Patterns**:
- Max-width containers (1200px-1400px) for content
- Grid-based responsive layouts
- Card-based component design
- Sticky navigation with blur backdrop

## External Dependencies

### Core Framework
- **Next.js 15.5.6**: React framework with App Router
- **React 19.1.0 & React DOM 19.1.0**: UI library

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS framework via @tailwindcss/postcss
- **Radix UI**: Accessible component primitives (20+ components)
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Utility for merging Tailwind classes

### Forms & Validation
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **@hookform/resolvers**: Form validation resolver

### Data & State
- **@tanstack/react-query**: Server state management and caching
- **date-fns**: Date manipulation and formatting

### PDF Generation
- **@react-pdf/renderer**: PDF document generation

### Notifications
- **sonner**: Toast notification system

### Development
- **ESLint**: Code linting (@eslint/eslintrc)

### Future Integration Points
- Stripe payment processing (components ready, not activated)
- Backend API (structure prepared with queryClient utilities)
- Database integration (Drizzle-ready architecture)
- User authentication system (mock implementation present)
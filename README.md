# The ORDINARY — Skincare E-Commerce Web App

A full-featured skincare e-commerce web application built with **Angular 21** and **Supabase**. The app allows users to browse and purchase skincare products, manage their cart and orders, and provides an admin panel for managing products and users.

---

## Features

### Shopping
- Browse all skincare products fetched in real-time from Supabase
- Filter products by category: **Cleanse, Serum, Gel, Balm, Cream**
- View detailed product pages
- Add products to cart with quantity management
- Sliding cart sidebar with item count badge

### Authentication
- User registration and login with JWT-based auth
- "Remember me" functionality
- Forgot password flow
- Route guards: protected routes for authenticated users, guest-only routes for login/register
- Automatic redirect to admin panel for admin users after login

### Checkout & Orders
- Full checkout form with shipping address and payment details (card or cash on delivery)
- Form validation (email format, phone number, 16-digit card number, CVV, expiry date)
- Free shipping on orders over $100
- Order confirmation page with order summary
- Orders saved to localStorage

### Admin Panel
- Protected by `adminGuard` — accessible only to admin role users
- **Dashboard** — overview of the store
- **Products management** — add, edit, and delete products with image upload to Supabase Storage
- **Users management** — view and manage registered users

### Journal / Blog
- Static blog section on the homepage with skincare-related articles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| Language | TypeScript 5.9 |
| Backend / Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage (`product-images` bucket) |
| Auth | Custom JWT auth using `localStorage` |
| State Management | RxJS `BehaviorSubject` |
| Testing | Vitest |
| Styling | CSS (component-scoped) |

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── dashboard/        # Admin overview
│   │   │   ├── products/         # Product CRUD
│   │   │   └── users/            # User management
│   │   ├── auth/                 # Login page
│   │   ├── cart/                 # Cart sidebar
│   │   ├── checkout/             # Checkout form
│   │   ├── forgot-password/      # Password reset
│   │   ├── header/               # Navigation bar
│   │   ├── homepage/             # Product listing + journal
│   │   ├── not-found/            # 404 page
│   │   ├── orders/               # Order confirmation
│   │   ├── product-detail/       # Single product view
│   │   └── register/             # Registration page
│   ├── guards/
│   │   └── auth.guard.ts         # authGuard, guestGuard, adminGuard
│   ├── interceptors/
│   │   └── auth.interceptor.ts   # HTTP auth interceptor
│   ├── services/
│   │   ├── auth.service.ts       # Login, register, JWT logic
│   │   ├── cart.service.ts       # Cart state management
│   │   └── supabase.service.ts   # DB & storage interactions
│   ├── app.routes.ts             # App routing
│   └── app.config.ts             # App configuration
└── assets/
    └── journal/                  # Blog article images
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.dev/tools/cli) v21

### Installation

```bash
# Clone the repository
git clone https://github.com/mtkebuch/skincareWeb.git
cd skincareWeb

# Install dependencies
npm install

# Start the development server
ng serve
```

Then open your browser at **http://localhost:4200**.

---

## Supabase Setup

The app connects to a Supabase project for product data and image storage. The following tables are required:

**`skincare_products`**
| Column | Type |
|---|---|
| id | uuid (primary key) |
| name | text |
| description | text |
| price | numeric |
| category | text |
| image_url | text |

**`users`** (for admin user management panel)
| Column | Type |
|---|---|
| id | uuid (primary key) |
| email | text |
| role | text |
| created_at | timestamp |

A **Supabase Storage bucket** named `product-images` is also required for admin image uploads.

---

## Default Admin Account

On first run, a default admin account is seeded into `localStorage`:

| Field | Value |
|---|---|
| Email | `admin@skincare.com` |
| Password | `Admin123!` |

> ⚠️ Change this before deploying to production.

---

## Available Scripts

```bash
ng serve       # Start dev server at localhost:4200
ng build       # Build for production (output in /dist)
ng test        # Run unit tests with Vitest
ng build --watch --configuration development  # Watch mode
```

---

## Security Notes

- JWT tokens are implemented client-side using `btoa`/`atob` with a hardcoded secret. This is **not secure for production** — consider using a proper backend auth service (e.g., Supabase Auth).
- User data and orders are stored in `localStorage`, which does not persist across devices.
- The Supabase anon key is currently hardcoded in `supabase.service.ts`. Move it to environment variables before deploying.

---

## License

This project is for educational/personal use.

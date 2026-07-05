# Seth Store — Backend API

A Laravel REST API powering **Seth Store**, a multi-category e-commerce platform (Books, Drinks, Computers, Phones). Built with clean architecture, role-based access control, and per-category product management.

## Tech Stack

- **Framework:** Laravel 10
- **Auth:** Laravel Sanctum (token-based API auth)
- **Database:** PostgrestSQL
- **Storage:** Local disk (`storage/app/public`) for product images

## Features

- **Multi-category catalog** — Books, Drinks, Computer Products, Phone Products, each with dedicated tables, models, and controllers, all linked to a shared `categories` table
- **Role-based access** — `admin` / `user` roles via a backed PHP enum (`UserRole`), enforced through an `AdminMiddleware` guard on protected routes
- **Authentication** — Register, login, logout, and current-user endpoints secured with Sanctum tokens
- **Product management** — Full CRUD per category, including image upload/replacement/deletion via Laravel's filesystem
- **Order system** — Category-specific order tables (drinks, books, computer shop, phone shop) plus a unified `orders` table, each storing a **price/name snapshot** at time of purchase so historical orders stay accurate even if product data changes later
- **Feedback system** — Authenticated users can submit feedback tied to their account
- **Order status tracking** — `pending → confirmed → delivered / cancelled` lifecycle, admin-controlled

## Key Endpoints

| Resource | Route prefix | Notes |
|---|---|---|
| Auth | `/api/login`, `/api/register`, `/api/logout`, `/api/user` | Sanctum |
| Categories | `/api/categories` | Admin-only write |
| Books | `/api/books` | Admin-only write |
| Drinks | `/api/drinks` | Admin-only write |
| Computer Products | `/api/computer-products` | Admin-only write |
| Phone Products | `/api/phone-products` | Admin-only write |
| Orders | `/api/orders` | Auth required |
| Computer Shop Orders | `/api/computer-shop-orders` | Admin manages, user creates |
| Feedback | `/api/feedback` | Auth required |
| Users | `/api/users` | Admin-only |

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate

# configure DB_* in .env (PostgrestSQL)
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Seeded accounts:
- `admin@gmail.com` / `password` (admin)
- `user@gmail.com` / `password` (user)

## Notes

- Enum casts (`role`) must be accessed via `->value` when returned as JSON.
- Each Eloquent model lives in its own file — required for Laravel's autoloader to resolve classes correctly.
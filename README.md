# AasaMedChem — Inventory & Order Management System

A hackathon project for the AasaMedChem recruitment process. Full-stack Next.js app with local PostgreSQL, role-based auth, unit conversion, and a quotation/order flow.

## Tech Stack

- **Frontend + Backend**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL via Prisma ORM (local; swap `DATABASE_URL` to connect to Neon)
- **Auth**: Custom cookie-based session (no NextAuth dependency)
- **Styling**: Tailwind CSS v4 (utility classes)
- **Deployment**: Vercel (swap `DATABASE_URL` to Neon for production)

## Database Schema

### `users`
| Column | Type | Notes |
|----------|----------|-------------------------------|
| id | cuid | PK |
| name | String | Display name |
| email | String | Unique, used for login |
| password | String | bcrypt hash |
| role | Role | `ADMIN` or `SELLER` |

### `products`
| Column | Type | Notes |
|------------------|----------------|---------------------------------------------|
| id | cuid | PK |
| name | String | Product name |
| category | String? | Optional category |
| sku | String? | Unique SKU |
| dimension | UnitDimension | `WEIGHT` / `VOLUME` / `COUNT` |
| pricePerBaseUnit | Decimal(14,4) | INR price per **1 base unit** |
| stockQuantity | Decimal(14,4) | Current stock in **base units** |
| reorderThreshold | Decimal(14,4)? | Low-stock alert threshold |

### `product_units`
| Column | Type | Notes |
|-------------|----------------|-----------------------------------------------------|
| id | cuid | PK |
| productId | String | FK → products |
| unit | String | `"g"`, `"kg"`, `"mL"`, `"L"`, `"unit"` |
| label | String | Display label |
| amountInBase| Decimal(14,4) | How many base units = 1 of this unit |

### `quotations`
| Column | Type | Notes |
|-------------|---------|----------------------------------------|
| id | cuid | PK |
| reference | String | Unique, human-readable ID (cuid prefix)|
| status | QuotationStatus | `PENDING` / `APPROVED` / `REJECTED` / `FULFILLED` |
| requestedById| String | FK → users |
| subtotal | Int | Total in **paisa** (₹ × 100) |
| taxAmount | Int | 18% GST in paisa |
| totalAmount | Int | subtotal + taxAmount in paisa |
| notes | String? | Optional order notes |

### `quotation_items`
| Column | Type | Notes |
|--------------|----------------|---------------------------------------------|
| id | cuid | PK |
| quotationId | String | FK → quotations |
| productId | String | FK → products |
| orderUnit | String | Unit chosen at time of order |
| orderQty | Decimal(14,4) | Quantity in order unit |
| baseQty | Decimal(14,4) | Converted quantity in base units |
| pricePerBase | Decimal(14,4) | Price per base unit at time of order |
| lineTotal | Int | Line total in paisa |

## Unit Conversion Strategy

### Storage Philosophy
All quantities are stored in **base units** internally. Every product has a `dimension` (WEIGHT, VOLUME, COUNT) that determines its base unit:

| Dimension | Base Unit | Reason |
|-----------|-----------|---------------------------------------|
| WEIGHT | grams (g) | Natural smallest unit, avoids fractions|
| VOLUME | millilitres (mL) | Same — avoids sub-unit fractions |
| COUNT | unit | 1:1 with base unit |

### Conversion Table
| Unit | Dimension | → Base factor |
|------|-----------|---------------|
| g | WEIGHT | 1 |
| kg | WEIGHT | 1000 (1 kg = 1000 g) |
| mL | VOLUME | 1 |
| L | VOLUME | 1000 (1 L = 1000 mL) |
| unit | COUNT | 1 |

### Conversion Points
1. **Before saving to DB**: Order quantity → base units via `toBaseQty(qty, unit)` from `src/lib/units.ts`. Stored as `baseQty`.
2. **Stock deduction**: Always subtracts `baseQty` from `stockQuantity` (which is stored in base units).
3. **Price calculation**: `baseQty × pricePerBaseUnit = line total in paisa`.
4. **Display in UI**: Products show price per base unit (`₹X/g`, `₹X/mL`, `₹X/unit`). Cart shows both the ordered qty/unit and the equivalent base qty for verification.

### Numeric Precision
- `Decimal(14, 4)` on all quantity and price fields → supports values up to ~10 billion with 4 decimal precision.
- Monetary totals stored as `Int` in **paisa** (₹ × 100) — avoids floating point errors entirely.
- `Decimal(14, 4)` on Prisma side maps to `NUMERIC(14,4)` in PostgreSQL.

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/session` | Get current session user |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Any | List products (search + filter) |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/[id]` | Any | Get single product |
| PUT | `/api/products/[id]` | Admin | Update product |
| DELETE | `/api/products/[id]` | Admin | Delete product |

### Quotations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/quotations` | Admin | List all (filter by status) |
| GET | `/api/quotations?mine=1` | Seller | List own quotations |
| POST | `/api/quotations` | Seller | Place quotation (deducts stock) |
| GET | `/api/quotations/[id]` | Any | Get single quotation |
| PATCH | `/api/quotations/[id]` | Admin | Update status |

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Neon)
- Bun (recommended) or npm

### 1. Clone & Install
```bash
npm install # or: bun install
```

### 2. Database Setup

**Local PostgreSQL:**
```bash
# Create database
psql -U $(whoami) -d postgres -c "CREATE DATABASE aasamedchem;"

# Run migrations
bun prisma migrate dev --name init

# Seed test data
bun run prisma/seed.ts
```

**Neon (production):**
```bash
# Update .env with your Neon connection string
# DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

bun prisma migrate dev --name init
bun run prisma/seed.ts
```

### 3. Run Development Server
```bash
bun next dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Vercel Deployment
```bash
# Set environment variable in Vercel dashboard:
# DATABASE_URL = your Neon connection string

vercel deploy
```

## Test Credentials

| Role | Email | Password |
|--------|----------------------------|-------------|
| Admin | admin@aasamedchem.com | admin123 |
| Seller | seller@aasamedchem.com | seller123 |

## Usage Guide

### Admin Flow
1. Log in as **Admin** → redirects to `/admin/products`
2. **Products**: Create products with dimension, price per base unit, stock quantity, and available units
3. **Quotations**: View all incoming quotations with full breakdown (ordered qty, base qty, rate, line total). Approve / Reject / Mark Fulfilled

### Seller Flow
1. Log in as **Seller** → redirects to `/seller/products`
2. **Browse Products**: Search/filter by name, category, or dimension
3. **Add to Cart**: Select unit (g/kg/mL/L/unit), enter quantity → see calculated price based on conversion
4. **Place Quotation**: Review cart, add notes, submit → stock is deducted immediately
5. **My Orders**: View own quotation history with status

## Key Design Decisions

1. **Base unit storage**: Each dimension has a canonical base unit. Conversions happen at order time, not storage time. This means stock levels are always consistent (never mix g and kg).
2. **Paisa for money**: Monetary fields stored as integer paisa to avoid floating point errors. Displayed as formatted INR.
3. **Decimal(14,4)**: Supports up to 10 billion with 4 decimal places — enough for any chemical quantity or price.
4. **No NextAuth**: Simple cookie session with a signed token avoids extra dependencies for a single-role auth system.
5. **Conversion in UI**: The cart shows both ordered qty/unit AND the equivalent base qty before checkout, so the seller can verify the math.
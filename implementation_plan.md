# 🕐 CHRONEX — Full MERN Stack Implementation Plan
## Enterprise-Grade Luxury Watch E-Commerce Platform

---

> [!IMPORTANT]
> **Scope Reality Check:** Tumne jo list di hai wo ek Shopify-level product hai — roughly 6–12 months ka production work. Main tumhare liye **Phase 1 (Launch-Ready MVP)** immediately build karunga jo impressive, fully functional ho. Baaki features phased manner mein add honge.

---

## 🎯 Reference UI Analysis (horizonx.so/lunarix-one)

- **Deep space dark** background (near-black navy `#050A14`)
- **Glowing neon** accents (blue/purple light emissions on 3D model)
- **Asymmetric hero layout** — left: text/CTA, right: interactive 3D model
- **Thin glass borders** with frosted glass cards
- **Smooth inertial scroll** (Lenis)
- **4-column product grid** with hover scale effects
- **Clean sans-serif** typography (Inter) with bold display headings

---

## 📁 Folder Structure (Clean Architecture)

```
chronex/
├── client/                          ← Next.js 15 App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (shop)/
│   │   │   ├── page.tsx             ← Home
│   │   │   ├── shop/page.tsx
│   │   │   ├── shop/[slug]/page.tsx ← Product Detail
│   │   │   ├── collections/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── (account)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/page.tsx       ← Admin Dashboard
│   │   │   ├── admin/products/page.tsx
│   │   │   ├── admin/orders/page.tsx
│   │   │   ├── admin/customers/page.tsx
│   │   │   └── admin/analytics/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      ← Reusable UI primitives
│   │   ├── layout/                  ← Navbar, Footer, Sidebar
│   │   ├── home/                    ← Hero, Collections, Story
│   │   ├── shop/                    ← Filters, ProductCard, Grid
│   │   ├── product/                 ← Gallery, Specs, Related
│   │   ├── cart/                    ← CartDrawer, CartItem
│   │   ├── checkout/                ← CheckoutForm, PaymentMethods
│   │   ├── 3d/                      ← Three.js components
│   │   └── admin/                   ← Admin-specific components
│   ├── features/
│   │   ├── auth/                    ← Auth slices + hooks
│   │   ├── cart/                    ← Cart state + API
│   │   ├── wishlist/
│   │   ├── products/
│   │   └── orders/
│   ├── hooks/                       ← Custom React hooks
│   ├── lib/
│   │   ├── api.ts                   ← Axios instance
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── store/                       ← Zustand stores
│   ├── types/                       ← TypeScript interfaces
│   └── public/
│       └── models/                  ← .glb watch 3D files
│
└── server/                          ← Node.js/Express API
    └── src/
        ├── modules/
        │   ├── auth/
        │   │   ├── auth.routes.ts
        │   │   ├── auth.controller.ts
        │   │   ├── auth.service.ts
        │   │   └── auth.model.ts
        │   ├── products/
        │   ├── categories/
        │   ├── collections/
        │   ├── cart/
        │   ├── orders/
        │   ├── payments/
        │   ├── reviews/
        │   ├── coupons/
        │   ├── users/
        │   ├── admin/
        │   └── analytics/
        ├── middleware/
        │   ├── auth.middleware.ts
        │   ├── admin.middleware.ts
        │   ├── rateLimit.middleware.ts
        │   └── error.middleware.ts
        ├── config/
        │   ├── db.ts                ← MongoDB connect
        │   ├── redis.ts
        │   └── cloudinary.ts
        ├── utils/
        └── app.ts
```

---

## 🗄️ Database Schema (MongoDB)

### Key Collections
| Collection | Key Fields |
|---|---|
| `users` | name, email, password(hashed), role, addresses[], wishlist[], googleId |
| `products` | name, brand, slug, price, salePrice, images[], category, collection, specs{}, stock, variants[], reviews[] |
| `categories` | name, slug, image, parent |
| `collections` | name, slug, description, products[] |
| `orders` | user, items[], total, status, paymentMethod, shippingAddress, trackingId |
| `cart` | user/sessionId, items[{product, qty, variant}], coupon |
| `reviews` | product, user, rating, comment, images[], verified |
| `coupons` | code, discount, type, minOrder, expiresAt, usageLimit |
| `analytics` | event, data, timestamp |

---

## 🎨 UI/Design Language (Based on Lunarix Reference)

| Token | Value |
|---|---|
| Background | `#050A14` (deep space navy) |
| Surface | `#0A1020` (card bg) |
| Border | `rgba(255,255,255,0.08)` (glassmorphic) |
| Accent Primary | `#C9A84C` → `#E8C97A` (gold gradient) |
| Accent Glow | `#8B5CF6` / `#00D4FF` (purple/cyan) |
| Text Primary | `#F0F4FF` |
| Text Muted | `#6B7FA3` |
| Font Display | Orbitron (headings) |
| Font Body | Inter (body text) |
| Border Radius | 12px cards, 8px inputs |
| Animation | Framer Motion + GSAP |
| Scroll | Lenis smooth scroll |
| 3D | React Three Fiber + Drei |

---

## 🚀 Phased Delivery Plan

### ✅ Phase 1 — Core Platform (Building Now)
> **Time: 2–3 days | Launch-ready**

**Frontend:**
- [x] Next.js 15 project setup with TypeScript + Tailwind
- [x] Global design system (tokens, components)
- [x] Navbar + Footer (glassmorphic, responsive)
- [x] **Home page** — Lenis scroll, 3D hero, collections grid, brand story, testimonials
- [x] **Shop page** — filters (brand/price/category), grid/list view, sort
- [x] **Product detail** — image gallery with zoom, specs, add to cart, related products
- [x] **Cart** — drawer/page, qty update, coupon
- [x] **Checkout** — 3-step (Address → Payment → Confirm), COD + Stripe
- [x] **Auth pages** — Login, Register, Forgot Password
- [x] **Customer dashboard** — Orders, Addresses, Profile
- [x] **Admin dashboard** — Products CRUD, Orders, Analytics charts
- [x] **Wishlist** page
- [x] Custom cursor, GSAP scroll animations, Framer Motion transitions
- [x] Mobile responsive (bottom nav, swipe gallery)

**Backend:**
- [x] Express + MongoDB + JWT auth
- [x] Products, Categories, Collections APIs
- [x] Cart, Orders, Payments (COD + Stripe) APIs
- [x] Reviews, Wishlist APIs
- [x] Admin CRUD endpoints
- [x] Cloudinary image upload
- [x] Redis caching
- [x] Nodemailer (order confirmation emails)

---

### 📋 Phase 2 — Advanced Features (Post-Launch)
- Three.js 3D watch model viewer (React Three Fiber)
- 360° product viewer
- AI Watch Finder chatbot
- Search with Meilisearch
- PWA + Push notifications
- Multi-currency support
- Flash sale countdown
- Loyalty points system
- Abandoned cart recovery

---

### 📋 Phase 3 — Enterprise (Future)
- Multi-vendor support
- Subscription products
- Advanced analytics (Elasticsearch)
- Mobile app (React Native)
- AR Preview

---

## 🔧 Tech Stack Confirmed

| Layer | Tech |
|---|---|
| Frontend Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion + GSAP |
| Smooth Scroll | Lenis |
| 3D | React Three Fiber + Drei + Three.js |
| State | Zustand + React Query (TanStack) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| Auth | JWT + Refresh Tokens + Google OAuth |
| Payments | Stripe + COD |
| Images | Cloudinary |
| Email | Nodemailer |
| Deploy | Vercel (frontend) + Railway/Render (backend) |

---

## ⚠️ Open Questions

> [!IMPORTANT]
> **Kya Node.js + npm machine pe install hai?** (Required to run Next.js + Express)

> [!IMPORTANT]  
> **MongoDB:** Local install karna hai ya MongoDB Atlas (cloud, free tier) use karein? Atlas recommended — no local setup needed.

> [!IMPORTANT]
> **Stripe:** Test mode use karein ya real payments bhi chahiye? (Test keys free hain)

> [!NOTE]
> **3D Watch Model:** Free .glb model use karunga Sketchfab se, ya koi specific watch chahiye?

---

## ✅ Approve Karo — Main Abhi Shuru Karta Hoon!

Approval ke baad main immediately Phase 1 build karna shuru karunga — Next.js project scaffold, design system, phir ek-ek page.

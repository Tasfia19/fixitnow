# FixItNow Frontend-Backend API Integration Map

This document outlines how the Next.js App Router frontend components consume and map to the modular backend Express REST API endpoints.

---

## 🔑 Authentication Modules

| Frontend Component | Next.js Page Path | Backend Endpoint Consumed | HTTP Method | Payload / Headers |
| :--- | :--- | :--- | :--- | :--- |
| **Login Form** | `/auth/login` | `/api/auth/login` | `POST` | `{ email, password }` |
| **Registration Form** | `/auth/register` | `/api/auth/register` | `POST` | `{ name, email, password, role }` |
| **Session Context** | Global Context mount | `/api/auth/me` | `GET` | `Authorization: Bearer <token>` |

---

## 🌐 Public Browsing & Searching

| Frontend Component | Next.js Page Path | Backend Endpoint Consumed | HTTP Method | Filters / URL Parameters |
| :--- | :--- | :--- | :--- | :--- |
| **Home Landing Grid** | `/` | `/api/services`<br>`/api/categories`<br>`/api/technicians` | `GET`<br>`GET`<br>`GET` | Retrieves top-rated technicians and featured lists. |
| **Search Filters** | `/services` | `/api/services`<br>`/api/categories` | `GET`<br>`GET` | Real-time filters: `search`, `categoryId`, `location`, `rating`, `priceMin`, `priceMax`. |
| **Technician Profile** | `/technicians/[id]` | `/api/technicians/:id` | `GET` | Fetch profile biography, skills list, and review list. |

---

## 👤 Customer Booking Actions

| Frontend Component | Next.js Page Path | Backend Endpoint Consumed | HTTP Method | Payload / Headers |
| :--- | :--- | :--- | :--- | :--- |
| **Scheduler Picker** | `/technicians/[id]` | `/api/bookings` | `POST` | `{ serviceId, scheduledAt }`<br>`Authorization: Bearer <token>` |
| **Schedules List** | `/dashboard/customer` | `/api/bookings` | `GET` | `Authorization: Bearer <token>` (filters customer's list) |
| **Cancel Booking** | `/dashboard/customer` | `/api/bookings/:id/cancel` | `PATCH` | `Authorization: Bearer <token>` (allowed before PAID status) |
| **Submit Review** | `/dashboard/customer` | `/api/reviews` | `POST` | `{ bookingId, rating, comment }`<br>`Authorization: Bearer <token>` |

---

## 💳 Payment Integrations

| Frontend Component | Next.js Page Path | Backend Endpoint Consumed | HTTP Method | Payload / Headers |
| :--- | :--- | :--- | :--- | :--- |
| **Initiate Checkout** | `/dashboard/customer` | `/api/payments/create` | `POST` | `{ bookingId }`<br>`Authorization: Bearer <token>` |
| **Stripe Simulator** | `/payment-sandbox` | `/api/bookings/:id`<br>`/api/payments/confirm` | `GET`<br>`POST` | `{ sessionId, bookingId }`<br>`Authorization: Bearer <token>` |
| **Stripe Outcome Webhook** | `/payment/success` | `/api/payments/confirm` | `POST` | Verifies Stripe Checkout session, updates database to `PAID`. |

---

## 🛠️ Technician Scheduling & Jobs

| Frontend Component | Next.js Page Path | Backend Endpoint Consumed | HTTP Method | Payload / Headers |
| :--- | :--- | :--- | :--- | :--- |
| **Bio & Skills Update** | `/dashboard/technician` | `/api/technician/profile` | `PUT` | `{ skills, experience, bio, pricePerHour, location }`<br>`Authorization: Bearer <token>` |
| **Weekly Slot Scheduler**| `/dashboard/technician` | `/api/technician/availability`| `PUT` | `{ availability: string[] }`<br>`Authorization: Bearer <token>` |
| **Register Service** | `/dashboard/technician` | `/api/technician/services` | `POST` | `{ name, description, price, categoryId }`<br>`Authorization: Bearer <token>` |
| **Delete Service** | `/dashboard/technician` | `/api/technician/services/:id`| `DELETE` | `Authorization: Bearer <token>` |
| **Incoming Jobs Table** | `/dashboard/technician/bookings` | `/api/technician/bookings` | `GET` | `Authorization: Bearer <token>` (technician's bookings list) |
| **Transition Status** | `/dashboard/technician/bookings` | `/api/technician/bookings/:id` | `PATCH` | `{ status: ACCEPTED \| DECLINED \| IN_PROGRESS \| COMPLETED }` |

---

## 📊 Admin Platform Controls

| Frontend Component | Next.js Page Path | Backend Endpoint Consumed | HTTP Method | Payload / Headers |
| :--- | :--- | :--- | :--- | :--- |
| **Global Stats** | `/dashboard/admin` | `/api/admin/bookings` | `GET` | Calculates active bookings count and volume.<br>`Bearer <token>` |
| **Users Moderate Table** | `/dashboard/admin` | `/api/admin/users` | `GET` | Query list of all registered accounts.<br>`Bearer <token>` |
| **Ban / Unban User** | `/dashboard/admin` | `/api/admin/users/:id` | `PATCH` | `{ status: ACTIVE \| BANNED }`<br>`Authorization: Bearer <token>` |
| **Categories List** | `/dashboard/admin/categories` | `/api/admin/categories` | `GET` | Retrieve categories with active service counts.<br>`Bearer <token>` |
| **Create Category** | `/dashboard/admin/categories` | `/api/admin/categories` | `POST` | `{ name, description }`<br>`Authorization: Bearer <token>` |

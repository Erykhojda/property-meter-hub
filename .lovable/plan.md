
## SCORE (Appartme) — Property & Utility Management Dashboard

### Overview
A professional SaaS-style property management platform with Bmeters device integration, a Polish-language interface, and role-based access control. The system will use Supabase for the database (with RLS), authentication, and backend logic.

---

### 1. 🗄️ Data Architecture

**Hierarchical structure:**
- **Inwestor** → **Inwestycja** → **Budynek** → **Lokal** → **Miernik** → **Punkt Pomiarowy** → **Odczyty** (time-series readings)
- **Zarządca** entity linked to buildings with a date-ranged assignment history table
- Separate `user_roles` table (`admin` | `zarządca`) — never on the profile
- RLS policies ensuring Managers only access buildings they're assigned to

**Measurement table optimized for time-series:**
- Columns: `id`, `punkt_pomiarowy_id`, `wartosc` (value), `timestamp`, `jednostka` (unit), `jakość_danych` (data quality: `validated` | `estimated` | `missing`)

---

### 2. 🔐 Authentication & IAM

- Email/password login via Supabase Auth
- Role-based routing: Admins see full navigation; Zarządcy see restricted portal
- ABAC via RLS: Managers can only query data for buildings they're currently assigned to
- A `zarządca_budynek` table stores assignment with `data_od` / `data_do` history

---

### 3. 🧭 Sidebar Navigation (Polish labels)

Six sections:
1. **Dashboard** — aggregated media consumption overview
2. **Struktura** — CRUD for Investor → Investment → Building → Apartment hierarchy
3. **Zarządcy** — manage Manager accounts and building assignments
4. **Urządzenia** — Miernik (meter) registry per apartment
5. **Integracja** — Bmeters API settings, Validation Engine, Sync Status log
6. **Audyt** — read-only log of all system actions

---

### 4. 📊 Dashboard (EPC-10 style)

**Main view (building level):**
- Summary cards: total water, heat, and energy consumption for the current period
- Building selector (Admin sees all, Zarządca sees assigned only)
- Data quality legend: ✅ Validated / 〜 Estimated / ❌ Missing

**Drill-down (apartment level):**
- Table listing all Lokale in the selected building with current period consumption per media type and data quality badge

**Detail view (unit level):**
- Time-series line charts (using Recharts) per media type
- Date range filter (last 7 days / 30 days / custom)
- Per-reading data quality color coding

---

### 5. 🏗️ Struktura Module

- Tree-view of the full Investor → Investment → Building → Apartment hierarchy
- Inline CRUD forms for each level (add, edit, delete with confirmation)
- Breadcrumb navigation for deep levels

---

### 6. 👤 Zarządcy Module

- List of all Manager accounts with their currently assigned buildings
- Assign/unassign buildings with date range
- View full assignment history per manager
- Create/deactivate Manager accounts

---

### 7. 📡 Urządzenia (Meter Registry)

- Per-apartment list of registered Bmeters devices
- Display: device ID, type (water/heat/energy), install date, last reading timestamp, sync status
- Add/remove devices from a unit

---

### 8. 🔌 Integracja (Bmeters Hub)

**Settings panel:**
- API Key / OAuth token input with masked display and a "Test Connection" button

**Validation Engine:**
- Pre-sync checker that validates building addresses and meter IDs against Bmeters format requirements
- Visual pass/fail results per building

**Mock Import:**
- "Symuluj import" button that generates realistic time-series readings for all registered meters (simulating a real Bmeters API pull)
- Configurable date range for the mock data generation

**Sync Status Log:**
- Table of past sync attempts: timestamp, buildings synced, records imported, errors, status badge

---

### 9. 📋 Audyt (Audit Log)

- Read-only table of all structural changes and data imports
- Columns: timestamp, użytkownik (user), akcja (action), encja (entity), szczegóły (details)
- Filterable by date range and action type

---

### 10. 🎨 Design System

- Clean SaaS aesthetic using Tailwind CSS + shadcn/ui components
- Collapsible sidebar with icon-only mini mode
- Color-coded data quality indicators throughout: green (validated), amber (estimated), red (missing)
- Responsive layout with mobile-friendly sidebar drawer
- Polish UI labels throughout the entire interface

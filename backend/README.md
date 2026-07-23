# VERA Hair Transplant Clinic — ASP.NET Core Web API + EF Core

This is the backend for the VERA Enterprise CMS React prototype: same 24 pages,
same role/permission model, same business rules (one active plan per patient,
payment-method-linked accounts, PO receive-with-selling-price, login → verify
→ dashboard). It's a real, runnable ASP.NET Core 8 Web API — not pseudocode —
but you'll need to fill in your own connection string and JWT secret before
running it.

## Project layout

```
VeraApi/
  Program.cs                  # DI, JWT auth, CORS, Swagger, startup migrate+seed
  appsettings.json            # connection string, JWT settings — EDIT THIS
  Data/
    VeraDbContext.cs          # EF Core context + fluent config (indexes, cascade rules)
    DbSeeder.cs                # seeds modules/navPages/roles/permissions/demo admin
  Models/                     # entity classes, grouped by module
    ConfigurationModels.cs    # ClinicSetting, AccountSetup, Role, User, VerificationCode...
    InventoryModels.cs        # ProductSku, PurchaseOrder, StockMovementLog...
    PatientModels.cs          # Patient, TreatmentPlan, PatientTreatmentPlan, Invoice...
    ExpenseModels.cs          # ExpenseCategory, ExpenseBudgetEstimate, ExpenseEntry
  DTOs/                       # request/response shapes for non-trivial endpoints
  Services/
    JwtTokenService.cs        # access + refresh token issuance
    PasswordHasher.cs         # PBKDF2 hashing (no extra Identity package needed)
    VerificationCodeService.cs # 6-digit login/reset codes + delivery
  Authorization/
    RequiresPermissionAttribute.cs  # per-action RBAC check against RolePermissions table
  Controllers/                # one file/class per API area (see mapping table below)
```

## 1. Setup

```bash
cd VeraApi
dotnet restore

# Install the EF Core CLI tool once, globally, if you don't have it:
dotnet tool install --global dotnet-ef
```

Edit `appsettings.json`:
- `ConnectionStrings:VeraDb` → point at your SQL Server instance.
- `Jwt:SigningKey` → replace with a real random 32+ character secret (never commit the real one).
- `Cors:AllowedOrigins` → the URL(s) your React frontend runs on.

## 2. Create the database

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

`Program.cs` also calls `db.Database.Migrate()` and `DbSeeder.SeedAsync(...)` on
startup, so the first `dotnet run` will apply any pending migrations and seed
the modules/navPages/roles/permissions + one demo Admin user automatically.

## 3. Run it

```bash
dotnet run
```

Swagger UI comes up at `/swagger` in development — use it to try every endpoint
with a bearer token before wiring up the frontend.

## Demo login

The seeded Admin account:
- Username: `a.reyes`
- Password: `vera2026`

Flow: `POST /api/auth/login` → returns `PendingUserId` → the code is written to
the console log (swap `ConsoleNotificationSender` for a real email/SMS sender
in production) → `POST /api/auth/verify` with that code → returns the real
access + refresh tokens. That's the exact login → verify → dashboard sequence
the React app expects.

## Frontend page → API endpoint mapping

| Frontend page | Endpoint(s) |
|---|---|
| Login / Verify / Reset Password | `POST /api/auth/login`, `/verify`, `/forgot-password`, `/reset-password`, `/refresh`, `/logout` |
| Dashboard | `GET /api/dashboard` |
| System Configuration — Clinic Info | `GET/PUT` a `ClinicSetting` (add a thin controller if not present — pattern matches `AccountSetupsController`) |
| System Configuration — Account Setups | `GET/POST/PUT /api/account-setups` |
| System Configuration — Discount Configuration | `GET/POST/PUT /api/discount-configurations` |
| System Configuration — SMS Gateway / Templates | add `SmsGatewaysController` / `SmsTemplatesController` on the `CrudControllerBase` pattern (omitted here for brevity — identical shape to `AccountSetupsController`) |
| Modules | `GET/PUT /api/modules` |
| NavPages | `GET/PUT /api/nav-pages` |
| Roles & Permissions (role-select → page grid) | `GET /api/role-permissions/role/{roleId}`, `PUT /api/role-permissions/role/{roleId}/page/{navPageId}` |
| Users | `GET/POST/PUT /api/users`, `POST /api/users/{id}/send-password-reset` |
| Products (Categories / Products / SKUs tabs) | `/api/product-categories`, `/api/products`, `/api/product-skus` |
| Product SKU — Adjust Stock | `POST /api/product-skus/{id}/adjust` |
| Product SKU — Audit drawer | `GET /api/product-skus/{id}/movements` |
| Suppliers (+ ledger cards) | `GET/POST/PUT /api/suppliers`, `GET /api/supplier-payments/ledger` |
| Purchase Orders | `GET/POST /api/purchase-orders`, `POST /{id}/mark-ordered`, `POST /{id}/receive-goods` |
| Purchase Order Returns | `GET/POST /api/purchase-order-returns` |
| Supplier Payments | `GET/POST /api/supplier-payments` (rejects a payment mode/account type mismatch) |
| Stock Movements | `GET /api/stock-movements?movementType=&skuCode=&from=&to=` |
| Services | `GET/POST/PUT/DELETE /api/services` |
| Patient Directory | `GET/POST/PUT /api/patients` |
| Treatment Plan Master | `GET/POST /api/treatment-plans` |
| Active Patient Plans (assign + cycles) | `GET /api/patient-treatment-plans`, `POST /assign`, `POST /api/plan-cycles/{id}/complete` |
| Billing & Invoices | `GET /api/billing/invoices`, `POST /api/billing/walk-in-checkout`, `POST /api/billing/cycle-checkout` |
| Expense Categories | `GET/POST/PUT/DELETE /api/expense-categories` |
| Setup Expenses | `GET/POST/PUT/DELETE /api/setup-expenses` |
| Expense Budget Estimates | `GET /api/expense-budget-estimates`, `POST` (upsert), `GET /variance?month=&year=` |
| Expense Entries | `GET/POST /api/expense-entries` |
| Financial Reports | `GET /api/reports/financial` |
| Clinical Reports | `GET /api/reports/clinical` |
| Inventory Audit Reports | `GET /api/reports/inventory-audit` |

## How the business rules map over

- **One active plan per patient**: checked in `PatientTreatmentPlansController.Assign`
  *and* enforced at the database level with a filtered unique index
  (`VeraDbContext.OnModelCreating`) so it holds even under concurrent requests.
- **Payment method ↔ account type**: `PaymentMethodAccountMap` in
  `ConfigurationModels.cs` is the single source of truth, checked server-side
  in both `SupplierPaymentsController` and `BillingController` — never trust
  the client's dropdown filtering alone.
- **Receive goods → selling price**: `PurchaseOrdersController.ReceiveGoods`
  accepts an optional `SellingPrice` per line and updates `ProductSku.UnitPrice`
  when supplied, alongside the stock increase and audit log write.
- **Role-select → page permissions**: `RolePermissionsController.GetForRole`
  returns every NavPage with that role's flags (defaulting to all-false),
  matching the "pick a role, then see its page grid" UI exactly.
- **[RequiresPermission] attribute**: every mutating/reading endpoint checks
  the caller's `roleId` claim (from the JWT) against the `RolePermissions`
  table for that specific `NavPageId` — this is the real enforcement behind
  what the frontend's "Viewing as" simulator only previews.

## Wiring up the React frontend

Replace the `window.storage` calls in the React artifact with real `fetch`
calls against this API, e.g.:

```js
const API_BASE = "https://localhost:5001/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("veraAccessToken");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) { /* trigger /api/auth/refresh, then retry */ }
  if (!res.ok) throw new Error((await res.json()).message || res.statusText);
  return res.status === 204 ? null : res.json();
}
```

Then swap each page's mock array reads/writes for the matching endpoint calls
from the table above.

## Before production

- Replace `ConsoleNotificationSender` with a real email/SMS provider (SendGrid,
  Twilio, etc.) for verification and password-reset codes.
- Move `Jwt:SigningKey` and the DB connection string to a secret store
  (Azure Key Vault, AWS Secrets Manager, user-secrets locally) instead of
  `appsettings.json`.
- Add rate limiting on `/api/auth/login` and `/api/auth/verify` to slow down
  brute-force attempts against the 6-digit code.
- Add pagination to the larger `GetAll()` endpoints (invoices, stock movements)
  before real data volume makes them slow.
- Wrap the multi-step writes (e.g. `BillingController` checkout, `PurchaseOrdersController.ReceiveGoods`)
  in an explicit `IDbContextTransaction` if you add any additional side effects
  beyond what's here, so partial failures can't leave stock/accounts out of sync.

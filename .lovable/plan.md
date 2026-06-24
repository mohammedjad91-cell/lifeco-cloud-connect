## LIFECO PMS — Final UI & Functional Improvements

I'll ship this in 5 focused workstreams, all preserving the existing glassmorphism dark-blue theme.

---

### 1. PIN Entry & Navigation UX

**File:** `src/pages/Login.tsx`

- Replace numeric keypad-only input with a **hidden auto-focused `<input type="password" inputMode="numeric" maxLength={4}>`** that opens centered in viewport when a department is selected (scroll into view + autofocus).
- Keep the visual 4-dot indicator + on-screen keypad for touch users, but allow physical keyboard typing + **Enter to submit**.
- After successful PIN, navigate to dashboard (already works).
- Add a consistent **"Back to Main"** button on every sub-page (Dashboard, Lab, Plant, Admin, BI) → routes to `/`.

---

### 2. Auto-Documentation (Day / Date / User)

**New file:** `src/lib/session.ts` — helpers `getCurrentUser()`, `getTimestampStamp()` returning `{ day, date, time, user }`.

**Login flow update:** capture **Operator Name + Employee ID** in a small modal AFTER PIN success (stored in `sessionStorage` as `lifeco_user`). Pre-fill on next login.

**Dashboard header (`src/pages/Dashboard.tsx`):** prominent banner showing `Thursday, 14 May 2026 — Operator: <name> (<empId>)`, live clock.

**Stamping:** every insert into `operations_logs`, `lab_results`, `samples` includes `employee_id` + a `logged_by` text field with the formatted stamp `[Day/Date/Time/User]`.

---

### 3. Official Asset Register & Dynamic Equipment

**New table:** `equipment_assets` via migration:
- `id uuid pk`, `department text`, `asset_code text`, `asset_name text`, `is_custom boolean`, `created_at`
- RLS: read all, insert/update all (matches existing project pattern)

**New table:** `maintenance_records`:
- `id`, `asset_id uuid → equipment_assets.id`, `notes text`, `recorded_by text`, `recorded_at timestamptz`
- RLS: read/insert all

**Seed the official asset register** in the same migration:
- AMM1 & AMM2: 101-J, 102-J, 103-J, 105-J, 104-J, H-101, R-101, HTS Converter, LTS Converter, Methanator, R-501
- DESAL1 & DESAL2 (under UTILITIES with sub-tag): Sea Water Intake Pumps, Brine Recirculation Pumps, Distillers D-1, Distillers D-2, Vacuum Ejectors
- NITROGEN: ZR 460 Air Compressor, Air Dryer Units, Cold Box, Expansion Turbine

**New component:** `src/components/AssetRegister.tsx`
- Lists assets per department from `equipment_assets`
- "**+ Add New Equipment**" button → modal with name/code → inserts custom asset
- Each asset row → expandable **Maintenance Records** textarea (history list + "Add record" form)

Wired into `Dashboard.tsx` as a new "Asset Register" tab/section.

---

### 4. Professional Daily Reporting

**New component:** `src/components/DailyReportGenerator.tsx`
- "Generate Report" button on Dashboard
- Pulls today's `operations_logs` + `lab_results` + `samples` for the active department
- Uses **Lovable AI** (`google/gemini-3-flash-preview`) via a server function `src/lib/report.functions.ts` to draft a professional summary
- Renders editable textarea (user can refine) → Export to PDF (jspdf, already installed)
- Header includes Day/Date/Operator/Employee ID stamp

---

### 5. Integrated AI Assistant

**New route:** `src/routes/assistant.tsx` → `src/pages/Assistant.tsx`
- Glassmorphism chat window
- Streaming chat to **Lovable AI Gateway** via server function `src/lib/assistant.functions.ts`
- System prompt scoped to LIFECO PMS technical/system help (departments, parameters, equipment)
- Add "AI Assistant" link in Login + Dashboard nav (Sparkles icon)

---

### Technical Details

- All new tables get permissive RLS (matches existing `Allow all read/insert` pattern).
- Lovable AI Gateway via `createServerFn` (not edge functions).
- All new UI uses existing `.glass-card`, `.neon-border`, `.neon-text` tokens — no hex literals.
- Adds one secret check: `LOVABLE_API_KEY` (already present per fetched secrets — no add_secret needed).
- Migrations run via `supabase--migration` tool (single consolidated migration).

### Files Created/Modified

```text
NEW:  src/lib/session.ts
NEW:  src/lib/report.functions.ts
NEW:  src/lib/assistant.functions.ts
NEW:  src/components/AssetRegister.tsx
NEW:  src/components/DailyReportGenerator.tsx
NEW:  src/components/UserCaptureModal.tsx
NEW:  src/pages/Assistant.tsx
NEW:  src/routes/assistant.tsx
NEW:  supabase migration (equipment_assets, maintenance_records + seed)
EDIT: src/pages/Login.tsx           (autofocus, Enter key, user capture)
EDIT: src/pages/Dashboard.tsx       (header stamp, asset tab, report gen, back btn)
EDIT: src/pages/LabDashboard.tsx    (back btn, user stamping)
EDIT: src/pages/PlantView.tsx       (back btn)
EDIT: src/pages/AdminSettings.tsx   (back btn)
EDIT: src/pages/BIDashboard.tsx     (back btn)
EDIT: src/start.ts                  (attachSupabaseAuth if missing — verify only)
```

Approve this plan and I'll execute end-to-end.
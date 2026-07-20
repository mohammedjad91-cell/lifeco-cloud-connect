
# LIFECO Digital Transformation Platform — Build Plan

Scope confirmed: build **all** layers (skeleton + equipment tree + maintenance workflow + 8-tier roles), and **replace** current departments with the 5 new ones.

## 1. Department restructure (breaking change)

Replace the existing `departments.ts` list with the 5 new departments:

| Key | Name | Icon | Color |
|---|---|---|---|
| `AMMONIA` | Ammonia | Flame | cyan |
| `UREA` | Urea | Beaker | emerald |
| `LAB` | Laboratory | FlaskConical | violet |
| `MAINTENANCE` | Maintenance | Wrench | amber |
| `WAREHOUSE` | Warehouse | PackageOpen | orange |

- Legacy departments (NITROGEN, UTILITIES, etc.) removed from the picker.
- Existing PIN-login flow keeps working — PINs will be re-seeded for the 5 new departments in `department_pins`.
- OTS, Nitrogen log sheets, and other legacy code stay accessible from the Maintenance department's tools panel (nothing deleted).

## 2. Database — new schema for the equipment hierarchy & workflow

One migration adds the whole backbone (all with GRANTs + RLS `USING(true)` to match current permissive posture):

```
plants           (id, department_key, name, code)
areas            (id, plant_id, name, code)
equipment        (id, area_id, tag, name, type, description, criticality)
equipment_docs   (id, equipment_id, kind: pdf|image|manual, url, label, uploaded_by, created_at)
spare_parts     (id, part_no, name, description, uom, stock_qty, min_qty, location)
equipment_spares (equipment_id, spare_id, qty_required)   -- BOM
maintenance_requests  (id, equipment_id, requested_by, status: draft|pending|approved|in_progress|done|rejected,
                       priority, description, created_at, approved_by, approved_at)
maintenance_executions (id, request_id, executed_by, notes, started_at, ended_at)
execution_spares      (id, execution_id, spare_id, qty_used)
execution_photos      (id, execution_id, url, caption)
material_issues       (id, request_id, spare_id, qty, issued_by, issued_at)
```

Plus the roles system (see §5). A second storage bucket `equipment-docs` is added.

## 3. Route map (new/updated)

```text
/                         → Landing (redirects to /dashboard if PIN session)
/dashboard                → 5-tile department dashboard (Ammonia, Urea, Lab, Maint., Warehouse)
/dept/$dept               → Department home (KPIs + shortcuts)
/dept/$dept/plants        → Plant list
/dept/$dept/plants/$plant → Plant → area list
/areas/$area              → Area → equipment list
/equipment/$eqId          → Equipment profile (tabs: Profile, Maintenance History,
                              PDFs, Images, Spare Parts, Reports, Documents)
/maintenance              → Maintenance workflow board (kanban by status)
/maintenance/new          → Create request (Inspection → Request)
/maintenance/$id          → Request detail (Approval, Execution, Spares, Photos, Report)
/warehouse                → Spare parts inventory + issue requests
/warehouse/parts/$id      → Part detail (stock, movements)
/reports                  → Reports & Document Center (existing + new equipment history exports)
/admin/dev                → Developer Control Panel (feature flags, seed, system health)
/admin/users              → Role management (super_dev/admin only)
```

Every route wraps existing glassmorphism theme + Back button that goes to `/dashboard`.

## 4. Maintenance workflow (implements the pasted flow)

```text
Inspection → Request → Approval → Execution → Spare Parts →
Photos → Report → History → Export (PDF/Excel/Word) → Share (WhatsApp/Email)
```

Implemented as a status machine on `maintenance_requests.status` with:
- **Request** form on equipment page.
- **Approval** button visible to `department_manager` and above.
- **Execution** panel: mark spares used (decrements `spare_parts.stock_qty` via `material_issues`), upload photos to `equipment-docs` bucket, add notes.
- **Report** — reuses the existing AI report generator (`generateDailyReport`) with a new prompt for maintenance jobs, producing PDF via `jspdf` (already installed). Excel via `xlsx` and Word via `docx` (added).
- **Share** — reuses `ReportShareButtons` (WhatsApp + Gmail).
- Every execution appends a row to `equipment` history (join view).

## 5. Roles (8 tiers)

New enum + table:

```sql
CREATE TYPE app_role AS ENUM (
  'super_developer','administrator','department_manager','plant_manager',
  'engineer','technician','operator','viewer'
);
CREATE TABLE user_roles (id, user_id, role, department_key nullable);
CREATE FUNCTION has_role(_uid, _role) RETURNS bool SECURITY DEFINER;
CREATE FUNCTION role_level(_uid) RETURNS int SECURITY DEFINER;  -- 8=super, 1=viewer
```

**Important note:** the app currently has **no Supabase Auth** (PIN-only). To make role gates real we need real logins. Two options — I will default to (a) unless you say otherwise:

- **(a) Keep it soft for now** — store role as extra metadata on the PIN session (localStorage) and gate the UI only. No DB enforcement yet. Ships today.
- **(b) Add proper Supabase Auth on top of PIN** — email/password login layered under the PIN flow, real RLS enforcement. Bigger change, breaks anonymous access.

Client-side helper `useRole()` returns `{ role, level, can(action) }`; buttons/tabs are hidden when `level` is below the required threshold. When (b) is chosen later, only the RLS policies change — UI stays the same.

## 6. UI additions

- New `DepartmentGrid` on `/dashboard` (5 large glass tiles, glow accent per color above).
- New `EquipmentTree` sidebar component (collapsible Department → Plant → Area → Equipment).
- New `EquipmentProfile` tabbed page (7 tabs as listed).
- New `MaintenanceBoard` (kanban with 6 columns matching the status enum).
- New `WarehouseInventory` (searchable table, low-stock highlight, issue button).
- New `RoleManager` page (only super_developer/administrator see it).
- All new pages inherit the existing dark-blue glassmorphism theme (`glass-card`, `neon-border`).

## 7. Seeds

Migration seeds:
- 5 departments PINs in `department_pins`.
- Ammonia: Plant A + areas (Reforming, Synthesis, Utilities) + 6 sample equipment.
- Urea: Plant U + area (Prilling) + 3 sample equipment.
- Lab, Maintenance, Warehouse: 1 dummy plant each so navigation isn't empty.
- 20 sample spare parts.
- Super-developer role granted to a placeholder UUID `00000000-0000-0000-0000-000000000000` (replace once (b) is chosen).

## 8. What I will NOT touch

- Existing OTS, Nitrogen Log Sheets, Field Ops Form, Safety Monitor, AI Chat sidebar, Assets Register, Daily Report — all stay usable from the Maintenance department tools.
- Existing tables (`operations_logs`, `field_ops_logs`, `lab_results`, `samples`, `activity_logs`, `equipment_assets`, `maintenance_records`, `locked_dates`, `dynamic_fields`) remain untouched. The new `equipment` table is separate from the legacy `equipment_assets` (kept for backwards compat).

## Technical section

- **New deps:** `xlsx` (Excel export), `docx` (Word export). `jspdf`, `recharts`, `lucide-react`, `@tanstack/react-router`, `@supabase/supabase-js` already present.
- **New storage bucket:** `equipment-docs` (private, authenticated read via signed URLs).
- **Route auth:** since there's no Supabase Auth yet, all new routes remain publicly accessible with the PIN gate on `/dashboard`. RLS on new tables uses `USING (true) WITH CHECK (true)` to match the current permissive posture — flagged in security memory.
- **Realtime:** enable Realtime on `maintenance_requests` and `spare_parts` so kanban and inventory update live.
- **Files:** ~15 new components, 6 new routes, 1 migration, 1 storage bucket, 1 seed pass. Estimated LOC: ~2,500.

## Deliverable order (single turn)

1. Migration (schema + seeds + bucket + Realtime).
2. `departments.ts` replaced + PIN seed updated in migration.
3. Roles helper + `useRole`.
4. Dashboard grid + equipment tree.
5. Equipment profile page (7 tabs).
6. Maintenance kanban + request/approval/execution flow.
7. Warehouse inventory + issue flow.
8. Reports & Document Center enhancements (Excel/Word export).
9. Developer Control Panel + Role Manager.
10. Wire back-navigation everywhere to `/dashboard`.

Reply **approve** to proceed, or tell me which sections to trim.

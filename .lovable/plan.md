
# LIFECO Hierarchical Navigation Rebuild

This restructures the app around a strict navigation hierarchy and modern
industrial UI. Existing PIN gating, Supabase tables, and glassmorphism theme
are preserved — only the routing + shell change.

## New Routes (TanStack, file-based)

```text
/                              → Home (department grid, no PIN wall by default)
/dept/$deptId                  → Department page (plants grid)
/dept/$deptId/plant/$plantId   → Plant page (sections grid: Overview, Ops, Equipment, …)
/dept/$deptId/plant/$plantId/section/$sectionId   → Section page (equipment grid / list)
/equipment/$equipmentId        → Equipment profile (tabs: Info, Specs, Schedule, History, …)
```

Existing routes `/admin`, `/bi`, `/assistant`, `/hierarchy`, `/documents`
stay and become the destinations for the top-bar "centers".

PIN entry moves into a small modal triggered from a department card when the
department is PIN-protected; users no longer land on a PIN screen.

## Step 1 — Home Screen (`/`)

Replace current `Login` landing with a `Home` component:
- 14 large cards: 8 operational departments + 6 centers (Reports, Equipment,
  Documents, AI, Administration, Developer).
- Each department card shows: department image (from `dept-backgrounds`),
  name (EN/AR), plant count, equipment count, active users, open tasks,
  live status dot (green/amber/red).
- Counts come from a single `useHomeStats()` hook that runs one
  `supabase.rpc`-style parallel query set:
  `plants`, `equipment`, `field_ops_logs` (24h active users),
  `maintenance_requests` (status='open') filtered by department.
- Hover: subtle scale + neon glow (existing `.neon-border` + `hover:shadow`).
- Global top bar: logo, language switch, notifications bell, user avatar.

## Step 2 — Department Page

`/dept/$deptId` reuses the current `DEPT_STRUCTURE` taxonomy:
- Header: department icon + name + breadcrumb (Home ▸ Ammonia).
- Grid of plant cards from `DEPT_STRUCTURE[deptId]` with per-plant image
  (new field `image?: string` on `DeptPlant`, falls back to placeholder).
- Each card: plant name, module count, equipment count (query
  `equipment` by `plant_id`), live indicator.

## Step 3 — Plant Page

`/dept/$deptId/plant/$plantId` renders a fixed section grid regardless of
plant type: Overview, Operations, Equipment, Maintenance, Laboratory,
Engineering, Documents, Reports, Photos, P&ID, Manuals, Spare Parts, KPIs,
Live Dashboard. Sections not applicable to a plant are dimmed with a
"coming soon" chip.
- Reuses existing Dashboard sub-components (`FieldOpsForm`,
  `NitrogenLogSheets`, `AnalyticsDashboard`, `PlantMimic`, etc.) via a
  section→component map so no logic is lost.

## Step 4 — Section: Equipment

`/dept/$deptId/plant/$plantId/section/equipment` shows equipment cards:
- Image, name, tag number, status pill, health score bar, running hours,
  criticality badge, QR code (generated inline with `qrcode` npm).
- Filter/search bar at top (name, tag, criticality, status).
- Data source: `equipment` table joined with `equipment_assets` for image.

## Step 5 — Equipment Details

`/equipment/$equipmentId` opens a tabbed profile:
- Tabs: General, Specs, Schedule, History, Inspection, Lubrication, Oil,
  Spares, Manuals, Photos, Videos, Drawings, Datasheets, Attachments,
  Reports.
- Actions row: Export PDF, Export Excel, Export Word, WhatsApp, Outlook,
  Print. PDF via existing report generator; Excel via `xlsx`; Word via
  `docx`; WhatsApp/Outlook via `mailto:`/`wa.me` deep links (already used
  in `ReportShareButtons`).

## Shared Page Chrome

New `<PageShell>` wrapping every page provides:
- Back button (`router.history.back()` with fallback to parent route).
- Breadcrumb generated from the current route match tree.
- Search box, filter chips slot, export/print buttons slot.
- Language switch (existing `useI18n`), notifications bell (stub), user chip
  (from `sessionStorage.lifeco_user`).

## Data Additions

- Migration `add_home_stats_helpers`:
  - Add `department_id text` and `image_url text` to `plants` if missing.
  - Add `image_url text` to `equipment` if missing.
  - Create `home_stats` view aggregating plant/equipment/active-user/open-task
    counts per department for a single-round-trip Home query.

## Files to Add

```text
src/routes/home.tsx                    (new /, replacing Login as landing)
src/routes/dept.$deptId.tsx
src/routes/dept.$deptId.plant.$plantId.tsx
src/routes/dept.$deptId.plant.$plantId.section.$sectionId.tsx
src/routes/equipment.$equipmentId.tsx
src/components/shell/PageShell.tsx
src/components/shell/Breadcrumbs.tsx
src/components/shell/NotificationsBell.tsx
src/components/home/DepartmentCard.tsx
src/components/plants/PlantCard.tsx
src/components/plants/SectionGrid.tsx
src/components/equipment/EquipmentCard.tsx
src/components/equipment/EquipmentProfile.tsx
src/components/equipment/QRBadge.tsx
src/lib/home-stats.ts                  (queries + types)
src/lib/section-map.ts                 (section id → component)
```

## Files to Edit

- `src/lib/dept-structure.ts` — add `image?` to `DeptPlant`, add fixed
  section list constant.
- `src/lib/i18n.tsx` — add EN/AR strings for new UI.
- `src/pages/Login.tsx` — demoted to `/login`, only used when a PIN modal
  triggers it explicitly (kept intact for existing PIN flow).
- `src/routes/index.tsx` — render new `Home` component.
- `src/routes/dashboard.tsx` — remains but is no longer the landing; kept
  as a Live-Dashboard section target.

## Out of Scope (this pass)

- Real permit-to-work, PR/PO, inspection, and lubrication data models —
  the Section pages ship with empty-state UI wired to a placeholder query
  so shape is right, data can land in follow-ups.
- Rich role-based routing (admin vs operator) — existing `user_roles`
  table stays; the Developer Panel card is only shown to `admin`.

## Verification

- Build must pass (`tsgo`).
- Manual smoke via Playwright: Home renders 14 cards, clicking Ammonia
  opens `/dept/AMMONIA` with 6 plant cards, clicking AMM1 opens the
  section grid, clicking Equipment opens the equipment list, clicking a
  row opens the equipment profile with all 15 tabs mounted.
- Arabic toggle flips labels on every new screen.
- Existing dashboard flows (Nitrogen sheets, Field Ops, OTS) still reach
  the same components through the new section map.

Approve to start with Home + routing scaffold (Steps 1–3), then Equipment
list and profile (Steps 4–5) in a second batch to keep changes reviewable.

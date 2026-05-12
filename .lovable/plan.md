# Port LIFECO PMS into this Lovable project

## What you uploaded
- Standard Vite + React + React Router + Tailwind v3 app
- 6 pages: `Login`, `Dashboard`, `LabDashboard`, `PlantView`, `AdminSettings`, `BIDashboard` + `NotFound`
- Components: `AnalyticsDashboard`, `ExportPreviewDialog`, `FieldOpsForm`, `GlassPulseChart`, `NavLink`, full shadcn/ui
- Libs: `i18n` provider, `departments`, `ranges`, `utils`; hooks: `use-mobile`, `use-toast`
- Supabase integration files + 10 migrations + 1 edge function (`verify-pin`)
- Glassmorphism design tokens (HSL) with Orbitron + Inter fonts, neon glow, `.glass-card` utility

## Target environment
- This Lovable project runs **TanStack Start + Tailwind v4** (not React Router + Tailwind v3). Per your choice, I'll port the source into the TanStack template rather than replace it.
- Lovable Cloud will be enabled, which provisions a fresh Supabase project. Your 10 migrations will be replayed there. **The original project ID `kvqfsqlcbbjtazuwhjjl` cannot be reused** — Lovable Cloud always creates a new one. Schema and data structure are preserved; the project ID changes.

## Steps

1. **Enable Lovable Cloud** — provisions Supabase, generates `src/integrations/supabase/{client.ts,client.server.ts,auth-middleware.ts,types.ts}` and the env vars.

2. **Install missing deps**: `framer-motion`, `recharts`, `jspdf`, `jspdf-autotable`, `date-fns`, `zod`, `react-hook-form`, `@hookform/resolvers`, `next-themes`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `cmdk`, `vaul` (only the ones not already in the template).

3. **Copy non-routing source verbatim** into the project:
   - `src/components/{AnalyticsDashboard,ExportPreviewDialog,FieldOpsForm,GlassPulseChart,NavLink}.tsx`
   - `src/lib/{i18n.tsx,departments.ts,ranges.ts}` (merge with existing `utils.ts`)
   - `src/hooks/use-toast.ts` (keep existing `use-mobile.tsx`)
   - `src/assets/*` (any logos/images)

4. **Port routing to TanStack file-based routes** under `src/routes/`:
   ```
   src/routes/
     __root.tsx          ← wrap Outlet in QueryClientProvider + I18nProvider + TooltipProvider + Toaster + Sonner
     index.tsx           ← Login (path "/")
     dashboard.tsx       ← Dashboard
     lab.tsx             ← LabDashboard
     plant.tsx           ← PlantView
     admin.tsx           ← AdminSettings
     bi.tsx              ← BIDashboard
   ```
   - Replace `react-router-dom` imports (`useNavigate`, `Link`, `useParams`) with `@tanstack/react-router` equivalents inside each page.
   - Delete `src/App.tsx` / `src/main.tsx` patterns (template uses `__root.tsx`).
   - Remove the `PlaceholderIndex` from current `src/routes/index.tsx`.

5. **Translate glassmorphism tokens to Tailwind v4** in `src/styles.css`:
   - Convert the HSL design tokens (background, primary gold, accent cyan, neon-glow, glass-bg/border/shadow, sidebar tokens) to **oklch** equivalents to match template conventions.
   - Add `@theme inline` mappings so Tailwind classes (`bg-background`, `text-primary`, etc.) resolve.
   - Re-add `.glass-card`, neon glow utilities, and the Orbitron + Inter `@import url(...)` from Google Fonts.
   - Visual result is identical to the original (dark navy background, gold primary, cyan accent, frosted glass panels).

6. **Replay Supabase schema** — apply the 10 migration SQL files (`20260326…` → `20260412…`) via the migration tool against the new Lovable Cloud Supabase project, in chronological order. Adjust any references to the old project ID.

7. **Recreate the `verify-pin` edge function** as a TanStack server function (`src/lib/verify-pin.functions.ts`) using `requireSupabaseAuth` — TanStack Start uses server functions instead of Supabase Edge Functions.

8. **Verification**:
   - Build passes (no unresolved imports, no React Router DOM left).
   - `/`, `/dashboard`, `/lab`, `/plant`, `/admin`, `/bi` all render with glass styling.
   - Supabase client connects; tables from migrations are visible in the Cloud tab.

## Tradeoffs you should know
- **Schema is preserved, data is not.** Migrations recreate empty tables; if you have production data in `kvqfsqlcbbjtazuwhjjl`, you'll need to export/import it separately (I can help with `pg_dump` → `psql` if you want).
- **`verify-pin` becomes a server function**, not an edge function. Same behavior, different invocation path (`useServerFn` instead of `supabase.functions.invoke`).
- **Tailwind v3 → v4 migration** means class names stay the same, but the config lives in `src/styles.css` (`@theme inline`) instead of `tailwind.config.ts`.

Ready to implement when you approve.
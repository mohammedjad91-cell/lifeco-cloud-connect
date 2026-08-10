/**
 * Shared "Back" target for screens opened from a plant (modules grid).
 * Returns the plant modules page when a plant context exists,
 * otherwise the department screen, otherwise the main landing page.
 */
export function getBackTarget(): string {
  if (typeof window === "undefined") return "/";
  
  // 1. If we are in a sub-module workspace, we should go back to the plant modules grid
  const plant = sessionStorage.getItem("lifeco_plant");
  if (plant) return `/modules/${plant}`;
  
  // 2. If we are in a department-level screen (like Lab Command Center without a plant selected)
  const dept = sessionStorage.getItem("lifeco_dept");
  if (dept) return `/dept/${dept}`;
  
  // 3. Fallback to home
  return "/";
}

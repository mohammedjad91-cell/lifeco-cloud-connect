/**
 * Shared "Back" target for screens opened from a plant (modules grid).
 * Returns the plant modules page when a plant context exists,
 * otherwise the department screen, otherwise the main landing page.
 */
export function getBackTarget(): string {
  if (typeof window === "undefined") return "/";
  const plant = sessionStorage.getItem("lifeco_plant");
  if (plant) return `/modules/${plant}`;
  const dept = sessionStorage.getItem("lifeco_dept");
  if (dept) return `/dept/${dept}`;
  return "/";
}

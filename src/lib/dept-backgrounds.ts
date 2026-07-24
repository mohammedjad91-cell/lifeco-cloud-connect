// Per-department background image manager (stored in localStorage as data URL).
export const BG_STORAGE_PREFIX = "lifeco_bg_";

export function getDeptBg(deptId: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(BG_STORAGE_PREFIX + deptId); } catch { return null; }
}

export function setDeptBg(deptId: string, dataUrl: string) {
  try { localStorage.setItem(BG_STORAGE_PREFIX + deptId, dataUrl); } catch {}
  window.dispatchEvent(new CustomEvent("lifeco:bg-changed", { detail: { deptId } }));
}

export function clearDeptBg(deptId: string) {
  try { localStorage.removeItem(BG_STORAGE_PREFIX + deptId); } catch {}
  window.dispatchEvent(new CustomEvent("lifeco:bg-changed", { detail: { deptId } }));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

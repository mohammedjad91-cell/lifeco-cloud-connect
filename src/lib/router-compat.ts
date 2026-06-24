// Compatibility shim so source files written for react-router-dom work
// against @tanstack/react-router with minimal edits.
import { useNavigate as _useTanstackNavigate } from "@tanstack/react-router";

type NavOpts = { replace?: boolean };

export function useNavigate() {
  const nav = _useTanstackNavigate();
  return (to: string, opts?: NavOpts) => nav({ to, replace: opts?.replace ?? true });
}

export function useSearchParams(): [URLSearchParams] {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  return [params];
}

export function useLocation() {
  return {
    pathname: typeof window !== "undefined" ? window.location.pathname : "/",
    search: typeof window !== "undefined" ? window.location.search : "",
  };
}

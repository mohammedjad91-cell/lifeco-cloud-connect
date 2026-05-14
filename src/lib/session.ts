import { format } from "date-fns";

export interface OperatorSession {
  name: string;
  employeeId: string;
  department: string;
}

const KEY = "lifeco_operator";

export function getOperator(): OperatorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setOperator(op: OperatorSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(op));
  localStorage.setItem(KEY, JSON.stringify(op)); // remember for next session
}

export function clearOperator() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

export interface Stamp {
  day: string;
  date: string;
  time: string;
  user: string;
  formatted: string;
}

export function getStamp(op?: OperatorSession | null): Stamp {
  const operator = op ?? getOperator();
  const now = new Date();
  const day = format(now, "EEEE");
  const date = format(now, "dd MMM yyyy");
  const time = format(now, "HH:mm:ss");
  const userLabel = operator
    ? `${operator.name} (${operator.employeeId})`
    : "Unknown";
  return {
    day,
    date,
    time,
    user: userLabel,
    formatted: `[${day}/${date}/${time}/${userLabel}]`,
  };
}

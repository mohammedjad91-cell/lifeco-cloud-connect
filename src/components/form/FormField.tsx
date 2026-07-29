import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  /** Visible, unambiguous label. */
  label: string;
  /** Short helper text rendered under the control. */
  hint?: string;
  /** Longer explanation shown in an info tooltip next to the label. */
  tooltip?: string;
  /** Small trailing hint on the label row (e.g. a valid range). */
  badge?: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
  /** Receives the generated id so the control is always label-associated. */
  children: (id: string) => ReactNode;
}

/**
 * Single source of truth for form field presentation across the app:
 * one label, one optional tooltip, one helper line. Prevents duplicated
 * ad-hoc label markup and keeps every input accessible.
 */
export function FormField({
  label,
  hint,
  tooltip,
  badge,
  required,
  error,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
          {required && <span className="text-destructive ms-0.5">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${label}: more information`}
                  className="text-muted-foreground/70 hover:text-primary transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {badge && <span className="ms-auto shrink-0 text-[10px] opacity-60">{badge}</span>}
      </div>

      {children(id)}

      {(hint || error) && (
        <p
          id={hintId}
          className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground/80")}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

export default FormField;

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200",
  success: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  danger: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200",
};

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", styles[variant], className)} {...props} />
);

export { Badge };

import { cn } from "@/lib/utilidades";
import type { HTMLAttributes } from "react";

export function Esqueleto({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("esqueleto", className)}
      data-testid="esqueleto"
      {...props}
    />
  );
}
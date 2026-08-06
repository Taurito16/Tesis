import { cn } from "@/lib/utilidades";
import type { HTMLAttributes } from "react";

type VarianteInsignia = "primario" | "exito" | "error" | "info" | "neutro";

interface PropsInsignia extends HTMLAttributes<HTMLSpanElement> {
  variante?: VarianteInsignia;
}

const variantes: Record<VarianteInsignia, string> = {
  primario: "bg-primary-50 text-primary-600",
  exito: "bg-green-50 text-green-600",
  error: "bg-red-50 text-red-500",
  info: "bg-blue-50 text-blue-600",
  neutro: "bg-gray-100 text-gray-600",
};

export function Insignia({
  variante = "neutro",
  className,
  ...props
}: PropsInsignia) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        variantes[variante],
        className
      )}
      {...props}
    />
  );
}

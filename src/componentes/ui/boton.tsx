"use client";

import { cn } from "@/lib/utilidades";
import { Loader2 } from "lucide-react";

interface PropsBoton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "peligro";
  cargando?: boolean;
}

export function Boton({
  children,
  className,
  variante = "primario",
  cargando,
  disabled,
  ...props
}: PropsBoton) {
  const base =
    "w-full h-12 rounded-full font-medium text-[15px] transition-all duration-200 inline-flex items-center justify-center gap-[9px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantes = {
    primario:
      "text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700",
    secundario:
      "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600",
    peligro:
      "text-white bg-red-500 hover:bg-red-600 active:bg-red-700",
  };

  return (
    <button
      className={cn(base, variantes[variante], className)}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && <Loader2 className="size-[18px] animate-spin" />}
      {children}
    </button>
  );
}

"use client";

import { cn } from "@/lib/utilidades";
import RefreshIcon from "@/componentes/ui/iconos/refresh-icon";

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
    "w-full h-12 rounded-full font-medium text-[15px] transition-all duration-200 inline-flex items-center justify-center gap-[9px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500  disabled:opacity-50 disabled:cursor-not-allowed";

  const variantes = {
    primario:
      "text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700",
    secundario:
      "text-gray-700  bg-gray-100  hover:bg-gray-200  border border-gray-300 ",
    peligro:
      "text-white bg-red-500 hover:bg-red-600 active:bg-red-700",
  };

  return (
    <button
      className={cn(base, variantes[variante], className)}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && <RefreshIcon className="size-[18px] animate-spin" />}
      {children}
    </button>
  );
}

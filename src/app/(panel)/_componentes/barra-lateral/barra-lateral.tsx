"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utilidades";
import ArrowBackIcon from "@/componentes/ui/iconos/arrow-back-icon";
import { elementosNavegacion } from "./elementos-navegacion";

export function BarraLateral() {
  const pathname = usePathname();
  const [colapsado, setColapsado] = useState(true);
  const [inicializado, setInicializado] = useState(false);
  const [anchoExpandido, setAnchoExpandido] = useState<number | null>(null);
  const refSidebar = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (anchoExpandido !== null) return;

    const el = refSidebar.current;
    if (!el) return;

    const spans = el.querySelectorAll<HTMLElement>("[data-texto]");
    let maxTextWidth = 0;
    spans.forEach((s) => {
      maxTextWidth = Math.max(maxTextWidth, s.scrollWidth);
    });

    setAnchoExpandido(Math.max(87.5 + maxTextWidth, 200));
    setInicializado(true);
  }, [anchoExpandido]);

  return (
      <aside
        ref={refSidebar}
        className={cn(
          "mx-3 my-3 rounded-[32px] bg-primary-500  flex flex-col shrink-0 sticky top-[68px] max-h-[calc(100vh-5.5rem)]",
          "overflow-hidden",
          inicializado && "transition-[width] duration-300 ease-in-out"
        )}
        style={{ width: anchoExpandido !== null && !colapsado ? anchoExpandido : 67 }}
      >
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {elementosNavegacion.map((item) => {
          const Icono = item.icono;
          const activo = pathname === item.ruta;
          return (
            <Link
              key={item.ruta}
              href={item.ruta}
              className={cn(
                "group relative flex items-center gap-3 w-full py-3 pl-[7.5px] pr-4 text-sm font-medium whitespace-nowrap",
                activo ? "text-gray-700 " : "text-white"
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-[1.5px] -left-1 -right-4 bg-gray-50  rounded-l-full",
                  "origin-right transition-transform duration-500 ease-in-out",
                  activo ? "scale-x-100" : "scale-x-0"
                )}
              />
              {!activo && (
                <div className="absolute inset-y-[1.5px] -left-1 -right-4 bg-white/10 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              )}
              <Icono className="size-5 shrink-0 relative" />
              <span data-texto
                className={cn(
                  "relative inline-block overflow-hidden whitespace-nowrap",
                  inicializado && "transition-all duration-300 ease-in-out",
                  colapsado ? "max-w-0 opacity-0" : "max-w-60 opacity-100"
                )}
              >
                {item.etiqueta}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/20">
        <button
          onClick={() => setColapsado(!colapsado)}
          className="group relative flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          aria-label={colapsado ? "Expandir sidebar" : "Ocultar sidebar"}
        >
          <span
            className={cn(
              "inline-block overflow-hidden whitespace-nowrap",
              inicializado && "transition-all duration-300 ease-in-out",
              colapsado ? "max-w-0 opacity-0" : "max-w-60 opacity-100"
            )}
          >
            Ocultar
          </span>
          <ArrowBackIcon className={cn("size-5 shrink-0 transition-transform duration-300 ease-in-out", colapsado && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}

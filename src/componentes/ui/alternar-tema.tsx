"use client";

import { Sun, Moon } from "lucide-react";
import { useTema } from "@/componentes/proveedores/proveedor-tema";

export function AlternarTema() {
  const { tema, alternarTema } = useTema();

  return (
    <button
      onClick={alternarTema}
      className="fixed top-4 right-4 z-50 flex items-center justify-center size-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label={tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {tema === "oscuro" ? (
        <Sun className="size-5 text-yellow-500" />
      ) : (
        <Moon className="size-5 text-gray-600" />
      )}
    </button>
  );
}

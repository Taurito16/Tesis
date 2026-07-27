"use client";

import { MenuUsuario } from "./menu-usuario";

export function Encabezado() {
  return (
    <header className="h-14 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
      <span className="text-gray-900 dark:text-gray-100 font-medium">Título</span>
      <MenuUsuario />
    </header>
  );
}

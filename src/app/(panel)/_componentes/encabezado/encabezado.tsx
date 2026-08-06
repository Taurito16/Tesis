"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { MenuUsuario } from "./menu-usuario";

const TITULOS: Record<string, { titulo: string; subtitulo: string }> = {
  "/usuarios":        { titulo: "Gestión de Usuarios",      subtitulo: "Administración de Usuarios" },
  "/pacientes":       { titulo: "Seguimiento de Pacientes", subtitulo: "Control y Seguimiento" },
  "/recien-nacidos":  { titulo: "Recién Nacidos",           subtitulo: "Registro de Neonatos" },
  "/consulta-rapida": { titulo: "Consulta Rápida",          subtitulo: "Búsqueda de Pacientes" },
  "/reportes":        { titulo: "Reportes",                 subtitulo: "Estadísticas del Sistema" },
};

type PropsEncabezado = {
  nombreUsuario: string;
  iniciales: string;
};

export function Encabezado({ nombreUsuario, iniciales }: PropsEncabezado) {
  const pathname = usePathname();
  const info = TITULOS[pathname] ?? { titulo: "Dashboard", subtitulo: "Panel Principal" };

  return (
    <header className="relative flex items-center justify-between px-6 h-14 w-full bg-white  border-b border-gray-200  shrink-0">
      <div className="relative h-8 w-8 shrink-0 ml-[5.5px]">
        <Image
          src="/logotipo_transparent.png"
          alt="Hospital"
          fill
          className="object-contain"
          priority
          sizes="32px"
        />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="text-sm font-bold tracking-wide text-gray-900  font-heading uppercase">
          {info.titulo}
        </span>
        <span className="w-px h-5 bg-gray-400/50  rounded-full" />
        <span className="text-sm text-gray-600 ">
          {info.subtitulo}
        </span>
      </div>
      <MenuUsuario nombreUsuario={nombreUsuario} iniciales={iniciales} />
    </header>
  );
}

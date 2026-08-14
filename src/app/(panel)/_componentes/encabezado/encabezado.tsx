"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utilidades";
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
  const [conSombra, setConSombra] = useState(false);
  const info = TITULOS[pathname] ?? { titulo: "Dashboard", subtitulo: "Panel Principal" };

  useEffect(() => {
    const manejarScroll = () => setConSombra(window.scrollY > 8);
    manejarScroll();
    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 transition-shadow",
        conSombra && "shadow-sm"
      )}
    >
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

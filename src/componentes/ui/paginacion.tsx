"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  calcularRango,
  paginasVisibles,
  TAMANOS_PAGINA,
} from "@/lib/paginacion";
import { cn } from "@/lib/utilidades";

type PropsPaginacion = {
  total: number;
  pagina: number;
  tamano: number;
};

export function Paginacion({ total, pagina, tamano }: PropsPaginacion) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rango = calcularRango(total, pagina, tamano);

  const urlDe = (nuevaPagina: number, nuevoTamano: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(nuevaPagina));
    params.set("tamano", String(nuevoTamano));
    return `${pathname}?${params.toString()}`;
  };

  const cambiarTamano = (nuevoTamano: number) => {
    router.replace(urlDe(1, nuevoTamano), { scroll: false });
  };

  if (total <= 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-600">
        Mostrando {rango.desde}–{rango.hasta} de {total} registros
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filas por página</span>
          <select
            value={tamano}
            onChange={(e) => cambiarTamano(Number(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TAMANOS_PAGINA.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Paginación" className="flex items-center gap-1">
          <BotonPagina
            url={urlDe(rango.pagina - 1, rango.tamano)}
            deshabilitado={rango.pagina <= 1}
            rotulo="Página anterior"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </BotonPagina>

          {paginasVisibles(rango.pagina, rango.totalPaginas).map((item, i) =>
            item === "…" ? (
              <span key={`elipsis-${i}`} className="px-1 text-sm text-gray-500">
                …
              </span>
            ) : (
              <BotonPagina
                key={item}
                url={urlDe(item, rango.tamano)}
                activa={item === rango.pagina}
                rotulo={`Ir a la página ${item}`}
              >
                {item}
              </BotonPagina>
            )
          )}

          <BotonPagina
            url={urlDe(rango.pagina + 1, rango.tamano)}
            deshabilitado={rango.pagina >= rango.totalPaginas}
            rotulo="Página siguiente"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </BotonPagina>
        </nav>
      </div>
    </div>
  );
}

type PropsBotonPagina = {
  url: string;
  deshabilitado?: boolean;
  activa?: boolean;
  rotulo: string;
  children: React.ReactNode;
};

function BotonPagina({ url, deshabilitado, activa, rotulo, children }: PropsBotonPagina) {
  const clases = cn(
    "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
    activa
      ? "bg-primary-500 text-white"
      : "text-gray-700 hover:bg-gray-100",
    deshabilitado && "pointer-events-none text-gray-300"
  );

  return (
    <Link
      href={url}
      aria-label={rotulo}
      aria-current={activa ? "page" : undefined}
      aria-disabled={deshabilitado || undefined}
      tabIndex={deshabilitado ? -1 : undefined}
      className={clases}
    >
      {children}
    </Link>
  );
}

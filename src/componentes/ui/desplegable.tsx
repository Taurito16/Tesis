"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utilidades";
import DownChevron from "@/componentes/ui/iconos/chevron-down-icon";
import CheckIcon from "@/componentes/ui/iconos/check-icon";

interface OpcionDesplegable {
  value: string;
  etiqueta: string;
}

interface PropsDesplegable {
  nombre: string;
  etiqueta: string;
  opciones: OpcionDesplegable[];
  valorInicial?: string;
  onCambio?: (valor: string) => void;
  error?: string;
}

export function Desplegable({
  nombre,
  etiqueta,
  opciones,
  valorInicial = "",
  onCambio,
  error,
}: PropsDesplegable) {
  const idEtiqueta = useId();
  const idLista = useId();
  const idError = `${idLista}-error`;

  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [seleccion, setSeleccion] = useState(valorInicial);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const opcionSeleccionada = opciones.find((opcion) => opcion.value === seleccion);

  useEffect(() => {
    if (!abierto) return;

    const id = requestAnimationFrame(() => listaRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const manejarMousedown = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarMousedown);
    return () => document.removeEventListener("mousedown", manejarMousedown);
  }, [abierto]);

  const abrir = () => {
    const indice = opciones.findIndex((opcion) => opcion.value === seleccion);
    setIndiceActivo(indice >= 0 ? indice : 0);
    setAbierto(true);
  };

  const seleccionar = (value: string) => {
    setSeleccion(value);
    onCambio?.(value);
    setAbierto(false);
    botonRef.current?.focus();
  };

  const manejarTeclaLista = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndiceActivo((i) => Math.min(i + 1, opciones.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setIndiceActivo((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        const opcion = opciones[indiceActivo];
        if (opcion) seleccionar(opcion.value);
        break;
      case "Escape":
        e.preventDefault();
        setAbierto(false);
        botonRef.current?.focus();
        break;
    }
  };

  return (
    <div className="w-full">
      <div className="relative" ref={contenedorRef}>
        <div
          className={cn(
            "relative flex items-center border-b-2 transition-colors",
            error
              ? "border-red-400"
              : "border-gray-300 focus-within:border-primary-400"
          )}
        >
          <button
            ref={botonRef}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={abierto}
            aria-controls={abierto ? idLista : undefined}
            aria-labelledby={idEtiqueta}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            onClick={() => (abierto ? setAbierto(false) : abrir())}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                abrir();
              }
            }}
            className="h-[46px] w-full cursor-pointer bg-transparent text-left text-[15px] text-gray-800 outline-none"
          >
            <span
              className={cn(
                "block truncate",
                !opcionSeleccionada && "text-gray-500"
              )}
            >
              {opcionSeleccionada?.etiqueta ?? "Seleccione"}
            </span>
          </button>
          <label
            id={idEtiqueta}
            className="pointer-events-none absolute left-0 top-[-7px] text-[11px] text-gray-500"
          >
            {etiqueta}
          </label>
          <motion.span
            aria-hidden="true"
            className="pointer-events-none shrink-0 pb-[10px] text-gray-400"
            animate={{ rotate: abierto ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <DownChevron className="size-[18px]" />
          </motion.span>
        </div>

        <AnimatePresence>
          {abierto && (
            <motion.ul
              ref={listaRef}
              id={idLista}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={idEtiqueta}
              aria-activedescendant={
                opciones.length > 0 ? `${idLista}-opcion-${indiceActivo}` : undefined
              }
              className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg outline-none"
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onKeyDown={manejarTeclaLista}
            >
              {opciones.map((opcion, i) => {
                const activa = i === indiceActivo;
                const seleccionada = opcion.value === seleccion;
                return (
                  <li
                    key={opcion.value}
                    id={`${idLista}-opcion-${i}`}
                    role="option"
                    aria-selected={seleccionada}
                    onClick={() => seleccionar(opcion.value)}
                    onMouseEnter={() => setIndiceActivo(i)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[15px] text-gray-700 transition-colors",
                      activa && !seleccionada && "bg-gray-100",
                      seleccionada && "bg-primary-500 font-medium text-white"
                    )}
                  >
                    <span className="truncate">{opcion.etiqueta}</span>
                    <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center">
                      {seleccionada && <CheckIcon className="size-4" strokeWidth={2.5} />}
                    </span>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <input type="hidden" name={nombre} value={seleccion} />

      {error && (
        <p
          id={idError}
          role="alert"
          className="mt-[6px] text-left text-[13px] text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

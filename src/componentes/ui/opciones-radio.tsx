"use client";

import { useId, useState } from "react";

interface OpcionRadio {
  value: string;
  etiqueta: string;
}

interface PropsOpcionesRadio {
  nombre: string;
  etiqueta: string;
  opciones: OpcionRadio[];
  valorInicial?: string;
  onCambio?: (valor: string) => void;
  error?: string;
}

export function OpcionesRadio({
  nombre,
  etiqueta,
  opciones,
  valorInicial,
  onCambio,
  error,
}: PropsOpcionesRadio) {
  const idEtiqueta = useId();
  const idError = `${idEtiqueta}-error`;
  const [seleccion, setSeleccion] = useState(
    valorInicial ?? opciones[0]?.value ?? ""
  );

  return (
    <div className="w-full">
      <fieldset aria-describedby={error ? idError : undefined}>
        <legend id={idEtiqueta} className="mb-2 text-[13px] font-medium text-gray-700">
          {etiqueta}
        </legend>
        <div className="space-y-2">
          {opciones.map((opcion) => {
            const marcada = seleccion === opcion.value;
            return (
              <label
                key={opcion.value}
                className="flex cursor-pointer select-none items-center gap-3"
              >
                <input
                  type="radio"
                  name={nombre}
                  value={opcion.value}
                  checked={marcada}
                  onChange={() => {
                    setSeleccion(opcion.value);
                    onCambio?.(opcion.value);
                  }}
                  className="sr-only peer"
                />
                <span
                  aria-hidden="true"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gray-400 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2"
                >
                  {marcada && (
                    <span className="size-[9px] rounded-full bg-primary-500" />
                  )}
                </span>
                <span className="text-[15px] text-gray-800">
                  {opcion.etiqueta}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

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

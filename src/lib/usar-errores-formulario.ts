"use client";

import { useEffect, useRef, useState } from "react";

export function useErroresFormulario<T extends Record<string, string[] | undefined>>(
  errores: T | undefined,
  ordenCampos: string[]
) {
  const [editados, setEditados] = useState<Set<string>>(new Set());
  const formularioRef = useRef<HTMLFormElement>(null);
  const [prevErrores, setPrevErrores] = useState(errores);

  if (errores !== prevErrores) {
    setPrevErrores(errores);
    if (errores) {
      setEditados(new Set());
    }
  }

  useEffect(() => {
    if (!errores) return;

    const primero = ordenCampos.find((nombre) => errores[nombre]?.length);
    if (!primero) return;

    const elemento = formularioRef.current?.querySelector(`[name="${primero}"]`);
    if (elemento instanceof HTMLElement) {
      elemento.focus();
    }
  }, [errores, ordenCampos]);

  const marcarEditado = (nombre: string) => {
    setEditados((prev) => {
      if (prev.has(nombre)) return prev;
      const siguiente = new Set(prev);
      siguiente.add(nombre);
      return siguiente;
    });
  };

  const errorDe = (nombre: string) =>
    editados.has(nombre) ? undefined : errores?.[nombre]?.[0];

  return { formularioRef, errorDe, marcarEditado };
}

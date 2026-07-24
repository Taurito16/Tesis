"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Tema = "claro" | "oscuro";

interface ContextoValor {
  tema: Tema;
  alternarTema: () => void;
}

function obtenerTemaInicial(temaInicial?: Tema): Tema {
  if (typeof window !== "undefined") {
    const almacenado = localStorage.getItem("tema") as Tema | null;
    if (almacenado === "claro" || almacenado === "oscuro") {
      document.documentElement.classList.toggle("dark", almacenado === "oscuro");
      return almacenado;
    }
    const prefiereOscuro = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.classList.toggle("dark", prefiereOscuro);
    return prefiereOscuro ? "oscuro" : "claro";
  }
  return temaInicial ?? "claro";
}

const ContextoTema = createContext<ContextoValor>({
  tema: "claro",
  alternarTema: () => {},
});

export function ProveedorTema({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tema, setTema] = useState<Tema>(() => obtenerTemaInicial());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "oscuro");
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((prev) => {
      const nuevo = prev === "claro" ? "oscuro" : "claro";
      localStorage.setItem("tema", nuevo);
      document.documentElement.classList.toggle("dark", nuevo === "oscuro");
      return nuevo;
    });
  }, []);

  return (
    <ContextoTema.Provider value={{ tema, alternarTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) {
    throw new Error("useTema debe usarse dentro de un ProveedorTema");
  }
  return contexto;
}

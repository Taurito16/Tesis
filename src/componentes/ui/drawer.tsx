"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { cn } from "@/lib/utilidades";
import XIcon from "@/componentes/ui/iconos/x-icon";

const suscribirseAEnCliente = () => () => {};
const obtenerEnCliente = () => true;
const obtenerEnServidor = () => false;

type PropsDrawer = {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  subtitulo?: string;
  ancho?: string;
  children: React.ReactNode;
};

export function Drawer({
  abierto,
  onCerrar,
  titulo,
  subtitulo,
  ancho = "max-w-md",
  children,
}: PropsDrawer) {
  const tituloId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const anteriorFoco = useRef<HTMLElement | null>(null);
  const montado = useSyncExternalStore(
    suscribirseAEnCliente,
    obtenerEnCliente,
    obtenerEnServidor
  );

  useEffect(() => {
    if (!abierto) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    anteriorFoco.current = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      cancelAnimationFrame(id);
      anteriorFoco.current?.focus();
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCerrar();
      }
    };

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, onCerrar]);

  const manejarTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const enfocables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );

    if (enfocables.length === 0) {
      e.preventDefault();
      return;
    }

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  if (!montado) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {abierto && (
          <div className="fixed inset-0 z-50">
            <motion.div
              key="fondo"
              aria-hidden="true"
              className="absolute inset-0 bg-gray-900/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCerrar}
            />
            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
              tabIndex={-1}
              className={cn(
                "absolute inset-y-0 right-0 flex w-full flex-col rounded-l-2xl bg-white shadow-2xl outline-none",
                ancho
              )}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onKeyDown={manejarTab}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h2
                    id={tituloId}
                    className="text-lg font-semibold font-heading text-gray-900"
                  >
                    {titulo}
                  </h2>
                  {subtitulo && (
                    <p className="mt-0.5 text-sm text-gray-500">{subtitulo}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onCerrar}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body
  );
}

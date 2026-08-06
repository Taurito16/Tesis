"use client";

import { useFormStatus } from "react-dom";
import RefreshIcon from "@/componentes/ui/iconos/refresh-icon";
import LogoutIcon from "@/componentes/ui/iconos/logout-icon";
import { cerrarSesion } from "@/app/acciones/auth";

type PropsMenuUsuario = {
  nombreUsuario: string;
  iniciales: string;
};

export function MenuUsuario({ nombreUsuario, iniciales }: PropsMenuUsuario) {
  return (
    <div className="flex items-center">
      <div className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 ">
        <span className="text-sm font-bold uppercase text-white">{iniciales}</span>
      </div>
      <span className="mr-5 text-sm font-medium text-gray-900 ">
        {nombreUsuario}
      </span>
      <form action={cerrarSesion}>
        <BotonCerrarSesion />
      </form>
    </div>
  );
}

function BotonCerrarSesion() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      title="Cerrar sesión"
      aria-label="Cerrar sesión"
      disabled={pending}
      className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-600 active:bg-red-500/15 active:text-red-700 disabled:opacity-50  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
    >
      {pending ? (
        <RefreshIcon className="size-5 animate-spin" />
      ) : (
        <LogoutIcon className="size-5" />
      )}
    </button>
  );
}

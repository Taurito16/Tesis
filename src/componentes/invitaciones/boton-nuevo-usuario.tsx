"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/componentes/ui/drawer";
import { FormularioNuevoUsuario } from "@/componentes/invitaciones/formulario-nuevo-usuario";
import type { RolCreable } from "@/lib/supabase/usuarios-servidor";

type PropsBotonNuevoUsuario = {
  roles: RolCreable[];
};

export function BotonNuevoUsuario({ roles }: PropsBotonNuevoUsuario) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  const manejarExito = () => {
    setAbierto(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-500 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Nuevo usuario
      </button>

      <Drawer
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Nuevo Usuario"
        subtitulo="Enviar enlace de invitación"
      >
        <FormularioNuevoUsuario roles={roles} onExito={manejarExito} />
      </Drawer>
    </>
  );
}

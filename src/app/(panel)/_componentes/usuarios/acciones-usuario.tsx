"use client";

import PenIcon from "@/componentes/ui/iconos/pen-icon";
import TrashIcon from "@/componentes/ui/iconos/trash-icon";
import DotsVerticalIcon from "@/componentes/ui/iconos/dots-vertical-icon";

type PropsAccionesUsuario = {
  usuario: string;
};

const estiloBoton =
  "inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500";

export function AccionesUsuario({ usuario }: PropsAccionesUsuario) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={estiloBoton} aria-label={`Editar a ${usuario}`}>
        <PenIcon size={18} className="text-gray-400 hover:text-primary-600" />
      </button>
      <button type="button" className={estiloBoton} aria-label={`Eliminar a ${usuario}`}>
        <TrashIcon size={18} className="text-gray-400 hover:text-red-500" />
      </button>
      <button type="button" className={estiloBoton} aria-label={`Más opciones de ${usuario}`}>
        <DotsVerticalIcon size={18} className="text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  );
}

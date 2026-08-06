"use client";

import {
  useActionState,
  useEffect,
  useState,
  startTransition,
  type FormEvent,
} from "react";
import { crearUsuario } from "@/app/acciones/usuarios";
import { OpcionesRadio } from "@/componentes/ui/opciones-radio";
import { CampoFlotante } from "@/componentes/ui/campo-flotante";
import { Boton } from "@/componentes/ui/boton";
import TriangleAlertIcon from "@/componentes/ui/iconos/triangle-alert-icon";
import FilledCheckedIcon from "@/componentes/ui/iconos/filled-checked-icon";
import type { EstadoAccion } from "@/lib/utilidades";
import { normalizarUsuario } from "@/lib/utilidades";
import { useErroresFormulario } from "@/lib/usar-errores-formulario";
import type { RolCreable } from "@/lib/supabase/usuarios-servidor";
import type { ErroresCrearUsuario } from "@/lib/esquemas/usuarios";

type PropsFormulario = {
  roles: RolCreable[];
  onExito?: () => void;
};

const ORDEN_CAMPOS: (keyof ErroresCrearUsuario)[] = [
  "rol_id",
  "apellidos",
  "nombres",
  "usuario",
  "correo",
];

export function FormularioNuevoUsuario({ roles, onExito }: PropsFormulario) {
  const [state, formAction, pendiente] = useActionState<
    EstadoAccion<ErroresCrearUsuario>,
    FormData
  >(crearUsuario, {});

  const { formularioRef, errorDe, marcarEditado } =
    useErroresFormulario(state?.errores, ORDEN_CAMPOS);

  const [campos, setCampos] = useState({
    apellidos: "",
    nombres: "",
    usuario: "",
    correo: "",
  });

  const actualizarCampo = (
    nombre: keyof typeof campos,
    valor: string
  ) => {
    setCampos((prev) => ({ ...prev, [nombre]: valor }));
    marcarEditado(nombre);
  };

  const previewUsuario = campos.usuario
    ? normalizarUsuario(campos.usuario)
    : "";

  useEffect(() => {
    if (state?.exito) {
      onExito?.();
    }
  }, [state, onExito]);

  const onSubmitEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form ref={formularioRef} action={formAction} noValidate onSubmit={onSubmitEnviar}>
      <p className="mb-6 text-sm text-gray-500">
        Se enviará un enlace de invitación al correo para que defina su
        contraseña.
      </p>

      <div className="space-y-5">
          <OpcionesRadio
            nombre="rol_id"
            etiqueta="Rol"
            opciones={roles.map((r) => ({ value: String(r.id), etiqueta: r.nombre }))}
            onCambio={() => marcarEditado("rol_id")}
            error={errorDe("rol_id")}
          />

          <CampoFlotante
            name="apellidos"
            etiqueta="Apellidos Completos"
            value={campos.apellidos}
            onChange={(e) => actualizarCampo("apellidos", e.target.value)}
            error={errorDe("apellidos")}
          />

          <CampoFlotante
            name="nombres"
            etiqueta="Nombres Completos"
            value={campos.nombres}
            onChange={(e) => actualizarCampo("nombres", e.target.value)}
            error={errorDe("nombres")}
            autoFocus
          />

          <div>
            <CampoFlotante
              name="usuario"
              etiqueta="Nombre de Usuario"
              value={campos.usuario}
              onChange={(e) => actualizarCampo("usuario", e.target.value)}
              error={errorDe("usuario")}
            />
            {previewUsuario && (
              <p className="text-[13px] text-gray-500 mt-1">
                Se guardará como <span className="text-primary-600">{previewUsuario}</span>
              </p>
            )}
          </div>

          <CampoFlotante
            name="correo"
            etiqueta="Correo Electrónico"
            type="email"
            autoComplete="email"
            value={campos.correo}
            onChange={(e) => actualizarCampo("correo", e.target.value)}
            error={errorDe("correo")}
          />
        </div>

        {state?.error && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-[9px] text-red-500 text-[15px] bg-red-50 rounded-lg px-[18px] py-[9px]"
          >
            <TriangleAlertIcon className="size-[18px] shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.exito && (
          <div
            role="status"
            className="mt-5 flex items-center gap-[9px] text-green-600 text-[15px] bg-green-50 rounded-lg px-[18px] py-[9px]"
          >
            <FilledCheckedIcon className="size-[18px] shrink-0" />
            <span>{state.exito}</span>
          </div>
        )}

        <Boton type="submit" cargando={pendiente} className="mt-7">
          {pendiente ? "Enviando invitación..." : "Crear Usuario"}
        </Boton>
    </form>
  );
}
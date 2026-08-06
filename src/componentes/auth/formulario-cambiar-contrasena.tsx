"use client";

import { useActionState, useState } from "react";
import { cambiarContrasena } from "@/app/acciones/auth";
import { Campo } from "@/componentes/ui/campo";
import { Boton } from "@/componentes/ui/boton";
import LockIcon from "@/componentes/ui/iconos/lock-icon";
import ShieldCheck from "@/componentes/ui/iconos/shield-check";
import TriangleAlertIcon from "@/componentes/ui/iconos/triangle-alert-icon";
import FilledCheckedIcon from "@/componentes/ui/iconos/filled-checked-icon";
import EyeIcon from "@/componentes/ui/iconos/eye-icon";
import EyeOffIcon from "@/componentes/ui/iconos/eye-off-icon";
import type { EstadoAccion } from "@/lib/utilidades";
import type { ErroresCambiarContrasena } from "@/lib/esquemas/auth";

function BotonOjo({ mostrar, onToggle }: { mostrar: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="flex items-center justify-center cursor-pointer"
    >
      {mostrar ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

export function FormularioCambiarContrasena() {
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [state, formAction, pendiente] = useActionState<
    EstadoAccion<ErroresCambiarContrasena>,
    FormData
  >(cambiarContrasena, {});

  return (
    <form
      action={formAction}
      className="sm:w-[475px] w-full text-center border border-gray-300/60  rounded-2xl px-[36px] py-11 bg-white  shadow-sm"
      noValidate
    >
      <div className="flex justify-center mb-[18px]">
        <div className="size-[62px] rounded-full bg-primary-100  flex items-center justify-center">
          <ShieldCheck className="size-[31px] text-primary-600 " />
        </div>
      </div>

      <h1 className="text-gray-900  text-[26px] font-medium font-heading">
        Cambiar Contraseña
      </h1>
      <p className="text-gray-500  text-[15px] mt-2">
        Es necesario cambiar su contraseña por seguridad
      </p>

      <div className="mt-9 space-y-[18px] text-left">
        <Campo
          name="contrasena_actual"
          type={mostrarActual ? "text" : "password"}
          placeholder="Contraseña actual"
          autoComplete="current-password"
          icono={<LockIcon />}
          iconoDerecha={<BotonOjo mostrar={mostrarActual} onToggle={() => setMostrarActual(!mostrarActual)} />}
          error={state?.errores?.contrasena_actual?.[0]}
        />

        <Campo
          name="contrasena_nueva"
          type={mostrarNueva ? "text" : "password"}
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          icono={<LockIcon />}
          iconoDerecha={<BotonOjo mostrar={mostrarNueva} onToggle={() => setMostrarNueva(!mostrarNueva)} />}
          error={state?.errores?.contrasena_nueva?.[0]}
        />

        <Campo
          name="confirmar_contrasena"
          type={mostrarConfirmar ? "text" : "password"}
          placeholder="Confirmar nueva contraseña"
          autoComplete="new-password"
          icono={<LockIcon />}
          iconoDerecha={<BotonOjo mostrar={mostrarConfirmar} onToggle={() => setMostrarConfirmar(!mostrarConfirmar)} />}
          error={state?.errores?.confirmar_contrasena?.[0]}
        />
      </div>

      <div className="mt-[18px] text-[13px] text-gray-500  space-y-1 text-left bg-gray-50  rounded-lg px-[18px] py-[13px]">
        <p className="font-medium text-gray-700 ">Requisitos:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una mayúscula</li>
          <li>Al menos una minúscula</li>
          <li>Al menos un número</li>
          <li>Al menos un carácter especial (@, #, $, etc.)</li>
        </ul>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mt-[18px] flex items-center gap-[9px] text-red-500  text-[15px] bg-red-50  rounded-lg px-[18px] py-[9px]"
        >
          <TriangleAlertIcon className="size-[18px] shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.exito && (
        <div
          role="status"
          className="mt-[18px] flex items-center gap-[9px] text-green-600  text-[15px] bg-green-50  rounded-lg px-[18px] py-[9px]"
        >
          <FilledCheckedIcon className="size-[18px] shrink-0" />
          <span>{state.exito}</span>
        </div>
      )}

      <Boton
        type="submit"
        cargando={pendiente}
        className="mt-7"
      >
        {pendiente ? "Guardando..." : "Cambiar Contraseña"}
      </Boton>
    </form>
  );
}

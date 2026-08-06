"use client";

import { useActionState, useState, startTransition, type FormEvent } from "react";
import { completarRegistro } from "@/app/acciones/usuarios";
import { CampoFlotante } from "@/componentes/ui/campo-flotante";
import { Boton } from "@/componentes/ui/boton";
import ShieldCheck from "@/componentes/ui/iconos/shield-check";
import TriangleAlertIcon from "@/componentes/ui/iconos/triangle-alert-icon";
import EyeIcon from "@/componentes/ui/iconos/eye-icon";
import EyeOffIcon from "@/componentes/ui/iconos/eye-off-icon";
import type { EstadoAccion } from "@/lib/utilidades";
import { useErroresFormulario } from "@/lib/usar-errores-formulario";
import type { ErroresCompletarRegistro } from "@/lib/esquemas/usuarios";

const ORDEN_CAMPOS: (keyof ErroresCompletarRegistro)[] = [
  "contrasena",
  "confirmar_contrasena",
];

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

export function FormularioCompletarRegistro({ token }: { token: string }) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [state, formAction, pendiente] = useActionState<
    EstadoAccion<ErroresCompletarRegistro>,
    FormData
  >(completarRegistro, {});

  const { formularioRef, errorDe, marcarEditado } =
    useErroresFormulario(state?.errores, ORDEN_CAMPOS);

  const [campos, setCampos] = useState({ contrasena: "", confirmar_contrasena: "" });

  const actualizarCampo = (
    nombre: keyof typeof campos,
    valor: string
  ) => {
    setCampos((prev) => ({ ...prev, [nombre]: valor }));
    marcarEditado(nombre);
  };

  const onSubmitEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form
      ref={formularioRef}
      action={formAction}
      className="sm:w-[475px] w-full text-center border border-gray-300/60 rounded-2xl px-[36px] py-11 bg-white shadow-sm"
      noValidate
      onSubmit={onSubmitEnviar}
    >
      <input type="hidden" name="token" value={token} />

      <div className="flex justify-center mb-[18px]">
        <div className="size-[62px] rounded-full bg-primary-100 flex items-center justify-center">
          <ShieldCheck className="size-[31px] text-primary-600" />
        </div>
      </div>

      <h1 className="text-gray-900 text-[26px] font-medium font-heading">
        Activar Cuenta
      </h1>
      <p className="text-gray-500 text-[15px] mt-2">
        Defina una contraseña para activar su cuenta
      </p>

      <div className="mt-9 space-y-[18px] text-left">
        <CampoFlotante
          name="contrasena"
          etiqueta="Contraseña"
          type={mostrarContrasena ? "text" : "password"}
          autoComplete="new-password"
          value={campos.contrasena}
          onChange={(e) => actualizarCampo("contrasena", e.target.value)}
          iconoDerecha={
            <BotonOjo
              mostrar={mostrarContrasena}
              onToggle={() => setMostrarContrasena(!mostrarContrasena)}
            />
          }
          error={errorDe("contrasena")}
        />

        <CampoFlotante
          name="confirmar_contrasena"
          etiqueta="Confirmar contraseña"
          type={mostrarConfirmar ? "text" : "password"}
          autoComplete="new-password"
          value={campos.confirmar_contrasena}
          onChange={(e) => actualizarCampo("confirmar_contrasena", e.target.value)}
          iconoDerecha={
            <BotonOjo
              mostrar={mostrarConfirmar}
              onToggle={() => setMostrarConfirmar(!mostrarConfirmar)}
            />
          }
          error={errorDe("confirmar_contrasena")}
        />
      </div>

      <div className="mt-[18px] text-[13px] text-gray-500 space-y-1 text-left bg-gray-50 rounded-lg px-[18px] py-[13px]">
        <p className="font-medium text-gray-700">Requisitos:</p>
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
          className="mt-[18px] flex items-center gap-[9px] text-red-500 text-[15px] bg-red-50 rounded-lg px-[18px] py-[9px]"
        >
          <TriangleAlertIcon className="size-[18px] shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Boton type="submit" cargando={pendiente} className="mt-7">
        {pendiente ? "Activando..." : "Activar Cuenta"}
      </Boton>
    </form>
  );
}

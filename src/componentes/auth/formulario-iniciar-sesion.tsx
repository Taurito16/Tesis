"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { iniciarSesion } from "@/app/acciones/auth";
import { Campo } from "@/componentes/ui/campo";
import { Boton } from "@/componentes/ui/boton";
import { User, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { EstadoAccion } from "@/lib/utilidades";

export function FormularioIniciarSesion() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [state, formAction, pendiente] = useActionState<EstadoAccion, FormData>(
    iniciarSesion,
    {}
  );

  useEffect(() => {
    const saved = localStorage.getItem("usuario_recordado");
    if (saved && inputRef.current) {
      inputRef.current.value = saved;
      setRecordarme(true);
    }
  }, []);

  function handleSubmit() {
    const input = inputRef.current;
    if (!input) return;
    if (recordarme) {
      localStorage.setItem("usuario_recordado", input.value);
    } else {
      localStorage.removeItem("usuario_recordado");
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="sm:w-[416px] w-full text-center relative mt-[30px] pt-[79px] border border-gray-300/60 dark:border-gray-700 rounded-2xl px-[36px] py-11 bg-white dark:bg-gray-900 shadow-sm"
      noValidate
    >
      <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 size-[121px] rounded-full bg-white overflow-hidden flex items-center justify-center p-2">
        <Image
          src="/logotipo_transparent.png"
          alt="Logo del hospital"
          width={121}
          height={121}
          loading="eager"
          className="size-full object-contain"
        />
      </div>

      <h1 className="text-gray-900 dark:text-gray-100 text-[26px] font-bold font-heading">
        Iniciar Sesión
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-[15px] mt-2">
        Ingrese sus credenciales para continuar
      </p>

      <div className="mt-9 space-y-[18px]">
        <Campo
          ref={inputRef}
          name="usuario"
          type="text"
          placeholder="Nombre de usuario"
          autoComplete="username"
          icono={<User />}
          error={state?.errores?.usuario?.[0]}
        />

        <Campo
          name="contrasena"
          type={mostrarContrasena ? "text" : "password"}
          placeholder="Contraseña"
          autoComplete="current-password"
          icono={<Lock />}
          iconoDerecha={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="flex items-center justify-center cursor-pointer"
            >
              {mostrarContrasena ? <EyeOff /> : <Eye />}
            </button>
          }
          error={state?.errores?.contrasena?.[0]}
        />
      </div>

      <div className="flex items-center justify-between mt-7">
        <button
          type="button"
          role="checkbox"
          aria-checked={recordarme}
          onClick={() => setRecordarme(!recordarme)}
          className="flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-1 rounded"
        >
          <span
            className={`size-[13px] rounded shrink-0 border transition-colors duration-150 flex items-center justify-center ${
              recordarme
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-primary-400"
            }`}
          >
            {recordarme && (
              <svg className="size-[10px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-[13px] text-gray-600 dark:text-gray-400 select-none">
            Recordarme
          </span>
        </button>

        <Link
          href="/recuperar-contrasena"
          className="text-[13px] text-gray-600 dark:text-gray-400 font-medium inline transition-colors duration-200 hover:bg-gray-400/25 dark:hover:bg-gray-600/25 rounded-full px-3 py-1"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mt-[18px] flex items-center gap-[9px] text-red-500 dark:text-red-400 text-[15px] bg-red-50 dark:bg-red-900/20 rounded-lg px-[18px] py-[9px]"
        >
          <AlertCircle className="size-[18px] shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Boton
        type="submit"
        cargando={pendiente}
        className="mt-7"
        aria-label={pendiente ? "Ingresando al sistema..." : "Iniciar sesión"}
      >
        {pendiente ? "Ingresando..." : "Iniciar Sesión"}
      </Boton>

      <div className="mt-7 border-t border-gray-300/40 dark:border-gray-700/40" />

      <p className="mt-4 text-center">
        <span className="text-[13px] text-gray-600 dark:text-gray-400 font-medium transition-colors duration-200 hover:bg-gray-400/25 dark:hover:bg-gray-600/25 rounded-full px-3 py-1 cursor-pointer">
          Consultar estado de Recién Nacido
        </span>
      </p>
    </form>
  );
}

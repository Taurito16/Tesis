"use client";

import { cn } from "@/lib/utilidades";
import { forwardRef, useId, useState } from "react";

interface PropsCampoFlotante
  extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
  iconoDerecha?: React.ReactNode;
}

export const CampoFlotante = forwardRef<HTMLInputElement, PropsCampoFlotante>(
  (
    {
      etiqueta,
      error,
      iconoDerecha,
      className,
      type,
      id: idExterno,
      placeholder,
      onFocus,
      onBlur,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const idInterna = useId();
    const id = idExterno ?? idInterna;
    const idError = `${id}-error`;
    const textoEtiqueta = placeholder ?? etiqueta;

    const [enfocado, setEnfocado] = useState(false);
    const [conValor, setConValor] = useState(() => {
      if (defaultValue !== undefined) return defaultValue !== "";
      if (value !== undefined) return value !== "";
      return false;
    });

    const flotando = enfocado || conValor;

    const manejarFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setEnfocado(true);
      onFocus?.(e);
    };

    const manejarBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setEnfocado(false);
      setConValor(e.target.value !== "");
      onBlur?.(e);
    };

    const manejarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setConValor(e.target.value !== "");
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <div
          className={cn(
            "relative flex items-center border-b-2 transition-colors",
            error
              ? "border-red-400 "
              : "border-gray-300 focus-within:border-primary-400 "
          )}
        >
          <input
            ref={ref}
            id={id}
            type={type}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            className={cn(
              "w-full h-[46px] bg-transparent text-gray-800 outline-none text-[15px]",
              className
            )}
            value={value}
            defaultValue={defaultValue}
            onFocus={manejarFocus}
            onBlur={manejarBlur}
            onChange={manejarChange}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-0 text-[11px] text-gray-500 transition-all duration-200",
              flotando ? "top-[-7px]" : "top-3 text-[15px]",
              enfocado && !error && "text-primary-600",
              enfocado && error && "text-red-500"
            )}
          >
            {textoEtiqueta}
          </label>
          {iconoDerecha && (
            <span className="shrink-0 text-gray-400  [&_svg]:size-[18px] [&_svg]:stroke-current pb-[10px]">
              {iconoDerecha}
            </span>
          )}
        </div>
        {error && (
          <p id={idError} role="alert" className="text-red-500  text-[13px] mt-[6px] text-left">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CampoFlotante.displayName = "CampoFlotante";

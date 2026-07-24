"use client";

import { cn } from "@/lib/utilidades";
import { forwardRef, useId } from "react";

interface PropsCampo extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
  icono?: React.ReactNode;
  iconoDerecha?: React.ReactNode;
}

export const Campo = forwardRef<HTMLInputElement, PropsCampo>(
  ({ etiqueta, error, icono, iconoDerecha, className, type, id: idExterno, ...props }, ref) => {
    const idInterna = useId();
    const id = idExterno ?? idInterna;
    const idError = `${id}-error`;

    return (
      <div className="w-full">
        {etiqueta && (
          <label
            htmlFor={id}
            className="block text-[15px] font-medium text-gray-700 dark:text-gray-300 mb-[7px] text-left"
          >
            {etiqueta}
          </label>
        )}
        <div
          className={cn(
            "flex items-center w-full bg-white dark:bg-gray-900 border h-[53px] rounded-full overflow-hidden pl-[26px] gap-[9px] transition-colors",
            error
              ? "border-red-400 dark:border-red-500"
              : "border-gray-300/80 dark:border-gray-600 focus-within:border-primary-400 dark:focus-within:border-primary-500",
            className
          )}
        >
          {icono && (
            <span className="shrink-0 text-gray-400 dark:text-gray-500 [&_svg]:size-[18px] [&_svg]:stroke-current">
              {icono}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            className="bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-[15px] w-full h-full pr-[9px]"
            {...props}
          />
          {iconoDerecha && (
            <span className="shrink-0 text-gray-400 dark:text-gray-500 [&_svg]:size-[18px] [&_svg]:stroke-current pr-[18px]">
              {iconoDerecha}
            </span>
          )}
        </div>
        {error && (
          <p id={idError} role="alert" className="text-red-500 dark:text-red-400 text-[13px] mt-[7px] text-left">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Campo.displayName = "Campo";

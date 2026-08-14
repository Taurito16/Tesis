import { cn } from "@/lib/utilidades";
import type {
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

type PropsTabla = HTMLAttributes<HTMLTableElement> & {
  rellenar?: boolean;
};

export function Tabla({ className, rellenar = false, ...props }: PropsTabla) {
  return (
    <div
      className={cn(
        "relative w-full",
        rellenar ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto"
      )}
    >
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

type PropsTablaSeccion = HTMLAttributes<HTMLTableSectionElement>;

export function TablaCabecera({ className, ...props }: PropsTablaSeccion) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TablaCuerpo({ className, ...props }: PropsTablaSeccion) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TablaPie({ className, ...props }: PropsTablaSeccion) {
  return (
    <tfoot
      className={cn(
        "border-t bg-gray-50 font-medium text-gray-600",
        className
      )}
      {...props}
    />
  );
}

type PropsTablaFila = HTMLAttributes<HTMLTableRowElement>;

export function TablaFila({ className, ...props }: PropsTablaFila) {
  return (
    <tr
      className={cn(
        "border-b border-gray-200 transition-colors hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
}

type PropsTablaTitulo = ThHTMLAttributes<HTMLTableCellElement>;

export function TablaTitulo({ className, ...props }: PropsTablaTitulo) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-10 bg-white h-12 px-4 text-left align-middle text-xs font-[600] uppercase tracking-wide text-gray-900 whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

type PropsTablaCelda = TdHTMLAttributes<HTMLTableCellElement>;

export function TablaCelda({ className, ...props }: PropsTablaCelda) {
  return (
    <td
      className={cn("p-4 align-middle text-gray-600", className)}
      {...props}
    />
  );
}

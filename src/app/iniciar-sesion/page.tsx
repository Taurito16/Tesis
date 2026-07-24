import type { Metadata } from "next";
import Image from "next/image";
import { FormularioIniciarSesion } from "@/componentes/auth/formulario-iniciar-sesion";
import { AlternarTema } from "@/componentes/ui/alternar-tema";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Ingrese al sistema administrativo del hospital",
};

export default function PaginaIniciarSesion() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 relative">
      <Image
        src="/fondo.webp"
        alt=""
        fill
        className="object-cover -z-10"
        priority
        quality={85}
      />
      <div className="absolute inset-0 bg-black/65 -z-10" />
      <AlternarTema />
      <FormularioIniciarSesion />
    </main>
  );
}

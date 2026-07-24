import type { Metadata } from "next";
import Image from "next/image";
import { FormularioCambiarContrasena } from "@/componentes/auth/formulario-cambiar-contrasena";

export const metadata: Metadata = {
  title: "Cambiar Contraseña",
  description: "Cambio de contraseña obligatorio por seguridad",
};

export default function PaginaCambiarContrasena() {
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
      <FormularioCambiarContrasena />
    </main>
  );
}

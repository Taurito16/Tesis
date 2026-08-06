import type { Metadata } from "next";
import Image from "next/image";
import { FormularioIniciarSesion } from "@/componentes/auth/formulario-iniciar-sesion";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Ingrese al sistema administrativo del hospital",
};

export default function PaginaIniciarSesion() {
  const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hostSupabase = urlSupabase ? new URL(urlSupabase).host : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 relative">
      {hostSupabase && (
        <>
          <link rel="preconnect" href={`https://${hostSupabase}`} />
          <link rel="dns-prefetch" href={`https://${hostSupabase}`} />
        </>
      )}
      <Image
        src="/fondo.webp"
        alt=""
        fill
        className="object-cover -z-10"
        priority
        quality={85}
      />
      <div className="absolute inset-0 bg-black/65 -z-10" />
      <FormularioIniciarSesion />
    </main>
  );
}

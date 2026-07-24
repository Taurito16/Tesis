import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description: "Recuperación de contraseña",
};

export default function PaginaRecuperarContrasena() {
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
      <Link
        href="/iniciar-sesion"
        className="text-primary-400 hover:text-white hover:bg-primary-500 px-4 py-2 rounded-full transition-colors duration-200 text-[15px] font-medium"
      >
        Volver al inicio de sesión
      </Link>
    </main>
  );
}

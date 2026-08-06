import type { Metadata } from "next";
import Image from "next/image";
import { FormularioCompletarRegistro } from "@/componentes/auth/formulario-completar-registro";

export const metadata: Metadata = {
  title: "Activar Cuenta",
  description: "Activación de cuenta con enlace de invitación",
};

type PropsPagina = {
  searchParams: Promise<{ token?: string }>;
};

export default async function PaginaCompletarRegistro({ searchParams }: PropsPagina) {
  const { token } = await searchParams;

  if (!token) {
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
        <div className="sm:w-[475px] w-full text-center border border-gray-300/60 rounded-2xl px-[36px] py-11 bg-white shadow-sm">
          <p className="text-gray-900 text-[20px] font-medium font-heading">
            Enlace inválido
          </p>
          <p className="text-gray-500 text-[15px] mt-2">
            El enlace de activación es inválido o ha expirado.
          </p>
        </div>
      </main>
    );
  }

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
      <FormularioCompletarRegistro token={token} />
    </main>
  );
}

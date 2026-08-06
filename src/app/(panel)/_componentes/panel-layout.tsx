import { obtenerPerfilActual } from "@/lib/supabase/perfil-servidor";
import { formatearIniciales, formatearNombreUsuario } from "@/lib/utilidades";
import { BarraLateral } from "./barra-lateral/barra-lateral";
import { Encabezado } from "./encabezado/encabezado";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const perfil = await obtenerPerfilActual();
  const nombreUsuario = formatearNombreUsuario(perfil?.nombre, perfil?.apellidos);
  const iniciales = formatearIniciales(nombreUsuario);

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 ">
      <Encabezado nombreUsuario={nombreUsuario} iniciales={iniciales} />
      <div className="flex-1 flex">
        <BarraLateral />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

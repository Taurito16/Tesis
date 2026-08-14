import { obtenerPerfilActual } from "@/lib/supabase/perfil-servidor";
import { formatearIniciales, formatearNombreUsuario } from "@/lib/utilidades";
import { BarraLateral } from "./barra-lateral/barra-lateral";
import { Encabezado } from "./encabezado/encabezado";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const perfil = await obtenerPerfilActual();
  const nombreUsuario = formatearNombreUsuario(perfil?.nombre, perfil?.apellidos);
  const iniciales = formatearIniciales(nombreUsuario);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50">
      <Encabezado nombreUsuario={nombreUsuario} iniciales={iniciales} />
      <div className="flex min-h-0 flex-1">
        <BarraLateral />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

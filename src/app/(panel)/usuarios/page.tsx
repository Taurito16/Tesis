import {
  obtenerPerfilesAdminPaginados,
  obtenerRolActual,
  obtenerRolesCrear,
} from "@/lib/supabase/usuarios-servidor";
import type { PerfilAdmin } from "@/lib/supabase/usuarios-servidor";
import {
  Tabla,
  TablaCabecera,
  TablaCuerpo,
  TablaFila,
  TablaTitulo,
  TablaCelda,
} from "@/componentes/ui/tabla";
import { Insignia } from "@/componentes/ui/insignia";
import { Paginacion } from "@/componentes/ui/paginacion";
import { leerEntero } from "@/lib/paginacion";
import { AccionesUsuario } from "../_componentes/usuarios/acciones-usuario";
import { BotonNuevoUsuario } from "@/componentes/invitaciones/boton-nuevo-usuario";

type PropsPagina = {
  searchParams: Promise<{ pagina?: string; tamano?: string }>;
};

function varianteRol(rolId: number): "primario" | "exito" | "error" | "info" | "neutro" {
  switch (rolId) {
    case 1:
      return "primario";
    case 2:
      return "info";
    default:
      return "neutro";
  }
}

function formatearCreador(perfil: PerfilAdmin): string {
  if (!perfil.creado_por) return "Sistema";
  return perfil.creador_nombre ?? perfil.creador_usuario ?? "—";
}

export default async function PaginaUsuarios({ searchParams }: PropsPagina) {
  const { pagina: rawPagina, tamano: rawTamano } = await searchParams;

  const pagina = leerEntero(rawPagina, 1, 1, 1_000_000);
  const tamano = leerEntero(rawTamano, 10, 10, 100);

  const [resultado, rolActual, roles] = await Promise.all([
    obtenerPerfilesAdminPaginados(pagina, tamano),
    obtenerRolActual(),
    obtenerRolesCrear(),
  ]);

  const perfiles = resultado.perfiles;
  const puedeCrear = rolActual !== null && (rolActual === 1 || rolActual === 2);

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      {puedeCrear && (
        <div className="flex justify-end">
          <BotonNuevoUsuario roles={roles} />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <Tabla rellenar>
          <TablaCabecera>
            <TablaFila>
              <TablaTitulo>Nombre</TablaTitulo>
              <TablaTitulo>Apellidos</TablaTitulo>
              <TablaTitulo>Usuario</TablaTitulo>
              <TablaTitulo>Correo</TablaTitulo>
              <TablaTitulo>Rol</TablaTitulo>
              <TablaTitulo>Estado</TablaTitulo>
              <TablaTitulo>Creado por</TablaTitulo>
              <TablaTitulo>Acciones</TablaTitulo>
            </TablaFila>
          </TablaCabecera>
          <TablaCuerpo>
            {perfiles.length === 0 ? (
              <TablaFila>
                <TablaCelda colSpan={8} className="h-24 text-center text-gray-500">
                  No hay usuarios registrados
                </TablaCelda>
              </TablaFila>
            ) : (
              perfiles.map((perfil) => (
                <TablaFila key={perfil.id}>
                  <TablaCelda className="font-medium">
                    {perfil.nombre}
                  </TablaCelda>
                  <TablaCelda>{perfil.apellidos}</TablaCelda>
                  <TablaCelda>{perfil.usuario}</TablaCelda>
                  <TablaCelda>{perfil.correo}</TablaCelda>
                  <TablaCelda>
                    <Insignia variante={varianteRol(perfil.rol_id)}>
                      {perfil.rol_nombre ?? "Sin rol"}
                    </Insignia>
                  </TablaCelda>
                  <TablaCelda>
                    {perfil.activo ? (
                      <Insignia variante="exito">Activo</Insignia>
                    ) : (
                      <Insignia variante="error">Inactivo</Insignia>
                    )}
                  </TablaCelda>
                  <TablaCelda>{formatearCreador(perfil)}</TablaCelda>
                  <TablaCelda>
                    <AccionesUsuario usuario={perfil.usuario} />
                  </TablaCelda>
                </TablaFila>
              ))
            )}
          </TablaCuerpo>
        </Tabla>
        <Paginacion
          total={resultado.total}
          pagina={pagina}
          tamano={tamano}
        />
      </div>
    </div>
  );
}

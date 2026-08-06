import { cache } from "react";
import { crearClienteServidor } from "./servidor";

export type PerfilAdmin = {
  id: string;
  nombre: string;
  apellidos: string;
  usuario: string;
  correo: string;
  rol_id: number;
  rol_nombre: string | null;
  activo: boolean;
  creado_por: string | null;
  creador_usuario: string | null;
  creador_nombre: string | null;
};

export const obtenerPerfilesAdmin = cache(async (): Promise<PerfilAdmin[]> => {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("obtener_perfiles_admin");

  if (error) {
    console.error("Error al obtener perfiles de administración:", error.message);
    return [];
  }

  return (data as PerfilAdmin[]) ?? [];
});

export type RolCreable = {
  id: number;
  nombre: string;
};

export const obtenerRolActual = cache(async (): Promise<number | null> => {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("rol_id")
    .eq("id", user.id)
    .maybeSingle();

  return (data?.rol_id as number | undefined) ?? null;
});

export const obtenerRolesCrear = cache(async (): Promise<RolCreable[]> => {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("obtener_roles_creables");

  if (error) {
    console.error("Error al obtener roles creables:", error.message);
    return [];
  }

  return (data as RolCreable[]) ?? [];
});

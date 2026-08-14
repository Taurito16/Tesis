import { cache } from "react";
import { crearClienteServidor } from "./servidor";
import { obtenerLogger } from "@/lib/registro";

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
    const logger = await obtenerLogger();
    logger.error(
      { accion: "obtener_perfiles_admin", err: error },
      "Error al obtener perfiles de administración"
    );
    return [];
  }

  return (data as PerfilAdmin[]) ?? [];
});

export type ResultadoPerfilesPaginados = {
  perfiles: PerfilAdmin[];
  total: number;
};

export const obtenerPerfilesAdminPaginados = cache(
  async (pagina: number, tamano: number): Promise<ResultadoPerfilesPaginados> => {
    const supabase = await crearClienteServidor();
    const [resultado, total] = await Promise.all([
      supabase.rpc("obtener_perfiles_admin_paginado", {
        p_pagina: pagina,
        p_tamano: tamano,
      }),
      supabase.rpc("contar_perfiles_admin"),
    ]);

    if (resultado.error) {
      const logger = await obtenerLogger();
      logger.error(
        { accion: "obtener_perfiles_admin_paginado", err: resultado.error },
        "Error al obtener perfiles paginados"
      );
      return { perfiles: [], total: 0 };
    }

    return {
      perfiles: (resultado.data as PerfilAdmin[]) ?? [],
      total: (total.data as number) ?? 0,
    };
  }
);

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
    const logger = await obtenerLogger();
    logger.error(
      { accion: "obtener_roles_creables", err: error },
      "Error al obtener roles creables"
    );
    return [];
  }

  return (data as RolCreable[]) ?? [];
});

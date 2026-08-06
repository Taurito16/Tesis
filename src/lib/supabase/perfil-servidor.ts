import { cache } from "react";
import { crearClienteServidor } from "./servidor";

export type PerfilUsuario = {
  id: string;
  nombre: string;
  apellidos: string;
};

export const obtenerPerfilActual = cache(async (): Promise<PerfilUsuario | null> => {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre, apellidos")
    .eq("id", user.id)
    .single();

  return (perfil as PerfilUsuario | null) ?? null;
});

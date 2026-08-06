import { crearClienteServidor } from "@/lib/supabase/servidor";
import { redirect } from "next/navigation";

export default async function PaginaInicio() {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/iniciar-sesion");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol_id")
    .eq("id", user.id)
    .single();

  const rolId = (perfil as { rol_id: number } | null)?.rol_id ?? 3;

  if (rolId === 1 || rolId === 2) redirect("/usuarios");
  redirect("/pacientes");
}

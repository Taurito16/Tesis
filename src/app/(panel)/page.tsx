import { crearClienteServidor } from "@/lib/supabase/servidor";
import { redirect } from "next/navigation";
import { Boton } from "@/componentes/ui/boton";
import { cerrarSesion } from "@/app/acciones/auth";

export default async function PaginaInicio() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/iniciar-sesion");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, apellidos, roles:rol_id(nombre)")
    .eq("id", user.id)
    .single();

  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 font-heading">
        Bienvenido, {perfil?.nombre ?? "Usuario"}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Ha iniciado sesión correctamente
      </p>
      <form action={cerrarSesion}>
        <Boton type="submit" variante="secundario" className="max-w-xs mx-auto">
          Cerrar Sesión
        </Boton>
      </form>
    </div>
  );
}

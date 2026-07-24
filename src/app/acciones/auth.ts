"use server";

import { EsquemaIniciarSesion, EsquemaCambiarContrasena } from "@/lib/esquemas/auth";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { EstadoAccion } from "@/lib/utilidades";
import { normalizarUsuario } from "@/lib/utilidades";

type PerfilLogin = {
  id: string;
  correo: string;
  activo: boolean;
  contraseña_cambiada_en: string | null;
};

async function obtenerIp(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headersList.get("x-real-ip")
    ?? "unknown";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delayProgressivo(fallos: number): number {
  if (fallos < 3) return 0;
  const segundos = Math.min(Math.pow(2, fallos - 3), 30);
  return segundos * 1000 + Math.floor(Math.random() * 200);
}

async function safeRpc(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  functionName: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.rpc(functionName, params);
  } catch {
    /* best-effort: auditoría y rate-limit no bloquean el login */
  }
}

export async function iniciarSesion(
  prevState: EstadoAccion,
  formData: FormData
): Promise<EstadoAccion> {
  const datos = Object.fromEntries(formData);
  const validacion = EsquemaIniciarSesion.safeParse(datos);

  if (!validacion.success) {
    return {
      errores: validacion.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { usuario, contrasena } = validacion.data;
  const usuarioNormalizado = normalizarUsuario(usuario);

  try {
    const supabase = await crearClienteServidor();
    const ip = await obtenerIp();

    const { data: ipLimit } = await supabase
      .rpc("verificar_rate_limit_ip", { direccion_ip: ip })
      .single();

    if (ipLimit && (ipLimit as Record<string, unknown>).bloqueado) {
      await delay(30000);
      return { error: "Credenciales inválidas" };
    }

    const { data: fallos } = await supabase
      .rpc("obtener_fallos_usuario", { usuario_buscar: usuarioNormalizado })
      .single();

    const conteoFallos = ((fallos as Record<string, unknown>)?.conteo as number) ?? 0;
    const demora = delayProgressivo(conteoFallos);

    if (demora > 0) {
      await delay(demora);
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .rpc("obtener_perfil_para_login", { usuario_buscar: usuarioNormalizado })
      .single();

    if (errorPerfil || !perfil) {
      await safeRpc(supabase, "registrar_intento_ip", { direccion_ip: ip });
      return { error: "Credenciales inválidas" };
    }

    const perfilData = perfil as unknown as PerfilLogin;

    const { data: authData, error: errorAuth } =
      await supabase.auth.signInWithPassword({
        email: perfilData.correo,
        password: contrasena,
      });

    await safeRpc(supabase, "registrar_intento_ip", { direccion_ip: ip });

    if (errorAuth || !authData?.user) {
      await safeRpc(supabase, "registrar_intento_login", {
        usuario_buscar: usuarioNormalizado,
        fue_exitoso: false,
        direccion_ip: ip,
      });
      await safeRpc(supabase, "registrar_auditoria_auth", {
        p_accion: "inicio_sesion_fallido",
        p_usuario: usuarioNormalizado,
        p_ip_address: ip,
        p_detalles: { motivo: "credenciales_invalidas" },
      });
      return { error: "Credenciales inválidas" };
    }

    if (!perfilData.activo) {
      await safeRpc(supabase, "registrar_intento_login", {
        usuario_buscar: usuarioNormalizado,
        fue_exitoso: false,
        direccion_ip: ip,
      });
      await safeRpc(supabase, "registrar_auditoria_auth", {
        p_accion: "inicio_sesion_fallido",
        p_usuario: usuarioNormalizado,
        p_ip_address: ip,
        p_detalles: { motivo: "cuenta_inactiva" },
      });
      return { error: "Credenciales inválidas" };
    }

    await safeRpc(supabase, "limpiar_intentos_usuario", {
      usuario_buscar: usuarioNormalizado,
    });

    const ahora = new Date().toISOString();
    await supabase
      .from("perfiles")
      .update({ ultimo_acceso_en: ahora })
      .eq("id", authData.user.id);

    await safeRpc(supabase, "registrar_auditoria_auth", {
      p_accion: "inicio_sesion_exitoso",
      p_usuario_id: authData.user.id,
      p_usuario: usuarioNormalizado,
      p_ip_address: ip,
    });

    if (!perfilData.contraseña_cambiada_en) {
      redirect("/auth/cambiar-contrasena");
    }

    redirect("/");
  } catch (error) {
    if ((error as { digest?: string })?.digest) {
      throw error;
    }
    console.error("Error en iniciarSesion:", error);
    return { error: "Credenciales inválidas" };
  }
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteServidor();

  try {
    const ip = await obtenerIp();
    await safeRpc(supabase, "registrar_auditoria_auth", {
      p_accion: "cierre_sesion",
      p_ip_address: ip,
    });
  } catch { /* best-effort */ }

  await supabase.auth.signOut();
  redirect("/iniciar-sesion");
}

export async function cambiarContrasena(
  prevState: EstadoAccion,
  formData: FormData
): Promise<EstadoAccion> {
  const datos = Object.fromEntries(formData);
  const validacion = EsquemaCambiarContrasena.safeParse(datos);

  if (!validacion.success) {
    return {
      errores: validacion.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { contrasena_actual, contrasena_nueva } = validacion.data;

  try {
    const supabase = await crearClienteServidor();
    const ip = await obtenerIp();

    const {
      data: { user },
      error: errorSesion,
    } = await supabase.auth.getUser();

    if (errorSesion || !user) {
      return { error: "Su sesión ha expirado. Inicie sesión nuevamente." };
    }

    const { error: errorVerificar } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: contrasena_actual,
    });

    if (errorVerificar) {
      return { error: "La contraseña actual es incorrecta" };
    }

    const { error: errorUpdate } = await supabase.auth.updateUser({
      password: contrasena_nueva,
    });

    if (errorUpdate) {
      console.error("Error al actualizar contraseña:", errorUpdate);
      return { error: "Error al cambiar la contraseña. Intente nuevamente." };
    }

    await supabase
      .rpc("actualizar_timestamp_contrasena", { usuario_id: user.id });

    const { data: perfilActual } = await supabase
      .from("perfiles")
      .select("usuario")
      .eq("id", user.id)
      .single();

    if (perfilActual) {
      await safeRpc(supabase, "limpiar_intentos_usuario", {
        usuario_buscar: (perfilActual as Record<string, unknown>).usuario as string,
      });
    }

    await safeRpc(supabase, "registrar_auditoria_auth", {
      p_accion: "cambio_contrasena",
      p_usuario_id: user.id,
      p_usuario: user.email,
      p_ip_address: ip,
    });

    redirect("/");
  } catch (error) {
    if ((error as { digest?: string })?.digest) {
      throw error;
    }
    console.error("Error en cambiarContrasena:", error);
    return { error: "Error interno del servidor. Intente nuevamente." };
  }
}
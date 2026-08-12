"use server";

import {
  EsquemaIniciarSesion,
  EsquemaCambiarContrasena,
  type ErroresIniciarSesion,
  type ErroresCambiarContrasena,
} from "@/lib/esquemas/auth";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { EstadoAccion } from "@/lib/utilidades";
import { normalizarUsuario } from "@/lib/utilidades";
import { obtenerLogger } from "@/lib/registro";

type ContextoLogin = {
  bloqueado_ip: boolean;
  intentos_por_hora: number;
  conteo_fallos: number;
  id: string;
  correo: string;
  activo: boolean;
  rol_id: number;
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
  prevState: EstadoAccion<ErroresIniciarSesion>,
  formData: FormData
): Promise<EstadoAccion<ErroresIniciarSesion>> {
  const datos = Object.fromEntries(formData);
  const validacion = EsquemaIniciarSesion.safeParse(datos);

  if (!validacion.success) {
    return {
      errores: validacion.error.flatten().fieldErrors,
    };
  }

  const { usuario, contrasena } = validacion.data;
  const usuarioNormalizado = normalizarUsuario(usuario);
  const logger = await obtenerLogger();

  try {
    const inicioTotal = Date.now();
    const supabase = await crearClienteServidor();
    const ip = await obtenerIp();

    const inicioContexto = Date.now();
    const { data: contexto, error: errorContexto } = await supabase
      .rpc("obtener_contexto_login", {
        usuario_buscar: usuarioNormalizado,
        direccion_ip: ip,
      })
      .maybeSingle();
    const duracionContexto = Date.now() - inicioContexto;

    const contextoData = contexto as unknown as ContextoLogin | null;

    if (errorContexto || !contextoData) {
      await safeRpc(supabase, "registrar_login_fallido", {
        p_usuario: usuarioNormalizado,
        p_ip_address: ip,
        p_detalles: { motivo: "credenciales_invalidas" },
      });
      logger.warn(
        {
          accion: "iniciar_sesion",
          motivo: "contexto_no_disponible",
          ip,
          duracion_ms: Date.now() - inicioTotal,
        },
        "Login fallido: contexto no disponible"
      );
      return { error: "Credenciales inválidas" };
    }

    logger.debug(
      {
        accion: "iniciar_sesion",
        bloqueado_ip: contextoData.bloqueado_ip,
        intentos_fallidos: contextoData.conteo_fallos,
        rol_id: contextoData.rol_id,
        duracion_ms_contexto: duracionContexto,
        ip,
      },
      "Login: contexto obtenido"
    );

    if (contextoData.bloqueado_ip) {
      await delay(30000);
      logger.warn(
        {
          accion: "iniciar_sesion",
          motivo: "ip_bloqueada",
          ip,
          duracion_ms: Date.now() - inicioTotal,
        },
        "Login bloqueado por IP"
      );
      return { error: "Credenciales inválidas" };
    }

    const demora = delayProgressivo(contextoData.conteo_fallos);
    if (demora > 0) {
      logger.debug(
        {
          accion: "iniciar_sesion",
          demora_ms: demora,
          ip,
        },
        "Login: demora progresiva (NIST)"
      );
      await delay(demora);
    }

    const inicioGotrue = Date.now();
    const { data: authData, error: errorAuth } =
      await supabase.auth.signInWithPassword({
        email: contextoData.correo,
        password: contrasena,
      });
    const duracionGotrue = Date.now() - inicioGotrue;

    if (errorAuth || !authData?.user) {
      await safeRpc(supabase, "registrar_login_fallido", {
        p_usuario: usuarioNormalizado,
        p_ip_address: ip,
        p_detalles: { motivo: "credenciales_invalidas" },
      });
      logger.warn(
        {
          accion: "iniciar_sesion",
          motivo: "credenciales_invalidas",
          code: errorAuth?.code ?? "sin-codigo",
          ip,
          duracion_ms: Date.now() - inicioTotal,
          duracion_ms_gotrue: duracionGotrue,
        },
        "Login fallido: credenciales inválidas"
      );
      return { error: "Credenciales inválidas" };
    }

    if (!contextoData.activo) {
      await safeRpc(supabase, "registrar_login_fallido", {
        p_usuario: usuarioNormalizado,
        p_ip_address: ip,
        p_detalles: { motivo: "cuenta_inactiva" },
      });
      await supabase.auth.signOut();
      logger.warn(
        {
          accion: "iniciar_sesion",
          motivo: "cuenta_inactiva",
          ip,
          duracion_ms: Date.now() - inicioTotal,
          duracion_ms_gotrue: duracionGotrue,
        },
        "Login bloqueado: cuenta inactiva"
      );
      return { error: "Credenciales inválidas" };
    }

    const inicioRegistro = Date.now();
    await safeRpc(supabase, "registrar_login_exitoso", {
      p_usuario_id: authData.user.id,
      p_usuario: usuarioNormalizado,
      p_ip_address: ip,
    });
    const duracionRegistro = Date.now() - inicioRegistro;

    logger.info(
      {
        accion: "iniciar_sesion",
        resultado: "exitoso",
        usuario_id: authData.user.id,
        rol_id: contextoData.rol_id,
        ip,
        duracion_ms_total: Date.now() - inicioTotal,
        duracion_ms_contexto: duracionContexto,
        duracion_ms_gotrue: duracionGotrue,
        duracion_ms_registro: duracionRegistro,
      },
      "Login exitoso"
    );

    if (!contextoData.contraseña_cambiada_en) {
      redirect("/auth/cambiar-contrasena");
    }

    if (contextoData.rol_id === 1 || contextoData.rol_id === 2) {
      redirect("/usuarios");
    }
    redirect("/pacientes");
  } catch (error) {
    if ((error as { digest?: string })?.digest) {
      throw error;
    }
    logger.error(
      {
        accion: "iniciar_sesion",
        err: error,
        usuario: usuarioNormalizado,
      },
      "Error en iniciarSesion"
    );
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
  prevState: EstadoAccion<ErroresCambiarContrasena>,
  formData: FormData
): Promise<EstadoAccion<ErroresCambiarContrasena>> {
  const datos = Object.fromEntries(formData);
  const validacion = EsquemaCambiarContrasena.safeParse(datos);

  if (!validacion.success) {
    return {
      errores: validacion.error.flatten().fieldErrors,
    };
  }

  const { contrasena_actual, contrasena_nueva } = validacion.data;
  const logger = await obtenerLogger();

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
      logger.error(
        {
          accion: "cambiar_contrasena",
          err: errorUpdate,
          usuario_id: user.id,
          ip,
        },
        "Error al actualizar contraseña"
      );
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
    logger.error(
      {
        accion: "cambiar_contrasena",
        err: error,
      },
      "Error en cambiarContrasena"
    );
    return { error: "Error interno del servidor. Intente nuevamente." };
  }
}

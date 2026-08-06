"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { crearClienteAdmin } from "@/lib/supabase/cliente-admin";
import {
  EsquemaCrearUsuario,
  EsquemaCompletarRegistro,
  type ErroresCrearUsuario,
  type ErroresCompletarRegistro,
} from "@/lib/esquemas/usuarios";
import { obtenerRolActual } from "@/lib/supabase/usuarios-servidor";
import { generarToken, hashToken } from "@/lib/invitaciones";
import { enviarInvitacion, obtenerUrlBase } from "@/lib/correo";
import type { EstadoAccion } from "@/lib/utilidades";

async function obtenerRolPermitido(rolSolicitado: number): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const rolActual = await obtenerRolActual();

  if (rolActual === null || rolActual === 3) {
    return { ok: false, error: "No tiene permisos para crear usuarios" };
  }

  if (rolSolicitado <= rolActual) {
    return {
      ok: false,
      error: "No puede crear usuarios con ese rol",
    };
  }

  return { ok: true };
}

async function obtenerIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

async function registrarAuditoria(
  usuarioId: string,
  usuario: string,
  accion: string,
  detalles?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await crearClienteServidor();
    await supabase.rpc("registrar_auditoria_auth", {
      p_accion: accion,
      p_usuario_id: usuarioId,
      p_usuario: usuario,
      p_ip_address: "server",
      p_detalles: detalles,
    });
  } catch {
    /* best-effort: la auditoría no bloquea la operación */
  }
}

export async function crearUsuario(
  _prevState: EstadoAccion<ErroresCrearUsuario>,
  formData: FormData
): Promise<EstadoAccion<ErroresCrearUsuario>> {
  const datos = Object.fromEntries(formData);
  const validacion = EsquemaCrearUsuario.safeParse(datos);

  if (!validacion.success) {
    return {
      errores: validacion.error.flatten().fieldErrors,
    };
  }

  const { rol_id, apellidos, nombres, usuario, correo } = validacion.data;
  const permiso = await obtenerRolPermitido(rol_id);
  if (!permiso.ok) {
    return { error: permiso.error };
  }

  try {
    const supabase = await crearClienteServidor();
    const {
      data: { user: creador },
    } = await supabase.auth.getUser();

    if (!creador) {
      return { error: "Su sesión ha expirado. Inicie sesión nuevamente." };
    }

    const admin = crearClienteAdmin();

    const { data: existente, error: errExistente } = await admin
      .from("perfiles")
      .select("id, usuario, correo")
      .or(`usuario.eq.${usuario},correo.eq.${correo}`)
      .maybeSingle();

    if (errExistente) {
      console.error("Error al verificar duplicados:", errExistente);
      return { error: "Error interno al verificar la disponibilidad." };
    }

    if (existente) {
      return {
        errores:
          existente.usuario === usuario
            ? { usuario: ["El nombre de usuario ya está en uso"] }
            : { correo: ["El correo electrónico ya está en uso"] },
      };
    }

    const { data: creado, error: errorAuth } = await admin.auth.admin.createUser({
      email: correo,
      email_confirm: true,
      user_metadata: {
        usuario,
        apellidos,
        nombre: nombres,
        rol_id,
        creado_por: creador.id,
      },
    });

    if (errorAuth) {
      console.error(
        "Error al crear usuario:",
        `code=${errorAuth.code ?? "sin-codigo"}`,
        `message=${errorAuth.message}`,
        errorAuth
      );
      if (errorAuth.code === "email_exists") {
        return { errores: { correo: ["El correo electrónico ya está en uso"] } };
      }
      return { error: "Error al crear el usuario. Intente nuevamente." };
    }

    if (!creado.user) {
      return { error: "Error al crear el usuario. Intente nuevamente." };
    }

    const token = generarToken();
    const hash = hashToken(token);
    const expiraEn = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: errHash } = await admin
      .from("perfiles")
      .update({ invitacion_token_hash: hash, invitacion_expira_en: expiraEn })
      .eq("id", creado.user.id);

    if (errHash) {
      console.error("Error al guardar invitación:", errHash);
      return { error: "Error al preparar la invitación. Intente nuevamente." };
    }

    await registrarAuditoria(creador.id, usuario, "crear_usuario", {
      rol_id,
      correo,
    });

    const base = await obtenerUrlBase();
    const link = `${base}/auth/completar-registro?token=${token}`;

    try {
      await enviarInvitacion(correo, nombres, link);
    } catch (errorCorreo) {
      console.error("Error al enviar invitación:", errorCorreo);
      revalidatePath("/usuarios");
      return {
        exito: "Usuario creado. No se pudo enviar el correo de invitación.",
      };
    }

    revalidatePath("/usuarios");
    return { exito: `Invitación enviada a ${correo}` };
  } catch (error) {
    if ((error as { digest?: string })?.digest) {
      throw error;
    }
    console.error("Error en crearUsuario:", error);
    return { error: "Error interno del servidor. Intente nuevamente." };
  }
}

export async function completarRegistro(
  prevState: EstadoAccion<ErroresCompletarRegistro>,
  formData: FormData
): Promise<EstadoAccion<ErroresCompletarRegistro>> {
  const datos = Object.fromEntries(formData);
  const validacion = EsquemaCompletarRegistro.safeParse(datos);

  if (!validacion.success) {
    return {
      errores: validacion.error.flatten().fieldErrors,
    };
  }

  const { contrasena, token } = validacion.data;

  try {
    const admin = crearClienteAdmin();
    const ip = await obtenerIp();

    const { data: ipLimit } = await admin
      .rpc("verificar_rate_limit_ip", { direccion_ip: ip })
      .single();

    if (ipLimit && (ipLimit as Record<string, unknown>).bloqueado) {
      return {
        error: "Se han realizado demasiados intentos. Intente más tarde.",
      };
    }

    const { data: invitacion, error: errInvitacion } = await admin.rpc(
      "verificar_y_consumir_invitacion",
      { p_token_hash: hashToken(token) }
    );

    await admin.rpc("registrar_intento_ip", { direccion_ip: ip });

    if (errInvitacion || !invitacion) {
      console.error("Error al validar invitación:", errInvitacion);
      return {
        error: errInvitacion?.message ?? "El enlace es inválido o ha expirado",
      };
    }

    const perfil = (invitacion as Array<Record<string, unknown>>)[0];
    const usuarioId = perfil.id as string;
    const usuario = perfil.usuario as string;

    const { error: errorUpdate } = await admin.auth.admin.updateUserById(
      usuarioId,
      { password: contrasena }
    );

    if (errorUpdate) {
      console.error("Error al actualizar contraseña:", errorUpdate);
      return {
        error: "Error al configurar la contraseña. Intente nuevamente.",
      };
    }

    await admin.rpc("actualizar_timestamp_contrasena", {
      usuario_id: usuarioId,
    });

    await registrarAuditoria(usuarioId, usuario, "completar_registro");

    redirect("/iniciar-sesion");
  } catch (error) {
    if ((error as { digest?: string })?.digest) {
      throw error;
    }
    console.error("Error en completarRegistro:", error);
    return { error: "Error interno del servidor. Intente nuevamente." };
  }
}
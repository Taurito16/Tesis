import { z } from "zod";
import { normalizarUsuario } from "@/lib/utilidades";

export const REGEX_USUARIO = /^[a-z0-9][a-z0-9._-]{1,49}$/;

export const EsquemaCrearUsuario = z
  .object({
    rol_id: z
      .coerce.number()
      .int("El rol no es válido")
      .positive("El rol no es válido"),
    apellidos: z
      .string()
      .trim()
      .min(1, "Los apellidos son requeridos")
      .max(80, "Los apellidos no pueden exceder 80 caracteres")
      .transform((v) => v.replace(/\s+/g, " ")),
    nombres: z
      .string()
      .trim()
      .min(1, "Los nombres son requeridos")
      .max(80, "Los nombres no pueden exceder 80 caracteres")
      .transform((v) => v.replace(/\s+/g, " ")),
    usuario: z
      .string()
      .min(1, "El nombre de usuario es requerido")
      .max(50, "El nombre de usuario no puede exceder 50 caracteres")
      .transform(normalizarUsuario)
      .refine((u) => REGEX_USUARIO.test(u), {
        message:
          "Solo letras minúsculas, números, punto, guion o guion bajo (debe empezar con letra o número)",
      }),
    correo: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .max(120, "El correo no puede exceder 120 caracteres")
      .trim()
      .email("Ingrese un correo electrónico válido")
      .transform((v) => v.toLowerCase()),
  });

export type DatosCrearUsuario = z.output<typeof EsquemaCrearUsuario>;
export type ErroresCrearUsuario = Partial<Record<keyof DatosCrearUsuario, string[]>>;

const REGLAS_CONTRASENA = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña no puede exceder 128 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (@, #, $, etc.)");

export const EsquemaCompletarRegistro = z
  .object({
    contrasena: REGLAS_CONTRASENA,
    confirmar_contrasena: z.string().min(1, "Debe confirmar la contraseña"),
    token: z.string().min(1, "El enlace es inválido"),
  })
  .refine((data) => data.contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"],
  });

export type DatosCompletarRegistro = z.input<typeof EsquemaCompletarRegistro>;
export type ErroresCompletarRegistro = Partial<Record<keyof DatosCompletarRegistro, string[]>>;
import { z } from "zod";

export const EsquemaIniciarSesion = z.object({
  usuario: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres")
    .trim(),
  contrasena: z
    .string()
    .min(1, "La contraseña es requerida"),
});

export const EsquemaCambiarContrasena = z
  .object({
    contrasena_actual: z.string().min(1, "La contraseña actual es requerida"),
    contrasena_nueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(
        /[^A-Za-z0-9]/,
        "Debe contener al menos un carácter especial (@, #, $, etc.)"
      ),
    confirmar_contrasena: z.string().min(1, "Debe confirmar la contraseña"),
  })
  .refine((data) => data.contrasena_nueva === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"],
  });

export type DatosIniciarSesion = z.infer<typeof EsquemaIniciarSesion>;
export type DatosCambiarContrasena = z.infer<typeof EsquemaCambiarContrasena>;

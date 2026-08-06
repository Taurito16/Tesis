import { describe, expect, it } from "vitest";
import { EsquemaCambiarContrasena, EsquemaIniciarSesion } from "./auth";

function erroresDe(validacion: {
  success: boolean;
  error?: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } };
}) {
  return validacion.success
    ? undefined
    : validacion.error?.flatten().fieldErrors ?? {};
}

describe("EsquemaIniciarSesion", () => {
  it("acepta credenciales válidas", () => {
    expect(
      EsquemaIniciarSesion.safeParse({ usuario: "jose", contrasena: "x" }).success
    ).toBe(true);
  });

  it("rechaza usuario vacío", () => {
    const e = erroresDe(
      EsquemaIniciarSesion.safeParse({ usuario: "   ", contrasena: "x" })
    );
    expect(e?.usuario).toBeTruthy();
  });

  it("rechaza contraseña vacía", () => {
    const e = erroresDe(
      EsquemaIniciarSesion.safeParse({ usuario: "jose", contrasena: "" })
    );
    expect(e?.contrasena).toBeTruthy();
  });
});

describe("EsquemaCambiarContrasena", () => {
  it("acepta datos válidos", () => {
    expect(
      EsquemaCambiarContrasena.safeParse({
        contrasena_actual: "Actual1@",
        contrasena_nueva: "Nueva12@",
        confirmar_contrasena: "Nueva12@",
      }).success
    ).toBe(true);
  });

  it("rechaza contraseña nueva sin número", () => {
    const e = erroresDe(
      EsquemaCambiarContrasena.safeParse({
        contrasena_actual: "Actual1@",
        contrasena_nueva: "Nueva@Sola",
        confirmar_contrasena: "Nueva@Sola",
      })
    );
    expect(e?.contrasena_nueva).toBeTruthy();
  });

  it("rechaza contraseñas que no coinciden", () => {
    const e = erroresDe(
      EsquemaCambiarContrasena.safeParse({
        contrasena_actual: "Actual1@",
        contrasena_nueva: "Nueva1@",
        confirmar_contrasena: "Distinta1@",
      })
    );
    expect(e?.confirmar_contrasena).toBeTruthy();
  });
});
import { describe, expect, it } from "vitest";
import { EsquemaCompletarRegistro, EsquemaCrearUsuario } from "./usuarios";

function erroresDe(validacion: { success: boolean; error?: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } } }) {
  return validacion.success
    ? undefined
    : validacion.error?.flatten().fieldErrors ?? {};
}

describe("EsquemaCrearUsuario", () => {
  it("acepta datos válidos y normaliza campos", () => {
    const resultado = EsquemaCrearUsuario.safeParse({
      rol_id: "2",
      apellidos: "  Lopez   García ",
      nombres: "  María ",
      usuario: "  MaríaJosé ",
      correo: "  Prueba@Correo.com ",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.rol_id).toBe(2);
      expect(resultado.data.apellidos).toBe("Lopez García");
      expect(resultado.data.nombres).toBe("María");
      expect(resultado.data.usuario).toBe("mariajose");
      expect(resultado.data.correo).toBe("prueba@correo.com");
    }
  });

  it("requiere apellidos (no solo espacios)", () => {
const e = erroresDe(EsquemaCrearUsuario.safeParse({
      rol_id: "2",
      apellidos: " ",
      nombres: "María",
      usuario: "mj",
      correo: "a@b.com",
    }));
    expect(e?.apellidos).toBeTruthy();
  });

  it("rechaza un correo inválido", () => {
    const e = erroresDe(EsquemaCrearUsuario.safeParse({
      rol_id: "2",
      apellidos: "García",
      nombres: "María",
      usuario: "mj",
      correo: "no-es-email",
    }));
    expect(e?.correo).toBeTruthy();
  });

  it("rechaza un usuario con caracteres no permitidos", () => {
    const e = erroresDe(EsquemaCrearUsuario.safeParse({
      rol_id: "2",
      apellidos: "García",
      nombres: "María",
      usuario: "usuario invalido",
      correo: "a@b.com",
    }));
    expect(e?.usuario).toBeTruthy();
  });

  it("rechaza un rol no positivo", () => {
    const e = erroresDe(EsquemaCrearUsuario.safeParse({
      rol_id: "0",
      apellidos: "García",
      nombres: "María",
      usuario: "mj",
      correo: "a@b.com",
    }));
    expect(e?.rol_id).toBeTruthy();
  });
});

describe("EsquemaCompletarRegistro", () => {
  it("acepta una contraseña de cada clase correcta", () => {
    expect(
      EsquemaCompletarRegistro.safeParse({
        contrasena: "Contr@seña1",
        confirmar_contrasena: "Contr@seña1",
        token: "abc123",
      }).success
    ).toBe(true);
  });

  it("rechaza contraseña sin mayúscula", () => {
    const e = erroresDe(EsquemaCompletarRegistro.safeParse({
      contrasena: "contraseña1",
      confirmar_contrasena: "contraseña1",
      token: "tok",
    }));
    expect(e?.contrasena).toBeTruthy();
  });

  it("rechaza contraseñas que no coinciden", () => {
    const e = erroresDe(EsquemaCompletarRegistro.safeParse({
      contrasena: "Contr0seña1",
      confirmar_contrasena: "OtraContraseña1",
      token: "tok",
    }));
    expect(e?.confirmar_contrasena).toBeTruthy();
  });

  it("rechaza un token vacío", () => {
    const e = erroresDe(EsquemaCompletarRegistro.safeParse({
      contrasena: "Contr0seña1",
      confirmar_contrasena: "Contr0seña1",
      token: "",
    }));
    expect(e?.token).toBeTruthy();
  });
});
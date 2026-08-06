import { describe, expect, it } from "vitest";
import {
  cn,
  formatearIniciales,
  formatearNombreUsuario,
  generarContrasena,
  normalizarUsuario,
} from "./utilidades";

describe("normalizarUsuario", () => {
  it("convierte a minúsculas y recorta espacios", () => {
    expect(normalizarUsuario("  JOSE  ")).toBe("jose");
  });

  it("elimina tildes", () => {
    expect(normalizarUsuario("María José")).toBe("maria jose");
  });

  it("convierte ñ en n", () => {
    expect(normalizarUsuario("Ñaño")).toBe("nano");
  });
});

describe("formatearIniciales", () => {
  it("devuelve U cuando el texto está vacío", () => {
    expect(formatearIniciales("")).toBe("U");
    expect(formatearIniciales("   ")).toBe("U");
  });

  it("toma la inicial del primer y último nombre", () => {
    expect(formatearIniciales("José María Pérez")).toBe("JP");
  });

  it("devuelve la inicial única si hay un solo nombre", () => {
    expect(formatearIniciales("jose")).toBe("J");
  });
});

describe("formatearNombreUsuario", () => {
  it("combina primer nombre y primer apellido en mayúsculas", () => {
    expect(formatearNombreUsuario("María", "López García")).toBe("MARÍA LÓPEZ");
  });

  it("tolera valores nulos o vacíos", () => {
    expect(formatearNombreUsuario(null, null)).toBe("");
    expect(formatearNombreUsuario("Ana", null)).toBe("ANA");
  });
});

describe("generarContrasena", () => {
  it("genera la longitud pedida", () => {
    expect(generarContrasena(16)).toHaveLength(16);
    expect(generarContrasena(24)).toHaveLength(24);
  });

  it("incluye al menos una letra de cada clase", () => {
    const contrasena = generarContrasena(16);
    expect(contrasena).toMatch(/[A-Z]/);
    expect(contrasena).toMatch(/[a-z]/);
    expect(contrasena).toMatch(/[0-9]/);
    expect(contrasena).toMatch(/[^A-Za-z0-9]/);
  });
});

describe("cn", () => {
  it("une clases no vacías", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("descarta valores falsos", () => {
    expect(cn("a", false, "b", undefined, null, "")).toBe("a b");
  });

  it("devuelve cadena vacía sin clases válidas", () => {
    expect(cn(false, undefined)).toBe("");
  });
});

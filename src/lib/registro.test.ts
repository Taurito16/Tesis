import { describe, expect, it } from "vitest";
import {
  crearLogger,
  nuevaRequestId,
  runConRequestId,
} from "./registro";

function capturarSalida() {
  const lineas: string[] = [];
  const salida = {
    write(linea: string) {
      lineas.push(linea);
    },
  };
  return { lineas, salida };
}

describe("crearLogger", () => {
  it("respeta el nivel configurado", () => {
    const { lineas, salida } = capturarSalida();
    const log = crearLogger({ nivel: "warn", salida });

    log.info("no debe aparecer");
    log.warn({}, "debe aparecer");

    expect(lineas).toHaveLength(1);
    const dato = JSON.parse(lineas[0]);
    expect(dato.level).toBe(40);
    expect(dato.msg).toBe("debe aparecer");
  });

  it("incluye metadatos base", () => {
    const { lineas, salida } = capturarSalida();
    const log = crearLogger({ nivel: "info", salida });

    log.info("hola");

    const dato = JSON.parse(lineas[0]);
    expect(dato.env).toBeDefined();
    expect(dato.servicio).toBe("hospital-tesis");
  });
});

describe("redacción de datos sensibles", () => {
  const redactarYParsear = (campos: Record<string, unknown>) => {
    const { lineas, salida } = capturarSalida();
    const log = crearLogger({ nivel: "info", salida });

    log.info(campos, "con datos sensibles");

    return JSON.parse(lineas[0]);
  };

  it("redacta la contraseña a nivel raíz", () => {
    const dato = redactarYParsear({ contrasena: "secreta123" });
    expect(dato.contrasena).toBe("[REDACTADO]");
  });

  it("redacta la contraseña en objetos anidados", () => {
    const dato = redactarYParsear({ detalles: { contrasena: "secreta123" } });
    expect(dato.detalles.contrasena).toBe("[REDACTADO]");
  });

  it("redacta tokens y hashes de invitación", () => {
    const dato = redactarYParsear({
      token: "abctoken",
      invitacion_token_hash: "abcdef",
    });
    expect(dato.token).toBe("[REDACTADO]");
    expect(dato.invitacion_token_hash).toBe("[REDACTADO]");
  });

  it("redacta el campo correo (PII)", () => {
    const dato = redactarYParsear({ correo: "ana@hospital.test" });
    expect(dato.correo).toBe("[REDACTADO]");
  });

  it("no altera campos no sensibles", () => {
    const dato = redactarYParsear({ usuario: "ana", rol_id: 2 });
    expect(dato.usuario).toBe("ana");
    expect(dato.rol_id).toBe(2);
  });
});

describe("correlación con request_id", () => {
  it("incluye request_id dentro del contexto ALS", () => {
    const { lineas, salida } = capturarSalida();
    const log = crearLogger({ nivel: "info", salida });

    runConRequestId("req-123", () => {
      log.info("evento dentro de la petición");
    });

    const dato = JSON.parse(lineas[0]);
    expect(dato.request_id).toBe("req-123");
  });

  it("omite request_id fuera del contexto ALS", () => {
    const { lineas, salida } = capturarSalida();
    const log = crearLogger({ nivel: "info", salida });

    log.info("evento fuera de la petición");

    const dato = JSON.parse(lineas[0]);
    expect(dato.request_id).toBeUndefined();
  });
});

describe("nuevaRequestId", () => {
  it("genera un UUID válido", () => {
    const id = nuevaRequestId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});
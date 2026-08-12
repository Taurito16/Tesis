import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import pino, { type DestinationStream, type Logger, type LoggerOptions } from "pino";

export const CABECERA_REQUEST_ID = "x-request-id";

export type ContextoRegistro = {
  request_id: string;
};

const almacen = new AsyncLocalStorage<ContextoRegistro>();

export function nuevaRequestId(): string {
  return randomUUID();
}

export function runConRequestId<T>(requestId: string, fn: () => T): T {
  return almacen.run({ request_id: requestId }, fn);
}

type OpcionesRegistro = {
  nivel?: string;
  salida?: DestinationStream;
};

export function crearLogger(opciones: OpcionesRegistro = {}): Logger {
  const config: LoggerOptions = {
    level: opciones.nivel ?? process.env.LOG_LEVEL ?? "info",
    base: {
      env: process.env.NODE_ENV ?? "development",
      servicio: "hospital-tesis",
    },
    mixin: () => {
      const contexto = almacen.getStore();
      return contexto ? { request_id: contexto.request_id } : {};
    },
    redact: {
      paths: [
        "password",
        "*.password",
        "contrasena",
        "contrasena_actual",
        "contrasena_nueva",
        "*.contrasena",
        "token",
        "*.token",
        "invitacion_token_hash",
        "*.invitacion_token_hash",
        "authorization",
        "cookie",
        "correo",
        "*.correo",
        "email",
        "*.email",
      ],
      censor: "[REDACTADO]",
    },
  };

  return opciones.salida ? pino(config, opciones.salida) : pino(config);
}

export const logger = crearLogger();

export async function obtenerLogger(): Promise<Logger> {
  try {
    const h = await headers();
    const requestId = h.get(CABECERA_REQUEST_ID);
    return requestId ? logger.child({ request_id: requestId }) : logger;
  } catch {
    return logger;
  }
}

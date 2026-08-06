import { createHash, randomBytes } from "crypto";

export function generarToken(longitud = 32): string {
  return randomBytes(longitud).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

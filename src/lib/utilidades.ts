export function normalizarUsuario(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n");
}

export function generarContrasena(longitud = 16): string {
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const minusculas = "abcdefghijklmnopqrstuvwxyz";
  const numeros = "0123456789";
  const especiales = "@#$%&*!";
  const todos = mayusculas + minusculas + numeros + especiales;

  let contrasena = "";
  contrasena += mayusculas[Math.floor(Math.random() * mayusculas.length)];
  contrasena += minusculas[Math.floor(Math.random() * minusculas.length)];
  contrasena += numeros[Math.floor(Math.random() * numeros.length)];
  contrasena += especiales[Math.floor(Math.random() * especiales.length)];

  for (let i = contrasena.length; i < longitud; i++) {
    contrasena += todos[Math.floor(Math.random() * todos.length)];
  }

  return contrasena
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function cn(...clases: (string | false | undefined | null)[]): string {
  return clases.filter(Boolean).join(" ");
}

export type EstadoAccion<T = Record<string, string[]>> = {
  error?: string | null;
  errores?: T;
  exito?: string;
};

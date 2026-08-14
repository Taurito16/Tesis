export const TAMANOS_PAGINA = [10, 25, 50, 100];

export type ResultadoPaginacion = {
  pagina: number;
  tamano: number;
  desde: number;
  hasta: number;
  totalPaginas: number;
};

export function leerEntero(
  valor: string | undefined | null,
  porDefecto: number,
  minimo: number,
  maximo: number
): number {
  if (valor === undefined || valor === null || valor === "") return porDefecto;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < minimo) return porDefecto;
  return Math.min(Math.floor(numero), maximo);
}

export function calcularRango(total: number, pagina: number, tamano: number): ResultadoPaginacion {
  if (total <= 0) {
    return { pagina: 1, tamano, desde: 0, hasta: 0, totalPaginas: 1 };
  }

  const totalPaginas = Math.max(1, Math.ceil(total / tamano));
  const paginaSegura = Math.min(Math.max(pagina, 1), totalPaginas);
  const desde = (paginaSegura - 1) * tamano + 1;
  const hasta = Math.min(paginaSegura * tamano, total);

  return { pagina: paginaSegura, tamano, desde, hasta, totalPaginas };
}

export function paginasVisibles(paginaActual: number, totalPaginas: number): (number | "…")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  const paginas: (number | "…")[] = [1];

  let inicio = Math.max(2, paginaActual - 1);
  let fin = Math.min(totalPaginas - 1, paginaActual + 1);

  if (paginaActual <= 3) {
    inicio = 2;
    fin = 4;
  }
  if (paginaActual >= totalPaginas - 2) {
    inicio = totalPaginas - 3;
    fin = totalPaginas - 1;
  }

  if (inicio > 2) paginas.push("…");
  for (let i = inicio; i <= fin; i++) paginas.push(i);
  if (fin < totalPaginas - 1) paginas.push("…");
  paginas.push(totalPaginas);

  return paginas;
}

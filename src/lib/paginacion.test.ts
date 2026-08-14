import { describe, expect, it } from "vitest";
import { leerEntero, calcularRango, paginasVisibles } from "./paginacion";

describe("leerEntero", () => {
  it("devuelve el valor por defecto cuando el valor está vacío", () => {
    expect(leerEntero(undefined, 10, 1, 100)).toBe(10);
    expect(leerEntero(null, 10, 1, 100)).toBe(10);
    expect(leerEntero("", 10, 1, 100)).toBe(10);
  });

  it("devuelve el valor por defecto cuando no es un número válido", () => {
    expect(leerEntero("abc", 10, 1, 100)).toBe(10);
    expect(leerEntero("NaN", 10, 1, 100)).toBe(10);
  });

  it("respeta los límites mínimo y máximo", () => {
    expect(leerEntero("0", 10, 1, 100)).toBe(10);
    expect(leerEntero("9999", 10, 1, 100)).toBe(100);
    expect(leerEntero("50", 10, 1, 100)).toBe(50);
  });
});

describe("calcularRango", () => {
  it("con total 0 devuelve un rango vacío", () => {
    expect(calcularRango(0, 2, 10)).toEqual({
      pagina: 1,
      tamano: 10,
      desde: 0,
      hasta: 0,
      totalPaginas: 1,
    });
  });

  it("calcula el rango de la primera página", () => {
    const rango = calcularRango(57, 1, 10);
    expect(rango.desde).toBe(1);
    expect(rango.hasta).toBe(10);
    expect(rango.totalPaginas).toBe(6);
  });

  it("calcula el rango de una página intermedia", () => {
    const rango = calcularRango(57, 3, 10);
    expect(rango.desde).toBe(21);
    expect(rango.hasta).toBe(30);
  });

  it("acota la página más allá de la última", () => {
    const rango = calcularRango(57, 99, 10);
    expect(rango.pagina).toBe(6);
    expect(rango.desde).toBe(51);
    expect(rango.hasta).toBe(57);
  });
});

describe("paginasVisibles", () => {
  it("muestra todas las páginas cuando hay pocas", () => {
    expect(paginasVisibles(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("usa elipsis para rangos largos en el medio", () => {
    expect(paginasVisibles(5, 20)).toEqual([1, "…", 4, 5, 6, "…", 20]);
  });

  it("mantiene visibles las primeras cuando la actual es baja", () => {
    expect(paginasVisibles(1, 20)).toEqual([1, 2, 3, 4, "…", 20]);
  });

  it("mantiene visibles las últimas cuando la actual es alta", () => {
    expect(paginasVisibles(20, 20)).toEqual([1, "…", 17, 18, 19, 20]);
  });
});

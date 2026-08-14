import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { EsqueletoTabla } from "./esqueleto-tabla";

afterEach(cleanup);

describe("EsqueletoTabla", () => {
  it("expone el estado de carga a tecnologías de asistencia", () => {
    render(<EsqueletoTabla encabezados={8} filas={6} />);
    const estado = screen.getByRole("status");
    expect(estado.getAttribute("aria-live")).toBe("polite");
    expect(estado.getAttribute("aria-label")).toContain("Cargando");
  });

  it("muestra todas las celdas del skeleton", () => {
    render(<EsqueletoTabla encabezados={8} filas={4} />);
    const celdas = screen.getAllByTestId("esqueleto");
    const esperadas = 8 + 8 * 4;
    expect(celdas).toHaveLength(esperadas);
  });

  it("usa un ancho mayor para la primera columna (jerarquía de la tabla)", () => {
    render(<EsqueletoTabla encabezados={2} filas={1} />);
    const contenedor = screen.getByRole("status");
    const primera = within(contenedor)
      .getAllByTestId("esqueleto")
      .find((el) => el.className.includes("w-32"));
    expect(primera).toBeTruthy();
  });
});
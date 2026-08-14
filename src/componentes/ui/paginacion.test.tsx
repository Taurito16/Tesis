import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Paginacion } from "./paginacion";

const reemplazar = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/usuarios",
  useSearchParams: () => new URLSearchParams("pagina=2&tamano=10"),
  useRouter: () => ({ replace: reemplazar }),
}));

afterEach(() => {
  cleanup();
  reemplazar.mockClear();
});

describe("Paginacion", () => {
  it("no se renderiza cuando no hay registros", () => {
    render(<Paginacion total={0} pagina={1} tamano={10} />);
    expect(screen.queryByRole("navigation", { name: "Paginación" })).toBeNull();
  });

  it("muestra el rango y el total de registros", () => {
    render(<Paginacion total={57} pagina={1} tamano={10} />);
    expect(screen.getByText("Mostrando 1–10 de 57 registros")).toBeTruthy();
  });

  it("marca la página actual con aria-current y construye el href", () => {
    render(<Paginacion total={57} pagina={2} tamano={10} />);
    const actual = screen.getByText("2").closest("a");
    expect(actual?.getAttribute("aria-current")).toBe("page");
    expect(actual?.getAttribute("href")).toBe("/usuarios?pagina=2&tamano=10");
  });

  it("deshabilita el botón anterior en la primera página", () => {
    render(<Paginacion total={57} pagina={1} tamano={10} />);
    const anterior = screen.getByLabelText("Página anterior");
    expect(anterior.getAttribute("aria-disabled")).toBe("true");
    expect(anterior.getAttribute("tabindex")).toBe("-1");
  });

  it("deshabilita el botón siguiente en la última página", () => {
    render(<Paginacion total={57} pagina={6} tamano={10} />);
    const siguiente = screen.getByLabelText("Página siguiente");
    expect(siguiente.getAttribute("aria-disabled")).toBe("true");
  });

  it("construye la URL correcta al cambiar de página", () => {
    render(<Paginacion total={57} pagina={1} tamano={10} />);
    const siguiente = screen.getByLabelText("Página siguiente");
    expect(siguiente.getAttribute("href")).toBe("/usuarios?pagina=2&tamano=10");
  });

  it("preserva los parámetros existentes al construir la URL", () => {
    render(<Paginacion total={57} pagina={2} tamano={10} />);
    const siguiente = screen.getByLabelText("Página siguiente");
    expect(siguiente.getAttribute("href")).toBe("/usuarios?pagina=3&tamano=10");
  });

  it("ofrece las opciones de filas por página", () => {
    render(<Paginacion total={57} pagina={1} tamano={10} />);
    const select = screen.getByLabelText("Filas por página") as HTMLSelectElement;
    expect(select.value).toBe("10");
    const opciones = Array.from(select.options).map((o) => o.value);
    expect(opciones).toEqual(["10", "25", "50", "100"]);
  });

  it("al cambiar el tamaño navega a la primera página sin scroll", () => {
    render(<Paginacion total={57} pagina={2} tamano={10} />);
    const select = screen.getByLabelText("Filas por página") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "25" } });
    expect(reemplazar).toHaveBeenCalledWith(
      "/usuarios?pagina=1&tamano=25",
      { scroll: false }
    );
  });
});

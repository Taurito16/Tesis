import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CampoFlotante } from "./campo-flotante";

afterEach(cleanup);

describe("CampoFlotante", () => {
  it("muestra la etiqueta dentro del campo por defecto", () => {
    render(<CampoFlotante etiqueta="Correo" name="correo" />);
    const etiqueta = screen.getByText("Correo", { selector: "label" });
    expect(etiqueta.className).toContain("top-3");
    expect(etiqueta.className).not.toContain("top-[-7px]");
  });

  it("levanta la etiqueta al enfocar el campo", () => {
    render(<CampoFlotante etiqueta="Correo" name="correo" />);
    const input = screen.getByLabelText("Correo") as HTMLInputElement;

    fireEvent.focus(input);

    const etiqueta = screen.getByText("Correo", { selector: "label" });
    expect(etiqueta.className).toContain("top-[-7px]");
    expect(etiqueta.className).toContain("text-primary-600");
  });

  it("levanta la etiqueta cuando el campo tiene valor", () => {
    render(<CampoFlotante etiqueta="Correo" name="correo" value="a@b.com" readOnly />);
    const etiqueta = screen.getByText("Correo", { selector: "label" });
    expect(etiqueta.className).toContain("top-[-7px]");
  });

  it("marca el campo con aria-invalid y aria-describedby cuando hay error", () => {
    render(<CampoFlotante etiqueta="Correo" name="correo" error="Correo inválido" />);

    const input = screen.getByLabelText("Correo");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const id = input.getAttribute("aria-describedby");
    expect(id).toBeTruthy();

    const error = screen.getByText("Correo inválido");
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.id).toBe(id);
  });

  it("no declara error cuando no lo hay", () => {
    render(<CampoFlotante etiqueta="Correo" name="correo" />);
    expect(screen.getByLabelText("Correo").getAttribute("aria-invalid")).toBe("false");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
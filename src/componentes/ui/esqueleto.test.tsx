import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Esqueleto } from "./esqueleto";

afterEach(cleanup);

describe("Esqueleto", () => {
  it("se marca como decorativo y sin accesibilidad para lectores de pantalla", () => {
    render(<Esqueleto />);
    const esqueleto = screen.getByTestId("esqueleto");
    expect(esqueleto.getAttribute("aria-hidden")).toBe("true");
  });

  it("incluye la clase base y la clase personalizada", () => {
    render(<Esqueleto className="h-4 w-24" />);
    const esqueleto = screen.getByTestId("esqueleto");
    expect(esqueleto.className).toContain("esqueleto");
    expect(esqueleto.className).toContain("h-4");
    expect(esqueleto.className).toContain("w-24");
  });
});
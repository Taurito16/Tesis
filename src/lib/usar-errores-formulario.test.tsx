import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, renderHook } from "@testing-library/react";
import { useErroresFormulario } from "./usar-errores-formulario";

type Errores = Record<string, string[] | undefined>;

const ERRORES_APELLIDOS: Errores = { apellidos: ["Requerido"] };
const ERRORES_MULTIPLES: Errores = {
  apellidos: ["Requerido"],
  correo: ["Correo inválido"],
};

afterEach(cleanup);

describe("useErroresFormulario", () => {
  it("muestra el error de un campo hasta que se edita", () => {
    const { result } = renderHook(() =>
      useErroresFormulario<Errores>(ERRORES_APELLIDOS, [])
    );
    expect(result.current.errorDe("apellidos")).toBe("Requerido");

    act(() => result.current.marcarEditado("apellidos"));
    expect(result.current.errorDe("apellidos")).toBeUndefined();
  });

  it("solo oculta el campo editado, no los demás", () => {
    const { result } = renderHook(() =>
      useErroresFormulario<Errores>(ERRORES_MULTIPLES, [])
    );

    act(() => result.current.marcarEditado("apellidos"));

    expect(result.current.errorDe("apellidos")).toBeUndefined();
    expect(result.current.errorDe("correo")).toBe("Correo inválido");
  });

  it("reaparecen los errores al llegar un resultado nuevo del servidor", () => {
    const primerEstado: Errores = { correo: ["El correo ya está en uso"] };
    const { result, rerender } = renderHook(
      ({ errores }: { errores: Errores | undefined }) =>
        useErroresFormulario<Errores>(errores, []),
      { initialProps: { errores: primerEstado } }
    );

    act(() => result.current.marcarEditado("correo"));
    expect(result.current.errorDe("correo")).toBeUndefined();

    rerender({ errores: { correo: ["El correo ya está en uso"] } });
    expect(result.current.errorDe("correo")).toBe("El correo ya está en uso");
  });

  it("no resetea los campos editados mientras el estado no cambia", () => {
    const primerEstado: Errores = { correo: ["Error viejo"] };
    const { result, rerender } = renderHook(
      ({ errores }: { errores: Errores | undefined }) =>
        useErroresFormulario<Errores>(errores, []),
      { initialProps: { errores: primerEstado } }
    );

    act(() => result.current.marcarEditado("correo"));
    rerender({ errores: primerEstado });

    expect(result.current.errorDe("correo")).toBeUndefined();
  });

  it("enfoca el primer campo con error según el orden", () => {
    function Arnes({ errores }: { errores: Errores | undefined }) {
      const { formularioRef } = useErroresFormulario<Errores>(
        errores,
        ["apellidos", "correo"]
      );
      return (
        <form ref={formularioRef}>
          <input name="apellidos" />
          <input name="correo" />
        </form>
      );
    }

    const { rerender } = render(<Arnes errores={{ correo: ["Requerido"] }} />);
    expect(document.activeElement?.getAttribute("name")).toBe("correo");

    rerender(<Arnes errores={{ apellidos: ["Requerido"] }} />);
    expect(document.activeElement?.getAttribute("name")).toBe("apellidos");
  });
});
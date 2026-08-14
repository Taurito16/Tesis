import { Esqueleto } from "@/componentes/ui/esqueleto";
import { cn } from "@/lib/utilidades";

type PropsEsqueletoTabla = {
  encabezados: number;
  filas?: number;
  rellenar?: boolean;
};

export function EsqueletoTabla({
  encabezados,
  filas = 6,
  rellenar = false,
}: PropsEsqueletoTabla) {
  const celdasEncabezado = Array.from({ length: encabezados }, (_, i) => i);
  const celdasCuerpo = Array.from({ length: filas }, (_, i) => i);
  const celdasPorFila = Array.from({ length: encabezados }, (_, i) => i);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200 bg-white",
        rellenar && "flex min-h-0 flex-1 flex-col"
      )}
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <div
        className={cn(
          "relative w-full",
          rellenar ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto"
        )}
      >
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              {celdasEncabezado.map((i) => (
                <th
                  key={i}
                  className="sticky top-0 z-10 bg-white h-12 px-4 text-left align-middle"
                >
                  <Esqueleto className="h-3 w-24 text-xs uppercase" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {celdasCuerpo.map((fila) => (
              <tr key={fila} className="border-b border-gray-200">
                {celdasPorFila.map((celda) => (
                  <td key={celda} className="p-4 align-middle">
                    <Esqueleto
                      className={celda === 0 ? "h-4 w-32" : "h-4 w-24"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

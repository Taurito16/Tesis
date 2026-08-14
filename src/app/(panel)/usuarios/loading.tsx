import { Esqueleto } from "@/componentes/ui/esqueleto";
import { EsqueletoTabla } from "@/componentes/ui/esqueleto-tabla";

export default function CargandoUsuarios() {
  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      <div className="flex justify-end">
        <Esqueleto className="h-10 w-28 rounded-full" />
      </div>
      <EsqueletoTabla encabezados={8} filas={10} rellenar />
    </div>
  );
}

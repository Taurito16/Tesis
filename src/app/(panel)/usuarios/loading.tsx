import { Esqueleto } from "@/componentes/ui/esqueleto";
import { EsqueletoTabla } from "@/componentes/ui/esqueleto-tabla";

export default function CargandoUsuarios() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Esqueleto className="h-10 w-28 rounded-full" />
      </div>
      <EsqueletoTabla encabezados={8} filas={6} />
    </div>
  );
}
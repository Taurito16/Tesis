import { BarraLateral } from "./barra-lateral/barra-lateral";
import { Encabezado } from "./encabezado/encabezado";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 dark:bg-gray-950">
      <Encabezado />
      <div className="flex-1 flex">
        <BarraLateral />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

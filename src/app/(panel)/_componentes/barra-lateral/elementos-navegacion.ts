import type { LucideIcon } from "lucide-react";
import { Users, Activity, Baby, Search, BarChart3 } from "lucide-react";

export type ElementoNavegacion = {
  ruta: string;
  etiqueta: string;
  icono: LucideIcon;
};

export const elementosNavegacion: ElementoNavegacion[] = [
  { ruta: "/usuarios", etiqueta: "Gestión de Usuarios", icono: Users },
  { ruta: "/pacientes", etiqueta: "Seguimiento de Pacientes", icono: Activity },
  { ruta: "/recien-nacidos", etiqueta: "Recién Nacidos", icono: Baby },
  { ruta: "/consulta-rapida", etiqueta: "Consulta Rápida", icono: Search },
  { ruta: "/reportes", etiqueta: "Reportes", icono: BarChart3 },
];

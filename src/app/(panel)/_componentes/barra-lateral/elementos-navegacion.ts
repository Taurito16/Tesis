import type { ComponentType } from "react";
import type { AnimatedIconProps } from "@/componentes/ui/iconos/types";
import UsersIcon from "@/componentes/ui/iconos/users-icon";
import AccessibilityIcon from "@/componentes/ui/iconos/accessibility-icon";
import ScanHeartIcon from "@/componentes/ui/iconos/scan-heart-icon";
import MagnifierIcon from "@/componentes/ui/iconos/magnifier-icon";
import ChartBarIcon from "@/componentes/ui/iconos/chart-bar-icon";

export type ElementoNavegacion = {
  ruta: string;
  etiqueta: string;
  icono: ComponentType<AnimatedIconProps>;
};

export const elementosNavegacion: ElementoNavegacion[] = [
  { ruta: "/usuarios", etiqueta: "Gestión de Usuarios", icono: UsersIcon },
  { ruta: "/pacientes", etiqueta: "Seguimiento de Pacientes", icono: AccessibilityIcon },
  { ruta: "/recien-nacidos", etiqueta: "Recién Nacidos", icono: ScanHeartIcon },
  { ruta: "/consulta-rapida", etiqueta: "Consulta Rápida", icono: MagnifierIcon },
  { ruta: "/reportes", etiqueta: "Reportes", icono: ChartBarIcon },
];

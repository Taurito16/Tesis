import { type NextRequest, NextResponse } from "next/server";
import { crearClienteProxy } from "@/lib/supabase/cliente-proxy";
import {
  CABECERA_REQUEST_ID,
  nuevaRequestId,
  runConRequestId,
} from "@/lib/registro";

const rutasProtegidas = ["/"];

export async function proxy(request: NextRequest) {
  const requestId = request.headers.get(CABECERA_REQUEST_ID) ?? nuevaRequestId();

  return runConRequestId(requestId, async () => {
    const { pathname } = request.nextUrl;

    const supabase = crearClienteProxy(request);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const estaProtegida = rutasProtegidas.some((r) => pathname.startsWith(r));
    const estaAutenticado = !!session;

    if (estaProtegida && !estaAutenticado && pathname !== "/iniciar-sesion") {
      const url = new URL("/iniciar-sesion", request.url);
      url.searchParams.set("redirect", pathname);
      const respuesta = NextResponse.redirect(url);
      respuesta.headers.set(CABECERA_REQUEST_ID, requestId);
      return respuesta;
    }

    if (estaAutenticado && pathname === "/iniciar-sesion") {
      const respuesta = NextResponse.redirect(new URL("/", request.url));
      respuesta.headers.set(CABECERA_REQUEST_ID, requestId);
      return respuesta;
    }

    const cabeceras = new Headers(request.headers);
    cabeceras.set(CABECERA_REQUEST_ID, requestId);

    const respuesta = NextResponse.next({ request: { headers: cabeceras } });
    respuesta.headers.set(CABECERA_REQUEST_ID, requestId);
    return respuesta;
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

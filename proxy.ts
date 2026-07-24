import { type NextRequest, NextResponse } from "next/server";
import { crearClienteProxy } from "@/lib/supabase/cliente-proxy";

const rutasProtegidas = ["/"];

export async function proxy(request: NextRequest) {
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
    return NextResponse.redirect(url);
  }

  if (estaAutenticado && pathname === "/iniciar-sesion") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

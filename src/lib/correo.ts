import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { headers } from "next/headers";
import { obtenerLogger } from "@/lib/registro";

function obtenerTransporte(): Transporter {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP no configurado");
  }

  const puerto = Number(process.env.SMTP_PORT ?? 587);

  return nodemailer.createTransport({
    host,
    port: puerto,
    secure: puerto === 465,
    auth: { user, pass },
  });
}

export async function obtenerUrlBase(): Promise<string> {
  const urlApp = process.env.NEXT_PUBLIC_APP_URL;
  if (urlApp) return urlApp;

  const h = await headers();
  const protocolo = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${protocolo}://${host}`;
}

export async function enviarInvitacion(
  correo: string,
  nombre: string,
  link: string
): Promise<void> {
  const logger = await obtenerLogger();
  const inicio = Date.now();
  const transporte = obtenerTransporte();

  await transporte.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: correo,
    subject: "Activa tu cuenta en el Sistema Hospitalario",
    text: [
      `Hola ${nombre},`,
      "",
      "Te han creado una cuenta en el Sistema Hospitalario.",
      "Para activarla y definir tu contraseña, abre el siguiente enlace:",
      "",
      link,
      "",
      "El enlace es válido por 24 horas y es de un solo uso.",
      "",
      "Si no esperabas esta invitación, ignora este correo.",
    ].join("\n"),
  });

  logger.info(
    { accion: "enviar_invitacion", duracion_ms: Date.now() - inicio },
    "Invitación enviada por correo"
  );
}

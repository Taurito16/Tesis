import { spawn } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const PUERTO_PRED = 3199;
const TIMEOUT_INICIO_MS = 90_000;
const ESPERA_TRAS_POST_MS = 2_000;

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const sinGuion = a.slice(2);
    const igual = sinGuion.indexOf("=");
    if (igual >= 0) args.set(sinGuion.slice(0, igual), sinGuion.slice(igual + 1));
    else args.set(sinGuion, process.argv[i + 1]);
  }
}

const usuario = args.get("usuario") ?? "jperez";
const contrasena = args.get("contrasena") ?? "";
const contrasenaMala = "ContrasenaIncorrecta#2026";
const puerto = Number(args.get("puerto") ?? PUERTO_PRED);
const rutaLog = path.resolve(args.get("log") ?? path.join(RAIZ, ".verificacion-observabilidad.log"));

if (!contrasena) {
  console.error("Falta --contrasena (la contraseña real del usuario).");
  process.exit(2);
}

let fallos = 0;
let pasos = 0;
let bufferServidor = "";
let proceso = undefined;

function registrar(ok, nombre, detalle = "") {
  pasos++;
  if (!ok) fallos++;
  const marca = ok ? "[PASS]" : "[FAIL]";
  console.log(`${marca} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchTexto(url, opciones = {}) {
  const res = await fetch(url, opciones);
  const texto = await res.text();
  const requestId = res.headers.get("x-request-id");
  return { res, texto, requestId };
}

function lineasPino() {
  return bufferServidor
    .split(/\r?\n/)
    .filter((l) => l.startsWith("{") && l.includes('"servicio"'))
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return undefined;
      }
    })
    .filter(Boolean);
}

function lineasConRequestId(requestId) {
  return lineasPino().filter((l) => l.request_id === requestId);
}

function extraerCamposAccion(html) {
  const campos = {};
  const re = /<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/>/g;
  let m;
  while ((m = re.exec(html))) {
    let valor = m[2];
    if (valor !== undefined) {
      valor = valor
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    }
    campos[m[1]] = valor ?? "";
  }
  return campos;
}

function postLogin(campos, usuarioEnvio, contrasenaEnvio) {
  const form = new FormData();
  for (const [k, v] of Object.entries(campos)) form.append(k, v);
  form.append("usuario", usuarioEnvio);
  form.append("contrasena", contrasenaEnvio);
  return fetchTexto(`http://127.0.0.1:${puerto}/iniciar-sesion`, {
    method: "POST",
    body: form,
    redirect: "manual",
  });
}

async function iniciarServidor(nivel) {
  bufferServidor = "";
  const env = { ...process.env, LOG_LEVEL: nivel };
  proceso = spawn(
    "cmd.exe",
    ["/d", "/s", "/c", `pnpm dev --port ${puerto}`],
    { cwd: RAIZ, env, shell: false }
  );
  proceso.stdout.on("data", (d) => {
    bufferServidor += d.toString("utf8");
  });
  proceso.stderr.on("data", (d) => {
    bufferServidor += d.toString("utf8");
  });
  proceso.on("exit", () => {
    bufferServidor += "\n[PROCESO_SERVIDOR_SALIO]\n";
  });

  const finInicio = Date.now() + TIMEOUT_INICIO_MS;
  while (Date.now() < finInicio) {
    try {
      const res = await fetch(`http://127.0.0.1:${puerto}/iniciar-sesion`, {
        redirect: "manual",
      });
      if (res.status === 200) return true;
    } catch {
      /* aún arrancando */
    }
    await esperar(1000);
  }
  return false;
}

async function detenerServidor() {
  if (!proceso) return;
  try {
    spawn("taskkill", ["/pid", String(proceso.pid), "/T", "/F"]);
  } catch {
    /* ignorar */
  }
  await esperar(1500);
  proceso = undefined;
}

async function faseProxy() {
  const { res, requestId } = await fetchTexto(
    `http://127.0.0.1:${puerto}/iniciar-sesion`
  );
  registrar(
    res.status === 200,
    "Página de login responde 200",
    `status=${res.status}`
  );
  registrar(
    Boolean(requestId),
    "Inyecta encabezado x-request-id (proxy activo)",
    requestId ? `id=${requestId}` : "sin header"
  );

  const raiz = await fetchTexto(`http://127.0.0.1:${puerto}/`, {
    redirect: "manual",
  });
  const location = raiz.res.headers.get("location") ?? "";
  registrar(
    raiz.res.status === 307 && location.includes("redirect="),
    "GET / redirige via proxy a /iniciar-sesion?redirect=",
    `status=${raiz.res.status} location=${location}`
  );
  registrar(
    Boolean(raiz.requestId),
    "Redirección del proxy lleva x-request-id",
    raiz.requestId ? `id=${raiz.requestId}` : "sin header"
  );
}

async function loginYVerificar(usuarioEnvio, contrasenaEnvio, esperado, verificarMetricas) {
  const pagina = await fetchTexto(`http://127.0.0.1:${puerto}/iniciar-sesion`);
  const campos = extraerCamposAccion(pagina.texto);
  registrar(
    Object.keys(campos).length >= 4 && campos.$ACTION_REF_1 !== undefined,
    `Campos Server Action extraídos (${usuarioEnvio})`,
    Object.keys(campos).join(", ")
  );

  const { res, requestId } = await postLogin(campos, usuarioEnvio, contrasenaEnvio);
  await esperar(ESPERA_TRAS_POST_MS);

  const conId = lineasConRequestId(requestId);
  const msg = conId.map((l) => l.msg).join(" | ");
  const ok =
    conId.length > 0 &&
    conId.some((l) => esperado(l));
  registrar(
    ok,
    `Login ${usuarioEnvio}: evento esperado con request_id correlacionado`,
    `id=${requestId} msg="${msg}"`
  );
  const metricasOk = verificarMetricas ? verificarMetricas(conId) : true;
  registrar(
    metricasOk,
    `Login ${usuarioEnvio}: métricas de duración presentes`,
    conId.length ? `eventos=${conId.length}` : "sin eventos"
  );
  registrar(
    res.status >= 200 && res.status < 500,
    `Respuesta HTTP del action (${usuarioEnvio})`,
    `status=${res.status}`
  );
  return { conId, requestId };
}

async function faseLoginFallido() {
  return loginYVerificar(
    usuario,
    contrasenaMala,
    (l) => l.level === 40 && l.motivo === "credenciales_invalidas",
    (conId) => {
      const warn = conId.find((l) => l.motivo === "credenciales_invalidas");
      const debug = conId.find((l) => l.msg === "Login: contexto obtenido");
      return Boolean(
        warn && warn.duracion_ms !== undefined && warn.duracion_ms_gotrue !== undefined &&
        debug && debug.duracion_ms_contexto !== undefined
      );
    }
  );
}

async function faseLoginExitoso() {
  return loginYVerificar(
    usuario,
    contrasena,
    (l) =>
      l.level === 30 &&
      l.resultado === "exitoso" &&
      l.usuario_id !== undefined &&
      l.duracion_ms_total !== undefined,
    (conId) => {
      const exito = conId.find((l) => l.resultado === "exitoso");
      const debug = conId.find((l) => l.msg === "Login: contexto obtenido");
      return Boolean(
        exito &&
        exito.duracion_ms_total !== undefined &&
        exito.duracion_ms_contexto !== undefined &&
        exito.duracion_ms_gotrue !== undefined &&
        exito.duracion_ms_registro !== undefined &&
        debug && debug.duracion_ms_contexto !== undefined
      );
    }
  );
}

async function faseRedaccion(marcadores) {
  const crudo = bufferServidor;
  for (const marcador of marcadores) {
    const encontrado = crudo.includes(marcador);
    registrar(
      !encontrado,
      `Redacción: "${marcador}" no aparece en logs`,
      encontrado ? "¡ENCONTRADO!" : "ausente"
    );
  }
  const clavesSensibles = lineasPino().some(
    (l) =>
      l.contrasena !== undefined ||
      l.correo !== undefined ||
      l.token !== undefined ||
      l.invitacion_token_hash !== undefined
  );
  registrar(
    !clavesSensibles,
    "Ninguna línea logea campos sensibles (contrasena/correo/token)"
  );
}

async function faseNiveles() {
  const debugPresente = lineasPino().some((l) => l.level === 20);
  registrar(
    debugPresente,
    "Con LOG_LEVEL=debug aparecen líneas level=20",
    debugPresente ? "hallado" : "ausente"
  );

  await detenerServidor();
  const arranco = await iniciarServidor("warn");
  registrar(arranco, "Servidor reiniciado con LOG_LEVEL=warn");

  const pagina = await fetchTexto(`http://127.0.0.1:${puerto}/iniciar-sesion`);
  const campos = extraerCamposAccion(pagina.texto);
  const { res, requestId } = await postLogin(campos, usuario, contrasena);
  await esperar(ESPERA_TRAS_POST_MS);
  const conId = lineasConRequestId(requestId);
  const hayInfo = conId.some((l) => l.level === 30 || l.level === 20);
  registrar(
    !hayInfo,
    "Con LOG_LEVEL=warn el login exitoso NO emite debug/info",
    hayInfo ? "¡aparece info/debug!" : "solo se suprimió"
  );
  registrar(res.status >= 300 && res.status < 400, "Login warn redirige correctamente", `status=${res.status}`);
}

async function main() {
  console.log(`http://127.0.0.1:${puerto} | usuario=${usuario}`);
  const arranco = await iniciarServidor("debug");
  if (!arranco) {
    console.error("\nEl servidor no arrancó a tiempo. Log capturado:");
    console.error(bufferServidor.slice(-2000));
    await detenerServidor();
    process.exit(2);
  }
  registrar(true, "Servidor dev arrancado con LOG_LEVEL=debug");

  await faseProxy();
  await faseLoginFallido();
  await faseLoginExitoso();
  await faseRedaccion([
    contrasenaMala,
    contrasena,
    "12345678Ab@",
  ]);
  await faseNiveles();

  writeFileSync(rutaLog, bufferServidor, "utf8");
  console.log(`\nLog capturado (UTF-8): ${rutaLog}`);

  await detenerServidor();

  console.log(`\nResultado: ${pasos - fallos}/${pasos} verificaciones OK ${fallos ? `— ${fallos} FALLARON` : ""}`);
  process.exit(fallos ? 1 : 0);
}

rmSync(rutaLog, { force: true });
main().catch((e) => {
  console.error("Error inesperado:", e);
  try {
    writeFileSync(rutaLog, bufferServidor, "utf8");
  } catch {
    /* ignorar */
  }
  process.exit(2);
});
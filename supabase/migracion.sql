-- =============================================================
-- MIGRACIÓN: Sistema de Autenticación Hospitalario
-- Ejecutar en el SQL Editor de Supabase
-- =============================================================

-- 1. TABLA: roles
CREATE TABLE IF NOT EXISTS public.roles (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en   TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: permisos
CREATE TABLE IF NOT EXISTS public.permisos (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en   TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: roles_permisos (relación N:N)
CREATE TABLE IF NOT EXISTS public.roles_permisos (
  rol_id      INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permiso_id  INTEGER NOT NULL REFERENCES public.permisos(id) ON DELETE CASCADE,
  creado_en   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (rol_id, permiso_id)
);

-- 4. TABLA: perfiles
CREATE TABLE IF NOT EXISTS public.perfiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  usuario                 TEXT UNIQUE NOT NULL,
  correo                  TEXT UNIQUE NOT NULL,
  nombre                  TEXT NOT NULL,
  apellidos               TEXT NOT NULL,
  rol_id                  INTEGER NOT NULL REFERENCES public.roles(id),
  activo                  BOOLEAN DEFAULT TRUE,
  creado_por              UUID REFERENCES auth.users(id),
  contraseña_cambiada_en  TIMESTAMPTZ,
  ultimo_acceso_en        TIMESTAMPTZ,
  creado_en               TIMESTAMPTZ DEFAULT now(),
  invitacion_token_hash   TEXT,
  invitacion_expira_en    TIMESTAMPTZ
);

-- =============================================================
-- ÍNDICES
-- =============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfiles_usuario ON public.perfiles(usuario);
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfiles_correo ON public.perfiles(correo);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_creado_por ON public.perfiles(creado_por);
CREATE INDEX IF NOT EXISTS idx_perfiles_activo ON public.perfiles(activo) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_perfiles_invitacion_hash ON public.perfiles(invitacion_token_hash);

-- Compatibilidad con bases existentes (idempotente)
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS invitacion_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS invitacion_expira_en TIMESTAMPTZ;

-- =============================================================
-- EXTENSIÓN: unaccent para normalización de texto
-- =============================================================
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =============================================================
-- TRIGGER: Crear perfil automáticamente al crear usuario en auth
--   El username se normaliza: minúsculas, sin tildes, ñ → n
-- =============================================================
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.perfiles (id, usuario, correo, nombre, apellidos, rol_id, creado_por)
  VALUES (
    NEW.id,
    LOWER(
      TRANSLATE(
        public.unaccent(NEW.raw_user_meta_data->>'usuario'),
        'ñÑ',
        'nn'
      )
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellidos',
    COALESCE((NEW.raw_user_meta_data->>'rol_id')::INTEGER, 3),
    NULLIF((NEW.raw_user_meta_data->>'creado_por'), '')::UUID
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_usuario_creado ON auth.users;
CREATE TRIGGER on_usuario_creado
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- =============================================================
-- SEED: Roles base del sistema
-- =============================================================
INSERT INTO public.roles (nombre, descripcion) VALUES
  ('desarrollador', 'Acceso completo al sistema, incluyendo configuración técnica'),
  ('administrador', 'Gestión de usuarios y configuración administrativa'),
  ('usuario_general', 'Acceso básico a las funcionalidades del sistema')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_permisos ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios solo ven su propio perfil
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.perfiles
  FOR SELECT
  USING (id = auth.uid());

-- Política: usuarios actualizan su propio perfil
DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios actualizan su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Función segura: comprueba si el usuario autenticado es admin/desarrollador.
-- SECURITY DEFINER evita recursión infinita de RLS (la política de perfiles
-- no puede hacer subconsultas sobre perfiles).
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol_id IN (1, 2)
  );
$$;

-- Política: admins y desarrolladores ven todos los perfiles
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.perfiles;
CREATE POLICY "Admins ven todos los perfiles"
  ON public.perfiles
  FOR SELECT
  USING (public.es_administrador());

-- =============================================================
-- TABLA: intentos_login (rate limiting)
-- Registra cada intento de inicio de sesión para detectar
-- ataques de fuerza bruta.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.intentos_login (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_busqueda TEXT NOT NULL,
  exitoso BOOLEAN NOT NULL,
  ip_address TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intentos_login_busqueda ON public.intentos_login(usuario_busqueda, creado_en DESC);

ALTER TABLE public.intentos_login ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- TABLA: auditoria_auth
-- Registro de auditoría para eventos de autenticación.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.auditoria_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID,
  usuario TEXT,
  accion TEXT NOT NULL,
  ip_address TEXT,
  detalles JSONB,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_auth_creado ON public.auditoria_auth(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_auth_usuario ON public.auditoria_auth(usuario_id, creado_en DESC);

ALTER TABLE public.auditoria_auth ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- TABLA: intentos_por_ip
-- Rate limiting por dirección IP (independiente del usuario).
-- 20 intentos/hora desde una misma IP = bloqueo temporal.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.intentos_por_ip (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intentos_ip ON public.intentos_por_ip(ip_address, creado_en DESC);

ALTER TABLE public.intentos_por_ip ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- FUNCIÓN: verificar_rate_limit_ip
-- Revisa si una IP ha excedido el límite de intentos por hora.
-- =============================================================
CREATE OR REPLACE FUNCTION public.verificar_rate_limit_ip(direccion_ip TEXT)
RETURNS TABLE(bloqueado BOOLEAN, intentos_por_hora INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) >= 20::BOOLEAN AS bloqueado,
    COUNT(*)::INT AS intentos_por_hora
  FROM public.intentos_por_ip
  WHERE ip_address = direccion_ip
    AND creado_en > now() - INTERVAL '1 hour';
END;
$$;

-- =============================================================
-- FUNCIÓN: registrar_intento_ip
-- Registra un intento de autenticación desde una IP.
-- =============================================================
CREATE OR REPLACE FUNCTION public.registrar_intento_ip(direccion_ip TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.intentos_por_ip (ip_address) VALUES (direccion_ip);
END;
$$;

-- =============================================================
-- FUNCIÓN: limpiar_intentos_usuario
-- Elimina todos los intentos registrados de un usuario.
-- Se llama tras un inicio de sesión exitoso o cambio de contraseña.
-- =============================================================
CREATE OR REPLACE FUNCTION public.limpiar_intentos_usuario(usuario_buscar TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.intentos_login
  WHERE usuario_busqueda = usuario_buscar;
END;
$$;

-- =============================================================
-- FUNCIÓN: actualizar_timestamp_contrasena
-- Marca la contraseña como cambiada (bypass RLS via SECURITY DEFINER).
-- Recibe el usuario_id explícitamente (validado previamente por
-- la server action) para evitar dependencia de auth.uid() en
-- contextos donde la sesión no se propaga (ej: tras updateUser()).
-- =============================================================
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_contrasena(usuario_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.perfiles
  SET contraseña_cambiada_en = now()
  WHERE id = usuario_id;
END;
$$;

-- =============================================================
-- FUNCIÓN: registrar_auditoria_auth
-- Inserta un evento de auditoría en la tabla auditoria_auth.
-- =============================================================
CREATE OR REPLACE FUNCTION public.registrar_auditoria_auth(
  p_accion TEXT,
  p_usuario_id UUID DEFAULT NULL,
  p_usuario TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_detalles JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.auditoria_auth (usuario_id, usuario, accion, ip_address, detalles)
  VALUES (p_usuario_id, p_usuario, p_accion, p_ip_address, p_detalles);
END;
$$;

-- =============================================================
-- FUNCIÓN: obtener_perfiles_admin
-- Lista todos los perfiles con el nombre del rol y del creador.
-- Solo administradores y desarrolladores (rol_id IN (1, 2)).
-- Bypass RLS via SECURITY DEFINER (roles y perfiles tienen RLS).
-- creador_nombre es el nombre completo del usuario que creó el
-- perfil; si no hay perfil de creador, cae a creador_usuario.
-- =============================================================
CREATE OR REPLACE FUNCTION public.obtener_perfiles_admin()
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  apellidos TEXT,
  usuario TEXT,
  correo TEXT,
  rol_id INTEGER,
  rol_nombre TEXT,
  activo BOOLEAN,
  creado_por UUID,
  creador_usuario TEXT,
  creador_nombre TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.es_administrador() THEN
    RAISE EXCEPTION 'Solo administradores';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.nombre,
    p.apellidos,
    p.usuario,
    p.correo,
    p.rol_id,
    r.nombre,
    p.activo,
    p.creado_por,
    c.usuario,
    NULLIF(TRIM(c.nombre || ' ' || c.apellidos), '')
  FROM public.perfiles p
  LEFT JOIN public.roles r ON r.id = p.rol_id
  LEFT JOIN public.perfiles c ON c.id = p.creado_por
  ORDER BY p.nombre, p.apellidos;
END;
$$;

-- =============================================================
-- FUNCIÓN: obtener_roles_creables
-- Roles que el usuario autenticado puede asignar al crear usuarios.
-- Jerarquía por id: desarrollador (1) crea 2 y 3; administrador (2)
-- crea 3; usuario_general (3) no crea. Solo admins/dev.
-- =============================================================
CREATE OR REPLACE FUNCTION public.obtener_roles_creables()
RETURNS TABLE (id INTEGER, nombre TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rol_actual INTEGER;
BEGIN
  SELECT p.rol_id INTO rol_actual
  FROM public.perfiles p
  WHERE p.id = auth.uid();

  IF rol_actual IS NULL OR rol_actual NOT IN (1, 2) THEN
    RAISE EXCEPTION 'No tiene permisos para crear usuarios';
  END IF;

  RETURN QUERY
  SELECT r.id, r.nombre
  FROM public.roles r
  WHERE r.id > rol_actual
  ORDER BY r.id;
END;
$$;

-- =============================================================
-- FUNCIÓN: verificar_y_consumir_invitacion
-- Valida el hash del token de invitación, verifica que no haya
-- expirado y lo invalida en la misma transacción (single-use).
-- Devuelve id, usuario y correo del perfil invitado.
-- =============================================================
CREATE OR REPLACE FUNCTION public.verificar_y_consumir_invitacion(p_token_hash TEXT)
RETURNS TABLE (id UUID, usuario TEXT, correo TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  perfil_id UUID;
BEGIN
  SELECT p.id INTO perfil_id
  FROM public.perfiles p
  WHERE p.invitacion_token_hash = p_token_hash
    AND p.invitacion_expira_en > now()
  FOR UPDATE;

  IF perfil_id IS NULL THEN
    RAISE EXCEPTION 'El enlace es inválido o ha expirado';
  END IF;

  UPDATE public.perfiles p
  SET invitacion_token_hash = NULL,
      invitacion_expira_en = NULL
  WHERE p.id = perfil_id;

  RETURN QUERY
  SELECT p.id, p.usuario, p.correo
  FROM public.perfiles p
  WHERE p.id = perfil_id;
END;
$$;

-- =============================================================
-- FUNCIÓN: obtener_contexto_login
-- Consolidación del pre-chequeo de inicio de sesión en UNA sola
-- llamada: rate-limit por IP, conteo de fallos para el delay
-- progresivo y datos del perfil (incluye rol para redirigir
-- directo al módulo correspondiente tras autenticarse).
-- Devuelve cero filas si el usuario no existe.
-- =============================================================
CREATE OR REPLACE FUNCTION public.obtener_contexto_login(
  usuario_buscar TEXT,
  direccion_ip TEXT
)
RETURNS TABLE (
  bloqueado_ip BOOLEAN,
  intentos_por_hora INT,
  conteo_fallos INT,
  id UUID,
  correo TEXT,
  activo BOOLEAN,
  rol_id INTEGER,
  contraseña_cambiada_en TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) >= 20
       FROM public.intentos_por_ip
      WHERE ip_address = direccion_ip
        AND creado_en > now() - INTERVAL '1 hour') AS bloqueado_ip,
    (SELECT COUNT(*)::INT
       FROM public.intentos_por_ip
      WHERE ip_address = direccion_ip
        AND creado_en > now() - INTERVAL '1 hour') AS intentos_por_hora,
    (SELECT COUNT(*)::INT
       FROM public.intentos_login
      WHERE usuario_busqueda = usuario_buscar
        AND exitoso = false
        AND creado_en > now() - INTERVAL '1 hour') AS conteo_fallos,
    p.id,
    p.correo,
    p.activo,
    p.rol_id,
    p.contraseña_cambiada_en
  FROM public.perfiles p
  WHERE p.usuario = usuario_buscar;
END;
$$;

-- =============================================================
-- FUNCIÓN: registrar_login_exitoso
-- Post-procesamiento del login exitoso en UNA transacción:
-- limpia intentos del usuario, actualiza último acceso y registra
-- la auditoría. Reemplaza 3 llamadas separadas.
-- =============================================================
CREATE OR REPLACE FUNCTION public.registrar_login_exitoso(
  p_usuario_id UUID,
  p_usuario TEXT,
  p_ip_address TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.intentos_login
  WHERE usuario_busqueda = p_usuario;

  UPDATE public.perfiles
  SET ultimo_acceso_en = now()
  WHERE id = p_usuario_id;

  INSERT INTO public.auditoria_auth (usuario_id, usuario, accion, ip_address)
  VALUES (p_usuario_id, p_usuario, 'inicio_sesion_exitoso', p_ip_address);
END;
$$;

-- =============================================================
-- FUNCIÓN: registrar_login_fallido
-- Post-procesamiento del login fallido en UNA transacción:
-- registra el intento por IP (rate-limit), el intento del usuario
-- (delay progresivo) y la auditoría. Reemplaza 3 llamadas.
-- =============================================================
CREATE OR REPLACE FUNCTION public.registrar_login_fallido(
  p_usuario TEXT,
  p_ip_address TEXT,
  p_detalles JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.intentos_por_ip (ip_address)
  VALUES (p_ip_address);

  INSERT INTO public.intentos_login (usuario_busqueda, exitoso, ip_address)
  VALUES (p_usuario, false, p_ip_address);

  INSERT INTO public.auditoria_auth (usuario, accion, ip_address, detalles)
  VALUES (p_usuario, 'inicio_sesion_fallido', p_ip_address, p_detalles);
END;
$$;

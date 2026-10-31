"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useSesion } from "@/lib/sesion";
import { supabase } from "@/lib/supabase";

type Modo = "ingresar" | "registro";

/** Traduce los errores de Supabase Auth a un mensaje que la persona pueda resolver. */
function mensajeError(mensaje: string, modo: Modo): string {
  const m = mensaje.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ese correo ya tiene una cuenta. Ingresa con tu contraseña.";
  if (m.includes("invalid login credentials")) return "El correo o la contraseña no coinciden.";
  if (m.includes("email not confirmed"))
    return "Tu cuenta todavía no está confirmada. Revisa tu correo y abre el enlace de confirmación.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled") || m.includes("email logins are disabled") || m.includes("provider is not enabled"))
    return "El registro con correo está desactivado en este momento. Avísale al equipo de Escalón Cero.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Hubo demasiados intentos seguidos. Espera un minuto y vuelve a intentarlo.";
  if (m.includes("password")) return "La contraseña es muy débil. Usa al menos 6 caracteres, con letras y números.";
  if (m.includes("email") && m.includes("invalid")) return "Ese correo no es válido. Revisa cómo lo escribiste.";
  if (m.includes("fetch") || m.includes("network")) return "No hay conexión con el servidor. Revisa tu internet y vuelve a intentarlo.";
  return modo === "registro"
    ? `No pudimos crear tu cuenta (${mensaje}). Inténtalo de nuevo.`
    : `No pudimos ingresar (${mensaje}). Inténtalo de nuevo.`;
}

/** Solo se vuelve a rutas internas, para no redirigir a otro sitio. */
function destinoSeguro(valor: string | null): string {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : "/";
}

/**
 * Ingreso y registro. Con `enLinea`, se muestra dentro de otra página (por
 * ejemplo, al entregar un proyecto) y no redirige: quien lo usa sigue donde estaba.
 */
export function FormularioIngreso({
  enLinea = false,
  titulo,
  texto,
  alIngresar,
}: {
  enLinea?: boolean;
  titulo?: string;
  texto?: string;
  /** Solo con `enLinea`: se llama apenas la sesión queda abierta. */
  alIngresar?: () => void;
} = {}) {
  const parametros = useSearchParams();
  const router = useRouter();
  const { usuario, nombre: nombreSesion, cerrarSesion } = useSesion();
  const volver = destinoSeguro(parametros.get("volver"));
  const [modo, setModo] = useState<Modo>(enLinea || parametros.get("modo") === "registro" ? "registro" : "ingresar");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [recienIngreso, setRecienIngreso] = useState(false);
  const id = useId();

  useEffect(() => {
    if (recienIngreso && usuario && !enLinea) router.replace(volver);
  }, [recienIngreso, usuario, router, volver, enLinea]);

  if (usuario && !recienIngreso && !enLinea) {
    return (
      <div className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-[-0.03em]">Ya ingresaste como {nombreSesion}</h2>
        <p className="mt-2 text-pizarra">{usuario.email}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={volver === "/" ? "/rutas" : volver}
            className="inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco hover:bg-cobalto-hondo"
          >
            Continuar
          </Link>
          <button
            type="button"
            onClick={() => void cerrarSesion()}
            className="inline-flex items-center justify-center rounded-xl border border-linea px-6 py-3.5 font-bold hover:border-tinta"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setAviso(null);
    if (modo === "registro" && nombre.trim().length < 2) return setError("Escribe tu nombre completo.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.trim())) return setError("Escribe un correo válido.");
    if (clave.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");

    setError(null);
    setEnviando(true);
    if (modo === "registro") {
      const { data, error: e } = await supabase.auth.signUp({
        email: correo.trim(),
        password: clave,
        options: { data: { nombre: nombre.trim() } },
      });
      setEnviando(false);
      if (e) {
        console.error("Registro:", e.message);
        return setError(mensajeError(e.message, "registro"));
      }
      if (!data.session) {
        setAviso("Te enviamos un correo para confirmar tu cuenta. Después de confirmarla, ingresa aquí.");
        setModo("ingresar");
        return;
      }
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: clave });
      setEnviando(false);
      if (e) {
        console.error("Ingreso:", e.message);
        return setError(mensajeError(e.message, "ingresar"));
      }
    }
    if (enLinea) {
      alIngresar?.();
      return;
    }
    setRecienIngreso(true);
  }

  const campo =
    "mt-2 w-full rounded-xl border border-linea bg-niebla px-4 py-3 outline-none transition-colors focus:border-cobalto focus:bg-blanco";

  return (
    <form onSubmit={enviar} noValidate className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
      {titulo && <h2 className="text-2xl font-bold tracking-[-0.03em]">{titulo}</h2>}
      {texto && <p className="mt-2 max-w-[60ch] leading-relaxed text-pizarra">{texto}</p>}
      {(titulo || texto) && <div className="mb-6" />}
      <div role="tablist" aria-label="Tipo de acceso" className="grid grid-cols-2 gap-1 rounded-xl bg-niebla p-1 text-sm font-bold">
        {(["ingresar", "registro"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={modo === m}
            onClick={() => {
              setModo(m);
              setError(null);
            }}
            className={`rounded-lg px-3 py-2.5 transition-colors ${modo === m ? "bg-blanco text-tinta shadow-sm" : "text-pizarra hover:text-tinta"}`}
          >
            {m === "ingresar" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      {modo === "registro" && (
        <div className="mt-6">
          <label htmlFor={`${id}-nombre`} className="block font-semibold">
            Nombre completo
          </label>
          <input id={`${id}-nombre`} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} className={campo} />
        </div>
      )}
      <div className="mt-5">
        <label htmlFor={`${id}-correo`} className="block font-semibold">
          Correo
        </label>
        <input
          id={`${id}-correo`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className={campo}
        />
      </div>
      <div className="mt-5">
        <label htmlFor={`${id}-clave`} className="block font-semibold">
          Contraseña
        </label>
        <input
          id={`${id}-clave`}
          type="password"
          autoComplete={modo === "registro" ? "new-password" : "current-password"}
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className={campo}
        />
        {modo === "registro" && <p className="mt-1 text-xs text-pizarra">Al menos 6 caracteres.</p>}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-alerta">
          {error}
        </p>
      )}
      {aviso && (
        <p role="status" className="mt-4 rounded-xl bg-cielo p-3 text-sm font-semibold text-cobalto-hondo">
          {aviso}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo disabled:cursor-wait disabled:opacity-80"
      >
        {enviando ? "Un momento…" : modo === "ingresar" ? "Ingresar" : "Crear mi cuenta"}
      </button>
    </form>
  );
}

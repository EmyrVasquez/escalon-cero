"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  leerProgresoLocal,
  olvidarProgresoLocal,
  type Borrador,
  type EntradaPortafolio,
  type PostulacionLocal,
} from "./almacenamiento";
import { supabase } from "./supabase";
import type { EntregaAdjunta } from "./tipos";

/**
 * Sesión del estudiante con Supabase Auth. El progreso (entregas, borradores y
 * postulaciones) se guarda en su cuenta, protegido por RLS: cada persona solo
 * lee y escribe lo suyo. Los datos públicos se siguen leyendo en el servidor.
 */

interface Datos {
  userId: string;
  portafolio: EntradaPortafolio[];
  borradores: Record<string, Borrador>;
  postulaciones: PostulacionLocal[];
}

export interface NuevaEntrega {
  practicaId: string;
  titulo: string;
  area: string;
  rol: string;
  herramientas: string[];
  criterios: string[];
  solucion: string;
  enlace: string;
}

export interface NuevaPostulacion {
  oportunidadId: string;
  titulo: string;
  empresa: string;
  tipo: string;
  compensacion: string;
  nombre: string;
  correo: string;
  mensaje: string;
  entregas: EntregaAdjunta[];
}

interface Sesion {
  /** `undefined` mientras se averigua; `null` sin sesión. */
  usuario: User | null | undefined;
  nombre: string | null;
  portafolio: EntradaPortafolio[] | undefined;
  borradores: Record<string, Borrador> | undefined;
  postulaciones: PostulacionLocal[] | undefined;
  /** Devuelven un mensaje de error para mostrar, o `null` si salió bien. */
  entregar: (entrega: NuevaEntrega) => Promise<string | null>;
  postular: (postulacion: NuevaPostulacion) => Promise<string | null>;
  actualizarCriterios: (practicaId: string, cumplidos: string[]) => void;
  quitarEntrega: (practicaId: string) => Promise<void>;
  guardarBorrador: (borrador: Omit<Borrador, "actualizado">) => void;
  cerrarSesion: () => Promise<void>;
}

const Contexto = createContext<Sesion | null>(null);

type Uno<T> = T | T[] | null;
function uno<T>(valor: Uno<T>): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

interface FilaEntrega {
  caso_id: string;
  solucion: string;
  enlace: string | null;
  criterios_cumplidos: string[];
  entregado: string;
  casos: Uno<{ titulo: string; carrera: string; rol: string; herramientas: string[]; criterios: string[] }>;
}

interface FilaBorrador {
  caso_id: string;
  solucion: string;
  enlace: string;
  actualizado: string;
  casos: Uno<{ titulo: string; carrera: string }>;
}

interface FilaPostulacion {
  oportunidad_id: string;
  created_at: string;
  entregas: EntregaAdjunta[] | null;
  oportunidades: Uno<{ titulo: string; empresa: string; tipo: string; compensacion: string }>;
}

/** Sube a la cuenta lo que se guardó en este navegador antes de las cuentas. */
async function importarProgresoLocal(): Promise<void> {
  const { portafolio, borradores } = leerProgresoLocal();
  if (portafolio.length === 0 && borradores.length === 0) return;

  const entregas = portafolio
    .filter((e) => e.solucion.trim().length >= 10)
    .map((e) => ({
      caso_id: e.practicaId,
      solucion: e.solucion.slice(0, 2000),
      enlace: e.enlace || null,
      criterios_cumplidos: e.criteriosCumplidos ?? [],
      entregado: e.entregado,
    }));
  const pendientes = borradores
    .filter((b) => !portafolio.some((e) => e.practicaId === b.practicaId))
    .map((b) => ({ caso_id: b.practicaId, solucion: b.solucion, enlace: b.enlace, actualizado: b.actualizado }));

  const resultados = await Promise.all([
    entregas.length
      ? supabase.from("entregas").upsert(entregas, { onConflict: "user_id,caso_id", ignoreDuplicates: true })
      : null,
    pendientes.length
      ? supabase.from("borradores").upsert(pendientes, { onConflict: "user_id,caso_id", ignoreDuplicates: true })
      : null,
  ]);
  if (resultados.every((r) => !r?.error)) olvidarProgresoLocal();
}

async function cargarDatos(userId: string): Promise<Datos> {
  await importarProgresoLocal().catch(() => undefined);

  const [entregas, borradores, postulaciones] = await Promise.all([
    supabase
      .from("entregas")
      .select("caso_id, solucion, enlace, criterios_cumplidos, entregado, casos(titulo, carrera, rol, herramientas, criterios)")
      .order("entregado", { ascending: false }),
    supabase.from("borradores").select("caso_id, solucion, enlace, actualizado, casos(titulo, carrera)"),
    supabase
      .from("postulaciones")
      .select("oportunidad_id, created_at, entregas, oportunidades(titulo, empresa, tipo, compensacion)")
      .order("created_at", { ascending: false }),
  ]);

  const portafolio: EntradaPortafolio[] = ((entregas.data ?? []) as unknown as FilaEntrega[]).flatMap((f) => {
    const caso = uno(f.casos);
    if (!caso) return [];
    return [
      {
        practicaId: f.caso_id,
        titulo: caso.titulo,
        area: caso.carrera,
        rol: caso.rol,
        herramientas: caso.herramientas ?? [],
        solucion: f.solucion,
        enlace: f.enlace ?? "",
        criterios: caso.criterios ?? [],
        criteriosCumplidos: f.criterios_cumplidos ?? [],
        entregado: f.entregado,
      },
    ];
  });

  const mapaBorradores: Record<string, Borrador> = {};
  for (const f of (borradores.data ?? []) as unknown as FilaBorrador[]) {
    const caso = uno(f.casos);
    if (!caso) continue;
    mapaBorradores[f.caso_id] = {
      practicaId: f.caso_id,
      titulo: caso.titulo,
      area: caso.carrera,
      solucion: f.solucion,
      enlace: f.enlace,
      actualizado: f.actualizado,
    };
  }

  const listaPostulaciones: PostulacionLocal[] = ((postulaciones.data ?? []) as unknown as FilaPostulacion[]).flatMap(
    (f) => {
      const o = uno(f.oportunidades);
      if (!o) return [];
      return [
        {
          oportunidadId: f.oportunidad_id,
          titulo: o.titulo,
          empresa: o.empresa,
          tipo: o.tipo,
          compensacion: o.compensacion,
          practicas: (f.entregas ?? []).map((e) => e.titulo),
          enviada: f.created_at,
        },
      ];
    },
  );

  return { userId, portafolio, borradores: mapaBorradores, postulaciones: listaPostulaciones };
}

const ESPERA_BORRADOR = 800;

export function ProveedorSesion({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [datos, setDatos] = useState<Datos | null>(null);
  const temporizadores = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const userId = usuario?.id ?? null;

  useEffect(() => {
    // INITIAL_SESSION llega al suscribirse, con o sin sesión guardada.
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUsuario(sesion?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let vigente = true;
    cargarDatos(userId).then((nuevos) => {
      if (vigente) setDatos(nuevos);
    });
    return () => {
      vigente = false;
    };
  }, [userId]);

  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => pendientes.forEach((t) => clearTimeout(t));
  }, []);

  // Los datos solo valen si son de la persona que tiene la sesión abierta.
  const propios = datos && userId && datos.userId === userId ? datos : null;
  const cargando = usuario === undefined || (usuario !== null && !propios);

  const actualizar = useCallback((cambio: (d: Datos) => Datos) => {
    setDatos((d) => (d ? cambio(d) : d));
  }, []);

  const guardarBorrador = useCallback(
    (b: Omit<Borrador, "actualizado">) => {
      const actualizado = new Date().toISOString();
      actualizar((d) => ({ ...d, borradores: { ...d.borradores, [b.practicaId]: { ...b, actualizado } } }));
      const previo = temporizadores.current.get(b.practicaId);
      if (previo) clearTimeout(previo);
      temporizadores.current.set(
        b.practicaId,
        setTimeout(() => {
          temporizadores.current.delete(b.practicaId);
          void supabase
            .from("borradores")
            .upsert(
              { caso_id: b.practicaId, solucion: b.solucion, enlace: b.enlace, actualizado },
              { onConflict: "user_id,caso_id" },
            );
        }, ESPERA_BORRADOR),
      );
    },
    [actualizar],
  );

  const entregar = useCallback(
    async (e: NuevaEntrega): Promise<string | null> => {
      const pendiente = temporizadores.current.get(e.practicaId);
      if (pendiente) clearTimeout(pendiente);
      temporizadores.current.delete(e.practicaId);

      const { error } = await supabase.from("entregas").upsert(
        { caso_id: e.practicaId, solucion: e.solucion, enlace: e.enlace || null, criterios_cumplidos: [] },
        { onConflict: "user_id,caso_id" },
      );
      if (error) return "No pudimos guardar tu entrega. Revisa tu conexión a internet y vuelve a intentarlo.";

      // Registro anónimo de respuestas para el equipo; si falla, la entrega ya quedó guardada.
      void supabase.from("respuestas").insert({ caso_id: e.practicaId, respuesta: e.solucion, enlace: e.enlace || null });
      void supabase.from("borradores").delete().eq("caso_id", e.practicaId);

      const entrada: EntradaPortafolio = {
        practicaId: e.practicaId,
        titulo: e.titulo,
        area: e.area,
        rol: e.rol,
        herramientas: e.herramientas,
        solucion: e.solucion,
        enlace: e.enlace,
        criterios: e.criterios,
        criteriosCumplidos: [],
        entregado: new Date().toISOString(),
      };
      actualizar((d) => {
        const resto = { ...d.borradores };
        delete resto[e.practicaId];
        return {
          ...d,
          borradores: resto,
          portafolio: [entrada, ...d.portafolio.filter((x) => x.practicaId !== e.practicaId)],
        };
      });
      return null;
    },
    [actualizar],
  );

  const actualizarCriterios = useCallback(
    (practicaId: string, cumplidos: string[]) => {
      actualizar((d) => ({
        ...d,
        portafolio: d.portafolio.map((x) => (x.practicaId === practicaId ? { ...x, criteriosCumplidos: cumplidos } : x)),
      }));
      void supabase.from("entregas").update({ criterios_cumplidos: cumplidos }).eq("caso_id", practicaId);
    },
    [actualizar],
  );

  const quitarEntrega = useCallback(
    async (practicaId: string) => {
      const { error } = await supabase.from("entregas").delete().eq("caso_id", practicaId);
      if (!error) actualizar((d) => ({ ...d, portafolio: d.portafolio.filter((x) => x.practicaId !== practicaId) }));
    },
    [actualizar],
  );

  const postular = useCallback(
    async (p: NuevaPostulacion): Promise<string | null> => {
      const { error } = await supabase.from("postulaciones").insert({
        oportunidad_id: p.oportunidadId,
        nombre: p.nombre,
        correo: p.correo,
        mensaje: p.mensaje || null,
        entregas: p.entregas,
        consentimiento: true,
      });
      if (error) {
        if (error.code === "23505") return "Ya postulaste a esta oportunidad.";
        if (error.code === "42501")
          return "La empresa todavía no puede recibir tu postulación: revisa que hayas entregado todos los proyectos que pide.";
        return "No pudimos enviar tu postulación. Revisa tu conexión a internet y vuelve a intentarlo.";
      }
      const nueva: PostulacionLocal = {
        oportunidadId: p.oportunidadId,
        titulo: p.titulo,
        empresa: p.empresa,
        tipo: p.tipo,
        compensacion: p.compensacion,
        practicas: p.entregas.map((e) => e.titulo),
        enviada: new Date().toISOString(),
      };
      actualizar((d) => ({ ...d, postulaciones: [nueva, ...d.postulaciones] }));
      return null;
    },
    [actualizar],
  );

  const cerrarSesion = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const valor = useMemo<Sesion>(() => {
    const nombre =
      (typeof usuario?.user_metadata?.nombre === "string" && usuario.user_metadata.nombre) ||
      usuario?.email?.split("@")[0] ||
      null;
    return {
      usuario,
      nombre,
      portafolio: cargando ? undefined : (propios?.portafolio ?? []),
      borradores: cargando ? undefined : (propios?.borradores ?? {}),
      postulaciones: cargando ? undefined : (propios?.postulaciones ?? []),
      entregar,
      postular,
      actualizarCriterios,
      quitarEntrega,
      guardarBorrador,
      cerrarSesion,
    };
  }, [usuario, cargando, propios, entregar, postular, actualizarCriterios, quitarEntrega, guardarBorrador, cerrarSesion]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): Sesion {
  const sesion = useContext(Contexto);
  if (!sesion) throw new Error("useSesion se usa dentro de <ProveedorSesion>.");
  return sesion;
}

/** `undefined` mientras carga; vacío sin sesión. */
export function usePortafolio() {
  return useSesion().portafolio;
}

export function useBorradores() {
  return useSesion().borradores;
}

export function usePostulaciones() {
  return useSesion().postulaciones;
}

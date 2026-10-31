"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";
import type {
  Borrador,
  EntradaPortafolio,
  EntregaAdjunta,
  PostulacionEnviada,
  ResultadoComprobacion,
} from "./tipos";

/**
 * Sesión del estudiante con Supabase Auth. El progreso (entregas, borradores y
 * postulaciones) se guarda en su cuenta, protegido por RLS: cada persona solo
 * lee y escribe lo suyo. Los datos públicos se siguen leyendo en el servidor.
 */

interface Datos {
  userId: string;
  portafolio: EntradaPortafolio[];
  borradores: Record<string, Borrador>;
  postulaciones: PostulacionEnviada[];
}

export interface NuevaEntrega {
  proyectoId: string;
  titulo: string;
  area: string;
  rol: string;
  herramientas: string[];
  criterios: string[];
  solucion: string;
  enlace: string;
}

/** Entrega de un proyecto con comprobación automática (ver migración 006). */
export interface EntregaComprobada extends NuevaEntrega {
  respuestas: Record<string, string>;
  /** Archivo del trabajo (captura, PDF o .pbix); se sube al bucket «entregas». */
  archivo: File | null;
}

export interface Comprobacion {
  resultado: ResultadoComprobacion | null;
  error: string | null;
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
  /** CV en PDF; se sube al bucket «entregas», carpeta <user_id>/cv/. */
  cv: File | null;
}

interface Sesion {
  /** `undefined` mientras se averigua; `null` sin sesión. */
  usuario: User | null | undefined;
  nombre: string | null;
  portafolio: EntradaPortafolio[] | undefined;
  borradores: Record<string, Borrador> | undefined;
  postulaciones: PostulacionEnviada[] | undefined;
  /** Devuelven un mensaje de error para mostrar, o `null` si salió bien. */
  entregar: (entrega: NuevaEntrega) => Promise<string | null>;
  /** Sube el archivo, corrige las cifras en la base de datos y guarda la entrega. */
  comprobar: (entrega: EntregaComprobada) => Promise<Comprobacion>;
  /** Enlace temporal para abrir un archivo propio del bucket «entregas». */
  urlArchivo: (ruta: string) => Promise<string | null>;
  postular: (postulacion: NuevaPostulacion) => Promise<string | null>;
  actualizarCriterios: (proyectoId: string, cumplidos: string[]) => void;
  quitarEntrega: (proyectoId: string) => Promise<void>;
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
  archivo: string | null;
  respuestas: Record<string, string> | null;
  resultado: ResultadoComprobacion | null;
  aprobada: boolean | null;
  criterios_cumplidos: string[];
  entregado: string;
  casos: Uno<{
    titulo: string;
    carrera: string;
    rol: string;
    herramientas: string[];
    criterios: string[];
    comprobacion: unknown[] | null;
  }>;
}

interface FilaBorrador {
  caso_id: string;
  solucion: string;
  enlace: string;
  respuestas: Record<string, string> | null;
  actualizado: string;
  casos: Uno<{ titulo: string; carrera: string }>;
}

interface FilaPostulacion {
  oportunidad_id: string;
  created_at: string;
  entregas: EntregaAdjunta[] | null;
  oportunidades: Uno<{ titulo: string; empresa: string; tipo: string; compensacion: string }>;
}

async function cargarDatos(userId: string): Promise<Datos> {
  const [entregas, borradores, postulaciones] = await Promise.all([
    supabase
      .from("entregas")
      .select(
        "caso_id, solucion, enlace, archivo, respuestas, resultado, aprobada, criterios_cumplidos, entregado, casos(titulo, carrera, rol, herramientas, criterios, comprobacion)",
      )
      .order("entregado", { ascending: false }),
    supabase.from("borradores").select("caso_id, solucion, enlace, respuestas, actualizado, casos(titulo, carrera)"),
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
        proyectoId: f.caso_id,
        titulo: caso.titulo,
        area: caso.carrera,
        rol: caso.rol,
        herramientas: caso.herramientas ?? [],
        solucion: f.solucion,
        enlace: f.enlace ?? "",
        criterios: caso.criterios ?? [],
        criteriosCumplidos: f.criterios_cumplidos ?? [],
        entregado: f.entregado,
        archivo: f.archivo,
        respuestas: f.respuestas ?? {},
        resultado: f.resultado,
        valida: caso.comprobacion ? f.aprobada === true : true,
      },
    ];
  });

  const mapaBorradores: Record<string, Borrador> = {};
  for (const f of (borradores.data ?? []) as unknown as FilaBorrador[]) {
    const caso = uno(f.casos);
    if (!caso) continue;
    mapaBorradores[f.caso_id] = {
      proyectoId: f.caso_id,
      titulo: caso.titulo,
      area: caso.carrera,
      solucion: f.solucion,
      enlace: f.enlace,
      respuestas: f.respuestas ?? {},
      actualizado: f.actualizado,
    };
  }

  const listaPostulaciones: PostulacionEnviada[] = ((postulaciones.data ?? []) as unknown as FilaPostulacion[]).flatMap(
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
          proyectos: (f.entregas ?? []).map((e) => e.titulo),
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

  // Cada carga lleva un número: solo se aplica la más reciente, aunque una
  // anterior termine después (por ejemplo, la del ingreso y la de una entrega).
  const ultimaCarga = useRef(0);
  const recargar = useCallback((uid: string): Promise<void> => {
    const numero = ++ultimaCarga.current;
    return cargarDatos(uid)
      .then((nuevos) => {
        if (numero === ultimaCarga.current) setDatos(nuevos);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (userId) void recargar(userId);
    else ultimaCarga.current++;
  }, [userId, recargar]);

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
      actualizar((d) => ({ ...d, borradores: { ...d.borradores, [b.proyectoId]: { ...b, actualizado } } }));
      const previo = temporizadores.current.get(b.proyectoId);
      if (previo) clearTimeout(previo);
      temporizadores.current.set(
        b.proyectoId,
        setTimeout(() => {
          temporizadores.current.delete(b.proyectoId);
          void supabase
            .from("borradores")
            .upsert(
              {
                caso_id: b.proyectoId,
                solucion: b.solucion,
                enlace: b.enlace,
                ...(b.respuestas ? { respuestas: b.respuestas } : {}),
                actualizado,
              },
              { onConflict: "user_id,caso_id" },
            );
        }, ESPERA_BORRADOR),
      );
    },
    [actualizar],
  );

  const entregar = useCallback(
    async (e: NuevaEntrega): Promise<string | null> => {
      const pendiente = temporizadores.current.get(e.proyectoId);
      if (pendiente) clearTimeout(pendiente);
      temporizadores.current.delete(e.proyectoId);

      const { error } = await supabase.from("entregas").upsert(
        { caso_id: e.proyectoId, solucion: e.solucion, enlace: e.enlace || null, criterios_cumplidos: [] },
        { onConflict: "user_id,caso_id" },
      );
      if (error) return "No pudimos guardar tu entrega. Revisa tu conexión a internet y vuelve a intentarlo.";

      // Registro anónimo de respuestas para el equipo; si falla, la entrega ya quedó guardada.
      void supabase.from("respuestas").insert({ caso_id: e.proyectoId, respuesta: e.solucion, enlace: e.enlace || null });
      void supabase.from("borradores").delete().eq("caso_id", e.proyectoId);

      const entrada: EntradaPortafolio = {
        proyectoId: e.proyectoId,
        titulo: e.titulo,
        area: e.area,
        rol: e.rol,
        herramientas: e.herramientas,
        solucion: e.solucion,
        enlace: e.enlace,
        criterios: e.criterios,
        criteriosCumplidos: [],
        entregado: new Date().toISOString(),
        valida: true,
      };
      actualizar((d) => {
        const resto = { ...d.borradores };
        delete resto[e.proyectoId];
        return {
          ...d,
          borradores: resto,
          portafolio: [entrada, ...d.portafolio.filter((x) => x.proyectoId !== e.proyectoId)],
        };
      });
      return null;
    },
    [actualizar],
  );

  const comprobar = useCallback(
    async (e: EntregaComprobada): Promise<Comprobacion> => {
      const pendiente = temporizadores.current.get(e.proyectoId);
      if (pendiente) clearTimeout(pendiente);
      temporizadores.current.delete(e.proyectoId);
      // Se lee la sesión directamente: puede haberse abierto recién, antes de que
      // el estado de este proveedor se actualice.
      const { data: sesionActual } = await supabase.auth.getSession();
      const uid = sesionActual.session?.user.id;
      if (!uid) return { resultado: null, error: "Ingresa a tu cuenta para entregar." };

      let archivo: string | null = null;
      if (e.archivo) {
        const limpio = e.archivo.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9._-]+/g, "-")
          .slice(-80);
        const ruta = `${uid}/${e.proyectoId}/${Date.now()}-${limpio}`;
        const subida = await supabase.storage.from("entregas").upload(ruta, e.archivo, {
          contentType: e.archivo.type || "application/octet-stream",
          upsert: false,
        });
        if (subida.error) {
          return {
            resultado: null,
            error: "No pudimos subir tu archivo. Revisa que pese menos de 20 MB, o pega un enlace en su lugar.",
          };
        }
        archivo = ruta;
      }

      const { data, error } = await supabase.rpc("comprobar_entrega", {
        p_caso: e.proyectoId,
        p_respuestas: e.respuestas,
        p_solucion: e.solucion,
        p_enlace: e.enlace || null,
        p_archivo: archivo,
      });
      if (error || !data) {
        const propio = error && (error.code === "22023" || error.code === "42501") ? error.message : null;
        return {
          resultado: null,
          error: propio ?? "No pudimos comprobar tu entrega. Revisa tu conexión a internet y vuelve a intentarlo.",
        };
      }
      const resultado = data as ResultadoComprobacion;

      // Registro anónimo de respuestas para el equipo.
      void supabase.from("respuestas").insert({ caso_id: e.proyectoId, respuesta: e.solucion, enlace: e.enlace || null });

      actualizar((d) => {
        const previa = d.portafolio.find((x) => x.proyectoId === e.proyectoId);
        const entrada: EntradaPortafolio = {
          proyectoId: e.proyectoId,
          titulo: e.titulo,
          area: e.area,
          rol: e.rol,
          herramientas: e.herramientas,
          solucion: e.solucion,
          enlace: e.enlace,
          criterios: e.criterios,
          criteriosCumplidos: previa?.criteriosCumplidos ?? [],
          entregado: new Date().toISOString(),
          archivo: archivo ?? previa?.archivo ?? null,
          respuestas: e.respuestas,
          resultado,
          valida: resultado.aprobada,
        };
        const resto = { ...d.borradores };
        delete resto[e.proyectoId];
        return {
          ...d,
          borradores: resto,
          portafolio: [entrada, ...d.portafolio.filter((x) => x.proyectoId !== e.proyectoId)],
        };
      });
      // Si la sesión se abrió recién, su progreso puede estar cargándose todavía:
      // se vuelve a leer de la cuenta para que incluya esta entrega.
      // Se espera la recarga para que la pantalla de resultado ya la encuentre.
      await recargar(uid);
      return { resultado, error: null };
    },
    [actualizar, recargar],
  );

  const urlArchivo = useCallback(async (ruta: string) => {
    const { data } = await supabase.storage.from("entregas").createSignedUrl(ruta, 60 * 60);
    return data?.signedUrl ?? null;
  }, []);

  const actualizarCriterios = useCallback(
    (proyectoId: string, cumplidos: string[]) => {
      actualizar((d) => ({
        ...d,
        portafolio: d.portafolio.map((x) => (x.proyectoId === proyectoId ? { ...x, criteriosCumplidos: cumplidos } : x)),
      }));
      void supabase.from("entregas").update({ criterios_cumplidos: cumplidos }).eq("caso_id", proyectoId);
    },
    [actualizar],
  );

  const quitarEntrega = useCallback(
    async (proyectoId: string) => {
      const { error } = await supabase.from("entregas").delete().eq("caso_id", proyectoId);
      if (!error) actualizar((d) => ({ ...d, portafolio: d.portafolio.filter((x) => x.proyectoId !== proyectoId) }));
    },
    [actualizar],
  );

  const postular = useCallback(
    async (p: NuevaPostulacion): Promise<string | null> => {
      let cv: string | null = null;
      if (p.cv) {
        const { data: sesionActual } = await supabase.auth.getSession();
        const uid = sesionActual.session?.user.id;
        if (!uid) return "Ingresa a tu cuenta para postular.";
        const limpio = p.cv.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9._-]+/g, "-")
          .slice(-80);
        const ruta = `${uid}/cv/${Date.now()}-${limpio}`;
        const subida = await supabase.storage
          .from("entregas")
          .upload(ruta, p.cv, { contentType: p.cv.type || "application/pdf", upsert: false });
        if (subida.error) return "No pudimos subir tu CV. Revisa que sea un PDF de menos de 5 MB y vuelve a intentarlo.";
        cv = ruta;
      }
      const { error } = await supabase.from("postulaciones").insert({
        cv,
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
      const nueva: PostulacionEnviada = {
        oportunidadId: p.oportunidadId,
        titulo: p.titulo,
        empresa: p.empresa,
        tipo: p.tipo,
        compensacion: p.compensacion,
        proyectos: p.entregas.map((e) => e.titulo),
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
      comprobar,
      urlArchivo,
      postular,
      actualizarCriterios,
      quitarEntrega,
      guardarBorrador,
      cerrarSesion,
    };
  }, [usuario, cargando, propios, entregar, comprobar, urlArchivo, postular, actualizarCriterios, quitarEntrega, guardarBorrador, cerrarSesion]);

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

"use client";

import { useState, type FormEvent } from "react";
import { EtiquetaTipo } from "@/components/oportunidades/EtiquetaOportunidad";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { areaActiva } from "@/lib/areas";
import { EMPRESA_DEMO } from "@/lib/empresa-demo";
import { RUTAS } from "@/lib/rutas";
import { fechaLarga } from "@/lib/texto";
import type { TipoOportunidad } from "@/lib/tipos";

interface Aviso {
  titulo: string;
  tipo: TipoOportunidad;
  ruta: string;
  etapa: number;
  compensacion: string;
  cierra: string;
  descripcion: string;
}

const RUTAS_ACTIVAS = RUTAS.filter((r) => areaActiva(r.area));
const campo = "mt-1.5 w-full rounded-xl border border-linea bg-blanco px-4 py-3 text-base focus:border-cobalto focus:outline-none";

/** Formulario para publicar un aviso. En la demo solo muestra la vista previa. */
export function FormularioAviso() {
  const [aviso, setAviso] = useState<Aviso | null>(null);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setAviso({
      titulo: String(f.get("titulo") ?? "").trim(),
      tipo: f.get("tipo") === "reto_con_premio" ? "reto_con_premio" : "experiencia_empresa",
      ruta: String(f.get("ruta") ?? ""),
      etapa: Number(f.get("etapa") ?? 1),
      compensacion: String(f.get("compensacion") ?? "").trim(),
      cierra: String(f.get("cierra") ?? ""),
      descripcion: String(f.get("descripcion") ?? "").trim(),
    });
  }

  if (aviso) {
    const ruta = RUTAS.find((r) => r.slug === aviso.ruta);
    return (
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section aria-labelledby="titulo-vista-previa">
          <h2 id="titulo-vista-previa" className="text-sm font-bold text-cobalto">
            Así se verá tu aviso
          </h2>
          <article className="mt-3 rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-pizarra">{EMPRESA_DEMO.nombre}</p>
                <div className="mt-2">
                  <EtiquetaTipo tipo={aviso.tipo} />
                </div>
              </div>
              <Ilustracion nombre={aviso.tipo === "reto_con_premio" ? "ficha-reto" : "ficha-encargo"} className="h-16 w-auto" />
            </div>
            <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.03em]">{aviso.titulo}</h3>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-pizarra">{aviso.descripcion}</p>
            <p className="mt-5 inline-flex rounded-full bg-cielo px-3 py-1 text-sm font-bold text-cobalto">
              Pide: ruta {ruta?.puesto ?? aviso.ruta}, etapa {aviso.etapa}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-linea pt-4 text-sm">
              {aviso.compensacion && <span className="font-bold">{aviso.compensacion}</span>}
              {aviso.cierra && <span className="text-pizarra">Cierra el {fechaLarga(aviso.cierra)}</span>}
            </div>
          </article>
        </section>
        <aside className="rounded-3xl bg-tinta p-6 text-blanco">
          <p className="text-sm font-bold text-lima">¿Qué pasa ahora?</p>
          <p className="mt-2 text-xl font-extrabold leading-snug">El equipo revisa tu aviso y lo publica contigo.</p>
          <p className="mt-2 text-sm opacity-80">
            Solo podrán postular quienes aprueben los proyectos de la ruta hasta la etapa {aviso.etapa}. En esta vista de ejemplo
            el aviso no se guarda.
          </p>
          <button
            type="button"
            onClick={() => setAviso(null)}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-lima px-6 py-3 font-bold text-tinta hover:bg-blanco"
          >
            Editar el aviso
          </button>
        </aside>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-8 grid max-w-3xl gap-5 rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
      <label className="block font-bold">
        Título del aviso
        <input name="titulo" required maxLength={120} placeholder="Ej.: Tablero de cobranzas para el área comercial" className={campo} />
      </label>
      <fieldset>
        <legend className="font-bold">Tipo</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Opcion nombre="tipo" valor="experiencia_empresa" titulo="Experiencia con empresa" texto="Un encargo real, pagado o con constancia." defecto />
          <Opcion nombre="tipo" valor="reto_con_premio" titulo="Reto con premio" texto="Varias personas compiten; gana la mejor entrega." />
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
        <label className="block font-bold">
          Ruta que pides
          <select name="ruta" required className={campo} defaultValue={RUTAS_ACTIVAS[0]?.slug}>
            {RUTAS_ACTIVAS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.puesto}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-bold">
          Hasta la etapa
          <select name="etapa" className={campo} defaultValue="1">
            <option value="1">Etapa 1</option>
            <option value="2">Etapa 2</option>
            <option value="3">Etapa 3</option>
          </select>
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block font-bold">
          Compensación
          <input name="compensacion" required maxLength={80} placeholder="Ej.: S/ 800 por el encargo" className={campo} />
        </label>
        <label className="block font-bold">
          Cierra el
          <input name="cierra" type="date" required className={campo} />
        </label>
      </div>
      <label className="block font-bold">
        Qué necesitas
        <textarea
          name="descripcion"
          required
          rows={5}
          maxLength={1200}
          placeholder="Cuenta el problema como se lo contarías a alguien nuevo en el equipo."
          className={campo}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco hover:bg-cobalto-hondo">
          Ver cómo queda
        </button>
        <p className="text-sm text-pizarra">Vista de ejemplo: no se guarda nada.</p>
      </div>
    </form>
  );
}

function Opcion({ nombre, valor, titulo, texto, defecto = false }: { nombre: string; valor: string; titulo: string; texto: string; defecto?: boolean }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-linea p-4 has-[:checked]:border-cobalto has-[:checked]:bg-cielo">
      <input type="radio" name={nombre} value={valor} defaultChecked={defecto} className="mt-1 accent-cobalto" />
      <span>
        <span className="block font-bold">{titulo}</span>
        <span className="block text-sm font-normal text-pizarra">{texto}</span>
      </span>
    </label>
  );
}

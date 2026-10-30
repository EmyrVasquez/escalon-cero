import type { Area } from "./carreras";

/**
 * Una ruta es el mapa de un rol junior. Tiene tres etapas; cada etapa dice qué
 * aprender (con recursos gratuitos) y se demuestra con los proyectos de esa
 * etapa (columnas `ruta` y `etapa` de la tabla `casos`). Las oportunidades
 * piden completar la ruta hasta una etapa (`oportunidades.etapa_requerida`).
 */

export interface Recurso {
  nombre: string;
  url: string;
}

export interface Etapa {
  numero: 1 | 2 | 3;
  titulo: string;
  /** Qué sabes hacer al terminar la etapa, en una frase. */
  objetivo: string;
  temas: string[];
  recursos: Recurso[];
}

export interface Ruta {
  slug: string;
  area: Area;
  puesto: string;
  resumen: string;
  etapas: [Etapa, Etapa, Etapa];
  /** Hacia dónde se crece después del primer puesto. */
  despues: string[];
}

const SQL: Recurso = { nombre: "W3Schools: SQL", url: "https://www.w3schools.com/sql/" };
const POWER_BI: Recurso = { nombre: "Documentación de Power BI", url: "https://learn.microsoft.com/es-es/power-bi/" };

export const RUTAS: readonly Ruta[] = [
  {
    slug: "desarrollador-erp-junior",
    area: "erp",
    puesto: "Desarrollador ERP junior",
    resumen:
      "Adapta sistemas de gestión a los procesos de una empresa y convierte sus datos en información que gerencia pueda usar.",
    etapas: [
      {
        numero: 1,
        titulo: "Datos del ERP para gerencia",
        objetivo: "Entiendes cómo guarda el ERP las ventas, limpias sus datos y los presentas en un tablero confiable.",
        temas: ["Procesos de venta, compra e inventario", "Tablas de hechos y dimensiones", "Limpieza de datos", "Power BI y DAX"],
        recursos: [POWER_BI, SQL],
      },
      {
        numero: 2,
        titulo: "Configurar procesos en Business Central",
        objetivo: "Configuras clientes, productos y flujos de aprobación según lo que pide el área usuaria.",
        temas: ["Maestros: clientes, productos, proveedores", "Flujos de aprobación", "Levantar requerimientos"],
        recursos: [
          { nombre: "Microsoft Learn: Business Central", url: "https://learn.microsoft.com/es-es/dynamics365/business-central/" },
        ],
      },
      {
        numero: 3,
        titulo: "Extender el ERP con AL",
        objetivo: "Desarrollas extensiones: tablas, páginas y reportes propios sin tocar el estándar.",
        temas: ["Lenguaje AL", "Extensiones de tablas y páginas", "Pruebas y despliegue"],
        recursos: [
          {
            nombre: "Microsoft Learn: desarrollo para Business Central",
            url: "https://learn.microsoft.com/es-es/dynamics365/business-central/dev-itpro/",
          },
        ],
      },
    ],
    despues: ["Consultor funcional ERP", "Consultor técnico ERP", "Arquitecto de soluciones"],
  },
  {
    slug: "analista-junior-de-datos",
    area: "datos",
    puesto: "Analista junior de datos",
    resumen:
      "Prepara reportes, encuentra diferencias entre fuentes y explica qué dicen los números antes de que alguien los cuestione.",
    etapas: [
      {
        numero: 1,
        titulo: "Datos confiables",
        objetivo: "Cruzas fuentes, detectas diferencias y avisas a tiempo con una explicación posible.",
        temas: ["Excel: tablas dinámicas y búsquedas", "Conciliar dos fuentes", "Comunicar un problema"],
        recursos: [{ nombre: "Soporte de Microsoft: Excel", url: "https://support.microsoft.com/es-es/excel" }, SQL],
      },
      {
        numero: 2,
        titulo: "Análisis y visualización",
        objetivo: "Respondes preguntas del negocio con el gráfico y el indicador correctos.",
        temas: ["Estadística descriptiva", "Indicadores de negocio", "Visualización"],
        recursos: [
          { nombre: "Khan Academy: estadística", url: "https://es.khanacademy.org/math/statistics-probability" },
          POWER_BI,
        ],
      },
      {
        numero: 3,
        titulo: "Automatizar reportes",
        objetivo: "Automatizas la preparación de datos para que el reporte se actualice solo.",
        temas: ["Python con pandas", "SQL avanzado", "Programar actualizaciones"],
        recursos: [{ nombre: "Documentación de pandas", url: "https://pandas.pydata.org/docs/" }],
      },
    ],
    despues: ["Analista de datos", "Ingeniero de datos", "Científico de datos"],
  },
  {
    slug: "qa-junior",
    area: "software",
    puesto: "QA junior",
    resumen:
      "Encuentra lo que se rompe antes que el cliente: prueba procesos completos, reporta fallas y revisa la seguridad básica.",
    etapas: [
      {
        numero: 1,
        titulo: "Pruebas funcionales",
        objetivo: "Diseñas casos de prueba de un proceso completo y reportas fallas que otros pueden reproducir.",
        temas: ["Casos de prueba", "Valores límite", "Reporte de defectos"],
        recursos: [{ nombre: "ISTQB", url: "https://www.istqb.org/" }],
      },
      {
        numero: 2,
        titulo: "APIs y automatización",
        objetivo: "Pruebas servicios directamente y automatizas las comprobaciones que se repiten.",
        temas: ["Pruebas de APIs", "Colecciones y entornos", "Pruebas automatizadas"],
        recursos: [{ nombre: "Postman Learning Center", url: "https://learning.postman.com/" }],
      },
      {
        numero: 3,
        titulo: "Seguridad web",
        objetivo: "Detectas las vulnerabilidades más comunes en entornos autorizados y las reportas con responsabilidad.",
        temas: ["OWASP Top 10", "Laboratorios de hacking ético", "Divulgación responsable"],
        recursos: [
          { nombre: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
          { nombre: "TryHackMe", url: "https://tryhackme.com/" },
        ],
      },
    ],
    despues: ["QA automation", "Analista de ciberseguridad", "Ingeniero de software en pruebas"],
  },
  {
    slug: "asistente-de-marketing-digital",
    area: "marketing",
    puesto: "Asistente de marketing digital",
    resumen:
      "Planifica contenidos con un objetivo medible, publica y cuenta qué funcionó con números, no con impresiones.",
    etapas: [
      {
        numero: 1,
        titulo: "Campañas con objetivo",
        objetivo: "Defines a quién le hablas, qué quieres lograr y cómo lo vas a medir antes de publicar.",
        temas: ["Público objetivo", "Objetivos medibles", "Calendario de contenidos"],
        recursos: [{ nombre: "Meta para empresas: cursos", url: "https://www.facebook.com/business/learn" }],
      },
      {
        numero: 2,
        titulo: "Medición y anuncios",
        objetivo: "Lees un reporte de campaña y decides qué mantener, qué cambiar y qué dejar.",
        temas: ["Alcance, clics y conversiones", "Anuncios pagados", "Reportes de resultados"],
        recursos: [{ nombre: "Google Skillshop", url: "https://skillshop.withgoogle.com/" }],
      },
      {
        numero: 3,
        titulo: "Estrategia de contenidos",
        objetivo: "Planificas varios meses de contenido alineado al negocio y a su presupuesto.",
        temas: ["Embudo de ventas", "Redacción para marcas", "Presupuesto de campañas"],
        recursos: [],
      },
    ],
    despues: ["Community manager", "Analista de marketing digital", "Especialista en crecimiento"],
  },
  {
    slug: "disenador-grafico-junior",
    area: "diseno",
    puesto: "Diseñador gráfico junior",
    resumen:
      "Produce y revisa piezas que respetan la marca, y sabe cuándo una variante hecha con IA no se puede entregar.",
    etapas: [
      {
        numero: 1,
        titulo: "Piezas que respetan la marca",
        objetivo: "Aplicas un manual de marca y justificas qué piezas se entregan y cuáles no.",
        temas: ["Manuales de marca", "Jerarquía y tipografía", "Revisión de piezas generadas con IA"],
        recursos: [{ nombre: "Canva Design School", url: "https://www.canva.com/designschool/" }],
      },
      {
        numero: 2,
        titulo: "Archivos de trabajo en Figma",
        objetivo: "Construyes archivos ordenados, con componentes y estilos que otra persona pueda retomar.",
        temas: ["Componentes y estilos", "Auto layout", "Entrega a desarrollo"],
        recursos: [{ nombre: "Centro de ayuda de Figma", url: "https://help.figma.com/" }],
      },
      {
        numero: 3,
        titulo: "Diseño de interfaces",
        objetivo: "Diseñas pantallas simples a partir de un problema de usuario.",
        temas: ["Flujos de usuario", "Prototipos", "Pruebas con usuarios"],
        recursos: [],
      },
    ],
    despues: ["Diseñador UI", "Diseñador de producto", "Director de arte"],
  },
  {
    slug: "asistente-contable",
    area: "contabilidad",
    puesto: "Asistente contable",
    resumen: "Concilia cuentas, registra comprobantes y prepara la información del cierre de mes.",
    etapas: [
      {
        numero: 1,
        titulo: "Registro y comprobantes",
        objetivo: "Registras operaciones frecuentes con el comprobante correcto.",
        temas: ["Plan contable", "Asientos frecuentes", "Comprobantes electrónicos"],
        recursos: [{ nombre: "SUNAT", url: "https://www.sunat.gob.pe/" }],
      },
      {
        numero: 2,
        titulo: "Conciliaciones",
        objetivo: "Cruzas bancos y libros y explicas cada diferencia.",
        temas: ["Conciliación bancaria", "Cuentas por cobrar y pagar"],
        recursos: [],
      },
      {
        numero: 3,
        titulo: "Cierre de mes",
        objetivo: "Preparas la información del cierre y los reportes para gerencia.",
        temas: ["Provisiones", "Estados financieros", "Reportes de cierre"],
        recursos: [],
      },
    ],
    despues: ["Analista contable", "Analista financiero", "Contador general"],
  },
];

export function obtenerRuta(slug: string | null | undefined): Ruta | undefined {
  return RUTAS.find((r) => r.slug === slug);
}

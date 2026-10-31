import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Encabezado } from "@/components/layout/Encabezado";
import { Pie } from "@/components/layout/Pie";
import { SelectorVista } from "@/components/layout/SelectorVista";
import { Suspense } from "react";
import { ProveedorSesion } from "@/lib/sesion";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Escalón Cero — Gana experiencia antes de tu primer empleo",
    template: "%s · Escalón Cero",
  },
  description:
    "Experiencia real con empresas para personas sin experiencia: sigue una ruta, haz los proyectos que piden y postula con tu portafolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#contenido" className="saltar">
          Saltar al contenido
        </a>
        <ProveedorSesion>
          <Encabezado />
          <Suspense fallback={<div className="h-12" aria-hidden="true" />}>
            <SelectorVista />
          </Suspense>
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Pie />
        </ProveedorSesion>
      </body>
    </html>
  );
}

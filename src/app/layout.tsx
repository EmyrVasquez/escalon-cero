import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Escalón Cero — Practica tu primer empleo antes de tenerlo",
    template: "%s · Escalón Cero",
  },
  description:
    "Casos reales del primer año de trabajo: decide qué harías, descubre qué pasó de verdad y guarda tu entrega en tu portafolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#contenido" className="saltar">
          Saltar al contenido
        </a>
        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Pie />
      </body>
    </html>
  );
}

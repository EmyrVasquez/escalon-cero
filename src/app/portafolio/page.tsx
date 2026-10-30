import type { Metadata } from "next";
import { PortafolioVista } from "@/components/PortafolioVista";

export const metadata: Metadata = { title: "Mi portafolio" };

export default function Portafolio() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-12 sm:px-6">
      <PortafolioVista />
    </div>
  );
}

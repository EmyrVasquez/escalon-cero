import Image from "next/image";
import type { Ilustracion as Nombre } from "@/lib/areas";

/** Ilustraciones de trabajos (del prototipo del equipo, con nuestra paleta). Son decorativas. */
export function Ilustracion({
  nombre,
  className,
  alt = "",
  prioridad = false,
}: {
  nombre: Nombre | "ficha-encargo" | "ficha-reto";
  className?: string;
  alt?: string;
  prioridad?: boolean;
}) {
  const ficha = nombre.startsWith("ficha-");
  return (
    <Image
      src={`/ilustraciones/${nombre}.svg`}
      alt={alt}
      width={ficha ? 112 : 420}
      height={ficha ? 96 : 280}
      priority={prioridad}
      unoptimized
      className={className}
    />
  );
}

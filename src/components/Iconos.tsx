export function IconoCheck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" className="fill-lima" />
      <path
        d="M6 10.5l2.5 2.5L14 7.5"
        fill="none"
        stroke="#14213d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoReloj({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4l2.5 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoNivel({
  className = "h-4 w-4",
  nivel = "inicial",
}: {
  className?: string;
  nivel?: "inicial" | "intermedio";
}) {
  const llenas = nivel === "intermedio" ? 2 : 1;
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="3" y="11" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="8.5" y="7" width="3" height="10" rx="1" fill="currentColor" opacity={llenas >= 2 ? 1 : 0.35} />
      <rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function IconoChevron({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoChevronAbajo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoBuscar({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconoDescarga({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 3v10M6 9l4 4 4-4M4 16h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoArchivo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M5 3h7l3 3v11H5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 3v3h3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoCandado({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="4" y="9" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9V6.5a3 3 0 016 0V9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconoHecho({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

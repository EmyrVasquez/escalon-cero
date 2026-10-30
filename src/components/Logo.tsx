export function SimboloEscalon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 128"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M44 8H76C93.673 8 108 22.327 108 40V88C108 105.673 93.673 120 76 120H44C26.327 120 12 105.673 12 88V40C12 22.327 26.327 8 44 8Z M48 32H72C78.627 32 84 37.373 84 44V56H68V72H52V88H36V44C36 37.373 41.373 32 48 32Z"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <SimboloEscalon className="h-8 w-auto text-cobalto" />
      <span className="text-[1.15rem] font-extrabold tracking-[-0.03em] text-tinta">
        Escalón Cero
      </span>
    </span>
  );
}

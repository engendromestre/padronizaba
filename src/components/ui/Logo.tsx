interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Símbolo que sempre aparece */}
      <svg width="32" height="32" viewBox="0 0 100 100" className="shrink-0">
        <rect width="100" height="100" rx="20" className="fill-primary" />
        <path d="M30 40L50 25L70 40L65 70L35 70L30 40Z" fill="white" />
      </svg>
      
      {/* O texto "padroniza" só renderiza se showText for true */}
      {showText && (
        <span className="text-xl font-black tracking-tighter text-primary animate-in fade-in duration-300">
          padroniza
        </span>
      )}
    </div>
  );
}
interface FilmPerforationProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Компонент-обёртка с рамками киноплёнки (перфорация по бокам).
 */
export default function FilmPerforation({ children, className = '' }: FilmPerforationProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Левая перфорация */}
      <div className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none z-10 hidden md:block"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 6px,
            #2a1810 6px,
            #2a1810 8px,
            transparent 8px,
            transparent 12px,
            #c9a96e 12px,
            #c9a96e 20px,
            transparent 20px,
            transparent 24px
          )`,
          backgroundSize: '10px 28px',
          backgroundPosition: 'center',
          opacity: 0.5,
        }}
      />
      
      {/* Контент */}
      <div className="film-border mx-6 md:mx-8">
        {children}
      </div>

      {/* Правая перфорация */}
      <div className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none z-10 hidden md:block"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 6px,
            #2a1810 6px,
            #2a1810 8px,
            transparent 8px,
            transparent 12px,
            #c9a96e 12px,
            #c9a96e 20px,
            transparent 20px,
            transparent 24px
          )`,
          backgroundSize: '10px 28px',
          backgroundPosition: 'center',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

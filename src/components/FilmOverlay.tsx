import { useState } from 'react';
import { Film, Eye, EyeOff } from 'lucide-react';

interface FilmOverlayProps {
  children: React.ReactNode;
  showEffects?: boolean;
}

/**
 * Компонент-обёртка, добавляющий эффекты старой киноплёнки поверх контента.
 * Включает: зернистость, виньетку, мерцание, царапины, дрожание.
 */
export default function FilmOverlay({ children, showEffects = true }: FilmOverlayProps) {
  const [effectsEnabled, setEffectsEnabled] = useState(showEffects);

  if (!effectsEnabled) {
    return (
      <div className="relative min-h-screen">
        {children}
        <button
          onClick={() => setEffectsEnabled(true)}
          className="fixed bottom-4 right-4 z-[9999] bg-film-medium border border-film text-film-cream p-2 rounded opacity-50 hover:opacity-100 transition-opacity"
          title="Включить эффекты киноплёнки"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen film-jitter">
      {/* Основной контент */}
      {children}

      {/* Эффекты киноплёнки (поверх всего, но не перехватывают клики) */}
      <div className="film-grain" />
      <div className="film-vignette" />
      <div className="film-flicker" />
      <div className="film-scratches" />

      {/* Кнопка переключения эффектов */}
      <button
        onClick={() => setEffectsEnabled(false)}
        className="fixed bottom-4 right-4 z-[9999] bg-film-medium border border-film text-film-cream p-2 rounded opacity-30 hover:opacity-100 transition-opacity"
        title="Выключить эффекты киноплёнки"
      >
        <Film className="w-4 h-4" />
      </button>
    </div>
  );
}

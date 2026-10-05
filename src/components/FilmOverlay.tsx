import { useState } from 'react';
import { Camera, Eye, EyeOff } from 'lucide-react';

interface FilmOverlayProps {
  children: React.ReactNode;
  showEffects?: boolean;
}

/**
 * Компонент-обёртка, добавляющий эффекты плёночной фотографии поверх контента.
 * Включает: мягкую зернистость, виньетку, засветы.
 */
export default function FilmOverlay({ children, showEffects = true }: FilmOverlayProps) {
  const [effectsEnabled, setEffectsEnabled] = useState(showEffects);

  if (!effectsEnabled) {
    return (
      <div className="relative min-h-screen bg-polaroid">
        {children}
        <button
          onClick={() => setEffectsEnabled(true)}
          className="fixed bottom-4 right-4 z-[9999] bg-polaroid-white border border-polaroid text-polaroid p-2 rounded opacity-50 hover:opacity-100 transition-opacity shadow-polaroid"
          title="Включить эффекты плёнки"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-polaroid">
      {/* Основной контент */}
      {children}

      {/* Эффекты плёночной фотографии (поверх всего, но не перехватывают клики) */}
      <div className="film-grain" />
      <div className="film-vignette" />
      <div className="film-light-leaks" />

      {/* Кнопка переключения эффектов */}
      <button
        onClick={() => setEffectsEnabled(false)}
        className="fixed bottom-4 right-4 z-[9999] bg-polaroid-white border border-polaroid text-polaroid p-2 rounded opacity-30 hover:opacity-100 transition-opacity shadow-polaroid"
        title="Выключить эффекты плёнки"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
}

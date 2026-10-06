import { Camera, Eye } from 'lucide-react';
import { useState } from 'react';

interface FilmOverlayProps {
  children: React.ReactNode;
  showEffects?: boolean;
}

export default function FilmOverlay({ children, showEffects = true }: FilmOverlayProps) {
  const [effectsEnabled, setEffectsEnabled] = useState(showEffects);

  if (!effectsEnabled) {
    return (
      <div className="relative min-h-screen bg-polaroid">
        {children}
        <button onClick={() => setEffectsEnabled(true)} className="fixed bottom-4 right-4 z-[9999] bg-polaroid-white border border-polaroid text-polaroid p-2 rounded opacity-50 hover:opacity-100 transition-opacity shadow-polaroid" title="Включить эффекты">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-polaroid">
      {children}
      <div className="film-grain" />
      <div className="film-vignette" />
      <div className="film-light-leaks" />
      <button onClick={() => setEffectsEnabled(false)} className="fixed bottom-4 right-4 z-[9999] bg-polaroid-white border border-polaroid text-polaroid p-2 rounded opacity-30 hover:opacity-100 transition-opacity shadow-polaroid" title="Выключить эффекты">
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
}

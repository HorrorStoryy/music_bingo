import { motion, AnimatePresence } from 'framer-motion';

interface SilentFilmTitleCardProps {
  show: boolean;
  title: string;
  subtitle?: string;
  onEnd?: () => void;
}

/**
 * Компонент в стиле Polaroid-снимка с подписью.
 * Белый фон, мягкие тени, эффект "полароидного снимка".
 */
export default function SilentFilmTitleCard({ show, title, subtitle, onEnd }: SilentFilmTitleCardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={onEnd}
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-polaroid/95 backdrop-blur-sm"
        >
          {/* Polaroid карточка */}
          <motion.div
            initial={{ scale: 0.8, y: 50, rotate: -5 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.9, y: -30, rotate: 3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="polaroid max-w-md mx-4"
          >
            {/* "Фотография" */}
            <div className="bg-polaroid-cream aspect-square flex items-center justify-center mb-4 faded-photo">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  🎵
                </motion.div>
              </div>
            </div>

            {/* Подпись снизу (как на Polaroid) */}
            <div className="text-center">
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl font-handwritten text-polaroid mb-2"
                style={{ transform: 'rotate(-1deg)' }}
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-polaroid-light text-sm font-typewriter"
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Date stamp */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="date-stamp mt-3"
              >
                {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

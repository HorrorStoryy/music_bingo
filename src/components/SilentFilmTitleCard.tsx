import { motion, AnimatePresence } from 'framer-motion';

interface SilentFilmTitleCardProps {
  show: boolean;
  title: string;
  subtitle?: string;
  onEnd?: () => void;
}

/**
 * Компонент в стиле титров немого кино.
 * Чёрный фон, белый текст в декоративной рамке, эффект проявки.
 */
export default function SilentFilmTitleCard({ show, title, subtitle, onEnd }: SilentFilmTitleCardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={onEnd}
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black"
        >
          {/* Виньетка */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)'
            }}
          />

          {/* Карточка титра */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.1, opacity: 0, filter: 'blur(5px)' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="silent-film-card max-w-lg mx-4"
          >
            {/* Декоративные элементы сверху */}
            <div className="text-film-gold text-2xl mb-4 font-title tracking-widest">
              ✦ ✦ ✦
            </div>

            {/* Заголовок */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl md:text-4xl font-serif-old font-bold text-film-cream mb-4 leading-tight"
              style={{ textShadow: '0 0 20px rgba(245, 230, 211, 0.3)' }}
            >
              {title}
            </motion.h1>

            {/* Подзаголовок */}
            {subtitle && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-film-dim text-lg font-typewriter italic"
              >
                {subtitle}
              </motion.p>
            )}

            {/* Декоративные элементы снизу */}
            <div className="text-film-gold text-2xl mt-4 font-title tracking-widest">
              ✦ ✦ ✦
            </div>
          </motion.div>

          {/* Зернистость */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              animation: 'grain 0.5s steps(6) infinite'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

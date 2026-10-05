import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'admin' | 'player'>('player');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = login(username, password);
      if (!user) {
        setError('Неверное имя пользователя или пароль');
      }
    } else {
      if (!username || !password || !displayName) {
        setError('Заполните все поля');
        return;
      }
      const user = register(username, password, displayName, role);
      if (!user) {
        setError('Пользователь с таким именем уже существует');
      }
    }
  };

  return (
    <div className="min-h-screen bg-film-texture flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full fade-in-film"
      >
        {/* Заголовок в стиле титров */}
        <div className="text-center mb-8">
          <div className="text-film-gold text-3xl mb-2 font-title tracking-widest">✦ ✦ ✦</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-film-dark border-4 border-film-gold rounded-full mb-4"
          >
            <Music className="w-10 h-10 text-film-gold" />
          </motion.div>
          <h1 className="text-4xl font-serif-old font-bold text-film-cream mb-2">Музыкальное Лото</h1>
          <p className="text-film-dim font-typewriter">Представление начинается...</p>
          <div className="text-film-gold text-3xl mt-2 font-title tracking-widest">✦ ✦ ✦</div>
        </div>

        <div className="silent-film-card">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded font-title text-lg transition-all border-2 ${
                isLogin
                  ? 'bg-film-gold/20 border-film-gold text-film-gold'
                  : 'bg-film-dark border-film text-film-dim hover:border-film-gold'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded font-title text-lg transition-all border-2 ${
                !isLogin
                  ? 'bg-film-gold/20 border-film-gold text-film-gold'
                  : 'bg-film-dark border-film text-film-dim hover:border-film-gold'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-film-dim text-sm font-typewriter mb-1 block">Ваше имя</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Как вас называть?"
                  className="w-full bg-film-dark border-2 border-film rounded px-4 py-3 text-film-cream placeholder-film-dim/50 focus:outline-none focus:border-film-gold font-typewriter"
                />
              </div>
            )}

            <div>
              <label className="text-film-dim text-sm font-typewriter mb-1 block">Логин</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-film-dark border-2 border-film rounded px-4 py-3 text-film-cream placeholder-film-dim/50 focus:outline-none focus:border-film-gold font-typewriter"
              />
            </div>

            <div>
              <label className="text-film-dim text-sm font-typewriter mb-1 block">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-film-dark border-2 border-film rounded px-4 py-3 pr-12 text-film-cream placeholder-film-dim/50 focus:outline-none focus:border-film-gold font-typewriter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-film-dim hover:text-film-cream"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-film-dim text-sm font-typewriter mb-2 block">Роль</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('player')}
                    className={`py-3 rounded font-title text-lg transition-all border-2 ${
                      role === 'player'
                        ? 'bg-film-gold/20 border-film-gold text-film-gold'
                        : 'bg-film-dark border-film text-film-dim hover:border-film-gold'
                    }`}
                  >
                    🎮 Игрок
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-3 rounded font-title text-lg transition-all border-2 ${
                      role === 'admin'
                        ? 'bg-film-gold/20 border-film-gold text-film-gold'
                        : 'bg-film-dark border-film text-film-dim hover:border-film-gold'
                    }`}
                  >
                    👑 Админ
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded p-3 text-red-300 text-sm font-typewriter">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-film btn-film-primary w-full font-title text-xl flex items-center justify-center gap-2"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Войти
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Регистрация
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 bg-film-dark/50 rounded p-3 border border-film/30">
              <p className="text-film-dim text-xs font-typewriter">
                💡 <span className="text-film-gold">Демо-аккаунт:</span><br />
                Логин: <code className="text-film-cream">admin</code> / Пароль: <code className="text-film-cream">admin</code>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

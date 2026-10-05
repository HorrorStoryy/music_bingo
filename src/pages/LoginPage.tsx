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
    <div className="min-h-screen bg-paper-texture flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full fade-in-photo"
      >
        {/* Заголовок */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block polaroid p-3 mb-4"
          >
            <div className="bg-polaroid-cream w-20 h-20 flex items-center justify-center faded-photo">
              <Music className="w-12 h-12 text-polaroid-accent" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-serif-old font-bold text-polaroid mb-2">Музыкальное Лото</h1>
          <p className="text-polaroid-light font-typewriter">Войдите или создайте аккаунт</p>
        </div>

        {/* Форма */}
        <div className="polaroid-card">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded font-title text-lg transition-all border-2 ${
                isLogin
                  ? 'bg-polaroid-accent border-polaroid-accent text-white'
                  : 'bg-polaroid-cream border-polaroid text-polaroid-light hover:border-polaroid-accent'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded font-title text-lg transition-all border-2 ${
                !isLogin
                  ? 'bg-polaroid-accent border-polaroid-accent text-white'
                  : 'bg-polaroid-cream border-polaroid text-polaroid-light hover:border-polaroid-accent'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-polaroid-light text-sm font-typewriter mb-1 block">Ваше имя</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Как вас называть?"
                  className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter"
                />
              </div>
            )}

            <div>
              <label className="text-polaroid-light text-sm font-typewriter mb-1 block">Логин</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter"
              />
            </div>

            <div>
              <label className="text-polaroid-light text-sm font-typewriter mb-1 block">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 pr-12 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-polaroid-light hover:text-polaroid"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-polaroid-light text-sm font-typewriter mb-2 block">Роль</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('player')}
                    className={`py-3 rounded font-title text-lg transition-all border-2 ${
                      role === 'player'
                        ? 'bg-polaroid-accent border-polaroid-accent text-white'
                        : 'bg-polaroid-cream border-polaroid text-polaroid-light hover:border-polaroid-accent'
                    }`}
                  >
                    🎮 Игрок
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-3 rounded font-title text-lg transition-all border-2 ${
                      role === 'admin'
                        ? 'bg-polaroid-accent border-polaroid-accent text-white'
                        : 'bg-polaroid-cream border-polaroid text-polaroid-light hover:border-polaroid-accent'
                    }`}
                  >
                    👑 Админ
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm font-typewriter">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-polaroid btn-polaroid-primary w-full font-title text-xl flex items-center justify-center gap-2"
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
            <div className="mt-4 bg-polaroid-cream rounded p-3 border border-polaroid">
              <p className="text-polaroid-light text-xs font-typewriter">
                💡 <span className="text-polaroid-accent">Демо-аккаунт:</span><br />
                Логин: <code className="text-polaroid">admin</code> / Пароль: <code className="text-polaroid">admin</code>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

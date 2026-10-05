import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Users, Tv, Smartphone, Github } from 'lucide-react';
import { generateRoomCode } from '../utils/gameUtils';

export default function HomePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    navigate(`/host/${code}`);
  };

  const handleJoinRoom = () => {
    if (joinCode.length >= 4 && playerName.trim()) {
      navigate(`/player/${joinCode.toUpperCase()}/${encodeURIComponent(playerName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0, 0.5, 0],
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-2xl"
          >
            <Music className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Музыкальное Лото</h1>
          <p className="text-white/60 text-lg">Играй с друзьями под любимую музыку!</p>
        </div>

        {!showJoin ? (
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateRoom}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center gap-3"
            >
              <Tv className="w-6 h-6" />
              Создать игру (Хост)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowJoin(true)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-3"
            >
              <Smartphone className="w-6 h-6" />
              Присоединиться (Игрок)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/github-guide')}
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white/70 py-3 px-6 rounded-xl font-semibold text-base hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              <Github className="w-5 h-5" />
              Инструкция по GitHub
            </motion.button>

            <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
              <h3 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Как играть?
              </h3>
              <ol className="text-white/60 text-sm space-y-2">
                <li>1. Хост создаёт комнату и загружает музыку</li>
                <li>2. Игроки подключаются по коду на своих телефонах</li>
                <li>3. Хост включает треки в случайном порядке</li>
                <li>4. Игроки отмечают треки в своих карточках</li>
                <li>5. Кто первый закроет все ячейки — победил! 🎉</li>
              </ol>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-white text-xl font-bold mb-4">Присоединиться к игре</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Ваше имя</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Введите имя..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-1 block">Код комнаты</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Например: A3K7M"
                  maxLength={5}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoin(false)}
                  className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length < 4 || !playerName.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Войти
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

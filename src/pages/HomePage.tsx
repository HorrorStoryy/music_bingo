import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Users, Tv, Smartphone, Crown, LogOut, Settings, Play, Tag } from 'lucide-react';
import { generateRoomCode } from '../utils/gameUtils';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylists } from '../utils/storage';
import { Playlist } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPlaylists();
  }, [user]);

  const loadPlaylists = () => {
    const all = getPlaylists();
    setPlaylists(all.filter(p => p.isPublic || p.createdBy === user?.id));
  };

  const handleCreateRoom = () => {
    if (playlists.length === 0) {
      alert('Нет доступных плейлистов. Попросите администратора создать плейлисты.');
      return;
    }
    setShowPlaylistPicker(true);
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowPlaylistPicker(false);
    const code = generateRoomCode();
    navigate(`/host/${code}/${playlist.id}`);
  };

  const handleJoinRoom = () => {
    if (joinCode.length >= 4) {
      navigate(`/player/${joinCode.toUpperCase()}/${encodeURIComponent(user!.displayName)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredPlaylists = playlists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">Музыкальное Лото</h1>
              <p className="text-white/50 text-sm">
                {user.displayName}
                {isAdmin && <span className="text-yellow-400 ml-2">👑 Админ</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl hover:bg-yellow-500/30 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Управление</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {!showJoin && !showPlaylistPicker ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow flex flex-col items-center gap-3"
              >
                <Tv className="w-10 h-10" />
                <span>Создать игру</span>
                <span className="text-white/60 text-sm font-normal">Выбрать плейлист и начать</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJoin(true)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white py-6 px-6 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors flex flex-col items-center gap-3"
              >
                <Smartphone className="w-10 h-10" />
                <span>Присоединиться</span>
                <span className="text-white/60 text-sm font-normal">Ввести код комнаты</span>
              </motion.button>
            </div>

            {/* How to play */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Как играть?
              </h3>
              <ol className="text-white/60 text-sm space-y-2">
                <li>1. Хост выбирает плейлист и создаёт комнату</li>
                <li>2. Игроки подключаются по коду или QR-коду</li>
                <li>3. Хост включает треки в случайном порядке</li>
                <li>4. Игроки отмечают треки в своих карточках</li>
                <li>5. Кто первый закроет все ячейки — победил! 🎉</li>
              </ol>
            </div>
          </motion.div>
        ) : showJoin ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto"
          >
            <h2 className="text-white text-xl font-bold mb-4">Присоединиться к игре</h2>
            
            <div className="space-y-4">
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
                  onClick={() => { setShowJoin(false); setJoinCode(''); }}
                  className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length < 4}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Войти
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Playlist Picker */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white text-2xl font-bold">Выберите плейлист</h2>
              <button
                onClick={() => setShowPlaylistPicker(false)}
                className="text-white/60 hover:text-white text-sm"
              >
                Отмена
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск плейлистов..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaylists.map((playlist) => (
                <motion.button
                  key={playlist.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPlaylist(playlist)}
                  className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 transition-all text-left group"
                >
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">{playlist.description}</p>
                  
                  <div className="flex items-center gap-3 text-white/40 text-xs">
                    <span className="flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      {playlist.tracks.length} треков
                    </span>
                    {playlist.tags && playlist.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {playlist.tags.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">Выбрать</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredPlaylists.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 text-lg">Плейлисты не найдены</p>
                {isAdmin && (
                  <p className="text-white/30 text-sm mt-2">
                    Создайте плейлист в <button onClick={() => navigate('/admin')} className="text-purple-400 hover:underline">панели администратора</button>
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

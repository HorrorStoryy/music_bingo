import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Users, Tv, Smartphone, LogOut, Settings, Play, Tag, HelpCircle } from 'lucide-react';
import { generateRoomCode } from '../utils/gameUtils';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylists } from '../utils/storage';
import { Playlist } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const all = getPlaylists();
    setPlaylists(all.filter(p => p.isPublic || p.createdBy === user?.id));
  }, [user]);

  const handleCreateRoom = () => {
    if (playlists.length === 0) {
      alert('Нет доступных плейлистов.');
      return;
    }
    setShowPlaylistPicker(true);
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
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
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-film-texture">
      {/* Header */}
      <header className="bg-film-dark/80 backdrop-blur-md border-b-2 border-film-gold p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-film-dark border-2 border-film-gold rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-film-gold" />
            </div>
            <div>
              <h1 className="text-film-cream font-serif-old font-bold">Музыкальное Лото</h1>
              <p className="text-film-dim text-sm font-typewriter">
                {user.displayName}
                {isAdmin && <span className="text-film-gold ml-2">👑</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/how-to-play')}
              className="btn-film text-sm flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Справка</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="btn-film text-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Управление</span>
              </button>
            )}
            <button onClick={handleLogout} className="btn-film text-sm flex items-center gap-2">
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
            className="space-y-6 fade-in-film"
          >
            {/* Титр */}
            <div className="text-center mb-8">
              <div className="text-film-gold text-3xl mb-2 font-title tracking-widest">✦ ✦ ✦</div>
              <h2 className="text-3xl font-serif-old font-bold text-film-cream mb-2">Добро пожаловать</h2>
              <p className="text-film-dim font-typewriter">Выберите роль и начните представление</p>
              <div className="text-film-gold text-3xl mt-2 font-title tracking-widest">✦ ✦ ✦</div>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                className="btn-film btn-film-primary py-6 px-6 flex flex-col items-center gap-3"
              >
                <Tv className="w-10 h-10" />
                <span className="font-title text-xl">Создать игру</span>
                <span className="text-film-dim text-sm font-typewriter">Выбрать плейлист</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJoin(true)}
                className="btn-film py-6 px-6 flex flex-col items-center gap-3"
              >
                <Smartphone className="w-10 h-10" />
                <span className="font-title text-xl">Присоединиться</span>
                <span className="text-film-dim text-sm font-typewriter">Ввести код комнаты</span>
              </motion.button>
            </div>

            {/* How to play */}
            <div className="lotto-card-film p-5 max-w-2xl mx-auto">
              <h3 className="text-film-cream font-serif-old font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-film-gold" />
                <span className="font-title text-lg">Как играть?</span>
              </h3>
              <ol className="text-film-dim text-sm space-y-2 font-typewriter">
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
            className="silent-film-card max-w-md mx-auto"
          >
            <h2 className="text-film-cream text-xl font-serif-old font-bold mb-4">Присоединиться к игре</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-film-dim text-sm font-typewriter mb-1 block">Код комнаты</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="A3K7M"
                  maxLength={5}
                  className="w-full bg-film-dark border-2 border-film rounded px-4 py-3 text-film-cream placeholder-film-dim/50 focus:outline-none focus:border-film-gold text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowJoin(false); setJoinCode(''); }} className="btn-film flex-1">
                  Назад
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length < 4}
                  className="btn-film btn-film-primary flex-1 disabled:opacity-50"
                >
                  Войти
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-film-cream text-2xl font-serif-old font-bold">Выберите плейлист</h2>
              <button onClick={() => setShowPlaylistPicker(false)} className="text-film-dim hover:text-film-cream text-sm font-typewriter">
                Отмена
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск плейлистов..."
              className="w-full bg-film-dark border-2 border-film rounded px-4 py-3 text-film-cream placeholder-film-dim/50 focus:outline-none focus:border-film-gold font-typewriter"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaylists.map((playlist) => (
                <motion.button
                  key={playlist.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPlaylist(playlist)}
                  className="lotto-card-film p-5 text-left group hover:border-film-gold transition-all"
                >
                  <h3 className="text-film-cream font-serif-old font-bold text-lg mb-1 group-hover:text-film-gold transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-film-dim text-sm mb-3 font-typewriter">{playlist.description}</p>
                  
                  <div className="flex items-center gap-3 text-film-dim/60 text-xs font-typewriter">
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

                  <div className="mt-3 flex items-center gap-2 text-film-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-title">Выбрать</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredPlaylists.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-film-dim/30 mx-auto mb-4" />
                <p className="text-film-dim text-lg font-typewriter">Плейлисты не найдены</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

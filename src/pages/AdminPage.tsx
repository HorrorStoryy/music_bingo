import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Music, Trash2, Edit2, Download, Upload, ArrowLeft, 
  Save, X, Search, Tag, Users, Crown, LogOut
} from 'lucide-react';
import { Playlist, Track } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, 
  exportPlaylist, importPlaylist 
} from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadPlaylists();
  }, [user]);

  const loadPlaylists = () => {
    setPlaylists(getPlaylists());
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPlaylist({
      id: '',
      name: '',
      description: '',
      tracks: [],
      createdBy: user!.id,
      createdAt: Date.now(),
      isPublic: true,
      tags: [],
    });
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist({ ...playlist });
  };

  const handleSave = () => {
    if (!editingPlaylist) return;

    if (editingPlaylist.id) {
      updatePlaylist(editingPlaylist.id, editingPlaylist);
    } else {
      createPlaylist({
        name: editingPlaylist.name,
        description: editingPlaylist.description,
        tracks: editingPlaylist.tracks,
        createdBy: user!.id,
        isPublic: editingPlaylist.isPublic,
        tags: editingPlaylist.tags,
      });
    }

    setEditingPlaylist(null);
    setIsCreating(false);
    loadPlaylists();
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот плейлист?')) {
      deletePlaylist(id);
      loadPlaylists();
    }
  };

  const handleExport = (playlist: Playlist) => {
    const json = exportPlaylist(playlist);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const result = importPlaylist(importText, user!.id);
    if (result) {
      setShowImport(false);
      setImportText('');
      loadPlaylists();
    } else {
      alert('Ошибка импорта. Проверьте формат JSON.');
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

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-white font-bold text-lg">Панель администратора</h1>
              <p className="text-white/50 text-sm">Управление плейлистами</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm">
              👋 {user.displayName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск плейлистов..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Новый плейлист
          </button>
          
          <button
            onClick={() => setShowImport(true)}
            className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Импорт
          </button>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map((playlist) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">{playlist.name}</h3>
                  <p className="text-white/60 text-sm">{playlist.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-white/50 text-sm">
                <span className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  {playlist.tracks.length} треков
                </span>
                {playlist.tags && playlist.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {playlist.tags.join(', ')}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(playlist)}
                  className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Редактировать
                </button>
                <button
                  onClick={() => handleExport(playlist)}
                  className="bg-green-600/20 border border-green-500/30 text-green-300 p-2 rounded-lg hover:bg-green-600/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="bg-red-600/20 border border-red-500/30 text-red-300 p-2 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPlaylists.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg">Плейлисты не найдены</p>
            <p className="text-white/30 text-sm mt-2">Создайте первый плейлист или импортируйте существующий</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingPlaylist(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold">
                  {isCreating ? 'Новый плейлист' : 'Редактировать плейлист'}
                </h2>
                <button
                  onClick={() => setEditingPlaylist(null)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Название</label>
                  <input
                    type="text"
                    value={editingPlaylist.name}
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, name: e.target.value })}
                    placeholder="Например: Хиты 80-х"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-1 block">Описание</label>
                  <textarea
                    value={editingPlaylist.description}
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, description: e.target.value })}
                    placeholder="Описание плейлиста..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-1 block">Теги (через запятую)</label>
                  <input
                    type="text"
                    value={editingPlaylist.tags?.join(', ') || ''}
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, tags: e.target.value.split(',').map(t => t.trim()) })}
                    placeholder="рок, поп, 90-е"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white/70 text-sm mb-2">
                    <input
                      type="checkbox"
                      checked={editingPlaylist.isPublic}
                      onChange={(e) => setEditingPlaylist({ ...editingPlaylist, isPublic: e.target.checked })}
                      className="rounded"
                    />
                    Публичный плейлист (доступен всем игрокам)
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/70 text-sm">Треки ({editingPlaylist.tracks.length})</label>
                    <button
                      onClick={() => {
                        const newTrack: Track = {
                          id: uuidv4(),
                          name: '',
                          artist: '',
                          fileUrl: '',
                          fileName: '',
                        };
                        setEditingPlaylist({
                          ...editingPlaylist,
                          tracks: [...editingPlaylist.tracks, newTrack],
                        });
                      }}
                      className="bg-purple-600/30 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg text-sm hover:bg-purple-600/50 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить трек
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {editingPlaylist.tracks.map((track, idx) => (
                      <div key={track.id} className="flex gap-2 items-center bg-white/5 rounded-lg p-2">
                        <span className="text-white/40 text-xs w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={track.name}
                          onChange={(e) => {
                            const newTracks = [...editingPlaylist.tracks];
                            newTracks[idx] = { ...track, name: e.target.value };
                            setEditingPlaylist({ ...editingPlaylist, tracks: newTracks });
                          }}
                          placeholder="Название"
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400"
                        />
                        <input
                          type="text"
                          value={track.artist}
                          onChange={(e) => {
                            const newTracks = [...editingPlaylist.tracks];
                            newTracks[idx] = { ...track, artist: e.target.value };
                            setEditingPlaylist({ ...editingPlaylist, tracks: newTracks });
                          }}
                          placeholder="Исполнитель"
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400"
                        />
                        <button
                          onClick={() => {
                            const newTracks = editingPlaylist.tracks.filter((_, i) => i !== idx);
                            setEditingPlaylist({ ...editingPlaylist, tracks: newTracks });
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingPlaylist(null)}
                    className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editingPlaylist.name || editingPlaylist.tracks.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Сохранить
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImport(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-white text-xl font-bold mb-4">Импорт плейлиста</h2>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Вставьте JSON плейлиста..."
                rows={10}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none font-mono text-sm mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImport(false)}
                  className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20"
                >
                  Отмена
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Импортировать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

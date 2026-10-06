import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Music, Trash2, Edit2, Download, Upload, ArrowLeft, Save, X, Search, Tag, Crown, LogOut, Link2, Film } from 'lucide-react';
import { Playlist, Track } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, exportPlaylist, importPlaylist } from '../utils/storage';
import { getMediaLinkDescription, isValidUrl } from '../utils/mediaParser';
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
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackLink, setNewTrackLink] = useState('');
  const [newTrackType, setNewTrackType] = useState<'audio' | 'video'>('video');
  const [newTrackCover, setNewTrackCover] = useState('');
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
    loadPlaylists();
  }, [user]);

  const loadPlaylists = () => setPlaylists(getPlaylists());

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPlaylist({ id: '', name: '', description: '', tracks: [], createdBy: user!.id, createdAt: Date.now(), isPublic: true, tags: [] });
  };

  const handleEdit = (playlist: Playlist) => setEditingPlaylist({ ...playlist });

  const handleSave = () => {
    if (!editingPlaylist) return;
    if (editingPlaylist.id) updatePlaylist(editingPlaylist.id, editingPlaylist);
    else createPlaylist({ name: editingPlaylist.name, description: editingPlaylist.description, tracks: editingPlaylist.tracks, createdBy: user!.id, isPublic: editingPlaylist.isPublic, tags: editingPlaylist.tags });
    setEditingPlaylist(null); setIsCreating(false); loadPlaylists();
  };

  const handleDelete = (id: string) => { if (confirm('Удалить плейлист?')) { deletePlaylist(id); loadPlaylists(); } };

  const handleExport = (playlist: Playlist) => {
    const json = exportPlaylist(playlist);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${playlist.name}.json`; a.click();
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    if (importPlaylist(importText, user!.id)) { setShowImport(false); setImportText(''); loadPlaylists(); }
    else alert('Ошибка импорта');
  };

  const handleAddTrack = () => {
    setTrackError('');
    if (!editingPlaylist) return;
    if (!newTrackName.trim()) { setTrackError('Введите название'); return; }
    if (!newTrackLink.trim()) { setTrackError('Введите ссылку'); return; }
    if (!isValidUrl(newTrackLink)) { setTrackError('Некорректная ссылка'); return; }
    
    const track: Track = { id: uuidv4(), name: newTrackName.trim(), artist: newTrackArtist.trim() || 'Неизвестный', fileUrl: '', fileName: '', mediaLink: newTrackLink.trim(), mediaType: newTrackType, coverUrl: newTrackCover.trim() || undefined };
    setEditingPlaylist({ ...editingPlaylist, tracks: [...editingPlaylist.tracks, track] });
    setNewTrackName(''); setNewTrackArtist(''); setNewTrackLink(''); setNewTrackCover(''); setNewTrackType('video');
    setShowAddTrack(false);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-paper-texture">
      <header className="bg-polaroid-white/80 backdrop-blur-md border-b-2 border-polaroid p-4 shadow-polaroid">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-polaroid-light hover:text-polaroid"><ArrowLeft className="w-5 h-5" /></button>
            <Crown className="w-8 h-8 text-polaroid-accent" />
            <div><h1 className="text-polaroid font-serif-old font-bold text-lg">Панель администратора</h1><p className="text-polaroid-light text-sm font-typewriter">Управление плейлистами</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-polaroid-light text-sm font-typewriter">👋 {user.displayName}</span>
            <button onClick={handleLogout} className="btn-polaroid text-sm flex items-center gap-2"><LogOut className="w-4 h-4" />Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-polaroid-light" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск плейлистов..." className="w-full bg-polaroid-cream border-2 border-polaroid rounded pl-10 pr-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter" />
          </div>
          <button onClick={handleCreate} className="btn-polaroid btn-polaroid-primary flex items-center gap-2"><Plus className="w-5 h-5" /><span className="font-title">Новый плейлист</span></button>
          <button onClick={() => setShowImport(true)} className="btn-polaroid flex items-center gap-2"><Upload className="w-5 h-5" /><span className="font-title">Импорт</span></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist, idx) => (
            <motion.div key={playlist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="polaroid group hover:shadow-lg transition-all">
              <div className="bg-polaroid-cream aspect-video flex items-center justify-center mb-3 faded-photo"><Music className="w-12 h-12 text-polaroid-accent" /></div>
              <div className="text-center">
                <h3 className="text-polaroid font-handwritten text-lg mb-1">{playlist.name}</h3>
                <p className="text-polaroid-light text-xs font-typewriter mb-2">{playlist.description}</p>
                <div className="flex items-center justify-center gap-4 text-polaroid-light/60 text-xs font-typewriter mb-3">
                  <span className="flex items-center gap-1"><Music className="w-3 h-3" />{playlist.tracks.length} треков</span>
                  {playlist.tags && playlist.tags.length > 0 && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{playlist.tags.join(', ')}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(playlist)} className="btn-polaroid flex-1 text-sm flex items-center justify-center gap-1"><Edit2 className="w-4 h-4" />Редактировать</button>
                  <button onClick={() => handleExport(playlist)} className="btn-polaroid p-2"><Download className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(playlist.id)} className="btn-polaroid p-2 text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPlaylist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingPlaylist(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="polaroid-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-polaroid text-2xl font-serif-old font-bold">{isCreating ? 'Новый плейлист' : 'Редактировать'}</h2>
                <button onClick={() => setEditingPlaylist(null)} className="text-polaroid-light hover:text-polaroid"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Название</label><input type="text" value={editingPlaylist.name} onChange={(e) => setEditingPlaylist({ ...editingPlaylist, name: e.target.value })} placeholder="Хиты 80-х" className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter" /></div>
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Описание</label><textarea value={editingPlaylist.description} onChange={(e) => setEditingPlaylist({ ...editingPlaylist, description: e.target.value })} placeholder="Описание..." rows={3} className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent resize-none font-typewriter" /></div>
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Теги (через запятую)</label><input type="text" value={editingPlaylist.tags?.join(', ') || ''} onChange={(e) => setEditingPlaylist({ ...editingPlaylist, tags: e.target.value.split(',').map(t => t.trim()) })} placeholder="рок, поп, 90-е" className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter" /></div>
                <div><label className="flex items-center gap-2 text-polaroid-light text-sm font-typewriter"><input type="checkbox" checked={editingPlaylist.isPublic} onChange={(e) => setEditingPlaylist({ ...editingPlaylist, isPublic: e.target.checked })} />Публичный плейлист</label></div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-polaroid-light text-sm font-typewriter">Треки ({editingPlaylist.tracks.length})</label>
                    <button onClick={() => setShowAddTrack(true)} className="btn-polaroid btn-polaroid-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Добавить трек</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {editingPlaylist.tracks.map((track, idx) => (
                      <div key={track.id} className="flex gap-2 items-center bg-polaroid-cream rounded p-2 border border-polaroid">
                        <span className="text-polaroid-light text-xs w-6 font-mono">{idx + 1}.</span>
                        {track.coverUrl && <img src={track.coverUrl} alt="" className="w-8 h-8 rounded object-cover border border-polaroid" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                        <div className="flex-1 min-w-0"><p className="text-polaroid text-sm truncate font-typewriter">{track.name}</p><p className="text-polaroid-light text-xs truncate">{track.artist}</p>{track.mediaLink && <p className="text-polaroid-accent text-xs font-typewriter">{getMediaLinkDescription(track.mediaLink)}</p>}</div>
                        <span className="text-polaroid-accent text-xs">{track.mediaType === 'video' ? '🎬' : '🎵'}</span>
                        <button onClick={() => setEditingPlaylist({ ...editingPlaylist, tracks: editingPlaylist.tracks.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setEditingPlaylist(null)} className="btn-polaroid flex-1">Отмена</button>
                  <button onClick={handleSave} disabled={!editingPlaylist.name || editingPlaylist.tracks.length === 0} className="btn-polaroid btn-polaroid-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"><Save className="w-5 h-5" />Сохранить</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Track Modal */}
      <AnimatePresence>
        {showAddTrack && editingPlaylist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAddTrack(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="polaroid-card max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-polaroid text-xl font-serif-old font-bold mb-4 flex items-center gap-2"><Link2 className="w-5 h-5 text-polaroid-accent" />Добавить трек / клип</h2>
              <div className="space-y-4">
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Название *</label><input type="text" value={newTrackName} onChange={(e) => setNewTrackName(e.target.value)} placeholder="Название песни..." className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter" /></div>
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Исполнитель</label><input type="text" value={newTrackArtist} onChange={(e) => setNewTrackArtist(e.target.value)} placeholder="Имя артиста..." className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter" /></div>
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Ссылка *</label><input type="url" value={newTrackLink} onChange={(e) => setNewTrackLink(e.target.value)} placeholder="Google Drive, YouTube..." className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter text-sm" />{newTrackLink && isValidUrl(newTrackLink) && <p className="text-polaroid-accent text-xs mt-1 font-typewriter">{getMediaLinkDescription(newTrackLink)}</p>}</div>
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Тип медиа</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setNewTrackType('video')} className={`py-3 rounded font-title text-lg transition-all border-2 flex items-center justify-center gap-2 ${newTrackType === 'video' ? 'bg-polaroid-accent border-polaroid-accent text-white' : 'bg-polaroid-cream border-polaroid text-polaroid-light hover:border-polaroid-accent'}`}><Film className="w-4 h-4" />Видео</button><button type="button" onClick={() => setNewTrackType('audio')} className={`py-3 rounded font-title text-lg transition-all border-2 flex items-center justify-center gap-2 ${newTrackType === 'audio' ? 'bg-polaroid-accent border-polaroid-accent text-white' : 'bg-polaroid-cream border-polaroid text-polaroid-light hover:border-polaroid-accent'}`}><Music className="w-4 h-4" />Аудио</button></div></div>
                <div><label className="text-polaroid-light text-sm font-typewriter mb-1 block">Обложка (ссылка)</label><input type="url" value={newTrackCover} onChange={(e) => setNewTrackCover(e.target.value)} placeholder="https://..." className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent font-typewriter text-sm" /></div>
                {trackError && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm font-typewriter">{trackError}</div>}
                <div className="bg-polaroid-cream rounded p-3 border border-polaroid"><p className="text-polaroid-accent text-xs font-typewriter font-semibold mb-2">💡 Поддерживаемые ссылки:</p><ul className="text-polaroid-light text-xs space-y-1 font-typewriter"><li>• Google Drive (видео и аудио)</li><li>• YouTube (youtube.com, youtu.be)</li><li>• Прямые ссылки на MP3, MP4</li></ul></div>
                <div className="flex gap-3 pt-2"><button onClick={() => setShowAddTrack(false)} className="btn-polaroid flex-1">Отмена</button><button onClick={handleAddTrack} className="btn-polaroid btn-polaroid-primary flex-1">Добавить</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowImport(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="polaroid-card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-polaroid text-xl font-serif-old font-bold mb-4">Импорт плейлиста</h2>
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Вставьте JSON..." rows={10} className="w-full bg-polaroid-cream border-2 border-polaroid rounded px-4 py-3 text-polaroid placeholder-polaroid-light/50 focus:outline-none focus:border-polaroid-accent resize-none font-mono text-sm mb-4" />
              <div className="flex gap-3"><button onClick={() => setShowImport(false)} className="btn-polaroid flex-1">Отмена</button><button onClick={handleImport} disabled={!importText.trim()} className="btn-polaroid btn-polaroid-primary flex-1 disabled:opacity-50">Импортировать</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

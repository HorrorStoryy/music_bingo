import { User, Playlist, Track } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'music_lotto_users';
const CURRENT_USER_KEY = 'music_lotto_current_user';
const PLAYLISTS_KEY = 'music_lotto_playlists';
const HOST_TRACKS_KEY = 'music_lotto_host_tracks';

// ============ USERS ============
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}
export function saveUsers(users: User[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}
export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}
export function login(username: string, password: string): User | null {
  const user = getUsers().find(u => u.username === username && u.password === password);
  if (user) { setCurrentUser(user); return user; }
  return null;
}
export function register(username: string, password: string, displayName: string, role: 'admin' | 'player' = 'player'): User | null {
  const users = getUsers();
  if (users.find(u => u.username === username)) return null;
  const newUser: User = { id: uuidv4(), username, password, role, displayName };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  return newUser;
}
export function logout() { setCurrentUser(null); }
export function ensureDefaultAdmin() {
  const users = getUsers();
  if (!users.find(u => u.role === 'admin')) {
    users.push({ id: uuidv4(), username: 'admin', password: 'admin', role: 'admin', displayName: 'Администратор' });
    saveUsers(users);
  }
}

// ============ PLAYLISTS ============
export function getPlaylists(): Playlist[] {
  const data = localStorage.getItem(PLAYLISTS_KEY);
  return data ? JSON.parse(data) : [];
}
export function savePlaylists(playlists: Playlist[]) { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists)); }
export function getPlaylistById(id: string): Playlist | undefined { return getPlaylists().find(p => p.id === id); }
export function createPlaylist(playlist: Omit<Playlist, 'id' | 'createdAt'>): Playlist {
  const playlists = getPlaylists();
  const newPlaylist: Playlist = { ...playlist, id: uuidv4(), createdAt: Date.now() };
  playlists.push(newPlaylist);
  savePlaylists(playlists);
  return newPlaylist;
}
export function updatePlaylist(id: string, updates: Partial<Playlist>) {
  const playlists = getPlaylists();
  const idx = playlists.findIndex(p => p.id === id);
  if (idx !== -1) { playlists[idx] = { ...playlists[idx], ...updates }; savePlaylists(playlists); }
}
export function deletePlaylist(id: string) { savePlaylists(getPlaylists().filter(p => p.id !== id)); }
export function exportPlaylist(playlist: Playlist): string { return JSON.stringify(playlist, null, 2); }
export function importPlaylist(json: string, createdBy: string): Playlist | null {
  try {
    const data = JSON.parse(json);
    const playlist: Playlist = { ...data, id: uuidv4(), createdBy, createdAt: Date.now() };
    const playlists = getPlaylists();
    playlists.push(playlist);
    savePlaylists(playlists);
    return playlist;
  } catch { return null; }
}

// ============ HOST TRACKS ============
export function getHostTracks(): Track[] {
  const data = localStorage.getItem(HOST_TRACKS_KEY);
  return data ? JSON.parse(data) : [];
}
export function saveHostTracks(tracks: Track[]) { localStorage.setItem(HOST_TRACKS_KEY, JSON.stringify(tracks)); }

// ============ DEMO PLAYLISTS ============
export function createDemoPlaylists(adminId: string) {
  const existing = getPlaylists();
  if (existing.length > 0) return;
  const demoPlaylists: Omit<Playlist, 'id' | 'createdAt'>[] = [
    {
      name: '🎸 Хиты 90-х',
      description: 'Легендарные песни из золотой эры поп-музыки',
      tracks: [
        { id: uuidv4(), name: 'Smells Like Teen Spirit', artist: 'Nirvana', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Wonderwall', artist: 'Oasis', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Creep', artist: 'Radiohead', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: '...Baby One More Time', artist: 'Britney Spears', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Wannabe', artist: 'Spice Girls', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Barbie Girl', artist: 'Aqua', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'I Want It That Way', artist: 'Backstreet Boys', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Livin La Vida Loca', artist: 'Ricky Martin', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Blue (Da Ba Dee)', artist: 'Eiffel 65', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Believe', artist: 'Cher', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Genie in a Bottle', artist: 'Christina Aguilera', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Macarena', artist: 'Los Del Rio', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Tubthumping', artist: 'Chumbawamba', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'MMMBop', artist: 'Hanson', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Bitter Sweet Symphony', artist: 'The Verve', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'No Scrubs', artist: 'TLC', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Kiss Me', artist: 'Sixpence None the Richer', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Maria Maria', artist: 'Santana', fileUrl: '', fileName: '' },
      ],
      createdBy: adminId, isPublic: true, tags: ['90-е', 'поп', 'рок'],
    },
    {
      name: '🌟 Вечные хиты',
      description: 'Песни, которые знает каждый',
      tracks: [
        { id: uuidv4(), name: 'Bohemian Rhapsody', artist: 'Queen', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Hotel California', artist: 'Eagles', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Imagine', artist: 'John Lennon', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Billie Jean', artist: 'Michael Jackson', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Hey Jude', artist: 'The Beatles', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Stairway to Heaven', artist: 'Led Zeppelin', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: "Sweet Child O' Mine", artist: "Guns N' Roses", fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Dancing Queen', artist: 'ABBA', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Thriller', artist: 'Michael Jackson', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Yesterday', artist: 'The Beatles', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Purple Rain', artist: 'Prince', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Respect', artist: 'Aretha Franklin', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Let It Be', artist: 'The Beatles', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Born to Run', artist: 'Bruce Springsteen', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Like a Rolling Stone', artist: 'Bob Dylan', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: "What's Going On", artist: 'Marvin Gaye', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Smells Like Teen Spirit', artist: 'Nirvana', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'A Day in the Life', artist: 'The Beatles', fileUrl: '', fileName: '' },
      ],
      createdBy: adminId, isPublic: true, tags: ['классика', 'рок'],
    },
    {
      name: '🇷🇺 Русские хиты',
      description: 'Любимые песни на русском',
      tracks: [
        { id: uuidv4(), name: 'Группа крови', artist: 'Кино', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Перемен', artist: 'Кино', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Звезда по имени Солнце', artist: 'Кино', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Что такое осень', artist: 'ДДТ', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Районы-кварталы', artist: 'Звери', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Владивосток 2000', artist: 'Мумий Тролль', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Моя любовь', artist: 'Би-2', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Выхода нет', artist: 'Сплин', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Ресницы', artist: 'Земфира', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Батарейка', artist: 'Жанна Фриске', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Ла-ла-ла', artist: 'Руки Вверх', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Седая ночь', artist: 'Ласковый Май', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Белые розы', artist: 'Ласковый Май', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Нас не догонят', artist: 't.A.T.u.', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Полковнику никто не пишет', artist: 'Би-2', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Хочешь?', artist: 'Земфира', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Крошка моя', artist: 'Руки Вверх', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Всё идёт по плану', artist: 'Гражданская Оборона', fileUrl: '', fileName: '' },
      ],
      createdBy: adminId, isPublic: true, tags: ['русские', 'рок'],
    },
    {
      name: '🎉 Для вечеринки',
      description: 'Зажигательные треки для компании',
      tracks: [
        { id: uuidv4(), name: 'Dancing Queen', artist: 'ABBA', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'I Will Survive', artist: 'Gloria Gaynor', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'YMCA', artist: 'Village People', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: "Don't Stop Me Now", artist: 'Queen', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Uptown Funk', artist: 'Bruno Mars', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Happy', artist: 'Pharrell Williams', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Shake It Off', artist: 'Taylor Swift', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Blinding Lights', artist: 'The Weeknd', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Levitating', artist: 'Dua Lipa', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: "Don't Start Now", artist: 'Dua Lipa', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Watermelon Sugar', artist: 'Harry Styles', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Flowers', artist: 'Miley Cyrus', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Anti-Hero', artist: 'Taylor Swift', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'About Damn Time', artist: 'Lizzo', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'Physical', artist: 'Dua Lipa', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: 'As It Was', artist: 'Harry Styles', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: "Can't Stop the Feeling", artist: 'Justin Timberlake', fileUrl: '', fileName: '' },
        { id: uuidv4(), name: "Stayin' Alive", artist: 'Bee Gees', fileUrl: '', fileName: '' },
      ],
      createdBy: adminId, isPublic: true, tags: ['вечеринка', 'танцы'],
    },
  ];
  const playlists = demoPlaylists.map(p => ({ ...p, id: uuidv4(), createdAt: Date.now() }));
  savePlaylists(playlists);
}

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Smartphone, QrCode, Music, Users, Play, Crown } from 'lucide-react';

export default function HowToPlayPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          На главную
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Как играть в Музыкальное Лото</h1>
            <p className="text-white/60">Полная инструкция для хоста и игроков</p>
          </div>

          {/* Как открыть сайт */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-400" />
              Как открыть сайт
            </h2>
            
            <div className="space-y-4 text-white/80">
              <div>
                <p className="text-white font-semibold mb-2">Вариант 1: Локально (на своём компьютере)</p>
                <div className="bg-black/30 rounded-xl p-4 font-mono text-sm">
                  <p className="text-green-400"># 1. Скачайте проект</p>
                  <p className="text-white">git clone https://github.com/ВАШ_ЛОГИН/music-lotto.git</p>
                  <p className="text-white">cd music-lotto</p>
                  <p className="text-green-400 mt-2"># 2. Установите зависимости</p>
                  <p className="text-white">npm install</p>
                  <p className="text-green-400 mt-2"># 3. Запустите сервер</p>
                  <p className="text-white">npm run dev</p>
                  <p className="text-green-400 mt-2"># 4. Откройте в браузере:</p>
                  <p className="text-yellow-300">http://localhost:5173</p>
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Вариант 2: На GitHub Pages (для всех)</p>
                <ol className="text-white/70 space-y-2 text-sm">
                  <li>1. Создайте репозиторий на GitHub</li>
                  <li>2. Загрузите код (git push)</li>
                  <li>3. Настройте GitHub Actions (см. страницу "Инструкция по GitHub")</li>
                  <li>4. Сайт будет доступен по адресу: <code className="text-green-400">https://ВАШ_ЛОГИН.github.io/music-lotto/</code></li>
                </ol>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Вариант 3: Vercel / Netlify (проще всего)</p>
                <ol className="text-white/70 space-y-2 text-sm">
                  <li>1. Зарегистрируйтесь на <a href="https://vercel.com" className="text-blue-400 hover:underline">vercel.com</a> или <a href="https://netlify.com" className="text-blue-400 hover:underline">netlify.com</a></li>
                  <li>2. Подключите GitHub репозиторий</li>
                  <li>3. Автоматический деплой при каждом push</li>
                  <li>4. Получите бесплатную ссылку типа: <code className="text-green-400">music-lotto.vercel.app</code></li>
                </ol>
              </div>
            </div>
          </motion.div>

          {/* Как играть */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Как играть (пошагово)
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Хост входит как админ</p>
                  <p className="text-white/60 text-sm">Логин: <code className="text-purple-300">admin</code> / Пароль: <code className="text-purple-300">admin</code></p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Админ создаёт плейлисты</p>
                  <p className="text-white/60 text-sm">В панели админа добавьте треки (название + исполнитель) и загрузите аудио/видео файлы</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Хост создаёт игру</p>
                  <p className="text-white/60 text-sm">На главной нажмите "Создать игру" → выберите плейлист → получите код комнаты</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">4</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Игроки подключаются</p>
                  <p className="text-white/60 text-sm">
                    <Smartphone className="w-4 h-4 inline" /> На телефонах откройте сайт → "Присоединиться" → введите код<br/>
                    <QrCode className="w-4 h-4 inline" /> Или отсканируйте QR-код с экрана хоста
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">5</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Игра начинается!</p>
                  <p className="text-white/60 text-sm">
                    Хост включает треки в случайном порядке. <strong className="text-white">Название НЕ показывается!</strong><br/>
                    Игроки слушают и угадывают — находят трек в своей карточке и нажимают на него.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-yellow-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-400 font-bold">🏆</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Победа!</p>
                  <p className="text-white/60 text-sm">Кто первый закроет все 15 ячеек — победил!</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Как добавить клипы */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 backdrop-blur-md rounded-2xl p-6 border border-pink-500/20">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <Play className="w-6 h-6 text-pink-400" />
              Как добавить клипы (видео)
            </h2>
            
            <div className="space-y-3 text-white/80">
              <p className="text-white font-semibold">Для админа (создание плейлиста):</p>
              <ol className="text-white/70 space-y-2 text-sm">
                <li>1. В панели админа создайте новый плейлист</li>
                <li>2. Добавьте треки (название + исполнитель)</li>
                <li>3. Сохраните плейлист</li>
              </ol>

              <p className="text-white font-semibold mt-4">Для хоста (во время игры):</p>
              <ol className="text-white/70 space-y-2 text-sm">
                <li>1. Создайте игру и выберите плейлист</li>
                <li>2. В списке треков нажмите <span className="text-pink-400">«Видео»</span></li>
                <li>3. Выберите видеофайлы (MP4, WebM, MOV)</li>
                <li>4. Или для конкретного трека нажмите <span className="text-blue-400">«+файл»</span></li>
                <li>5. При воспроизведении клип покажется на большом экране!</li>
              </ol>

              <div className="bg-black/30 rounded-xl p-3 mt-4">
                <p className="text-yellow-300 text-sm font-semibold mb-1">💡 Подсказка:</p>
                <p className="text-white/60 text-xs">
                  Можно загружать и аудио (MP3), и видео (MP4) для разных треков.<br/>
                  Видео покажется на экране хоста, а игроки будут слышать звук и видеть клип!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Особенности */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">✨ Особенности игры</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white font-semibold mb-2">🎵 Слепое угадывание</p>
                <p className="text-white/60">Название трека НЕ показывается игрокам — они должны угадать на слух!</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white font-semibold mb-2">👁️ Показать ответ</p>
                <p className="text-white/60">Хост может нажать "Показать ответ" чтобы раскрыть название после угадывания</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white font-semibold mb-2">🎬 Поддержка клипов</p>
                <p className="text-white/60">Можно загружать видео — клип покажется на большом экране</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white font-semibold mb-2">📱 Мобильные карточки</p>
                <p className="text-white/60">Каждый игрок получает уникальную карточку на своём телефоне</p>
              </div>
            </div>
          </motion.div>

          {/* Системные требования */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">⚙️ Требования</h2>
            
            <div className="text-white/70 text-sm space-y-2">
              <p>• <strong className="text-white">Браузер:</strong> Chrome, Firefox, Safari, Edge (последние версии)</p>
              <p>• <strong className="text-white">Интернет:</strong> нужен для P2P соединения (PeerJS)</p>
              <p>• <strong className="text-white">HTTPS:</strong> обязательно для работы WebRTC (GitHub Pages предоставляет автоматически)</p>
              <p>• <strong className="text-white">Устройства:</strong> хост — компьютер/планшет, игроки — телефоны/планшеты</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

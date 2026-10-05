import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, Settings, Globe, Key, Code, Rocket, FolderGit2 } from 'lucide-react';

export default function GitHubGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          На главную
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl mb-4">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Создание репозитория на GitHub</h1>
            <p className="text-white/60">Пошаговая инструкция для публикации проекта</p>
          </div>

          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <h2 className="text-white text-xl font-bold">Создание нового репозитория</h2>
            </div>
            
            <div className="space-y-3 text-white/80">
              <p>Перейдите на <a href="https://github.com/new" target="_blank" className="text-blue-400 hover:underline">github.com/new</a></p>
              
              <div className="bg-black/30 rounded-xl p-4 space-y-3">
                <div className="space-y-2">
                  <p className="text-white font-semibold">📝 Repository name:</p>
                  <code className="text-green-400 bg-black/50 px-3 py-1 rounded">music-lotto</code>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white font-semibold">📄 Description (описание):</p>
                  <code className="text-green-400 bg-black/50 px-3 py-1 rounded text-sm">Музыкальное лото — мультиплеерная игра с загрузкой своей музыки</code>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white font-semibold">🔒 Public / Private:</p>
                  <p className="text-white/70">Выберите <span className="text-green-400 font-semibold">Public</span> (публичный) — если хотите поделиться, или <span className="text-yellow-400 font-semibold">Private</span> (приватный) — для личного использования.</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white font-semibold">✅ Initialize this repository with:</p>
                  <ul className="text-white/70 space-y-1 ml-4">
                    <li>☑️ <span className="text-white">Add a README file</span> — обязательно</li>
                    <li>☐ Add .gitignore — можно выбрать <code className="text-purple-300">Node</code></li>
                    <li>☐ Choose a license — опционально (MIT)</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <h2 className="text-white text-xl font-bold">Настройки репозитория</h2>
            </div>
            
            <div className="space-y-3 text-white/80">
              <p>После создания перейдите в <span className="text-white font-semibold">Settings</span> репозитория:</p>
              
              <div className="bg-black/30 rounded-xl p-4 space-y-4">
                <div>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> Pages (GitHub Pages)
                  </p>
                  <p className="text-white/70 text-sm mt-1">Для деплоя как веб-сайт:</p>
                  <ul className="text-white/60 text-sm ml-4 mt-1 space-y-1">
                    <li>• Source: <code className="text-purple-300">GitHub Actions</code></li>
                    <li>• Или: <code className="text-purple-300">Deploy from a branch</code> → branch <code className="text-purple-300">main</code> → folder <code className="text-purple-300">/dist</code></li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-yellow-400" /> General
                  </p>
                  <ul className="text-white/60 text-sm ml-4 mt-1 space-y-1">
                    <li>• Features: ☑️ Issues, ☑️ Projects, ☑️ Discussions</li>
                    <li>• Default branch: <code className="text-purple-300">main</code></li>
                  </ul>
                </div>

                <div>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4 text-green-400" /> Secrets and variables → Actions
                  </p>
                  <p className="text-white/70 text-sm mt-1">Если нужен бэкенд — добавьте секретные ключи здесь</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 font-bold">3</span>
              </div>
              <h2 className="text-white text-xl font-bold">Загрузка кода</h2>
            </div>
            
            <div className="space-y-3 text-white/80">
              <p>Откройте терминал и выполните:</p>
              
              <div className="bg-black/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <div className="space-y-2">
                  <p className="text-green-400"># Клонируем репозиторий</p>
                  <p className="text-white">git clone https://github.com/ВАШ_ЛОГИН/music-lotto.git</p>
                  <p className="text-white">cd music-lotto</p>
                  <p className="text-green-400 mt-3"># Копируем файлы проекта в папку</p>
                  <p className="text-white"># (скопируйте все файлы проекта сюда)</p>
                  <p className="text-green-400 mt-3"># Добавляем и коммитим</p>
                  <p className="text-white">git add .</p>
                  <p className="text-white">git commit -m "Initial commit: Музыкальное лото"</p>
                  <p className="text-white">git push origin main</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-orange-400 font-bold">4</span>
              </div>
              <h2 className="text-white text-xl font-bold">Деплой (GitHub Actions)</h2>
            </div>
            
            <div className="space-y-3 text-white/80">
              <p>Создайте файл <code className="text-purple-300">.github/workflows/deploy.yml</code>:</p>
              
              <div className="bg-black/50 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-white/90">{`name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      
      - run: npm ci
      - run: npm run build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      
      - uses: actions/deploy-pages@v4`}</pre>
              </div>
              
              <p className="text-white/60 text-sm">После push — сайт будет доступен по адресу:</p>
              <code className="text-green-400 bg-black/30 px-3 py-2 rounded block">
                https://ВАШ_ЛОГИН.github.io/music-lotto/
              </code>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <span className="text-pink-400 font-bold">5</span>
              </div>
              <h2 className="text-white text-xl font-bold">Итого: что выставить при создании</h2>
            </div>
            
            <div className="bg-black/30 rounded-xl p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/60 border-b border-white/10">
                    <th className="text-left py-2">Настройка</th>
                    <th className="text-left py-2">Значение</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">Repository name</td>
                    <td className="py-2"><code className="text-green-400">music-lotto</code></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">Description</td>
                    <td className="py-2">Музыкальное лото — мультиплеерная игра с плейлистами</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">Visibility</td>
                    <td className="py-2"><span className="text-green-400">Public</span> (для GitHub Pages)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">Initialize with README</td>
                    <td className="py-2"><span className="text-green-400">✅ Да</span></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">.gitignore</td>
                    <td className="py-2"><code className="text-purple-300">Node</code></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">License</td>
                    <td className="py-2"><code className="text-purple-300">MIT</code> (опционально)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 text-white/60">Default branch</td>
                    <td className="py-2"><code className="text-purple-300">main</code></td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white/60">Pages → Source</td>
                    <td className="py-2"><code className="text-purple-300">GitHub Actions</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* System Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/20"
          >
            <h2 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              Система авторизации и плейлисты
            </h2>
            <div className="text-white/70 space-y-3">
              <div>
                <p className="text-white font-semibold mb-1">🔐 Роли пользователей:</p>
                <ul className="text-white/60 text-sm space-y-1 ml-4">
                  <li>• <span className="text-yellow-400 font-semibold">Админ</span> — создаёт и управляет плейлистами</li>
                  <li>• <span className="text-blue-400 font-semibold">Игрок</span> — выбирает плейлист и играет</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">👑 Демо-аккаунт админа:</p>
                <code className="text-green-400 bg-black/30 px-3 py-1 rounded block text-sm">
                  Логин: admin / Пароль: admin
                </code>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">🎵 Предустановленные плейлисты:</p>
                <ul className="text-white/60 text-sm space-y-1 ml-4">
                  <li>• 🎸 Хиты 90-х</li>
                  <li>• 🌟 Вечные хиты</li>
                  <li>• 🇷🇺 Русские хиты</li>
                  <li>• 🎉 Для вечеринки</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">💾 Хранение данных:</p>
                <p className="text-white/60 text-sm">Плейлисты и аккаунты хранятся в localStorage браузера. Можно экспортировать/импортировать плейлисты в JSON.</p>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20"
          >
            <h2 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-400" />
              Полезные советы
            </h2>
            <ul className="text-white/70 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Для PeerJS связи нужен HTTPS — GitHub Pages предоставляет его автоматически ✅
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Если нужен свой бэкенд — используйте Vercel, Railway или Render (бесплатные тарифы)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Для хранения плейлистов можно использовать localStorage или Firebase
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Добавьте файл <code className="text-purple-300">vite.config.ts</code> с <code className="text-purple-300">base: '/music-lotto/'</code> для корректной работы на GitHub Pages
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

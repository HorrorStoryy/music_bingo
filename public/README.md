# 🎵 Музыкальное Лото — Музыкальная игра с друзьями

Мультиплеерная веб-игра "Музыкальное лото" с загрузкой своей музыки через ссылки (Google Drive, YouTube).

## 🎮 Как играть

1. **Админ** создаёт плейлисты с треками (через ссылки)
2. **Хост** создаёт комнату и выбирает плейлист
3. **Игроки** подключаются по коду или QR-коду на своих телефонах
4. Хост включает треки в случайном порядке (название НЕ показывается!)
5. Игроки слушают и отмечают треки в своих карточках
6. Кто первый закроет все 15 ячеек — **победил!** 🎉

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 🌐 Деплой на Vercel

### Шаг 1: Создайте репозиторий на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/music-lotto.git
git push -u origin main
```

### Шаг 2: Создайте файл `vercel.json` в корне репозитория

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Шаг 3: Деплой на Vercel

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Импортируйте ваш GitHub репозиторий
4. Vercel автоматически определит Vite проект
5. Нажмите **"Deploy"**

Готово! Сайт будет доступен по адресу: `https://music-lotto.vercel.app`

### Альтернатива: GitHub Pages

Если хотите использовать GitHub Pages вместо Vercel:

1. Добавьте в `vite.config.ts`:
```ts
export default defineConfig({
  plugins: [react()],
  base: '/music-lotto/', // имя вашего репозитория
})
```

2. Создайте `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

3. В настройках репозитория: **Settings → Pages → Source: GitHub Actions**

## 📱 Технологии

- **React** + **TypeScript** — UI
- **Tailwind CSS** — стили (Polaroid / плёночная фотография)
- **PeerJS** — P2P связь между устройствами (WebRTC)
- **Framer Motion** — анимации
- **Vite** — сборка

## 🔒 Приватность

- Вся музыка хранится локально в браузере (localStorage)
- PeerJS использует публичный signaling сервер для установки P2P соединения
- После установки соединения данные передаются напрямую между устройствами
- Никакой серверной части — всё работает в браузере!

## 📋 Структура проекта

```
src/
├── App.tsx              — Роутинг
├── types.ts             — TypeScript типы
├── contexts/
│   └── AuthContext.tsx  — Контекст авторизации
├── pages/
│   ├── LoginPage.tsx    — Вход / регистрация
│   ├── HomePage.tsx     — Главная (выбор плейлиста)
│   ├── HostPage.tsx     — Хост (управление игрой)
│   ├── PlayerPage.tsx   — Игрок (карточка лото)
│   ├── AdminPage.tsx    — Админ (управление плейлистами)
│   ├── HowToPlayPage.tsx — Инструкция
│   └── GitHubGuidePage.tsx — Инструкция по GitHub
├── components/
│   ├── LottoCard.tsx    — Компонент карточки лото
│   ├── FilmOverlay.tsx  — Эффекты плёночной фотографии
│   └── SilentFilmTitleCard.tsx — Polaroid-титры
├── hooks/
│   └── usePeer.ts       — PeerJS хуки для P2P связи
└── utils/
    ├── gameUtils.ts     — Утилиты игры
    ├── storage.ts       — Работа с localStorage
    └── mediaParser.ts   — Парсинг ссылок (Google Drive, YouTube)
```

## 🎨 Дизайн

Дизайн выполнен в стиле **Polaroid / плёночной фотографии**:
- Светлый кремовый фон
- Белые карточки с мягкими тенями
- Мягкая зернистость плёнки
- Лёгкие засветы (light leaks)
- Тёплая цветовая палитра
- Рукописные шрифты

## 📝 Лицензия

MIT

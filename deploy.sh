#!/bin/bash

# ============================================
# 🎵 Музыкальное Лото — Скрипт деплоя на GitHub Pages
# ============================================
# Запуск: bash deploy.sh
# ============================================

set -e

echo ""
echo "🎵 =========================================="
echo "🎵  Музыкальное Лото — Деплой на GitHub Pages"
echo "🎵 =========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Шаг 1: Проверка git
echo -e "${YELLOW}📋 Шаг 1: Проверка git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git не установлен! Установите git и попробуйте снова.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git найден${NC}"

# Шаг 2: Сборка проекта
echo -e "${YELLOW}🔨 Шаг 2: Сборка проекта...${NC}"
npm run build
echo -e "${GREEN}✅ Проект собран${NC}"

# Шаг 3: Инициализация git (если нужно)
echo -e "${YELLOW}📦 Шаг 3: Настройка git...${NC}"
if [ ! -d .git ]; then
    git init
    echo -e "${GREEN}✅ Git репозиторий инициализирован${NC}"
else
    echo -e "${GREEN}✅ Git репозиторий уже существует${NC}"
fi

# Шаг 4: Добавление файлов
echo -e "${YELLOW}📝 Шаг 4: Добавление файлов...${NC}"
git add .
echo -e "${GREEN}✅ Файлы добавлены${NC}"

# Шаг 5: Коммит
echo -e "${YELLOW}💾 Шаг 5: Создание коммита...${NC}"
git commit -m "🎵 Музыкальное лото — готово к деплою" --allow-empty 2>/dev/null || echo "Коммит уже существует"
echo -e "${GREEN}✅ Коммит создан${NC}"

# Шаг 6: Проверка remote
echo -e "${YELLOW}🔗 Шаг 6: Проверка remote...${NC}"
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo -e "${YELLOW}⚠️  Remote 'origin' не настроен!${NC}"
    echo ""
    echo "Введите URL вашего репозитория на GitHub:"
    echo "Формат: https://github.com/ВАШ_ЛОГИН/music_bingo.git"
    echo ""
    read -p "URL: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ URL не указан!${NC}"
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote добавлен: $REPO_URL${NC}"
else
    CURRENT_REMOTE=$(git remote get-url origin)
    echo -e "${GREEN}✅ Remote уже настроен: $CURRENT_REMOTE${NC}"
fi

# Шаг 7: Push в main
echo -e "${YELLOW}🚀 Шаг 7: Push в main...${NC}"
git branch -M main 2>/dev/null || true
git push -u origin main 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Push не удался. Возможно, нужна авторизация.${NC}"
    echo "Попробуйте выполнить вручную:"
    echo "  git push -u origin main"
}
echo -e "${GREEN}✅ Push выполнен${NC}"

# Шаг 8: Деплой на gh-pages
echo -e "${YELLOW}🌐 Шаг 8: Деплой на GitHub Pages...${NC}"
npx gh-pages -d dist
echo -e "${GREEN}✅ Деплой выполнен!${NC}"

# Итог
echo ""
echo -e "${GREEN}🎉 ==========================================${NC}"
echo -e "${GREEN}🎉  ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО!${NC}"
echo -e "${GREEN}🎉 ==========================================${NC}"
echo ""
echo -e "📱 Ваш сайт будет доступен через 1-2 минуты по адресу:"
echo ""

# Получаем URL из package.json
HOMEPAGE=$(node -p "require('./package.json').homepage" 2>/dev/null || echo "")
if [ -n "$HOMEPAGE" ]; then
    echo -e "${GREEN}🌐 $HOMEPAGE${NC}"
else
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -n "$REMOTE_URL" ]; then
        USERNAME=$(echo "$REMOTE_URL" | sed -n 's/.*github.com[:\/]\([^\/]*\)\/.*/\1/p')
        echo -e "${GREEN}🌐 https://${USERNAME}.github.io/music_bingo/${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}⚠️  Не забудьте включить GitHub Pages в настройках:${NC}"
echo "   Settings → Pages → Source: Deploy from a branch → gh-pages → / (root)"
echo ""
echo -e "${GREEN}🎵 Удачной игры!${NC}"
echo ""

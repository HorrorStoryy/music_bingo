export interface ParsedMedia {
  type: 'video' | 'audio' | 'youtube' | 'gdrive-video' | 'gdrive-audio' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  fileId?: string;
  displayType: 'iframe' | 'audio' | 'video';
}

/**
 * Извлекает ID файла из ссылки Google Drive
 * Поддерживает форматы:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/preview
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/.*/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Извлекает ID видео из ссылки YouTube
 * Поддерживает форматы:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Определяет тип медиа по расширению файла в URL
 */
function detectTypeByExtension(url: string): 'audio' | 'video' | null {
  const cleanUrl = url.split('?')[0].toLowerCase();
  
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  
  for (const ext of audioExtensions) {
    if (cleanUrl.endsWith(ext)) return 'audio';
  }
  for (const ext of videoExtensions) {
    if (cleanUrl.endsWith(ext)) return 'video';
  }
  return null;
}

/**
 * Главная функция парсинга медиа-ссылок.
 * Автоматически определяет тип ссылки и возвращает готовый embed URL.
 */
export function parseMediaLink(url: string, forcedType?: 'audio' | 'video'): ParsedMedia {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return {
      type: 'unknown',
      embedUrl: '',
      originalUrl: '',
      displayType: 'audio',
    };
  }
  
  // 1. Проверяем YouTube
  const youtubeId = extractYouTubeId(trimmedUrl);
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`,
      originalUrl: trimmedUrl,
      fileId: youtubeId,
      displayType: 'iframe',
    };
  }
  
  // 2. Проверяем Google Drive
  const gdriveId = extractGoogleDriveId(trimmedUrl);
  if (gdriveId) {
    const type = forcedType || 'video'; // По умолчанию видео для Google Drive
    
    if (type === 'video') {
      return {
        type: 'gdrive-video',
        embedUrl: `https://drive.google.com/file/d/${gdriveId}/preview`,
        originalUrl: trimmedUrl,
        fileId: gdriveId,
        displayType: 'iframe',
      };
    } else {
      return {
        type: 'gdrive-audio',
        embedUrl: `https://drive.google.com/uc?export=download&id=${gdriveId}`,
        originalUrl: trimmedUrl,
        fileId: gdriveId,
        displayType: 'audio',
      };
    }
  }
  
  // 3. Проверяем прямую ссылку по расширению
  const detectedType = detectTypeByExtension(trimmedUrl);
  if (detectedType === 'audio') {
    return {
      type: 'audio',
      embedUrl: trimmedUrl,
      originalUrl: trimmedUrl,
      displayType: 'audio',
    };
  }
  if (detectedType === 'video') {
    return {
      type: 'video',
      embedUrl: trimmedUrl,
      originalUrl: trimmedUrl,
      displayType: 'video',
    };
  }
  
  // 4. Fallback — используем принудительный тип или определяем по iframe-способности
  if (forcedType === 'audio') {
    return {
      type: 'audio',
      embedUrl: trimmedUrl,
      originalUrl: trimmedUrl,
      displayType: 'audio',
    };
  }
  
  // По умолчанию считаем видео (iframe)
  return {
    type: 'video',
    embedUrl: trimmedUrl,
    originalUrl: trimmedUrl,
    displayType: 'iframe',
  };
}

/**
 * Возвращает человекочитаемое описание типа ссылки
 */
export function getMediaLinkDescription(url: string): string {
  if (!url.trim()) return '';
  
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) return '📺 YouTube видео';
  
  const gdriveId = extractGoogleDriveId(url);
  if (gdriveId) return '☁️ Google Drive';
  
  const detectedType = detectTypeByExtension(url);
  if (detectedType === 'audio') return '🎵 Аудиофайл';
  if (detectedType === 'video') return '🎬 Видеофайл';
  
  return '🔗 Внешняя ссылка';
}

/**
 * Проверяет валидность URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
}

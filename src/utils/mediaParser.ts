export interface ParsedMedia {
  type: 'video' | 'audio' | 'youtube' | 'gdrive-video' | 'gdrive-audio' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  fileId?: string;
  displayType: 'iframe' | 'audio' | 'video';
}

function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectTypeByExtension(url: string): 'audio' | 'video' | null {
  const cleanUrl = url.split('?')[0].toLowerCase();
  const audioExt = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  const videoExt = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  for (const ext of audioExt) if (cleanUrl.endsWith(ext)) return 'audio';
  for (const ext of videoExt) if (cleanUrl.endsWith(ext)) return 'video';
  return null;
}

export function parseMediaLink(url: string, forcedType?: 'audio' | 'video'): ParsedMedia {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return { type: 'unknown', embedUrl: '', originalUrl: '', displayType: 'audio' };
  
  const youtubeId = extractYouTubeId(trimmedUrl);
  if (youtubeId) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`, originalUrl: trimmedUrl, fileId: youtubeId, displayType: 'iframe' };
  }
  
  const gdriveId = extractGoogleDriveId(trimmedUrl);
  if (gdriveId) {
    const type = forcedType || 'video';
    if (type === 'video') {
      return { type: 'gdrive-video', embedUrl: `https://drive.google.com/file/d/${gdriveId}/preview`, originalUrl: trimmedUrl, fileId: gdriveId, displayType: 'iframe' };
    } else {
      return { type: 'gdrive-audio', embedUrl: `https://drive.google.com/uc?export=download&id=${gdriveId}`, originalUrl: trimmedUrl, fileId: gdriveId, displayType: 'audio' };
    }
  }
  
  const detectedType = detectTypeByExtension(trimmedUrl);
  if (detectedType === 'audio') return { type: 'audio', embedUrl: trimmedUrl, originalUrl: trimmedUrl, displayType: 'audio' };
  if (detectedType === 'video') return { type: 'video', embedUrl: trimmedUrl, originalUrl: trimmedUrl, displayType: 'video' };
  
  if (forcedType === 'audio') return { type: 'audio', embedUrl: trimmedUrl, originalUrl: trimmedUrl, displayType: 'audio' };
  return { type: 'video', embedUrl: trimmedUrl, originalUrl: trimmedUrl, displayType: 'iframe' };
}

export function getMediaLinkDescription(url: string): string {
  if (!url.trim()) return '';
  if (extractYouTubeId(url)) return '📺 YouTube видео';
  if (extractGoogleDriveId(url)) return '☁️ Google Drive';
  const detectedType = detectTypeByExtension(url);
  if (detectedType === 'audio') return '🎵 Аудиофайл';
  if (detectedType === 'video') return '🎬 Видеофайл';
  return '🔗 Внешняя ссылка';
}

export function isValidUrl(url: string): boolean {
  try { new URL(url.trim()); return true; } catch { return false; }
}

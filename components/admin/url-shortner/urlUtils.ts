import { ShortenedLink } from './UrlShortnerIndex';

export const generateShortCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const addHttpsPrefix = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export const normalizeUrl = (url: string): string => {
  // Add https:// prefix if missing
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  
  try {
    // Create URL object to parse and normalize components
    const urlObj = new URL(normalized);
    
    // Remove trailing slashes
    let pathname = urlObj.pathname;
    while (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    
    // Remove default ports
    const port = (urlObj.protocol === 'https:' && urlObj.port === '443') || 
                (urlObj.protocol === 'http:' && urlObj.port === '80') 
                ? '' : urlObj.port;
    
    // Reconstruct the URL with normalized components
    const normalizedUrl = `${urlObj.protocol}//${urlObj.hostname}${port ? ':' + port : ''}${pathname}${urlObj.search}${urlObj.hash}`;
    return normalizedUrl.toLowerCase();
  } catch (error) {
    // If URL parsing fails, return the original with https prefix
    console.error('URL normalization error:', error);
    return normalized.toLowerCase();
  }
};

export const isLinkExpired = (link: ShortenedLink): boolean => {
  if (!link.expiresAt) return false;
  return new Date() > new Date(link.expiresAt);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getDaysUntilExpiration = (expiresAt: Date | null): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export const downloadMediaFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export const shareMediaFile = async (url: string, filename: string, type: string) => {
  try {
    // First try sharing the URL if it's publicly accessible
    if (navigator.share) {
      try {
        await navigator.share({
          title: filename,
          text: 'Check out this file',
          url: url
        });
        return;
      } catch (error: any) {
        if (error?.name !== 'NotAllowedError') {
          console.warn('URL sharing failed, falling back to file sharing:', error);
        } else {
          throw error; // Re-throw if user cancelled
        }
      }
    }

    // If URL sharing fails or isn't supported, try file sharing
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Share Media',
        text: 'Sharing from Gallery'
      });
    } else {
      // Fallback for browsers that don't support sharing
      throw new Error('Sharing is not supported on this browser');
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
};

import { format } from 'date-fns';

/**
 * Adds a timestamp overlay to an image file
 * @param file - The image file to process
 * @param timestamp - The timestamp to overlay (defaults to current time)
 * @returns Promise<File> - The processed image file with timestamp overlay
 */
export const addTimestampToImage = async (
  file: File, 
  timestamp: Date = new Date()
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    
    const originalOnLoad = () => {
      try {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Configure timestamp text style
        const fontSize = Math.max(img.width * 0.03, 20); // Responsive font size
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        // Format timestamp
        const timestampText = format(timestamp, 'yyyy-MM-dd HH:mm:ss');
        
        // Calculate text position (bottom-right corner with padding)
        const padding = 20;
        const textMetrics = ctx.measureText(timestampText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        const x = img.width - textWidth - padding;
        const y = img.height - padding;

        // Draw background rectangle for better readability
        ctx.fillRect(x - 10, y - textHeight - 5, textWidth + 20, textHeight + 15);

        // Draw timestamp text
        ctx.fillStyle = 'white';
        ctx.fillText(timestampText, x, y);

        // Convert canvas to blob and create new file
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, file.type, 0.9); // 90% quality
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onload = originalOnLoad;
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
};

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns boolean - True if valid image, false otherwise
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};

/**
 * Generates a unique transaction ID
 * @returns string - Unique transaction ID
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * Formats file size to human readable format
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validates phone number format
 * @param phone - Phone number string
 * @returns boolean - True if valid format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

/**
 * Validates email format
 * @param email - Email string
 * @returns boolean - True if valid format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats date to display format
 * @param date - Date object or string
 * @returns string - Formatted date string
 */
export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

/**
 * Gets initials from a name
 * @param name - Full name string
 * @returns string - Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
// src/services/media.js
//
// Service for image optimization and management
// Streamlined implementation for handling media uploads and optimizations

import { supabase } from '../lib/supabase';

class MediaService {
  constructor() {
    // Supported file types and size limit
    this.supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} - Validation result
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, message: 'No file provided' };
    }
    
    // Check file type
    if (!this.supportedTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: 'Unsupported file type. Please upload a JPEG, PNG, GIF, or WebP image.' 
      };
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        message: 'File size exceeds the 5MB limit.' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Get public URL for a storage path
   * @param {string} bucket - Storage bucket
   * @param {string} path - File path
   * @returns {string} - Public URL
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Upload a profile image
   * @param {string} userId - User ID
   * @param {File} file - Image file
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  async uploadProfileImage(userId, file) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload to 'avatars' bucket
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) throw error;
      
      // Return public URL
      return this.getPublicUrl('avatars', filePath);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  /**
   * Upload a post image
   * @param {string} userId - User ID
   * @param {File} file - Image file
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  async uploadPostImage(userId, file) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload to 'posts' bucket
      const { error } = await supabase.storage
        .from('posts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Return public URL
      return this.getPublicUrl('posts', filePath);
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw error;
    }
  }

  /**
   * Get initials from a name (for avatar fallbacks)
   * @param {string} name - Full name
   * @returns {string} - Initials (max 2 characters)
   */
  getInitials(name) {
    if (!name) return 'U';
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Generate a color from a string (for consistent avatar colors)
   * @param {string} str - String to hash (e.g., username)
   * @returns {string} - Hex color code
   */
  generateColorFromString(str) {
    if (!str) return '#0ea5e9'; // Default color
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#0ea5e9', // cyan-500
      '#3b82f6', // blue-500
      '#a855f7', // purple-500
      '#ec4899', // pink-500
      '#f43f5e', // rose-500
      '#ef4444', // red-500
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#14b8a6', // teal-500
    ];
    
    // Use the hash to pick a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Generate a placeholder SVG data URI for when images fail to load
   * @param {string} initials - Text to display (usually initials)
   * @param {string} bgColor - Background color
   * @param {number} size - Image size
   * @returns {string} - Data URI
   */
  generatePlaceholderDataUri(initials = 'U', bgColor = '#0ea5e9', size = 200) {
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${bgColor}" />
        <text x="50%" y="50%" dy=".1em" 
              font-family="Arial, sans-serif" 
              font-size="${size / 2.5}px" 
              fill="white" 
              text-anchor="middle" 
              dominant-baseline="middle">
          ${initials}
        </text>
      </svg>
    `;
    
    // Convert SVG to data URI
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate a placeholder for a post image
   * @returns {string} - Data URI placeholder image
   */
  getPostPlaceholder() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1350' viewBox='0 0 1080 1350'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23111827' stop-opacity='1' /%3E%3Cstop offset='100%25' stop-color='%23374151' stop-opacity='1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1080' height='1350' fill='url(%23grad)' /%3E%3C/svg%3E";
  }

  /**
   * Delete a file from storage
   * @param {string} bucket - Storage bucket
   * @param {string} path - File path
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(bucket, path) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const mediaService = new MediaService();
export default mediaService;
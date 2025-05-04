// src/pages/CreatePage.jsx
//
// Completely redesigned CreatePage with premium aesthetics
// Features elegant upload experience, intuitive interface, and smooth transitions

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/CardComponents';
import Button from '../components/ui/FormComponents';
import Avatar from '../components/ui/Avatar';
import { pageTransitions } from '../styles/animations';

/**
 * UploadArea Component - Elegant file upload area
 * 
 * Provides both drag-and-drop and click-to-browse functionality
 */
const UploadArea = ({ onImageSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }
      
      onImageSelect(file);
    }
  }, [onImageSelect, disabled]);
  
  // Handle file input change
  const handleChange = useCallback((e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }
      
      onImageSelect(file);
    }
  }, [onImageSelect, disabled]);
  
  // Trigger file input click
  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);
  
  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${dragActive 
          ? 'border-cyan-400/50 bg-cyan-400/5' 
          : 'border-white/20 hover:border-white/30 bg-white/5'
        }
      `}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center">
        <motion.div 
          animate={{ 
            y: dragActive ? -10 : 0,
            scale: dragActive ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </motion.div>
        
        <h3 className="text-white font-medium mb-2">
          {dragActive ? 'Drop image here' : 'Upload Image'}
        </h3>
        
        <p className="text-white/60 text-sm mb-4 max-w-sm mx-auto">
          Drag and drop your image here, or click to browse. Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
        </p>
        
        <Button 
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick();
          }}
          disabled={disabled}
        >
          Browse Files
        </Button>
      </div>
    </div>
  );
};

/**
 * ImagePreview Component - Elegant image preview
 * 
 * Displays selected image with removal option
 */
const ImagePreview = ({ imageUrl, onRemove, disabled }) => {
  return (
    <div className="relative rounded-xl overflow-hidden bg-black/20">
      <div className="transition-transform duration-200 hover:scale-[1.02]">
        <img 
          src={imageUrl} 
          alt="Post preview" 
          className="w-full object-contain max-h-[400px]"
        />
      </div>
      
      {!disabled && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

/**
 * CreatePage Component
 * 
 * Premium content creation experience:
 * - Elegant upload interaction
 * - Real-time preview
 * - Intuitive creation flow
 * - Smooth transitions between steps
 */
const CreatePage = () => {
  // Auth context and navigation
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [charCount, setCharCount] = useState(0);
  
  // Upload state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Character limits
  const MAX_CHARS = 500;
  
  // Handle caption change with character limit
  const handleCaptionChange = useCallback((e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setCaption(text);
      setCharCount(text.length);
    }
  }, []);
  
  // Handle image upload
  const handleImageUpload = useCallback((file) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);
  
  // Handle image removal
  const handleImageRemove = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview('');
  }, [imagePreview]);
  
  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);
  
  // Upload image to Supabase storage
  const uploadImage = async (file) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload file to the 'posts' bucket
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  // Simulate progress updates for better UX during uploads
  const simulateProgress = (callback) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) {
        progress = 90; // Cap at 90% until actual completion
        clearInterval(interval);
      }
      setUploadProgress(Math.min(Math.round(progress), 90));
    }, 300);
    
    return {
      complete: () => {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          callback?.();
        }, 500);
      },
      cancel: () => {
        clearInterval(interval);
        setUploadProgress(0);
      }
    };
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate input
    if (!caption.trim() && !image) {
      setError('Please add a caption or an image');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    // Simulate progress updates
    const progress = simulateProgress(() => {
      navigate('/home');
    });
    
    try {
      let imageUrl = null;
      
      // Upload image if exists
      if (image) {
        try {
          imageUrl = await uploadImage(image);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          progress.cancel();
          setError('Failed to upload image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare post data
      const postData = {
        user_id: user.id,
        caption: caption.trim(),
        image_url: imageUrl,
        location: location.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Create post in database
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select();
      
      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }
      
      // Complete the progress simulation
      progress.complete();
      
      // Clean up object URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      progress.cancel();
      setError(`Failed to create post: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };
  
  // Parse hashtags in content for preview mode
  const renderContent = useCallback((text) => {
    if (!text) return '';
    
    // Regular expression to match hashtags
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    
    // Split content by hashtags
    const parts = text.split(hashtagRegex);
    
    // Find all hashtags
    const hashtags = text.match(hashtagRegex) || [];
    
    // Combine parts and hashtags
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {hashtags[index] && (
          <span className="text-cyan-400">{hashtags[index]}</span>
        )}
      </React.Fragment>
    ));
  }, []);
  
  return (
    <AppLayout>
      
      <motion.div 
        className="max-w-3xl mx-auto"
        variants={pageTransitions}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white">Create Post</h1>
          <p className="text-white/60">
            Share your university experience with the community
          </p>
        </motion.div>
        
        {/* Main content card */}
        <Card className="mb-6">
          {/* Tab navigation */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setPreviewMode(false)}
              className={`
                relative px-6 py-4 text-sm font-medium transition-colors duration-300
                ${!previewMode ? 'text-white' : 'text-white/50 hover:text-white/80'}
              `}
              disabled={isSubmitting}
            >
              Create
              {!previewMode && (
                <motion.div
                  layoutId="activeCreateTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                />
              )}
            </button>
            
            <button
              onClick={togglePreview}
              className={`
                relative px-6 py-4 text-sm font-medium transition-colors duration-300
                ${previewMode ? 'text-white' : 'text-white/50 hover:text-white/80'}
              `}
              disabled={(!caption && !imagePreview) || isSubmitting}
            >
              Preview
              {previewMode && (
                <motion.div
                  layoutId="activeCreateTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                />
              )}
            </button>
          </div>
          
          {/* Content area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
              
              {/* Create mode */}
              {!previewMode ? (
                <motion.div
                  key="create-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* User info - adds context to the creation experience */}
                  <div className="flex items-center mb-6">
                    <Avatar 
                      src={profile?.avatar_url} 
                      name={profile?.full_name || 'User'}
                      size="md"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-white/50">@{profile?.username || 'username'}</p>
                    </div>
                  </div>
                  
                  {/* Caption input field */}
                  <div className="mb-4">
                    <label htmlFor="caption" className="block text-sm font-medium text-white/80 mb-1">
                      Caption
                    </label>
                    <textarea
                      id="caption"
                      value={caption}
                      onChange={handleCaptionChange}
                      placeholder="What's happening on campus?"
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-white/50">
                        Try adding #hashtags to categorize your post
                      </p>
                      <p className={`
                        text-xs ${charCount > MAX_CHARS * 0.8 
                          ? charCount > MAX_CHARS * 0.95 
                            ? 'text-red-400' 
                            : 'text-amber-400' 
                          : 'text-white/50'
                        }
                      `}>
                        {charCount}/{MAX_CHARS}
                      </p>
                    </div>
                  </div>
                  
                  {/* Location input */}
                  <div className="mb-6">
                    <label htmlFor="location" className="block text-sm font-medium text-white/80 mb-1">
                      Location (optional)
                    </label>
                    <div className="relative">
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add your location"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                        disabled={isSubmitting}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image upload/preview area */}
                  {!imagePreview ? (
                    <div className="mb-6">
                      <UploadArea 
                        onImageSelect={handleImageUpload} 
                        disabled={isSubmitting} 
                      />
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Image
                      </label>
                      <ImagePreview 
                        imageUrl={imagePreview} 
                        onRemove={handleImageRemove}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  
                  {/* Upload progress indicator */}
                  <AnimatePresence>
                    {isSubmitting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-white/80">Creating post...</p>
                          <p className="text-sm text-white/80">{uploadProgress}%</p>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-xs text-white/50 mt-2 text-center animate-pulse">
                          Please wait while we upload your post...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Action buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/home')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    
                    <div className="flex space-x-3">
                      {caption || imagePreview ? (
                        <Button
                          variant="secondary"
                          onClick={togglePreview}
                          disabled={isSubmitting}
                          rightIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          }
                        >
                          Preview
                        </Button>
                      ) : null}
                      
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={(!caption.trim() && !image) || isSubmitting}
                        isLoading={isSubmitting}
                        loadingText="Creating Post..."
                      >
                        Share Post
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Preview mode - shows how the post will look
                <motion.div
                  key="preview-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Post preview card */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4">
                      {/* Author info */}
                      <div className="flex items-center mb-4">
                        <Avatar 
                          src={profile?.avatar_url} 
                          name={profile?.full_name || 'User'}
                          size="md"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
                            <span className="mx-1.5 text-white/30">•</span>
                            <p className="text-xs text-white/50">Just now</p>
                          </div>
                          <p className="text-xs text-white/50">
                            @{profile?.username || 'username'} • {profile?.university || 'University'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Post content */}
                      {caption && (
                        <div className="mb-3">
                          <p className="text-white/90 text-sm whitespace-pre-wrap">
                            {renderContent(caption)}
                          </p>
                        </div>
                      )}
                      
                      {/* Location */}
                      {location && (
                        <div className="flex items-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs text-white/40 ml-1">{location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Image preview */}
                    {imagePreview && (
                      <div className="w-full bg-black/20">
                        <img 
                          src={imagePreview} 
                          alt="Post preview" 
                          className="w-full max-h-[400px] object-contain"
                        />
                      </div>
                    )}
                    
                    {/* Post actions */}
                    <div className="flex items-center justify-between p-4 border-t border-white/5">
                      <div className="flex space-x-5">
                        <div className="flex items-center space-x-1.5 text-white/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-xs font-medium">0</span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5 text-white/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs font-medium">0</span>
                        </div>
                        
                        <div className="text-white/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-white/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview status message */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mt-6">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-white/80">
                        This is a preview of how your post will appear in the feed.
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons for preview mode */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="secondary"
                      onClick={togglePreview}
                      leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      }
                    >
                      Back to Edit
                    </Button>
                    
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={(!caption.trim() && !image) || isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Creating Post..."
                    >
                      Share Post
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
        
        {/* Tips section */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-4">Tips for Great Posts</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Use hashtags</p>
                  <p className="text-xs text-white/60">Add #hashtags to categorize your post and make it more discoverable</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Add visuals</p>
                  <p className="text-xs text-white/60">Posts with images get more engagement from your university community</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Add location</p>
                  <p className="text-xs text-white/60">Sharing your location helps students find content relevant to them</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Be engaging</p>
                  <p className="text-xs text-white/60">Ask questions or share insights that spark conversation</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
};

export default CreatePage;
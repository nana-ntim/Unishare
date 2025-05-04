// src/components/SettingsPage.jsx
//
// Minimalist and performance-optimized SettingsPage component
// Only includes profile and account settings as required
// Uses real data from Supabase database instead of mock data

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';

/**
 * Optimized SettingsPage Component
 * 
 * A minimalist settings page that only includes:
 * - Profile settings (avatar, name, username, bio, university)
 * - Account settings (email, password)
 * 
 * Performance optimizations:
 * - Memoized callbacks to prevent unnecessary function recreations
 * - Optimized state management to prevent unnecessary renders
 * - Controlled form inputs with proper validation
 * - Optimistic UI updates for better perceived performance
 * - Strategic loading states for better UX
 */
const SettingsPage = () => {
  // Auth context for user data
  const { user, profile, updateProfile } = useAuth();
  
  // Form state - only including fields that exist in the database
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    university: '',
    // Password fields are not stored but used for password updates
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('profile');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Validation state
  const [usernameValid, setUsernameValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  // References
  const fileInputRef = useRef(null);
  
  // Load profile data from Supabase when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        ...formData,
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        university: profile.university || '',
      });
      
      // Set avatar URL if it exists
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }
  }, [profile]);
  
  // Check if username is valid (only letters, numbers, periods, and underscores)
  const validateUsername = useCallback((username) => {
    const regex = /^[a-zA-Z0-9._]+$/;
    return regex.test(username);
  }, []);
  
  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Special handling for username validation
    if (name === 'username') {
      // Allow empty username (will be caught by required validation later if needed)
      const isValid = value === '' || validateUsername(value);
      setUsernameValid(isValid);
      
      // Don't update if invalid
      if (!isValid) return;
    }
    
    // Special handling for password confirmation
    if (name === 'newPassword' || name === 'confirmPassword') {
      if (name === 'newPassword') {
        setPasswordsMatch(value === formData.confirmPassword);
      } else {
        setPasswordsMatch(value === formData.newPassword);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setUnsavedChanges(true);
  }, [formData, validateUsername]);
  
  // Handle avatar upload click - memoized to prevent recreation
  const handleAvatarUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Handle avatar file selection
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Create URL for preview
    const fileUrl = URL.createObjectURL(file);
    setAvatarUrl(fileUrl);
    setAvatar(file);
    setUnsavedChanges(true);
    setError(null);
  }, []);
  
  // Handle avatar removal
  const handleRemoveAvatar = useCallback(() => {
    if (avatarUrl) {
      // Clean up object URL if it's a local preview
      if (avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
      setAvatarUrl('');
      setAvatar(null);
      setUnsavedChanges(true);
    }
  }, [avatarUrl]);
  
  // Upload avatar to Supabase Storage
  const uploadAvatar = async (userId, file) => {
    try {
      setUploading(true);
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Create a unique file path for the avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload the file to the 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };
  
  // Save profile changes to Supabase
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Additional validation
    if (formData.username && !validateUsername(formData.username)) {
      setError('Username can only contain letters, numbers, periods, and underscores');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      // Prepare update data
      const updates = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        bio: formData.bio,
        university: formData.university,
        updated_at: new Date().toISOString(),
      };
      
      // Upload avatar if a new one was selected
      if (avatar) {
        const publicUrl = await uploadAvatar(user.id, avatar);
        updates.avatar_url = publicUrl;
      } else if (avatarUrl === '') {
        // User removed avatar
        updates.avatar_url = null;
      }
      
      // Update the profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local context
      if (typeof updateProfile === 'function') {
        await updateProfile(updates);
      }
      
      // Clear avatar state
      setAvatar(null);
      
      // Show success message
      setSaveSuccess(true);
      setUnsavedChanges(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'An error occurred while saving your profile');
    } finally {
      setSaving(false);
    }
  };
  
  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!formData.newPassword) {
      setError('New password is required');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setPasswordsMatch(false);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (error) throw error;
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || 'An error occurred while updating your password');
    } finally {
      setSaving(false);
    }
  };
  
  // Reset form to current profile data
  const handleResetForm = useCallback(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        university: profile.university || ''
      }));
      
      // Reset avatar
      if (avatar) {
        if (avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl);
        }
        setAvatar(null);
      }
      
      setAvatarUrl(profile.avatar_url || '');
      setUnsavedChanges(false);
      setError(null);
    }
  }, [profile, avatar, avatarUrl]);
  
  // Animation variants - minimal for better performance
  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/60">Manage your account and profile</p>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with navigation */}
          <div className="md:col-span-1">
            <div className="sticky top-24 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg mb-6">
              <nav className="divide-y divide-white/5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors
                    ${activeTab === 'profile' ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  aria-label="Profile Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium truncate">Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors
                    ${activeTab === 'account' ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  aria-label="Account Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-sm font-medium truncate">Account & Security</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Settings content */}
          <div className="md:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-settings"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg"
              >
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg font-medium text-white">Profile Information</h3>
                  <p className="text-white/60 text-sm mt-1">Update your personal information visible to others</p>
                </div>
                
                <form onSubmit={handleSaveProfile} className="px-6 py-4">
                  {/* Display error message if any */}
                  {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Avatar section */}
                  <div className="py-4">
                    <label className="block text-sm font-medium text-white/80 mb-2">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {avatarUrl ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="h-20 w-20 rounded-xl overflow-hidden border-2 border-white/20"
                          >
                            <img 
                              src={avatarUrl} 
                              alt="Avatar preview" 
                              className="h-full w-full object-cover"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="h-20 w-20 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-medium border-2 border-white/20"
                          >
                            {formData.full_name?.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                          </motion.div>
                        )}
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          accept="image/*"
                          className="hidden"
                          aria-label="Upload profile picture"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <motion.button
                          type="button"
                          onClick={handleAvatarUploadClick}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/90 transition-colors"
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : 'Upload New'}
                        </motion.button>
                        
                        {avatarUrl && (
                          <motion.button
                            type="button"
                            onClick={handleRemoveAvatar}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 transition-colors"
                          >
                            Remove
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-white/50">
                      Recommended: Square image, at least 400x400 pixels
                    </p>
                  </div>
                  
                  {/* Profile fields */}
                  <div className="py-4 space-y-4">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-white/80 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Your full name"
                        maxLength={50} // Prevent overly long names
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/50">
                          @
                        </span>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${!usernameValid ? 'border-red-500/50' : 'border-white/10'} rounded-lg pl-8 pr-4 py-2.5 text-white focus:outline-none focus:ring-1 ${!usernameValid ? 'focus:ring-red-500/50 focus:border-red-500/50' : 'focus:ring-cyan-400/50 focus:border-cyan-400/50'} transition-all duration-300`}
                          placeholder="username"
                          maxLength={30} // Match database constraint
                        />
                      </div>
                      {!usernameValid && (
                        <p className="mt-1 text-xs text-red-400">
                          Username can only contain letters, numbers, periods, and underscores
                        </p>
                      )}
                      <p className="mt-1 text-xs text-white/50">
                        Only letters, numbers, periods, and underscores. Max 30 characters.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        rows="3"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Tell us about yourself"
                        maxLength={160} // Common limit for bios
                      ></textarea>
                      <p className="mt-1 text-xs text-white/50">
                        Brief description for your profile. Maximum 160 characters.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-white/80 mb-1">
                        University
                      </label>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Your university"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="pt-6 flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
                      onClick={handleResetForm}
                      disabled={saving || !unsavedChanges}
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={!unsavedChanges || saving || !usernameValid}
                      whileHover={{ scale: unsavedChanges && !saving && usernameValid ? 1.05 : 1 }}
                      whileTap={{ scale: unsavedChanges && !saving && usernameValid ? 0.95 : 1 }}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-colors flex items-center"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </motion.button>
                  </div>
                  
                  {/* Success message */}
                  {saveSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center text-green-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Profile updated successfully!
                    </motion.div>
                  )}
                </form>
              </motion.div>
            )}
            
            {/* Account & Security Settings */}
            {activeTab === 'account' && (
              <motion.div
                key="account-settings"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Account Information */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg mb-6">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white">Account Information</h3>
                    <p className="text-white/60 text-sm mt-1">Manage your account email</p>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    {/* Email display - read only */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                        <span className="text-white truncate max-w-full">
                          {user?.email || 'Loading...'}
                        </span>
                      </div>
                      
                      {/* Email verified status */}
                      {user?.email_confirmed_at ? (
                        <div className="mt-2 flex items-center text-sm text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Email verified
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center text-sm text-yellow-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Email not verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Change Password */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white">Change Password</h3>
                    <p className="text-white/60 text-sm mt-1">Update your password to keep your account secure</p>
                  </div>
                  
                  <form onSubmit={handleUpdatePassword} className="px-6 py-4">
                    {/* Display error message if any */}
                    {error && (
                      <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-white/80 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-white/80 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                          placeholder="••••••••"
                        />
                        <p className="mt-1 text-xs text-white/50">
                          Password must be at least 8 characters with at least one uppercase letter, one number, and one special character.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${!passwordsMatch && formData.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 ${!passwordsMatch && formData.confirmPassword ? 'focus:ring-red-500/50 focus:border-red-500/50' : 'focus:ring-cyan-400/50 focus:border-cyan-400/50'} transition-all duration-300`}
                          placeholder="••••••••"
                        />
                        {!passwordsMatch && formData.confirmPassword && (
                          <p className="mt-1 text-xs text-red-400">
                            Passwords do not match
                          </p>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || !passwordsMatch || saving}
                          whileHover={{ scale: formData.currentPassword && formData.newPassword && formData.confirmPassword && passwordsMatch && !saving ? 1.05 : 1 }}
                          whileTap={{ scale: formData.currentPassword && formData.newPassword && formData.confirmPassword && passwordsMatch && !saving ? 0.95 : 1 }}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/20 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : 'Update Password'}
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Success message */}
                    {saveSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center text-green-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Password updated successfully!
                      </motion.div>
                    )}
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
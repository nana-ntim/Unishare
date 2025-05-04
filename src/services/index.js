// src/services/index.js
//
// Unified services export file
// Centralizes all service exports for easy imports throughout the app

import authService from './auth';
import dataService from './data';
import mediaService from './media';

// Export all services
export {
  authService,
  dataService,
  mediaService
};

// Default export as an object containing all services
export default {
  auth: authService,
  data: dataService,
  media: mediaService
};
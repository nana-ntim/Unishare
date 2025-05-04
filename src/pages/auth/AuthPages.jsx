// src/pages/auth/AuthPages.js
// Optimized export file for authentication-related pages

import React from 'react';
import UniSharePage from '../../components/UniSharePage';
import EmailVerification from '../../components/auth/EmailVerification';
import AuthCallback from '../../components/auth/AuthCallback';
import ForgotPassword from '../../components/auth/ForgotPassword';
import ResetPassword from '../../components/auth/ResetPassword';
import ResendVerification from '../../components/auth/ResendVerification';

// Export pages as a single object
export default {
  UniSharePage,
  EmailVerification,
  AuthCallback,
  ForgotPassword,
  ResetPassword,
  ResendVerification
};
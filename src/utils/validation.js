// src/utils/validation.js

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const validateEmail = (email) => {
    // Base pattern for email validation
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };
  
  /**
   * Validates if an email is from a university/educational domain
   * This is a basic check that can be expanded with a more comprehensive list
   * @param {string} email - The email to validate
   * @returns {boolean} - Whether the email is from an educational domain
   */
  export const isUniversityEmail = (email) => {
    // Common education domains
    const eduDomains = [
      '.edu',
      '.ac.',
      'university.',
      'college.',
      'school.',
      'campus.',
      '.edu.',
    ];
    
    const lowerEmail = email.toLowerCase();
    return eduDomains.some(domain => lowerEmail.includes(domain));
  };
  
  /**
   * Validates password strength
   * @param {string} password - The password to validate
   * @returns {Object} - Validation result and feedback
   */
  export const validatePassword = (password) => {
    if (!password || password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters'
      };
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one number'
      };
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one special character'
      };
    }
    
    return {
      valid: true,
      message: 'Password is strong'
    };
  };
  
  /**
   * Validates university name
   * @param {string} university - The university name to validate
   * @returns {Object} - Validation result and feedback
   */
  export const validateUniversity = (university) => {
    if (!university || university.trim().length < 3) {
      return {
        valid: false,
        message: 'University name must be at least 3 characters'
      };
    }
    
    return {
      valid: true,
      message: 'University name is valid'
    };
  };
  
  /**
   * Validates full name
   * @param {string} fullName - The full name to validate
   * @returns {Object} - Validation result and feedback
   */
  export const validateFullName = (fullName) => {
    if (!fullName || fullName.trim().length < 2) {
      return {
        valid: false,
        message: 'Full name must be at least 2 characters'
      };
    }
    
    // Check for at least two parts (first and last name)
    if (fullName.trim().split(/\s+/).length < 2) {
      return {
        valid: false,
        message: 'Please provide both first and last name'
      };
    }
    
    return {
      valid: true,
      message: 'Full name is valid'
    };
  };
  
  /**
   * Combines all form validations for signup
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Validation results for all fields
   */
  export const validateSignupForm = ({ email, password, fullName, university }) => {
    const emailValid = validateEmail(email);
    const passwordCheck = validatePassword(password);
    const nameCheck = validateFullName(fullName);
    const universityCheck = validateUniversity(university);
    
    return {
      isValid: emailValid && passwordCheck.valid && nameCheck.valid && universityCheck.valid,
      errors: {
        email: emailValid ? null : 'Please enter a valid email address',
        password: passwordCheck.valid ? null : passwordCheck.message,
        fullName: nameCheck.valid ? null : nameCheck.message,
        university: universityCheck.valid ? null : universityCheck.message
      }
    };
  };
  
  /**
   * Validates login form
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Validation results for all fields
   */
  export const validateLoginForm = ({ email, password }) => {
    const emailValid = validateEmail(email);
    const passwordValid = password.length > 0;
    
    return {
      isValid: emailValid && passwordValid,
      errors: {
        email: emailValid ? null : 'Please enter a valid email address',
        password: passwordValid ? null : 'Password is required'
      }
    };
  };
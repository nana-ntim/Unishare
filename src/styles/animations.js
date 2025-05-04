// src/styles/animations.js
//
// Centralized animation configurations for consistent motion
// Used across the application for elegant transitions

/**
 * Page Transitions
 * 
 * Smooth animations for page transitions
 */
export const pageTransitions = {
    initial: { 
      opacity: 0,
      y: 10
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  /**
   * Container Animations
   * 
   * For staggered animations of child elements
   */
  export const containerAnimations = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  /**
   * Item Animations
   * 
   * For individual items within container animations
   */
  export const itemAnimations = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  /**
   * Fade Animations
   * 
   * Simple fade in/out animations
   */
  export const fadeAnimations = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0 }
  };
  
  /**
   * Scale Animations
   * 
   * For elements that should scale on entry/exit
   */
  export const scaleAnimations = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };
  
  /**
   * Slide Animations
   * 
   * For elements that should slide in/out
   */
  export const slideAnimations = {
    left: {
      initial: { opacity: 0, x: -20 },
      animate: { 
        opacity: 1, 
        x: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      },
      exit: { opacity: 0, x: -20 }
    },
    right: {
      initial: { opacity: 0, x: 20 },
      animate: { 
        opacity: 1, 
        x: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      },
      exit: { opacity: 0, x: 20 }
    },
    up: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      },
      exit: { opacity: 0, y: 20 }
    },
    down: {
      initial: { opacity: 0, y: -20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      },
      exit: { opacity: 0, y: -20 }
    }
  };
  
  /**
   * Interactive Animations
   * 
   * For interactive elements like buttons and cards
   */
  export const interactiveAnimations = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.2 }
    },
    buttonHover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    buttonTap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };
  
  /**
   * Modal Animations
   * 
   * For modal dialogs and overlays
   */
  export const modalAnimations = {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } }
    },
    content: {
      initial: { opacity: 0, y: 50, scale: 0.9 },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30
        }
      },
      exit: { 
        opacity: 0, 
        y: 50, 
        scale: 0.9,
        transition: { duration: 0.2 } 
      }
    }
  };
  
  /**
   * Notification Animations
   * 
   * For toast notifications and alerts
   */
  export const notificationAnimations = {
    initial: { opacity: 0, y: -50, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -50, 
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };
  
  /**
   * Pulse Animation
   * 
   * For elements that should pulse to draw attention
   */
  export const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };
  
  /**
   * List Item Animations
   * 
   * For consistent list item animations
   */
  export const listItemAnimations = {
    initial: { 
      opacity: 0, 
      y: 15,
      height: 0
    },
    animate: { 
      opacity: 1, 
      y: 0,
      height: 'auto',
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -15,
      height: 0,
      transition: { 
        duration: 0.2,
        height: {
          delay: 0.1
        }
      } 
    }
  };
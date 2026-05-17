import React, { createContext, useContext } from 'react';

/**
 * Global Layout Configuration Context
 * Ensures consistent spacing and sizing across all pages
 */
const LayoutConfigContext = createContext();

export const LayoutConfigProvider = ({ children }) => {
  const config = {
    // Spacing system (24px as base unit = 1.5rem)
    spacing: {
      xs: '0.375rem',  // 6px
      sm: '0.75rem',   // 12px
      md: '1.5rem',    // 24px - Default
      lg: '2rem',      // 32px
      xl: '3rem',      // 48px
      '2xl': '4rem',   // 64px
    },

    // Layout padding
    padding: {
      main: '1.5rem',  // 24px
      section: '1.5rem',
      card: '1.5rem',
      mobile: '1rem',
    },

    // Sidebar configuration
    sidebar: {
      width: '240px',
      widthCollapsed: '60px',
      widthMobile: '0px',
    },

    // Max width constraints
    maxWidth: {
      container: '1400px',
      content: '1200px',
    },

    // Responsive breakpoints
    breakpoints: {
      xs: '320px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    // Colors
    colors: {
      bg: '#0b0b0f',
      bgLight: '#0f0f14',
      card: '#15151d',
      sidebar: '#0f0f14',
      border: 'rgba(255,255,255,0.06)',
    },

    // Transitions
    transitions: {
      base: 'var(--transition-base)',
      fast: 'var(--transition-fast)',
    },
  };

  return (
    <LayoutConfigContext.Provider value={config}>
      {children}
    </LayoutConfigContext.Provider>
  );
};

/**
 * Hook to access global layout configuration
 */
export const useLayoutConfig = () => {
  const context = useContext(LayoutConfigContext);
  if (!context) {
    throw new Error('useLayoutConfig must be used within LayoutConfigProvider');
  }
  return context;
};

export default LayoutConfigContext;

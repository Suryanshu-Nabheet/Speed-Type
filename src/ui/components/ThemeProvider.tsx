import React, { createContext, useContext } from 'react';
import { Theme } from '../../core/types';

const themes: Record<string, Theme> = {
  dark: {
    name: 'dark',
    colors: {
      background: '#1a1a1a',
      text: '#ffffff',
      correct: '#00ff00',
      incorrect: '#ff0000',
      cursor: '#ffff00',
      accent: '#00ffff',
      border: '#444444',
      dim: '#666666',
    },
  },
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      text: '#000000',
      correct: '#008000',
      incorrect: '#ff0000',
      cursor: '#0000ff',
      accent: '#0080ff',
      border: '#cccccc',
      dim: '#999999',
    },
  },
  'high-contrast': {
    name: 'high-contrast',
    colors: {
      background: '#000000',
      text: '#ffffff',
      correct: '#00ff00',
      incorrect: '#ff0000',
      cursor: '#ffff00',
      accent: '#ffffff',
      border: '#ffffff',
      dim: '#cccccc',
    },
  },
};

const ThemeContext = createContext<Theme>(themes.dark);

interface Props {
  theme: string;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ theme, children }) => {
  const currentTheme = themes[theme] || themes.dark;
  
  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};
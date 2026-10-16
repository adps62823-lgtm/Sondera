import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppMode = 'simple' | 'technical';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('sondera_app_mode');
    return saved === 'technical' ? 'technical' : 'simple';
  });

  useEffect(() => {
    localStorage.setItem('sondera_app_mode', mode);
  }, [mode]);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'simple' ? 'technical' : 'simple'));
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useAppMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within a ModeProvider');
  }
  return context;
};

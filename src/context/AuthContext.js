import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ssn, setSsn] = useState(null);

  const login = (ssnValue) => {
    setSsn(ssnValue);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setSsn(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    ssn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

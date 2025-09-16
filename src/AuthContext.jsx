import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  // التحقق من localStorage عند تحميل التطبيق
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    const storedUsername = localStorage.getItem('username');
    
    if (token && (email || storedUsername)) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setUserRole(role);
      setUsername(storedUsername);
    }
  }, []);

  const login = (token, emailOrUsername, role = 'customer') => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', emailOrUsername);
    
    // If it looks like an email, store it as email too
    if (emailOrUsername.includes('@')) {
      localStorage.setItem('userEmail', emailOrUsername);
      setUserEmail(emailOrUsername);
    }
    
    setIsLoggedIn(true);
    setUserRole(role);
    setUsername(emailOrUsername);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserRole(null);
    setUsername(null);
  };

  const getAuthHeaders = (contentType = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userEmail, 
      userRole, 
      username,
      login, 
      logout, 
      getAuthHeaders 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
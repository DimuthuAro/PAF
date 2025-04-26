import { createContext, useState, useContext, useEffect } from 'react';
import { userService, authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    // Update the user state with the data from the login response
    setCurrentUser(userData);
    
    // The token is already saved to localStorage by the authService.login method
    // We don't need to save it again here
    
    return userData;
  };

  const register = async (userData) => {
    try {
      const newUser = await userService.registerUser(userData);
      setCurrentUser(newUser);
      // If the register endpoint doesn't return a token, you might need to login after registration
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    authService.logout(); // This will clear the token from localStorage
  };

  const updateProfile = async (id, userData) => {
    try {
      const updatedUser = await userService.updateUser(id, userData);
      
      // Merge with existing user data to ensure we keep token info
      const updatedCurrentUser = { ...currentUser, ...updatedUser };
      setCurrentUser(updatedCurrentUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
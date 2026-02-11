import { createContext, useState, useEffect } from "react";
import API from "../services/api";

// Provide a safe default so destructuring won't throw if provider isn't mounted yet
const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page load hote hi check karo ki token aur user info saved hai kya?
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userInfo");

    if (token && storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      
      // Data save karo
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user)); // User details save
      
      setUser(data.user); // State update
      
      // FIX: Return the 'user' object so callers receive it
      return { success: true, user: data.user }; 
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: error.response?.data?.message || "Login Failed" };
    }
  };

  // Register Function
  const register = async (userData) => {
    try {
      await API.post("/auth/register", userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration Failed" };
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  // Allow external components to update user state and persist it
  const updateUser = (newUser) => {
    if (newUser) {
      localStorage.setItem('userInfo', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('userInfo');
    }
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
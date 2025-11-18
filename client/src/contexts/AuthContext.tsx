import React, { createContext, useContext, useEffect, useState } from "react";
import {
  isAuthenticated,
  getUserRole,
  getUserId,
  logout,
} from "@/lib/authUtils";

interface AuthContextType {
  isSignedIn: boolean;
  userId: string | null;
  userRole: string | null;
  email: string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  userId: null,
  userRole: null,
  email: null,
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(isAuthenticated());
  const [userId, setUserId] = useState<string | null>(getUserId());
  const [userRole, setUserRole] = useState<string | null>(getUserRole());
  const [email, setEmail] = useState<string | null>(
    localStorage.getItem("email")
  );

  useEffect(() => {
    // Update auth state when localStorage changes
    const handleStorageChange = () => {
      setIsSignedIn(isAuthenticated());
      setUserId(getUserId());
      setUserRole(getUserRole());
      setEmail(localStorage.getItem("email"));
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signOut = () => {
    logout();
    setIsSignedIn(false);
    setUserId(null);
    setUserRole(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ isSignedIn, userId, userRole, email, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

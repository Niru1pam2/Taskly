import React, { useContext, useEffect, useState } from "react";
import type { User } from "~/types";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicroutes } from "~/lib";
// import { client } from "~/lib/client"; // Optional: For validating session

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  const isPublicRoute = publicroutes.some((route) =>
    currentPath.startsWith(route)
  );

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          // 2. Restore the session
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to parse user data", error);
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        if (!isPublicRoute) {
          navigate("/sign-in");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener("force-logout", handleLogout);
    return () => window.removeEventListener("force-logout", handleLogout);
  }, []);

  const login = async (data: any) => {
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // 5. Clear LocalStorage
    localStorage.removeItem("user");

    // Call your backend logout endpoint to clear the Cookie
    try {
      // Assuming you have an API utility
      // await client.post("/users/logout");
    } catch (e) {
      console.error("Logout failed", e);
    }

    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
    navigate("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

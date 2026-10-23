"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { SimulatedUser } from "@/types/auth";
import { SIMULATED_PERSONAS } from "@/constants/personas";

interface AuthSimContextType {
  currentUser: SimulatedUser;
  switchPersona: (key: "admin" | "wasasa" | "cbe" | "merchant") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthSimContext = createContext<AuthSimContextType>({
  currentUser: SIMULATED_PERSONAS.admin,
  switchPersona: () => {},
  logout: () => {},
  isAuthenticated: true,
});

export function AuthSimProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimulatedUser>(SIMULATED_PERSONAS.admin);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const savedKey = localStorage.getItem("nw_sim_persona");
    if (savedKey && SIMULATED_PERSONAS[savedKey]) {
      setUser(SIMULATED_PERSONAS[savedKey]);
      setIsAuthenticated(true);
    }
  }, []);

  const switchPersona = (key: "admin" | "wasasa" | "cbe" | "merchant") => {
    const selected = SIMULATED_PERSONAS[key];
    if (selected) {
      setUser(selected);
      setIsAuthenticated(true);
      localStorage.setItem("nw_sim_persona", key);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nw_sim_persona");
  };

  return (
    <AuthSimContext.Provider
      value={{
        currentUser: user,
        switchPersona,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthSimContext.Provider>
  );
}

export function useAuthSim() {
  return useContext(AuthSimContext);
}

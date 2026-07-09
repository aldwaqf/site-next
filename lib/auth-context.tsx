'use client';

// ⚠️ VERSION MOCKÉE (Étape 3 du refactor)
// Même interface que l'auth-context original, mais personne n'est connecté.
// L'implémentation réelle arrivera à l'Étape 5 avec Auth.js.

import { createContext, useContext, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const value: AuthContextType = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: async () => {
            throw new Error('Auth pas encore implémentée (Étape 5)');
        },
        logout: () => {},
        checkAuth: async () => {},
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

'use client';

// Auth réelle branchée sur Auth.js (Étape 5).
// Garde la même interface que l'ancien mock : les composants qui
// utilisent useAuth() n'ont pas besoin de changer.

import { createContext, useContext, ReactNode } from 'react';
import { SessionProvider, useSession, signIn, signOut, getSession } from 'next-auth/react';

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
    login: (email: string, password: string) => Promise<User>;
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

function AuthContextBridge({ children }: { children: ReactNode }) {
    const { data: session, status, update } = useSession();

    const user: User | null = session?.user
        ? {
              id: session.user.id,
              email: session.user.email ?? '',
              firstName: session.user.firstName,
              lastName: session.user.lastName,
              role: session.user.role,
          }
        : null;

    const value: AuthContextType = {
        user,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        login: async (identifier, password) => {
            const result = await signIn('credentials', {
                identifier,
                password,
                redirect: false,
            });
            if (result?.error) {
                throw new Error('Identifiants invalides');
            }
            const fresh = await getSession();
            if (!fresh?.user) {
                throw new Error('Connexion échouée');
            }
            return {
                id: fresh.user.id,
                email: fresh.user.email ?? '',
                firstName: fresh.user.firstName,
                lastName: fresh.user.lastName,
                role: fresh.user.role,
            };
        },
        logout: () => {
            void signOut({ redirect: false });
        },
        checkAuth: async () => {
            await update();
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthContextBridge>{children}</AuthContextBridge>
        </SessionProvider>
    );
}

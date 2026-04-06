import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { LeadProfile } from '@/types';
import { checkSession } from '@/services/auth-service';

interface AuthContextType {
    lead: LeadProfile | null;
    project: { id: string; name: string; slug: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (lead: LeadProfile, project: { id: string; name: string; slug: string } | null, token: string) => void;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    lead: null,
    project: null,
    isAuthenticated: false,
    isLoading: true,
    setAuth: () => {},
    logout: () => {},
    refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [lead, setLead] = useState<LeadProfile | null>(null);
    const [project, setProject] = useState<{ id: string; name: string; slug: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('velto_token');
        localStorage.removeItem('velto_project');
        setLead(null);
        setProject(null);
    }, []);

    const setAuth = useCallback((lead: LeadProfile, project: { id: string; name: string; slug: string } | null, token: string) => {
        localStorage.setItem('velto_token', token);
        if (project) localStorage.setItem('velto_project', JSON.stringify(project));
        setLead(lead);
        setProject(project);
    }, []);

    const refreshProfile = useCallback(async () => {
        try {
            const res = await checkSession();
            if (res.success) {
                setLead(res.data.lead);
                setProject(res.data.project);
            }
        } catch {
            // Silently fail
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('velto_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        checkSession()
            .then(res => {
                if (res.success) {
                    setLead(res.data.lead);
                    setProject(res.data.project);
                } else {
                    logout();
                }
            })
            .catch(() => logout())
            .finally(() => setIsLoading(false));
    }, [logout]);

    // Listen for forced logout from API interceptor
    useEffect(() => {
        const handler = () => logout();
        window.addEventListener('velto:logout', handler);
        return () => window.removeEventListener('velto:logout', handler);
    }, [logout]);

    // Destroy session when page/tab is closed
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem('velto_token');
            localStorage.removeItem('velto_project');
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return (
        <AuthContext.Provider value={{
            lead,
            project,
            isAuthenticated: !!lead,
            isLoading,
            setAuth,
            logout,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

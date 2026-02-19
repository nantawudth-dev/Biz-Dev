
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isOfficer: boolean;
    isAccessDenied: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isOfficer, setIsOfficer] = useState(false);
    const [isAccessDenied, setAccessDenied] = useState(false);

    // Helper: Check profile and set role state
    const checkProfile = async (authUser: User) => {
        try {
            const userId = authUser.id;
            const userEmail = authUser.email;

            let { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            // If not found by ID, check by Email (Pre-approved / Whitelist)
            if (!profile && userEmail) {
                const { data: preProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', userEmail)
                    .maybeSingle();

                if (preProfile) {
                    console.log('[Auth] Found pre-approved profile by email. Migrating to Auth ID...');
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ id: userId })
                        .eq('email', userEmail);

                    if (updateError) {
                        console.error('[Auth] Failed to migrate profile ID:', updateError);
                        await supabase.from('profiles').delete().eq('email', userEmail);
                        await supabase.from('profiles').insert([{ ...preProfile, id: userId }]);
                    }

                    profile = { role: preProfile.role };
                }
            }

            if (!profile) {
                setAccessDenied(true);
                setIsAdmin(false);
                setIsOfficer(false);
            } else {
                setAccessDenied(false);
                setIsAdmin(profile.role === 'admin');
                setIsOfficer(profile.role === 'officer' || profile.role === 'admin');
            }
        } catch (error) {
            console.error('[Auth] Profile check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Step 1: Load existing session on mount (handles refresh correctly)
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            console.log('[Auth] Initial session:', currentSession ? 'found' : 'none');
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (currentSession?.user) {
                checkProfile(currentSession.user);
            } else {
                setIsLoading(false);
            }
        });

        // Step 2: Subscribe to all auth state changes (login, logout, token refresh)
        // This is the single source of truth for session changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            console.log('[Auth] Auth state changed:', _event);
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
                checkProfile(newSession.user);
            } else {
                setIsAdmin(false);
                setIsOfficer(false);
                setAccessDenied(false);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with Google:', error);
            alert('Error logging in with Google');
        }
    };

    const logout = async () => {
        try {
            // Clear only session-specific storage, NOT all localStorage
            // (clearing all localStorage would destroy the Supabase auth token)
            if (user?.id) {
                sessionStorage.removeItem(`welcome_shown_${user.id}`);
            }
            sessionStorage.clear();

            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setUser(null);
            setSession(null);
        }
    };

    const value = {
        user,
        session,
        isLoading,
        loginWithGoogle,
        logout,
        isAdmin,
        isOfficer,
        isAccessDenied
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

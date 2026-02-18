
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



    useEffect(() => {
        // Check active session
        async function checkSession(isSilent = false) {
            try {
                if (!isSilent) console.log('[Auth] CheckSession started');
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                // Only update session/user if they actually changed to avoid unnecessary re-renders
                if (currentSession?.user?.id !== user?.id || currentSession?.access_token !== session?.access_token) {
                    if (!isSilent) console.log('[Auth] Session changed or initial load, updating state...');
                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);
                } else if (!isSilent) {
                    console.log('[Auth] Session unchanged');
                }

                if (currentSession?.user) {
                    // Check profile directly
                    const userId = currentSession.user.id;
                    const userEmail = currentSession.user.email;

                    if (!isSilent) console.log('[Auth] Checking profile for:', userId);

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
                            if (!isSilent) console.log('[Auth] Found pre-approved profile by email. Migrating to Auth ID...');
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
                        if (isAccessDenied === false) setAccessDenied(true);
                        if (isAdmin === true) setIsAdmin(false);
                        if (isOfficer === true) setIsOfficer(false);
                    } else {
                        const newIsAdmin = profile.role === 'admin';
                        const newIsOfficer = profile.role === 'officer' || profile.role === 'admin';

                        if (isAccessDenied === true) setAccessDenied(false);
                        if (isAdmin !== newIsAdmin) setIsAdmin(newIsAdmin);
                        if (isOfficer !== newIsOfficer) setIsOfficer(newIsOfficer);
                    }
                    if (!isSilent) console.log('[Auth] Profile check complete. Role:', profile?.role);
                } else {
                    // No user
                    if (isAdmin === true) setIsAdmin(false);
                    if (isOfficer === true) setIsOfficer(false);
                    if (isAccessDenied === true) setAccessDenied(false);
                }
            } catch (error) {
                console.error('Session check failed:', error);
            } finally {
                if (!isSilent) {
                    console.log('[Auth] CheckSession finished, setting isLoading = false');
                    setIsLoading(false);
                }
            }
        }

        // Safety timeout to ensure loading doesn't hang indefinitely
        const timeoutId = setTimeout(async () => {
            setIsLoading((prev) => {
                if (prev) {
                    console.warn('Auth loading timed out, forcing logout and session clear to fix stuck state');
                    sessionStorage.clear();
                    // Attempt to clear local storage tokens if possible
                    try {
                        const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1].split('.')[0];
                        if (projectRef) localStorage.removeItem(`sb-${projectRef}-auth-token`);
                    } catch (e) { }

                    setUser(null);
                    setSession(null);
                    setAccessDenied(false);
                    setIsAdmin(false);
                    setIsOfficer(false);

                    supabase.auth.signOut().catch(err => console.error('Force signout error:', err));

                    return false;
                }
                return prev;
            });
        }, 15000);

        checkSession(false); // Initial load is NOT silent

        // Listen for tab visibility changes to re-verify session
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Use silent check for visibility changes to avoid UI flickering
                console.log('[Auth] Tab became visible, performing silent session verification...');
                checkSession(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Only update if tab is visible to avoid race conditions during background refreshing
            if (document.visibilityState === 'visible' || _event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
                try {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        // Check profile directly by ID first
                        let { data: profile } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', session.user.id)
                            .single();

                        // If not found by ID, check by Email (Pre-approved / Whitelist)
                        if (!profile && session.user.email) {
                            const { data: preProfile } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('email', session.user.email)
                                .maybeSingle();

                            if (preProfile) {
                                console.log('[Auth] Found pre-approved profile by email. Migrating to Auth ID...');
                                // Migration: Update the profile ID to match the actual Auth User ID
                                const { error: updateError } = await supabase
                                    .from('profiles')
                                    .update({ id: session.user.id })
                                    .eq('email', session.user.email);

                                if (updateError) {
                                    console.error('[Auth] Failed to migrate profile ID:', updateError);
                                    // Fallback: If update fails (e.g. PK constraint), try delete and recreate
                                    await supabase.from('profiles').delete().eq('email', session.user.email);
                                    await supabase.from('profiles').insert([{ ...preProfile, id: session.user.id }]);
                                }

                                // Set local profile data
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
                    } else {
                        setIsAdmin(false);
                        setIsOfficer(false);
                        setAccessDenied(false);
                    }
                } catch (error) {
                    console.error('Session check failed:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(timeoutId);
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
            // PROACTIVE: Clear session storage related to user session for a clean state
            if (user?.id) {
                sessionStorage.removeItem(`welcome_shown_${user.id}`);
            }
            // Also good practice to clear any other potential session data
            sessionStorage.clear();
            localStorage.clear(); // Clear local storage too for complete cleanup

            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            // Always clear local state regardless of server response
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

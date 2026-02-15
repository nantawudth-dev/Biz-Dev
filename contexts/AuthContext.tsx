
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
        async function checkSession() {
            try {
                console.log('[Auth] CheckSession started');
                const { data: { session } } = await supabase.auth.getSession();
                console.log('[Auth] Session retrieved:', session?.user?.email);

                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    if (session?.user) {
                        // Check profile directly
                        console.log('[Auth] Checking profile for:', session.user.id);
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
                                const { error: updateError } = await supabase
                                    .from('profiles')
                                    .update({ id: session.user.id })
                                    .eq('email', session.user.email);

                                if (updateError) {
                                    console.error('[Auth] Failed to migrate profile ID:', updateError);
                                    await supabase.from('profiles').delete().eq('email', session.user.email);
                                    await supabase.from('profiles').insert([{ ...preProfile, id: session.user.id }]);
                                }

                                profile = { role: preProfile.role };
                            }
                        }

                        if (!profile) {
                            // No profile found = Access Denied
                            setAccessDenied(true);
                            setIsAdmin(false);
                            setIsOfficer(false);
                        } else {
                            setAccessDenied(false);
                            setIsAdmin(profile.role === 'admin');
                            setIsOfficer(profile.role === 'officer' || profile.role === 'admin');
                        }
                        console.log('[Auth] Profile check complete. Role:', profile?.role);
                    } else {
                        setIsAdmin(false);
                        setIsOfficer(false);
                        setAccessDenied(false);
                    }
                } else {
                    // No user
                    setIsAdmin(false);
                    setIsOfficer(false);
                    setAccessDenied(false);
                }
            } catch (error) {
                console.error('Session check failed:', error);
            } finally {
                console.log('[Auth] CheckSession finished, setting isLoading = false');
                setIsLoading(false);
            }
        }

        // Safety timeout to ensure loading doesn't hang indefinitely
        const timeoutId = setTimeout(async () => {
            setIsLoading((prev) => {
                if (prev) {
                    console.warn('Auth loading timed out, forcing logout and session clear to fix stuck state');
                    // Force clear bad session state so user can re-login
                    sessionStorage.clear();
                    localStorage.removeItem(`sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1].split('.')[0]}-auth-token`); // Try to clear supabase token manually if possible, or reliance on signOut

                    // Note: We can't easily call 'logout()' here because it's defined below.
                    // So we manually clear state.
                    setUser(null);
                    setSession(null);
                    setAccessDenied(false);
                    setIsAdmin(false);
                    setIsOfficer(false);

                    // Attempt to sign out from Supabase to clear local storage
                    supabase.auth.signOut().catch(err => console.error('Force signout error:', err));

                    return false;
                }
                return prev;
            });
        }, 8000); // Reduce to 8s to be more responsive if it hangs

        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
                            // This effectively "Claims" the pre-created profile
                            const { error: updateError } = await supabase
                                .from('profiles')
                                .update({ id: session.user.id })
                                .eq('email', session.user.email);

                            if (updateError) {
                                console.error('[Auth] Failed to migrate profile ID:', updateError);
                                // Fallback: If update fails (e.g. PK constraint), try delete and recreate
                                // Note: This loses relational data if any exists pointing to the old ID
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
        });

        return () => {
            subscription.unsubscribe();
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
                sessionStorage.removeItem(`welcome_shown_${user.id} `); // Remove trailing space if it was a typo in App.tsx, but match key exactly
                // In App.tsx it's `welcome_shown_${user.id} ` (with space). Let's check App.tsx again.
            }
            // Also good practice to clear any other potential session data
            sessionStorage.clear();

            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setSession(null);
        } catch (error) {
            console.error('Error logging out:', error);
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

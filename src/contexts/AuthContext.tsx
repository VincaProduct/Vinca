
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: (referralCode?: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          localStorage.removeItem('redirect_after_login');

          // For new users (profile in 'waiting_lead_source'), write the lead source and
          // trigger the Zoho contact creation by flipping zoho_sync_status to 'pending'
          const leadSource = localStorage.getItem('pending_lead_source') || 'Website Signup';
          localStorage.removeItem('pending_lead_source');

          supabase
            .from('profiles')
            .select('zoho_sync_status')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data?.zoho_sync_status === 'waiting_lead_source') {
                supabase
                  .from('profiles')
                  .update({ lead_source: leadSource, zoho_sync_status: 'pending' })
                  .eq('id', session.user.id)
                  .then(() => {});
              }
            });
        }
      }
    );

    // Check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Session recovery error:', error.message);
          // Clear any invalid session data
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.warn('Failed to get session:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (referralCode?: string) => {
    // Store referral code in localStorage before OAuth redirect
    // OAuth metadata cannot contain custom data, so we process it after redirect
    if (referralCode) {
      localStorage.setItem('pending_referral_code', referralCode);
    }
    
    // Check for stored redirect path
    const redirectPath = localStorage.getItem('redirect_after_login') || '/';
    const redirectUrl = `${window.location.origin}${redirectPath}`;
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Manually clear the localStorage key to ensure complete cleanup
    localStorage.removeItem('sb-xmmyjphoaqazwlifehxs-auth-token');
    localStorage.removeItem('pending_referral_code');
    localStorage.removeItem('redirect_after_login');
    
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

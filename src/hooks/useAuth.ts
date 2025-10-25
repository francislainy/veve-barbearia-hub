import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Use an explicit site URL from env when available so emails from Supabase use the correct domain.
  // Set VITE_SITE_URL in your environment (e.g. .env) to your deployed site URL like https://your-domain.com
  const SITE_URL = (import.meta.env.VITE_SITE_URL as string) || window.location.origin;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success("Login realizado com sucesso!");
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const redirectUrl = `${SITE_URL}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });
      
      if (error) throw error;
      toast.success("Cadastro realizado com sucesso!");
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer cadastro");
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${SITE_URL}/auth`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de recuperação");
      return { success: false, error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};

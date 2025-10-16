import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RpcResponse {
  success: boolean;
  message?: string;
  error?: string;
  user_id?: string;
  role?: string;
}

export const useAdminManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const promoteUserToRole = async (email: string, role: "admin" | "barbeiro") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("promote_user_role" as any, {
        target_user_email: email,
        new_role: role,
      });

      if (error) {
        console.error("RPC error:", error);
        toast.error(error.message || "Erro ao promover usuário");
        return { success: false, error: error.message };
      }

      const result = data as RpcResponse;

      if (result?.success) {
        toast.success(result.message || `Usuário promovido a ${role} com sucesso!`);
        return { success: true };
      } else {
        toast.error(result?.error || "Erro ao promover usuário");
        return { success: false, error: result?.error };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Error promoting user:", error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminUser = async (email: string, password: string, role: "admin" | "barbeiro" = "admin") => {
    setIsLoading(true);
    try {
      // Use Supabase Admin API to create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0],
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        toast.error(authError.message || "Erro ao criar usuário");
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        toast.error("Falha ao criar usuário");
        return { success: false, error: "Falha ao criar usuário" };
      }

      // Now promote the user to the desired role
      const { data, error } = await supabase.rpc("promote_user_role" as any, {
        target_user_email: email,
        new_role: role,
      });

      if (error) {
        console.error("Error promoting newly created user:", error);
        toast.warning(`Usuário criado, mas não foi possível promover automaticamente. Email: ${email}`);
        return { success: true, needsManualPromotion: true };
      }

      const result = data as RpcResponse;

      if (result?.success) {
        toast.success(`Usuário ${role} criado com sucesso!`);
        return { success: true };
      } else {
        toast.warning(`Usuário criado, mas não foi possível promover: ${result?.error}`);
        return { success: true, needsManualPromotion: true };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Error creating admin user:", error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promoteUserToRole,
    createAdminUser,
    isLoading,
  };
};

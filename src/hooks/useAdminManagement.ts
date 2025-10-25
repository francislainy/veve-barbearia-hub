import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RpcResponse {
  success: boolean;
  message?: string;
  error?: string;
  user_id?: string;
  role?: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  full_name?: string;
}

export const useAdminManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = useCallback(async () => {
    console.log('=== STARTING USER FETCH ===');

    // First, check current user's admin status
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    console.log('Current user ID:', currentUserId);

    // Check if there are ANY profiles at all
    const { count: totalProfileCount } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true });

    console.log('TOTAL PROFILES IN DATABASE:', totalProfileCount);

    // Check if there are ANY user_roles at all
    const { count: totalRolesCount } = await supabase
      .from("user_roles")
      .select("*", { count: 'exact', head: true });

    console.log('TOTAL USER_ROLES IN DATABASE:', totalRolesCount);

    if (totalProfileCount === 0) {
      console.error('⚠️ PROFILES TABLE IS EMPTY!');
      console.log('Creating profile for current user...');

      // Try to create a profile for the current user
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          user_id: currentUserId,
          full_name: 'Admin User'
        })
        .select()
        .single();

      console.log('Profile creation result:', { newProfile, createError });

      if (!createError && newProfile) {
        toast.success('Perfil criado! Recarregando...');
        // Try fetching again after creating profile
        setTimeout(() => fetchUsers(), 1000);
        return;
      }
    }

    const { data: currentUserRoles, error: currentRoleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUserId);

    console.log('Current user roles:', currentUserRoles, 'Error:', currentRoleError);

    // Check if user is admin
    const isCurrentUserAdmin = currentUserRoles?.some(r => r.role === 'admin');
    console.log('Is current user admin?', isCurrentUserAdmin);

    try {
      // Get all profiles with their associated user data
      const { data: profiles, error: profilesError, status, statusText } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, created_at");

      console.log('Profiles query result:', {
        profiles,
        profilesError,
        status,
        statusText,
        profileCount: profiles?.length || 0
      });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Erro ao carregar perfis: " + profilesError.message);
        setUsers([]);
        setLoadingUsers(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found in database');
        toast.warning("Nenhum perfil encontrado no banco de dados - possível problema com RLS");
        setUsers([]);
        setLoadingUsers(false);
        return;
      }

      console.log(`Found ${profiles.length} profiles`);

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      console.log('User roles query result:', { userRoles, rolesError });

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        toast.error("Erro ao carregar permissões: " + rolesError.message);
      }

      // Build user list from profiles
      const usersList = profiles.map(profile => {
        const roles = userRoles?.filter(r => r.user_id === profile.user_id) || [];
        const isAdmin = roles.some(r => r.role === 'admin');

        return {
          id: profile.user_id,
          email: profile.user_id,
          created_at: profile.created_at || '',
          is_admin: isAdmin,
          full_name: profile.full_name || '-'
        };
      });

      console.log('Built users list:', usersList);
      console.log(`Successfully loaded ${usersList.length} users`);
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários: " + (error as Error).message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    try {
      if (currentIsAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
        toast.success("Privilégios de admin removidos");
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;
        toast.success("Usuário promovido a admin");
      }

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      console.error("Error toggling admin role:", error);
      toast.error(error.message || "Erro ao alterar permissões");
      return { success: false };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete user's bookings first
      const { error: bookingsError } = await supabase
        .from("bookings")
        .delete()
        .eq("user_id", userId);

      if (bookingsError) {
        console.error("Error deleting bookings:", bookingsError);
      }

      // Delete user roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) {
        console.error("Error deleting roles:", rolesError);
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        throw profileError;
      }

      toast.success("Usuário excluído com sucesso");
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao excluir usuário");
      return { success: false };
    }
  };

  const promoteUserToRole = async (email: string, role: "admin") => {
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

  const createAdminUser = async (email: string, password: string, role: "admin" = "admin") => {
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
    users,
    loadingUsers,
    fetchUsers,
    toggleAdminRole,
    deleteUser,
    promoteUserToRole,
    createAdminUser,
    isLoading,
  };
};

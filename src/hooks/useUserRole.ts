import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type AppRole = "admin" | "client";

export const useUserRole = (user: User | null) => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      hasFetchedRef.current = true;
      return;
    }

    // Reset when user changes
    hasFetchedRef.current = false;
    setLoading(true);

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;
        
        console.log('useUserRole - Fetched roles:', data);
        const fetchedRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(fetchedRoles);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      } finally {
        hasFetchedRef.current = true;
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user?.id]);

  const isAdmin = roles.includes("admin");

  // Only report not loading if we've actually completed a fetch
  const actuallyLoading = loading || !hasFetchedRef.current;

  console.log('useUserRole - Current state:', {
    roles,
    isAdmin,
    loading: actuallyLoading,
    hasFetched: hasFetchedRef.current,
    user: user?.email
  });

  return { roles, isAdmin, loading: actuallyLoading };
};

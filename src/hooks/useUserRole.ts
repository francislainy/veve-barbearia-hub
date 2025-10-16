import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type AppRole = "admin" | "barbeiro" | "cliente";

export const useUserRole = (user: User | null) => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;
        
        setRoles(data?.map(r => r.role as AppRole) || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const isBarbeiro = roles.includes("barbeiro") || roles.includes("admin");
  const isAdmin = roles.includes("admin");

  return { roles, isBarbeiro, isAdmin, loading };
};

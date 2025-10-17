import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Service = Tables<"services">;

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar serviços");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const createService = async (
    name: string,
    category: string,
    price: number,
    duration_minutes: number
  ) => {
    try {
      const { error } = await supabase.from("services").insert({
        name,
        category,
        price,
        duration_minutes,
      });

      if (error) throw error;
      toast.success("Serviço criado com sucesso!");
      await fetchServices();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar serviço");
      return { success: false };
    }
  };

  const updateService = async (
    id: string,
    updates: Partial<Omit<Service, "id" | "created_at" | "updated_at">>
  ) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update service error:", error);
        throw error;
      }

      // Check if any rows were actually updated
      if (!data || data.length === 0) {
        console.error("No rows updated - likely RLS blocked the operation");
        throw new Error("Você não tem permissão para atualizar serviços. Apenas administradores podem fazer isso.");
      }

      console.log("Service updated successfully:", data);
      toast.success("Serviço atualizado com sucesso!");
      await fetchServices();
      return { success: true };
    } catch (error: any) {
      console.error("Update service catch:", error);
      toast.error(error.message || "Erro ao atualizar serviço");
      return { success: false };
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;
      toast.success("Serviço excluído com sucesso!");
      await fetchServices();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir serviço");
      return { success: false };
    }
  };

  return {
    services,
    isLoading,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
};

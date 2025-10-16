import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type TimeSlot = Tables<"time_slots">;

export const useTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .order("time", { ascending: true });

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar horários");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const createTimeSlot = async (time: string) => {
    try {
      const { error } = await supabase.from("time_slots").insert({
        time,
      });

      if (error) throw error;
      toast.success("Horário criado com sucesso!");
      await fetchTimeSlots();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar horário");
      return { success: false };
    }
  };

  const updateTimeSlot = async (id: string, is_available: boolean) => {
    try {
      const { error } = await supabase
        .from("time_slots")
        .update({ is_available })
        .eq("id", id);

      if (error) throw error;
      toast.success("Horário atualizado com sucesso!");
      await fetchTimeSlots();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar horário");
      return { success: false };
    }
  };

  const deleteTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase.from("time_slots").delete().eq("id", id);

      if (error) throw error;
      toast.success("Horário excluído com sucesso!");
      await fetchTimeSlots();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir horário");
      return { success: false };
    }
  };

  return {
    timeSlots,
    isLoading,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    refetch: fetchTimeSlots,
  };
};


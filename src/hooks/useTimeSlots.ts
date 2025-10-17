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

    // Subscribe to real-time changes
    const channel = supabase
      .channel('time-slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_slots'
        },
        (payload) => {
          console.log('Time slots changed:', payload);
          fetchTimeSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      const { data, error } = await supabase
        .from("time_slots")
        .update({ is_available })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update timeslot error:", error);
        throw error;
      }

      // Check if any rows were actually updated
      if (!data || data.length === 0) {
        console.error("No rows updated - likely RLS blocked the operation");
        throw new Error("Você não tem permissão para atualizar horários. Apenas administradores podem fazer isso.");
      }

      console.log("Timeslot updated successfully:", data);
      toast.success("Horário atualizado com sucesso!");
      await fetchTimeSlots();
      return { success: true };
    } catch (error: any) {
      console.error("Update timeslot catch:", error);
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

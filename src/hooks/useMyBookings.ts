import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  user_id: string;
  created_at: string;
}

export const useMyBookings = (userId: string | undefined) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyBookings = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Erro ao carregar seus agendamentos");
        return;
      }
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching my bookings:", error);
      toast.error("Erro ao carregar seus agendamentos");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    fetchMyBookings();

    // Subscribe to changes
    const channel = supabase
      .channel("my-bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchMyBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMyBookings]);

  const deleteMyBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting booking:", error);
        toast.error("Erro ao cancelar agendamento");
        return;
      }

      toast.success("Agendamento cancelado com sucesso!");
      setBookings(bookings.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  return { bookings, isLoading, deleteMyBooking, refetch: fetchMyBookings };
};

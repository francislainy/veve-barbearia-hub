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
  service_name?: string | null; // Added service_name field
}

export const useMyBookings = (userId: string | undefined) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyBookings = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          service_name:services(name)
        `)
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Erro ao carregar seus agendamentos");
        return;
      }

      // Flatten the service_name from nested object
      const formattedData = data?.map(booking => ({
        ...booking,
        service_name: booking.service_name?.name || null
      })) || [];

      setBookings(formattedData);
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

      console.log('User booking deleted, refetching...');
      toast.success("Agendamento cancelado com sucesso!");
      // Refetch to ensure we have the latest data
      await fetchMyBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  return { bookings, isLoading, deleteMyBooking, refetch: fetchMyBookings };
};
